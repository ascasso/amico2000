# 6502 Conformance Testing

How the AMICO 2000's CPU core is checked against an external 6502 test suite,
what that does and does not prove, and how to run it. Issue #18.

## Current result

**The CPU core passes the Klaus Dormann 6502 functional test suite.**

| | |
|---|---|
| Outcome | reaches the success trap at `$3469` |
| Instructions | 30,646,177 |
| Cycles | 96,241,367 |
| Wall clock | ~0.6s |
| Suite revision | `7954e2d` (2020-01-05) |
| Last run | 2026-09-11 |

This covers every documented NMOS 6502 opcode in every addressing mode, with
heavy emphasis on the status flags. It is the broadest check the core has, and
it is still narrower than "the CPU is correct" — see [Coverage](#coverage).

## Commands

Run the conformance suite on its own:

```bash
node --test tests/cpu6502-functional.test.js
```

Run the runner's own checks on their own:

```bash
node --test tests/conformance-runner.test.js
```

Both are ordinary files in `tests/`, so the project-wide command runs them along
with every other regression check, and needs no flag or opt-in:

```bash
node --test tests/
```

There is nothing to install, download or assemble. The test image is vendored in
the repository, so the suite runs offline, and the project still has no
`package.json` and no third-party dependency.

The conformance suite adds about 0.6s to a full `node --test tests/` run, which
is why it is not hidden behind an opt-in flag: a check that has to be remembered
is a check that stops being run.

## Layout

| Path | What it is |
|---|---|
| `tests/fixtures/6502-functional/` | the vendored suite, pinned and checksummed |
| `tests/fixtures/6502-functional/README.md` | provenance, address derivation, licensing |
| `tests/fixtures/6502-functional/manifest.json` | machine-readable pin: revision, URLs, SHA-256, addresses, configuration |
| `tests/helpers/6502-conformance.js` | the runner |
| `tests/cpu6502-functional.test.js` | runs the real suite |
| `tests/conformance-runner.test.js` | checks that the runner reports correctly |

## Provenance

Upstream is [Klaus2m5/6502_65C02_functional_tests](https://github.com/Klaus2m5/6502_65C02_functional_tests),
pinned at commit `7954e2dbb49c469ea286070bf46cdd71aeb29e4b` (2020-01-05) — an
immutable SHA, not a branch, so the fixture cannot drift underneath the tests.
Every vendored file was verified against its git blob SHA-1 at that revision,
and the runner re-checks the image's SHA-256 before every run.

The suite is GPL-3.0-or-later while the emulator is MIT. It is kept isolated,
unmodified, with its own license text and corresponding source, and is read as
test data rather than linked into the emulator. The full reasoning is in the
fixture README.

Full detail — the assembly-time configuration, how each address was derived from
the upstream listing, and the memory the suite requires — lives in
`tests/fixtures/6502-functional/README.md` and `manifest.json` rather than being
duplicated here.

## How a pass is decided

This is the part worth understanding before trusting a green run.

The suite has no I/O. It reports by *trapping*: on success it executes `JMP *`
at `$3469`, and on any failed check it executes `JMP *`, `BNE *`, `BCS *` or
similar at whatever address the failing test occupies. Every trap is a loop on
itself, which means **"the program stopped making progress" is only how a trap
is detected — the address carries the entire result.**

So the runner:

- loads the image at `$0000` and sets `PC = $0400`
- **never calls `cpu.reset()`**, because the image points `$FFFC` at `res_trap`
  (`$37A3`), a *failure* trap for an unexpected RESET mid-run. Vectoring through
  reset would land there and read as a CPU defect that is not there
- treats a self-loop at `$3469`, and nothing else, as a pass
- treats any other self-loop, an illegal-opcode halt, a thrown exception, or an
  exhausted instruction budget as a failure
- bounds execution at 100,000,000 instructions, counted by the runner rather
  than read from `cpu.cycles`, so a core with broken cycle accounting fails the
  run instead of hanging it

The success address is read from `manifest.json`, not typed into the runner, and
it was derived from the listing at the pinned revision and cross-checked against
the image bytes. Upstream addresses move between revisions; if the pin is ever
bumped, re-derive them.

## Why the pass is trustworthy

A conformance runner that silently does nothing also reports a pass, so two
things back this one up.

`tests/conformance-runner.test.js` drives the runner with small synthetic
programs whose outcome is known by construction, and asserts that only the one
reaching the success address is ever marked passed. Its sharpest case is a decoy:
the *same* `JMP *` instruction placed three bytes before `$3469`, so nothing but
the address distinguishes it from a pass. It also covers illegal-opcode halts,
thrown exceptions, a multi-instruction loop that only the budget can stop, and
rejection of a missing, truncated or single-byte-corrupted fixture.

Separately, a negative control was run out-of-tree during development: a copy of
`cpu6502.js` with the `ADC` overflow flag forced to zero was caught at `$062B`
after 40,351 instructions, with the failing `BVC` visible in the instruction
trace. A flags-only defect of exactly the kind the AMICO monitor would never
reveal.

## Diagnosing a failure

The suite is a 13KB program, so a failure is an address you have to look up. The
runner prints PC, the opcode and the bytes at PC, `A`/`X`/`Y`/`SP`, the decoded
status flags, instruction and cycle counts, and the last 16 instructions
executed with the register state before each.

To interpret it:

1. Fetch the listing for the pinned revision — its URL and SHA-256 are in
   `manifest.json`; it is not vendored because of its size.
2. Find the failing address. **The instruction immediately above the trap is the
   one being tested.**
3. Upstream's own advice applies: results are checked first and flags second, by
   pushing them and pulling them into the accumulator, so at the moment a flag
   check fails the "real" flags for the tested instruction are already gone. If
   the instruction was indexed, check `X`/`Y` too — unlike the flags, those are
   still valid.

Before concluding the CPU is at fault, rule out the fixture and the runner: a
checksum failure means the image is not the pinned one, and a *halt* rather than
a trap usually means execution left the intended path rather than that an opcode
is wrong.

## Coverage

What the suite checks:

- every documented NMOS 6502 opcode, in every addressing mode
- status flag behaviour, checked separately from results for each instruction
- stack behaviour, including `JSR`/`RTS`/`RTI` and `BRK` frames
- branch offsets and page-crossing address arithmetic
- self-modifying code paths and a final RAM integrity check

### What it does **not** check

These are real gaps, not formalities. None of them is covered by a passing run:

| Gap | Why it matters here |
|---|---|
| **External interrupt behaviour** | IRQ/NMI delivery, timing and nesting are untested. That is the separate `6502_interrupt_test`, which needs a feedback register to inject requests. The AMICO monitor's RAM-resident vectors at `$03FC-$03FF` depend on this working. |
| **NMOS decimal flag behaviour** | Decimal `ADC`/`SBC` run here with **valid BCD operands only**, and **`N`, `V` and `Z` are ignored**. The NMOS flag semantics this project cares about (#4, #22) are therefore *not* covered — `tests/cpu6502-decimal-flags.test.js` and `tests/cpu6502-decimal-sbc.test.js` remain load-bearing, not redundant. The former sweeps all 20,000 valid-BCD operand pairs per instruction against an independent reference. Invalid BCD operands are reproduced by neither the suite nor this core, and that boundary is asserted rather than assumed. |
| **Instruction timing** | The suite checks results and flags, never cycles. A passing run says nothing about cycle accuracy, which stays approximate by design (Known Limitations #4). |
| **Undocumented opcodes** | Documented opcodes only. The core halts on unknown opcodes, which is a deliberate debugging choice rather than NMOS behaviour — a real 6502 executes the undocumented ones. |
| **AMICO 2000 hardware** | The suite runs against a bare `CPU6502`: no monitor ROM, no 8255 PIA, no display multiplexing, no keyboard matrix, no cassette traps. Board-level behaviour is covered by the other files in `tests/` and by browser testing. |

A passing conformance run means the instruction set is sound. It does not mean
the emulator is faithful to the AMICO 2000, which is a separate and, for this
project, more important question.

## Follow-up work

- `6502_interrupt_test` from the same upstream repository, which would close the
  external-interrupt gap. It needs a feedback register to inject IRQ and NMI,
  so it needs machine-layer support rather than a bare core.
- `6502_decimal_test` (Bruce Clark's), which checks decimal-mode flags properly,
  including invalid BCD operands — the gap the functional suite explicitly
  leaves open and the one closest to this project's existing CPU fixes.
- Issue #17, a targeted per-fix regression harness, remains open and is not
  satisfied by this work.
