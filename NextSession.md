# AMICO 2000 Next Session

## North Star

Make the emulator behave as closely as practical to the original AMICO 2000.
Prefer evidence from the monitor ROM, Sperimentare manual, and observed hardware
behavior over convenience abstractions.

Priority order:

1. Original AMICO 2000 behavior: monitor workflow, keyboard, display, memory
   map, PIA behavior.
2. Original NMOS 6502 behavior: flags, stack frames, interrupts, decimal mode,
   branch/page timing.
3. Small targeted verification that protects the above.
4. Cassette support, useful but secondary.
5. Large conformance or test-framework projects, only after core behavior is
   trustworthy.

## Current Status

- `develop` matches `origin/develop`.
- `#25` is done/closed: raw `.bin` program loads intentionally do not call
  `amico.reset()`.
- `#22` is implemented: decimal-mode SBC now derives `N` from the binary
  subtraction result, protected by a targeted dependency-free Node test.
- `#24` is resolved as a non-bug: the cassette traps correctly keep the `JSR`
  frame, because `$FE22` is the monitor reset entry and its `TXS` restores
  `SP`. Documented in `amico2000.js` and protected by
  `tests/cassette-trap-stack.test.js`.
- `#31` is fixed: the IC9 and IC10 PROM regions are read-only to guest code,
  including the `$FFFA-$FFFF` vectors, and the three direct-memory paths that
  bypassed the write callbacks (`loadProgram`, tape LOAD, the ROM loaders) are
  each bounded. Protected by `tests/rom-write-protection.test.js`.
- `#30` is fixed: RES drives the processor's reset line instead of poking the
  key matrix, so it recovers a tight loop and an illegal-opcode halt. RES
  preserves RAM and `reset()` remains the power-on cold start; the bench
  control is now labelled **Cold reset**. Protected by
  `tests/res-reset.test.js`. The two issues were worked together because a
  corrupted `$FFFC` vector defeats every reset path, so #31 had to land first.
- `#18` is implemented: the CPU core **passes** the Klaus Dormann 6502
  functional suite, pinned offline in `tests/fixtures/6502-functional/` and run
  by `node --test tests/cpu6502-functional.test.js` as part of the normal
  `node --test tests/`. It stayed dependency-free: no package.json, no
  framework, no network. See `docs/6502-conformance.md`. The issue has not been
  closed on GitHub; that is a deliberate hand-back, not an oversight.
- `#17` is implemented: every CPU fix the issue named now has a committed
  regression check, in the areas the conformance suite cannot reach.
  `tests/cpu6502-stack-frames.test.js` pins the physical byte layout of
  `JSR`/`BRK`/`IRQ`/`NMI` frames (#3), `tests/cpu6502-decimal-flags.test.js`
  sweeps all 20,000 valid-BCD operand pairs per instruction against an
  independent reference (#4, #22), and `tests/cpu6502-cycles.test.js` checks
  the base cost of all 151 documented opcodes plus every dynamic penalty (#5).
  `node --test tests/` is now 76 checks.
- Remaining items from the prior handoff: `#19`, `#20`, `#23`.
- The CPU core now has broad instruction-level coverage *and* per-fix
  regression coverage, but the **machine layer still does not**: the PIA,
  display multiplexing, keyboard matrix and monitor workflow are covered only
  by the targeted checks in `tests/` and by browser testing. That is the
  clearest remaining gap. Keep near-term verification there small and tied to a
  behavior fix.

## Highest Priority: Machine Fidelity

Re-check the user-visible AMICO 2000 workflow against the original monitor
behavior:

- Reset is done (`#30`). Address entry (`AD`), data entry (`DA`), increment
  (`+`), run (`GO`), register display (`REG`), and halt (`HLT`) are still
  unverified against the monitor ROM; `HLT` is mapped to `P` on inference from
  board position, and the manual describes it as generating a CPU-level
  interrupt, which the emulator does not do.
- Keyboard matrix behavior, including row/column assumptions and active-low
  reads.
- Display multiplexing and seven-segment patterns.
- RAM/ROM/PIA memory map, especially `$FD00-$FDFF` partial decoding.
- Manual program listings under `docs/manual-extraction/listings/` as practical
  smoke checks.

If behavior and comments/docs disagree, trust the ROM/manual/current verified
behavior and update the stale guidance.

## Latest CPU Fix

Issue `#22` corrected decimal-mode `SBC`, which previously set `N` from the
BCD-adjusted accumulator instead of the binary subtraction result required by
NMOS 6502 behavior.

Target case to preserve:

- `D=1`, `A=$00`, operand `$80`, `C=1`
- Binary diff has bit 7 set
- Adjusted accumulator becomes `$20`
- Expected `N=1`

The dependency-free regression check in
`tests/cpu6502-decimal-sbc.test.js` preserves this edge case. Choose any future
CPU fix from observed machine behavior or a concrete conformance failure rather
than expanding test infrastructure speculatively.

## Verification Approach

Do not introduce a large test framework as the next step.

Use the smallest useful checks:

- `node --check cpu6502.js amico2000.js main.js display.js`
- `node --test tests/` for the committed checks, or a single file while working.
- A tiny Node script or ad hoc command for CPU edge cases touched by the change.
- Browser/manual smoke testing for monitor workflow and display/keyboard
  behavior.
- Add a simple committed regression script only if it stays dependency-free and
  directly protects emulator fidelity.

The Klaus Dormann conformance suite (`#18`) is **done** and the core passes it,
so it no longer needs deferring. It cost no framework and no dependency, which
is why it fitted the guidance above rather than contradicting it.

Note what it does *not* settle before leaning on it: external interrupt
delivery, decimal arithmetic with invalid BCD operands, and undocumented
opcodes are still unverified, as is every part of the machine layer. Decimal
flag semantics and per-instruction timing are *not* on that list any more —
the #17 checks cover them, precisely because the functional suite cannot. `docs/6502-conformance.md` has the full list. The two obvious follow-on
suites are upstream's `6502_interrupt_test`, which needs machine-layer support
to inject IRQ/NMI, and Bruce Clark's `6502_decimal_test` — the latter being the
closest to this project's existing CPU fixes (`#4`, `#22`).

## Cassette Work: Secondary

Cassette support is nice to have, but do it after core machine and CPU behavior.

Relevant open items:

- `#23`: full `$0000-$FFFF` SAVE produces a 64KB data payload that cannot fit in
  the current 16-bit `.amtape` length field.
- `#35`: the `CASSETTE_ROM` array in `main.js` does not disassemble as coherent
  6502 code at `$FB00`: the ROM's own `JMP $FC54` at `$FBF3` lands on `$FB`, an
  invalid opcode, because `$FC52` holds `JSR $FB00`. It is not loaded by
  default, so nothing depends on it today, but it should be replaced with the
  archived `prom.ic10` binary before any cassette work relies on real ROM
  execution. See `docs/computerhistory-amico2000.md` for the source link.
- `#19`: document the `.amtape` mock cassette file format after behavior is
  settled.
- `#20`: analog cassette signal fidelity is long-term only.

For cassette work, prefer correctness and clear limits over expanding scope.
