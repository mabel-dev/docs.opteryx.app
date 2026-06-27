# The bytecode expression engine

Most of a query's *structure* is handled by operators — scans, joins, aggregates, sorts. But inside many of those operators sits an **expression**: the `WHERE a > 10 AND b LIKE 'x%'`, the `price * quantity`, the `CASE` in a projection. Opteryx evaluates these with a small bytecode engine — a stack machine that compiles an expression tree into a flat program once, then runs that program over each morsel of data.

The design goal is to do all the thinking up front. By the time data is flowing, every decision — which kernel handles this cast, what type this literal is, how this comparison dispatches — has already been made. Run time is pure execution.

---

## Compile once, at bind time

When the planner binds an operator that contains an expression, it compiles that expression's tree into bytecode then and there — not on the first row, and not per morsel, but once during planning.

Compilation is a depth-first walk of the expression tree that emits a flat array of instructions in postfix order: operands before the operation that consumes them, exactly as a stack machine wants them. Loading a column, loading a literal, a comparison, an arithmetic op, a cast, a function call, a `CASE` — each becomes one instruction.

Two things are resolved during this walk that matter enormously for speed:

**Literals are materialised once.** A literal like `10` or `'APAC'` is turned into a constant-shape Draken vector a single time, at compile, and stored in the instruction. At run time the executor reuses that constant and only re-stamps its logical length to match the morsel — no Python scalar is boxed per row, no allocation happens per morsel.

**Kernels are bound to function pointers.** Each instruction that calls a native routine — an add, a cast, a comparison, a JSON extraction — has its kernel resolved by name at compile time into a raw C function pointer, together with any context it needs (a cast's target precision and scale, a binary op's decimal scales or timestamp units). The instruction stores the pointer and the context directly. Dispatch at run time is an indirect call, not a name lookup.

---

## The instruction set

The bytecode is deliberately small. Instructions load operands (a column from the morsel, a boolean, a scalar, a pre-materialised constant), combine booleans (AND, OR, XOR, NOT, and flattened multi-term forms), compare and test ranges, do arithmetic and string and bitwise work, call functions, extract from maps/arrays/JSON, cast between types, and evaluate `CASE`. Each instruction names a sub-operation where it needs to — which comparison, which arithmetic op, which extraction variant — so a single opcode covers a whole family.

A column is loaded by its stable identity (assigned during binding), so the executor fetches the right vector from the morsel without any name matching in the hot loop.

---

## The C kernel ABI

Underneath the bytecode is a registry of around a hundred native kernels, all sharing one calling convention. A kernel takes a context pointer (or none), an array of input vectors, and a count, and returns a result vector:

> *a kernel receives `(context, vectors[], count)` and returns a result*

That uniformity is what makes dispatch trivial. Whether the instruction is a cast, a comparison, or an arithmetic op, the executor calls through the same signature with the operands it popped off the stack and pushes the result back on. The context pointer is how a kernel that needs parameters gets them — a cast-to-decimal kernel reads its precision and scale from the context that was attached at compile time; a binary op reads the scales and units it must reconcile.

Everything flows in and out as Draken vectors. The engine never unpacks a vector into Python values to operate on it; the operands are `DrakenVector`s, and so is the result.

---

## Running the program

At run time the executor walks the instruction array against a morsel, maintaining a stack of vectors. Load instructions push; operations pop their operands and push their result. The final value left on the stack is the expression's result for that morsel.

Because the whole program is known at compile time, the executor can pick a path before the first row moves. An expression that is pure boolean algebra over bitmaps takes a tight bitmap loop. An expression that is entirely native kernels takes a path that runs the whole program **with the GIL released**, so expression evaluation parallelises across worker threads alongside everything else in the engine. Temporary vectors produced mid-expression are allocated from a per-morsel arena and freed in one go when the morsel is done — no per-row objects, no lingering garbage.

---

## In short

The bytecode engine is the expression-evaluation core: it compiles each expression into a flat, postfix program once at bind time — materialising literals and binding kernels to function pointers up front — then executes that program over [Draken](draken.md) vectors morsel by morsel, with the GIL released wherever the whole expression is native. The planner does the thinking once; the data path just runs.
