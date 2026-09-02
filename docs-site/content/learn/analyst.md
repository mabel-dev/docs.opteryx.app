## Hands-on exercise: which planets get a probe?

Everything here runs in the Studio editor against `public.astronomy.planets`, a table everyone signed in can read. Open [Studio](https://opteryx.app), and for each step type the query, run it (⌘↵ / Ctrl+Enter), then check the result against the note under it. It takes about 30 minutes.

### 1. See what you have

```sql
SHOW COLUMNS FROM public.astronomy.planets;
```

Twenty columns. This exercise uses `name`, `mass`, `gravity` and `number_of_moons`. Click the table in the catalog panel too: the **Details** panel shows the same columns alongside the row count and size.

### 2. Look before you filter

```sql
SELECT name, mass, gravity, number_of_moons
  FROM public.astronomy.planets
 ORDER BY mass DESC;
```

Jupiter should be at the top. Note the bytes-scanned figure in **Details**. You will come back to it in step 7.

### 3. Narrow it

A probe wants something to orbit, so keep the planets with at least one moon:

```sql
SELECT name, number_of_moons
  FROM public.astronomy.planets
 WHERE number_of_moons > 0
 ORDER BY number_of_moons DESC;
```

Mercury and Venus should be gone.

### 4. Summarise

Sort the planets into classes and count each class. The `CASE` expression lives in a CTE so the outer query can group by its name:

```sql
WITH classed AS (
    SELECT name,
           mass,
           CASE
               WHEN number_of_moons = 0 THEN 'no moons'
               WHEN number_of_moons < 5 THEN 'a few moons'
               ELSE 'many moons'
           END AS moon_class
      FROM public.astronomy.planets
)
SELECT moon_class,
       COUNT(*)  AS planets,
       MAX(mass) AS heaviest
  FROM classed
 GROUP BY moon_class
 ORDER BY planets DESC;
```

Three rows. Change the thresholds and run it again: the shape of the result stays the same, only the counts move.

### 5. Rank without collapsing

Step 4 collapsed nine rows into three. A window function ranks every row and keeps them all:

```sql
SELECT name,
       mass,
       RANK() OVER (ORDER BY mass DESC) AS mass_rank
  FROM public.astronomy.planets
 ORDER BY mass_rank;
```

Now add `number_of_moons` to the select list and rank by that instead. Two planets share a rank, and `RANK()` skips the next number. Swap in `DENSE_RANK()` to see the other convention.

### 6. Join a second table

`public.astronomy.moons` has one row per moon. Find the column that names the moon's planet first:

```sql
SHOW COLUMNS FROM public.astronomy.moons;
```

then join it to the planets table on that column, replacing `<planet_column>` with what you found:

```sql
SELECT p.name,
       p.number_of_moons AS recorded,
       COUNT(m.<planet_column>) AS listed
  FROM public.astronomy.planets AS p
  LEFT JOIN public.astronomy.moons AS m
    ON m.<planet_column> = p.name
 GROUP BY p.name, p.number_of_moons
 ORDER BY listed DESC;
```

A `LEFT JOIN` keeps planets with no moons, at a count of zero. Do the two counts agree for every planet? If not, that is exactly the kind of discrepancy an analyst is paid to notice.

### 7. Make it cheaper

Run these two and compare the bytes scanned in **Details**:

```sql
SELECT * FROM public.astronomy.planets;
```

```sql
SELECT name FROM public.astronomy.planets;
```

Then ask the planner what it will do before it does it:

```sql
EXPLAIN
SELECT name
  FROM public.astronomy.planets
 WHERE mass > 1;
```

The plan comes back as rows. [Troubleshooting queries](/docs/guides/troubleshooting) explains how to read it, and the [cost model](/docs/core-concepts/cost-model) explains why the bytes matter.

### 8. Chart it

Run step 2 again and open the **Chart** tab next to the results. Numeric columns are plotted without any setup. Try it on step 5 as well.

### Check your understanding

<details>
<summary>Step 3 used <code>WHERE</code>. How would you show only the classes in step 4 that contain more than one planet?</summary>

Add `HAVING COUNT(*) > 1` after the `GROUP BY`. `WHERE` filters rows before they are grouped; `HAVING` filters the groups after the aggregate has run. See [HAVING](/docs/reference/sql/statements/having).

</details>

<details>
<summary>Why does <code>SELECT name</code> scan fewer bytes than <code>SELECT *</code> in step 7?</summary>

The data is stored column by column, so the engine reads only the columns the query names. Fewer columns means fewer bytes, and bytes scanned is what the [cost model](/docs/core-concepts/cost-model) charges for.

</details>

<details>
<summary>What changes in step 6 if you replace <code>LEFT JOIN</code> with <code>JOIN</code>?</summary>

Planets with no matching moon rows disappear from the result instead of appearing with a count of zero. An inner join keeps only rows that match on both sides. See [JOIN](/docs/reference/sql/statements/joins).

</details>
