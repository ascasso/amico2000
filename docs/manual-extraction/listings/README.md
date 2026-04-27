# Manual Code Listings

This directory contains transcribed AMICO 2000 code listings from the
Sperimentare supplement.

## Status Levels

- `verified`: byte values were checked against the rendered page image.
- `candidate`: byte values came from OCR or a readable text extraction and still
  need visual confirmation.
- `blocked`: the source listing is too noisy to normalize without manual review.

For now, files should default to `candidate` unless the rendered scan has been
checked carefully. Hex listings are especially prone to OCR errors such as:

- `O` vs `0`
- `I`, `l`, `1`, and `!`
- `S` vs `5`
- `B` vs `8`
- stray punctuation inside bytes

## `.hex` Format

The tracked `.hex` files use a deliberately simple format:

```text
# comment
@0200
A9 00 85 F9
```

- Lines beginning with `#` are metadata comments.
- `@NNNN` sets the load address for the following bytes.
- Byte rows contain uppercase two-digit hexadecimal values separated by spaces.

These files are intended as a staging format. Once a listing is verified, it can
be converted into emulator-loadable binary data or a richer program fixture with
expected key/display behavior.

## Initial Focus

The first listings are short tutorial programs, not the long Appendix 2 games.
They establish the workflow and are easier to check:

| File | Status | Source | Start | Purpose |
| --- | --- | --- | --- | --- |
| `somma-000a.hex` | candidate | PDF page 31, `Tabella 7` | `000A` | Add two zero-page bytes and store the result. |
| `somma-carry-0201.hex` | candidate | PDF page 36 | `0201` | Add two zero-page bytes with configurable carry input. |
| `clear-page-zero-range-0200.hex` | verified | PDF page 59 | `0200` | Clear zero-page locations `0020` through `002F`. |
| `trasformazione-complemento-due-0200.hex` | candidate | PDF page 62, Programma 1 | `0230` | Convert positive/negative decimal numbers to two's complement. |
| `master-mind-0200.hex` | candidate | PDF page 62, Programma 2 | `02A0` | Master Mind game. |
| `21-fiammiferi-0200.hex` | candidate | PDF page 103, Appendix 2 | `0200` | Matchstick game against AMICO 2000. |

Appendix 2 programs should be split into one file per program after visual
verification of the OCR-heavy listings.

## Smoke Check

The initial candidate files pass a basic syntax check: every non-comment,
non-address token is a two-digit hex byte. They also pass a small CPU-core smoke
check:

- `somma-000a.hex`: with `0006=03` and `0007=02`, stores `05` at `0004`.
- `somma-carry-0201.hex`: with `0006=02` and `0007=03`, stores `05` at `0000`
  with `CLC`; after changing byte `0201` to `38` (`SEC`), stores `06`.
- `clear-page-zero-range-0200.hex`: clears `0020` through `002F` and returns to
  the monitor vector at `FE22`; byte values were verified against PDF page 59 by
  the project owner.
- `trasformazione-complemento-due-0200.hex`: syntax-only checked so far. Entry
  point is inferred as `0230`.
- `master-mind-0200.hex`: syntax-only checked so far. The manual says to load at
  `0200` and RUN from `02A0`.
- `21-fiammiferi-0200.hex`: syntax-only checked so far. Runtime behavior depends
  on monitor routines and still needs visual verification.

These checks only prove that the transcribed bytes are internally plausible.
They do not replace visual verification against the scanned manual.
