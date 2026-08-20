# Terminal recordings

Animated GIFs used for REPL/TUI walkthroughs in the docs (the ASCII mocks stay as
text for one-shot commands; these are for interactive sessions where seeing
input and output appear over time is the point).

Each `.tape` file is a [VHS](https://github.com/charmbracelet/vhs) script — the
literal keystrokes and timing for one recording. They run the real CLI,
installed fresh from PyPI — see "Why a venv" below before assuming your
personal dev environment is close enough to skip it.

## Regenerating

```bash
brew install vhs  # if you don't have it
make recordings   # from the repo root — regenerates every .tape here
```

Or one at a time (the venv has to exist first — `make recordings` once is the
easiest way to get it):

```bash
cd docs-site/scripts/recordings
vhs opteryx-repl.tape
```

This overwrites the corresponding GIF under `docs-site/public/images/cli/`.
Re-run whenever the CLI's output, banner, or version changes enough that the
recording looks stale — or after a release, via `make recordings-refresh`
(below), since `make recordings` on its own reuses whatever venv is already
there rather than checking PyPI for something newer.

### Why a venv

Every tape activates `venv/` (created by `make recordings`, gitignored) rather
than whatever `opteryx`/`opteryx-upload` is on your PATH. On an engine
developer's machine that's rarely the same thing: it's easy to have a local
editable install of `opteryx-core` or `opteryx-upload` shadowing the PyPI
package under the same command name, with a different version and different
bugs (or missing ones) than what `pip install opteryx-core` actually gives a
reader following the docs. The first recordings here were made that way by
mistake — the REPL GIF showed a version number and a duplicate stats-line bug
that only existed in a local dev build, not in anything ever published. The
venv is the fix: `make recordings` (or `make recordings-refresh` to force a
rebuild) installs the real, current PyPI releases of `opteryx-core` and
`opteryx-upload` into `docs-site/scripts/recordings/venv`, and every tape runs
against that and nothing else.

`upload-tui.tape` records against `mock_upload_server.py`, a small stand-in for
the real upload service (see that file's docstring) — the tape starts and stops
it itself, so nothing needs to be running first. It speaks the real
`/v2/contracts` protocol and returns a fixed, scripted plan, so the real,
installed `opteryx-upload` command runs unmodified. `acme` is a reserved
workspace name kept for exactly this kind of example — use it for any workspace
a recording or a doc example needs.

## Recordings

| Tape | Shows | Used in |
|---|---|---|
| `opteryx-repl.tape` | Starting the REPL, running a query, exiting | [The Opteryx Command Line](/docs/guides/opteryx-cli) |
| `upload-tui.tape` | Negotiating, reviewing the plan, uploading and committing | [The Upload Command Line](/docs/guides/upload-cli) |
