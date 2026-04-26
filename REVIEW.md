# Project Review — AMICO 2000 Emulator

**Date:** 2026-04-16
**Reviewer:** Claude (Opus 4.7), first session on this project
**Scope:** Read-through of source, docs, and working tree state on branch `develop-claude`

## Summary

Solid, working emulator. Code is readable and the CPU / machine / display
separation is clean. Per `NEXT_SESSION.md`, the project is considered
"complete and fully functional" as of January 2026. The notes below are
polish items — none are blockers.

## Architecture (as-is)

| File | Lines | Role |
|------|------:|------|
| `cpu6502.js`   | 1108 | 6502 interpreter — all documented opcodes, addressing modes, BCD, IRQ/NMI/BRK |
| `amico2000.js` |  500 | Machine layer — 8255 PIA, display multiplexing, keyboard matrix |
| `display.js`   |  240 | SVG seven-segment renderer with authentic ASEL segment table |
| `main.js`      |  489 | App init, UI wiring, embedded `MONITOR_ROM` + `CASSETTE_ROM`, `debug.*` helpers |
| `index.html`   |  465 | Single-page UI |

The memory-mapped I/O via `onRead`/`onWrite` callbacks is a nice abstraction —
the CPU has no knowledge of the 8255 PIA, keyboard, or display.

## Loose ends

### 1. Unconditional console logging in keyboard handlers
`amico2000.js:244`, `amico2000.js:255`, `amico2000.js:266` — `console.log` fires
on every `keyDown`/`keyUp`, not gated by `window.debugKeyboard`. Spams the
console during normal use.

**Suggested fix:** wrap each in `if (window.debugKeyboard)`.

### 2. Keyboard matrix has unresolved slots
`amico2000.js:40-56` — Row 2 columns 4 and 6 are marked `?`, and multiple
function keys share positions:
- `[2,1]` — AD / REG / RES
- `[2,3]` — DA / PC / GO

It works in practice because the ROM disambiguates by context, but the
comment claims the layout is "empirically confirmed." More accurate to
call it "empirically sufficient — two positions and some function-key
collisions remain unverified."

### 3. Two `DOMContentLoaded` handlers in main.js
`main.js:140` sets up the emulator; `main.js:487` just assigns
`window.amico = amico`. Fragile — the second handler depends on the first
having already run. Fold the assignment into the first handler.

Also: `main.js:413` initializes `window.amico = null` at script load time,
which is immediately shadowed. Remove.

## Dev clutter

Scaffolding from the keyboard-matrix discovery phase that can likely be
deleted or archived now that the matrix is settled:

- `keyboard-test.html` (156 lines)
- `keyboard-debug.html` (158 lines)
- `keyboard-matrix-test.js` (189 lines)
- `KEYBOARD_TESTING_GUIDE.md` (198 lines)
- `GEMINI3.md` (67 lines — ROM analysis, no longer the active reference)

`NEXT_SESSION.md` (265 lines) reads like a handoff note; its content
overlaps with `CHANGELOG.md` and `README.md`. Consider folding the
workflow instructions into `README.md` and retiring the file.

`original-documentation.html` (staged, new, 20 lines) is an empty HTML
skeleton containing three archive.org links. These belong in
`README.md` under Credits/History, not as their own file.

## Minor issues

- `README.md:16-25` — Project structure diagram shows a `js/` subdirectory
  that doesn't exist. Files are at repo root per `index.html`.
- No automated tests. For a hobby project this is fine, but if you ever
  want confidence in the less-exercised 6502 opcodes, the Klaus Dormann
  functional test suite is the standard.
- `cpu6502.js:49-54` — Comment says RAM inits to `$FF`, and
  `amico2000.js:337-339` overwrites `$0000-$07FF` to `$00` on reset. Both
  correct, but the two comments don't cross-reference, which can confuse
  a reader arriving at either file first.

## What looks good

- The 8255 PIA partial-address-decoding behavior (`cpu6502.js:86-90`,
  `cpu6502.js:109-113`) correctly mirrors the hardware quirk — good catch
  and well commented.
- Display update decoupled from PIA writes — the architectural note in
  `amico2000.js:174-178` explains the "why" clearly.
- Authentic ROM data and authentic segment table from ROM `$FFEA`
  preserved faithfully.
- `debug.trackPC()` is a genuinely useful diagnostic and worth keeping.
- `CHANGELOG.md` is maintained consistently with the stated guidelines.