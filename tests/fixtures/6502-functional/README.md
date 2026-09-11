# Klaus Dormann 6502 functional test suite (pinned fixture)

Third-party test data, vendored verbatim. Nothing here is AMICO 2000 code and
nothing here is edited: if a file in this directory differs from upstream, that
is a bug, not a local patch.

## Provenance

| | |
|---|---|
| Upstream | <https://github.com/Klaus2m5/6502_65C02_functional_tests> |
| Revision | `7954e2dbb49c469ea286070bf46cdd71aeb29e4b` (2020-01-05) |
| Source version string | `version 05-jan-2020` |
| Author | Klaus Dormann |
| License | GPL-3.0-or-later (`LICENSE.txt`) |

`manifest.json` is the authoritative record: it carries the upstream revision,
the download URL, size and SHA-256 for every file, the load and trap addresses,
the assembly-time configuration, and the coverage limits. The test runner
validates the image against it, so a corrupted or swapped fixture fails loudly
instead of quietly testing something else.

## Files

| File | Upstream path | Purpose |
|---|---|---|
| `6502_functional_test.bin` | `bin_files/6502_functional_test.bin` | 64KB memory image the runner executes |
| `6502_functional_test.a65` | `6502_functional_test.a65` | Corresponding assembler source |
| `LICENSE.txt` | `license.txt` | Upstream GPL-3.0 text |
| `manifest.json` | — | Local provenance record (not upstream) |

The 728KB assembler listing (`bin_files/6502_functional_test.lst`) is **not**
vendored, because its bulk buys nothing at run time. Its SHA-256 and URL are in
`manifest.json` so anyone can fetch it and re-derive the addresses below.

## How to run it

The image is a flat 64KB memory image: byte `i` belongs at address `$i`. There
is no header and no relocation. Load it, set `PC = $0400`, and step.

**Do not vector through reset.** With `ROM_vectors = 1` the image fills
`$FFFA-$FFFF`, and `$FFFC` points at `res_trap` ($37A3) — a *failure* trap,
because an unexpected RESET during the run is an error. The upstream source
says to "alter PC to 400 hex (code_segment) and enter a go command", and that
is what the runner does.

Completion is detected by a self-loop, not by a halt:

- `$3469` — `JMP $3469`, the `success` macro. **This, and only this, is a pass.**
- any other self-loop — a failure trap (`jmp *`, `bne *`, `bcs *`, …)

Every trap in the suite is a branch or jump to itself, so "the program stopped
making progress" is *not* evidence of success. The address is the whole signal,
which is why it is pinned and cross-checked rather than assumed.

## Where the addresses come from

Derived from the listing at this revision, then cross-checked byte-for-byte
against the vendored `.bin` — which is how we know the image and the listing
are the same build:

| Address | Listing | Bytes in the image |
|---|---|---|
| `$0400` entry (`start`) | line 740, `0400 : d8  start cld` | `D8 A2 FF 9A` (`CLD` / `LDX #$FF` / `TXS`) |
| `$3469` success | line 13377, `3469 : 4c6934 > jmp *` | `4C 69 34` |
| `$379D` `nmi_trap` | line 14349 (`dw nmi_trap`) | `4C 9D 37` |
| `$37A3` `res_trap` | line 14350 (`dw res_trap`) | `4C A3 37` |
| `$FFFA` vectors | lines 14348-14351, `org $fffa` | `9D 37 A3 37 AB 37` |

Addresses move between upstream revisions. If the pin is ever bumped, re-derive
all of them from the new listing — do not carry these over.

## What this suite does and does not cover

Covers: the documented NMOS 6502 instruction set — every opcode in every
addressing mode, with heavy emphasis on the status flags — plus a final RAM
integrity check.

Does **not** cover:

- undocumented/illegal opcodes
- NMOS decimal flag behaviour — decimal ADC/SBC run with valid BCD operands
  only, and N, V and Z are ignored (so `tests/cpu6502-decimal-sbc.test.js`
  stays load-bearing, not redundant)
- external interrupt behaviour — that is the separate `6502_interrupt_test`,
  which needs a feedback register to inject IRQ and NMI
- instruction timing and cycle accuracy — results and flags only
- anything AMICO 2000: no monitor ROM, no 8255 PIA, no display, keyboard or
  cassette. This exercises the bare CPU core.

## A note on licensing

The emulator is MIT; this fixture is GPL-3.0-or-later. They are kept apart
deliberately. The suite is unmodified third-party *test data* in its own
directory, shipped with its own license text and its corresponding source, and
it is read at run time by a test rather than linked into or distributed as part
of the emulator. No AMICO 2000 source is derived from it. That is mere
aggregation, and it is how emulator projects normally vendor these tests — but
it is a deliberate call and worth knowing about before reusing this repository.
