---
title: The Upload Command Line - Load Data From a Shell or a Terminal App
description: Load Parquet, CSV and NDJSON into Opteryx from the shell with opteryx-upload, or from a full-screen terminal app that shows the column types before anything is sent.
---

# The Upload Command Line

Installing the [upload client](/docs/reference/python/upload) puts an
`opteryx-upload` command on your `PATH` — the same negotiate-and-commit flow the
Python SDK uses, driven from a shell. It agrees the column types with the
service before a byte of data is sent, so an upload that was going to be refused
is refused for the price of a sample rather than after four gigabytes.

```bash
pip install opteryx-upload
```

The command line and the terminal app come with it. Both are standard library —
argparse and curses — so neither pulls anything extra into your environment.

## Signing In

Set your access token from the [Authentication API](/docs/reference/api/authentication-api):

```bash
export OPTERYX_CLIENT_ID="<access token username>"
export OPTERYX_CLIENT_SECRET="<access token>"
```

These are exchanged for a short-lived assertion and re-exchanged as it ages,
which is what lets an upload measured in gigabytes finish. `OPTERYX_TOKEN` takes
a bearer JWT instead for a caller that already holds one; an access token in the
environment wins over it.

## Pushing a File

```bash
opteryx-upload push findings.csv --to acme.security.findings
```

You are not asked where the column types should come from, because the
destination answers it. A dataset that already declares its columns supplies
them. A dataset that does not exist yet has its types read from your data, and
shows them to you before anything is written:

```
  findings.csv  686.5 KB

  acme.security.findings  new, types read from your data

  column     sample                type
  cve_id     CVE-2026-00001        VARCHAR
  published  2026-08-02T04:22:07Z  VARCHAR
  source_ip  10.1.7.13             VARCHAR
  hosts      1                     INT64

  these types were read from your data
  accept [enter]   change column=TYPE   drop -column   stop q
  > published=TIMESTAMP source_ip=IPV4
```

The sampled value beside each column is what makes a mistyped one obvious:
`published` sitting next to `2026-08-02T04:22:07Z` reads as wrong at a glance in
a way that `published: VARCHAR` does not. A CSV cannot say that a column of
dotted quads is an [IPV4](/docs/reference/sql/types/ipv4) address, and once it
has been catalogued as `VARCHAR`, no amount of reading the data back will tell
you it was a mistake.

Correct a type by typing `column=TYPE`, drop one you do not want with `-column`,
and press enter to accept. Then the files go up and the dataset is committed.

## Appending

Pushing to a dataset that already exists asks nothing about types at all — it
uses the ones the catalog holds and converts your columns to match, saying which
conversions it will make:

```
  acme.security.findings  exists, using the types it declares
  writing   append

  column     sample                from        to
  cve_id     CVE-2026-12001        VARCHAR     VARCHAR
  published  2026-08-18T04:22:07Z  VARCHAR  →  TIMESTAMP[us]  converted
  source_ip  10.225.39.109         VARCHAR  →  IPV4           converted
  hosts      301                   INT64       INT64
```

At a terminal it asks whether to append or overwrite; `--append` and
`--overwrite` say so up front.

## Looking Without Uploading

`plan` runs the same negotiation, prints the table and abandons the contract, so
it uploads nothing and leaves nothing behind:

```bash
opteryx-upload plan data/*.parquet --to acme.security.findings
opteryx-upload plan data/*.parquet --to acme.security.findings --json
```

This is the cheap way to find out what a folder of exports will become. It costs
a few megabytes of sample whatever the files weigh, because a text file is
sampled from the front and a Parquet file from its footer, which is where its
schema lives.

## In a Pipeline

There is no terminal to show the table to, so inference has to be authorised in
advance. `--yes` accepts what was read from the data, `--declare` names the types
outright, and a `push` with neither is refused rather than guessed at.

```bash
opteryx-upload push data/*.parquet --to acme.security.findings \
    --type published=TIMESTAMP --type source_ip=IPV4 \
    --message "nightly load" --yes
```

Exit codes are part of the interface, because a pipeline that greps stderr will
eventually retry the wrong thing:

| code | meaning | worth retrying |
|---|---|---|
| 0 | committed | — |
| 2 | bad arguments, missing file, no credentials | no |
| 3 | refused: a value that will not cast, files that disagree, an undeclared column | no |
| 4 | the target moved after the contract was agreed | yes |
| 5 | not signed in, or not permitted to write here | no |
| 6 | the service could not be reached, or failed | yes |
| 130 | interrupted | — |

3 and 6 are deliberately different. Retrying a refusal never helps and retrying
a broken service often does.

A refusal names the column, the row and the value:

```
opteryx-upload: column 'source_ip' cannot hold 'not-an-ip' as IPV4
  column       source_ip
  row          5999
  value        'not-an-ip'
  declared     IPV4
```

That is raised on the write carrying the bad value, not at commit after
everything has been sent — and nothing is published, so there is no half-loaded
dataset to clean up.

## The Terminal App

```bash
opteryx-upload
```

Run it with no arguments at a terminal and you get the full-screen version;
typing the name and nothing else means you want to upload something, not to read
a list of subcommands. Off a terminal, no arguments prints the usage instead.

Same flow, same calls. What it adds is that the plan stays on screen: at a
scrolling prompt the table goes past once and correcting a type means retyping
the whole command, and here the cursor moves down it.

```
 opteryx upload                                        https://upload.opteryx.app

 FILES
   part-0000.parquet  412.9 MB
   part-0001.parquet  398.1 MB

 ACCOUNT
   acme-etl

 TO
   acme.security.findings

 PLAN   a new dataset; these types were read from your data
   column     sample                type
   cve_id     CVE-2026-00001        VARCHAR
   published  2026-08-02T04:22:07Z  TIMESTAMP[us]   was VARCHAR, converted
 › source_ip  10.1.7.13             IPV4            was VARCHAR, converted
   hosts      1                     INT64
   score      0.5                   FLOAT64         read and not written

 these types were read from your data - nothing is written until you accept
 ↑↓ column  e retype  x ignore  ⏎ accept  u upload  h keys  q quit
```

`h` lists every key. `c` signs in, `a` browses for files, `t` sets the
destination, `n` negotiates, `e` changes the type under the cursor, `x` drops a
column, `u` uploads and commits.

Requests run on a worker thread and the screen keeps redrawing while they do, so
a multi-gigabyte write shows a byte counter rather than a frozen terminal.
Quitting with a contract still open abandons it — nothing written was ever
readable, so there is nothing to undo.

### Signing in from the screen

Starting with no credentials opens the app rather than refusing. `c` asks for
your access token username, then the token itself, masked as you type. It
exchanges them straight away, so a mistyped token is a line on the status bar
rather than a failure half way through negotiating. Neither is written anywhere;
set them in the environment to skip the prompt.

### Choosing files

`a` opens a browser rather than a prompt. Typing a path is the fastest way in
when you already know it and the worst when you do not — an export lives four
directories down under a name nobody remembers.

```
 ADD FILES  ~/exports/2026-08
 ›  ..
    part-0000.parquet   412.9 MB
  ✓ part-0001.parquet   398.1 MB
  ✓ part-0002.parquet   401.7 MB
    SHA256SUMS               64 B

 2 to add
 ↑↓ move  ⏎ open  ← up  space tag  a all here  g type a path  . hidden  esc back
```

Space tags a file, `a` tags every readable file in the directory, and tagging
survives walking into another one, so a single upload can gather from several
places. Files the service cannot read are listed and dimmed rather than hidden —
an empty directory is the one answer that sends you looking in the wrong place.

`g` types a path, a folder or a glob instead, which is still the quickest route
when the path is already on your clipboard.

## Commands and Options

| | |
|---|---|
| `push FILE... --to W.C.D` | negotiate, upload, commit |
| `plan FILE... --to W.C.D` | negotiate and print; upload nothing |
| `show CONTRACT_ID` | print a contract by id |
| `abandon CONTRACT_ID` | give up on one |
| `tui` | the full-screen version |

| | |
|---|---|
| `--to WORKSPACE.COLLECTION.DATASET` | where the rows go (required) |
| `--append` / `--overwrite` | for a dataset that exists |
| `--type COLUMN=TYPE` | correct one type without a prompt; repeatable |
| `--ignore COLUMN` | read this column and do not write it; repeatable |
| `--infer` / `--use-dataset` / `--declare COLUMN:TYPE` | override the destination's answer |
| `-y`, `--yes` | accept inferred types unasked; required off a terminal |
| `-m`, `--message` | snapshot message |
| `--json` | the contract as the service sent it |
| `--no-color` | never colour the output |

For the same flow from Python, see the [upload client
reference](/docs/reference/python/upload). For the HTTP endpoints underneath it,
see the [Upload API](/docs/reference/api/upload-api).
