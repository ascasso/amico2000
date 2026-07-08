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
- Open items from the prior handoff: `#17`, `#18`, `#19`, `#20`, `#22`, `#23`,
  `#24`.
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

## Next CPU Fix

Fix `#22`: decimal-mode `SBC` currently sets `N` from the BCD-adjusted
accumulator. For NMOS 6502 behavior, `N` should derive from the binary
subtraction result.

Target case to preserve:

- `D=1`, `A=$00`, operand `$80`, `C=1`
- Binary diff has bit 7 set
- Adjusted accumulator becomes `$20`
- Expected `N=1`

A minimal fix should change the `opSBC()` decimal path to compute `N` from the
binary diff, then add only lightweight verification.

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
- `#24`: investigate whether cassette ROM traps should unwind a `JSR` return
  frame or intentionally jump back to the monitor.
- `#19`: document the `.amtape` mock cassette file format after behavior is
  settled.
- `#20`: analog cassette signal fidelity is long-term only.

For cassette work, prefer correctness and clear limits over expanding scope.
