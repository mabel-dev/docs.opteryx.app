# Terminal recordings

Animated GIFs used for REPL/TUI walkthroughs in the docs (the ASCII mocks stay as
text for one-shot commands; these are for interactive sessions where seeing
input and output appear over time is the point).

Each `.tape` file is a [VHS](https://github.com/charmbracelet/vhs) script — the
literal keystrokes and timing for one recording. They run the real, installed
CLI; nothing in the GIFs is mocked up.

## Regenerating

```bash
brew install vhs  # if you don't have it
make recordings   # from the repo root — regenerates every .tape here
```

Or one at a time:

```bash
cd docs-site/scripts/recordings
vhs opteryx-repl.tape
```

This overwrites the corresponding GIF under `docs-site/public/images/cli/`.
Re-run whenever the CLI's output, banner, or version changes enough that the
recording looks stale.

Run from a directory outside `/tmp` — pyenv-shimmed `python -m <module>`
invocations have been seen to fail there with an unrelated
`No module named 'compression'` error caused by something in this machine's
`/tmp`, not by Opteryx. `~` or the repo itself are fine. `make recordings`
already runs from the repo root, so this only matters if you run `vhs` by hand.

If you use pyenv and `python -m opteryx` isn't on the version that has
`opteryx-core` installed, set `PYENV_VERSION` before running `vhs`, e.g.
`PYENV_VERSION=3.13.12 vhs opteryx-repl.tape`.

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
