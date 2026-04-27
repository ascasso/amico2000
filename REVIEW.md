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

## Codex Review - 2026-04-26

**Reviewer:** Codex (GPT-5), first session on this project
**Scope:** Read-through of repository structure, documentation, core emulator
modules, and lightweight JavaScript checks on branch `develop`.

### Overall impression

This is a focused, readable preservation project with a sensible architecture.
The separation between `cpu6502.js`, `amico2000.js`, `display.js`, and
`main.js` is clean, and the hardware-specific comments are unusually helpful.
The PIA callback model, partial address decoding, display batching, authentic
ROM bytes, and debug console hooks all suggest the emulator has been debugged
against observed behavior rather than only sketched from a high-level design.

The main gap is confidence, not structure. The project has no automated tests,
and the riskiest code is the CPU core. `node --check` passes for the four main
JavaScript files, and a small CPU smoke test ran correctly, but a 6502 emulator
needs stronger validation around stack behavior, interrupts, BCD arithmetic,
and page-crossing behavior.

### Findings

1. `cpu6502.js:171-184` - `push16()` and `pull16()` are internally consistent,
   so `JSR`/`RTS` can appear to work, but the byte order on the physical stack
   looks reversed from real 6502 behavior. Programs that inspect return
   addresses or interrupt frames on the stack could diverge from hardware.

2. `amico2000.js:37-56` - keyboard matrix comments contradict the actual
   mapping for `E`: comments place `E` at row 0 bit 6, while `keyMap` uses
   `e: [2, 6]`. Aligning the comments with the current working map would reduce
   future debugging confusion.

3. `amico2000.js:244`, `amico2000.js:255`, `amico2000.js:266` - key
   press/release logging is unconditional. This should be gated behind
   `window.debugKeyboard` like the scan logging.

4. `main.js:413-488` - `window.amico` is initialized separately and assigned
   in a second `DOMContentLoaded` handler. Folding the assignment into the
   main initialization block would make startup ordering easier to reason about.

5. `README.md:16-25` - the project structure still shows a `js/` directory,
   but the files live at the repository root.

### Suggested next steps

- Add a small Node-compatible harness so the CPU core and machine layer can be
  tested without opening a browser.
- Run a known 6502 functional suite, such as the Klaus Dormann test, before
  treating CPU correctness as settled.
- Prune or archive the old keyboard-debug artifacts once the matrix comments
  are reconciled.
