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
- Remaining items from the prior handoff: `#17`, `#18`, `#19`, `#20`, `#23`.
- There is no full automated CPU test harness yet. Keep any near-term
  verification small and directly tied to a behavior fix.

## Highest Priority: Machine Fidelity

Re-check the user-visible AMICO 2000 workflow against the original monitor
behavior:

- Reset, address entry (`AD`), data entry (`DA`), increment (`+`), run (`GO`),
  register display (`REG`), and program counter display (`PC`).
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
- A tiny Node script or ad hoc command for CPU edge cases touched by the change.
- Browser/manual smoke testing for monitor workflow and display/keyboard
  behavior.
- Add a simple committed regression script only if it stays dependency-free and
  directly protects emulator fidelity.

Leave the Klaus Dormann conformance suite (`#18`) for later. It is valuable, but
not the next priority.

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
