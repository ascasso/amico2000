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

- As of 2026-11-19, `develop` is pushed and open as a pull request into
  `master`. GitHub Pages builds from `master`, so nothing below reaches the
  live site until that is merged.
- 2026-11-19 session (no GitHub issue work, at the owner's request): a security
  review of the public pages (CSP added, oversized files refused before
  reading, selector escaping), the keypad map rebuilt from the ROM's decode,
  the bench Run/Stop state fixed, the keyboard scan made Node-safe, the
  keyboard test pages and `original-documentation.html` removed, and every
  pending cleanup in `AGENTS.md` done. `docs/logs/2026-11-19.md` has each one.
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
  `node --test tests/` was 76 checks then and is 90 after 2026-11-19.
- Open on GitHub: `#19`, `#20`, `#23`, `#35`. `#23` is in fact fixed by commit
  `1ecbfaf`, which takes the issue's first suggested option, but that commit
  does not name the issue and the issue is still open; see Outstanding below.
- The CPU core now has broad instruction-level coverage *and* per-fix
  regression coverage. The **machine layer is only partly covered**: the
  keyboard matrix and keypad workflow (`tests/keyboard-matrix.test.js`), run
  state (`tests/run-state.test.js`), resets, ROM protection and the cassette
  traps have checks, but display multiplexing, segment patterns and the PIA's
  partial address decoding do not. That is the clearest remaining gap. Keep
  near-term verification there small and tied to a behavior fix.

## Outstanding (as of 2026-11-19)

Known open work, in rough priority order. None of it is started.

1. **Close or reference `#23`.** Commit `1ecbfaf` refuses a SAVE of the whole
   `$0000-$FFFF` range with the routine's `$0000 = $FF` status, which is
   option 1 in the issue, and `tests/cassette-tape-length.test.js` covers it.
   The commit message does not mention `#23` because the owner had asked for
   no GitHub issue work in that session. The issue needs closing with a pointer
   to the commit; no code change is needed.
2. **HLT is not emulated.** The manual's key list says only that HLT
   "genera una interruzione a livello CPU"; it is not in the key matrix (all 21
   cells are taken, see `keyMap` in `amico2000.js`), so the on-screen key does
   nothing and `P` is unmapped. To implement it, establish from the manual's
   interrupt chapter or the schematic: (a) whether HLT drives NMI or IRQ; and
   (b) what the RAM vectors hold when it fires. NMI goes `$FFFA` -> `$FE1C` ->
   `JMP ($03FC)`; IRQ/BRK goes `$FFFE` -> `$FE1F` -> `JMP ($03FE)`. The ROM
   never writes those RAM vectors; the emulator's power-on reset seeds both
   with `$FE30`, the monitor loop, which is an emulator choice, not ROM
   behavior. A strong lead, unverified: the code at `$FE00` is an
   interrupt-entry register save. It stores A, X, Y and SP, pulls P and the
   return PC off the stack, keeps them in `$F3-$FE` (the PC at `$F6/$F7`,
   which REG recalls, and in `$FA/$FB`, so the display shows it), then enters
   the monitor. No JMP or JSR in the ROM targets `$FE00` and no hardware vector
   points at it, so it can only be reached through those RAM vectors. If HLT plus a vector set to `$FE00` is the intended halt-and-resume
   path, then REG followed by RUN would resume the halted program. Confirm in
   the manual before building it.
3. **Machine-layer checks** for what is still uncovered: display multiplexing
   and the segment patterns at `$FFEA` (the monitor's digit table), and the
   `$FD00-$FDFF` partial decoding. The keypad tests show the pattern: run the
   real monitor in Node and assert on RAM or PIA state, with no DOM.
4. **`#35`**: when it is worked, the stale "Load ROM" mention and the claim
   that cassette needs the ROM, in the `CASSETTE_ROM` comment in `main.js`,
   belong to the same change; they were left alone on 2026-11-19 for that
   reason.
5. **`#19`, `#20`**: unchanged; see Cassette Work below.

Browser checks, learned on 2026-11-19: the pages' CSP forbids inline scripts,
so an automated check needs a scratch copy of `index.html` without the CSP
meta tag and with absolute `src` paths. Headless Chrome under
`--virtual-time-budget` does not fire `requestAnimationFrame`, so the emulator
only runs the frame that `start()` executes synchronously; for anything longer,
call `amico.stop()` and drive `amico.cpu.run(16667)` from `setInterval`. Firefox
headless `--screenshot` is a quick way to confirm a page renders under
`file://`.

## Highest Priority: Machine Fidelity

Re-check the user-visible AMICO 2000 workflow against the original monitor
behavior:

- Reset is done (`#30`). The matrix keys are now verified against the monitor
  ROM (2026-11-19): every key decodes through GETKEY at `$FF57` to the code its
  function needs, and AD, DA, increment, RUN and REG work end to end
  (`tests/keyboard-matrix.test.js`). The old hand-built map was wrong for `0`,
  AD, RUN and REG. `HLT` is still open: the manual says it generates a
  CPU-level interrupt without saying which line, so it is not emulated and no
  longer has a keyboard shortcut.
- Keyboard matrix behavior, including row/column assumptions and active-low
  reads: done on 2026-11-19 with the keypad fix above.
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
opcodes are still unverified, as is most of the machine layer. Decimal
flag semantics and per-instruction timing are *not* on that list any more —
the #17 checks cover them, precisely because the functional suite cannot. `docs/6502-conformance.md` has the full list. The two obvious follow-on
suites are upstream's `6502_interrupt_test`, which needs machine-layer support
to inject IRQ/NMI, and Bruce Clark's `6502_decimal_test` — the latter being the
closest to this project's existing CPU fixes (`#4`, `#22`).

## Cassette Work: Secondary

Cassette support is nice to have, but do it after core machine and CPU behavior.

Relevant open items:

- `#23`: full `$0000-$FFFF` SAVE produced a 64KB data payload that cannot fit in
  the 16-bit `.amtape` length field. Fixed in `1ecbfaf` (SAVE refuses that
  range); only closing the issue remains.
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
