# AGENTS.md

This file provides repository guidance for agents working in this repository.

## Agent Operating Contract

- Treat this file and the current source as the repository's source of truth.
  Files under `archived/` are historical context only unless a task explicitly
  asks for archival work.
- Inspect the current Git state and relevant files before changing anything.
  Preserve unrelated worktree changes and keep edits narrowly scoped.
- For implementation work, update `CHANGELOG.md` under `[Unreleased]` and add
  a concise entry to the dated engineering log in `docs/logs/`.
- Fully document every change, including its purpose, scope, and verification;
  commit the complete change in one or more focused logical commits before
  handoff.
- Run the narrowest relevant checks before handoff. At minimum, use
  `git diff --check`; for JavaScript changes also run `node --check` on the
  affected files and the targeted Node test when applicable.
- Do not add a build system or test framework for a small fix. Prefer the
  existing browser workflow and dependency-free Node checks.
- Do not push, publish, or alter external GitHub state unless explicitly asked.
- Report browser/manual-test limitations clearly when a check cannot be
  automated.

## Project Overview

This is a browser-based emulator for the **AMICO 2000**, an Italian home computer (ASEL Milano, 1978) that the project owner's father built from a kit. This is a preservation and memorial project recreating a machine that was later discarded.

## Running the Emulator

No build step is required. To run:

```bash
# Open index.html directly in a browser, or use a local server to avoid CORS issues:
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Testing the Emulator

- Run the committed regression checks with `node --test tests/`, or a single
  file, e.g. `node --test tests/cpu6502-decimal-sbc.test.js`
- Open the browser console (F12) to access debug commands
- Use `debug.mem(0x0000, 16)` to dump memory
- Use `debug.state()` to show CPU state
- Access emulator internals directly: `amico.cpu.PC`, `amico.cpu.A`, etc.

## Code Architecture

The project consists of four modular JavaScript files:

### 1. cpu6502.js (~1100 lines)
Complete 6502 CPU interpreter implementing:
- All 56 opcodes with 151 instruction variants
- All addressing modes
- BCD arithmetic
- Interrupt handling (IRQ, NMI, BRK)
- Memory-mapped I/O via callbacks (`readCallback`, `writeCallback`)
- Approximate timing (~1 MHz target via cycle counts per instruction; not cycle-accurate — see Known Limitations)

**Key architectural details:**
- Memory is a flat 64KB Uint8Array
- I/O callbacks allow the machine emulator to intercept reads/writes to specific addresses
- Interrupts are polled before each instruction fetch (see `_checkInterrupts()`)
- Stack lives at $0100-$01FF (standard 6502)

### 2. amico2000.js (~500 lines)
Machine emulation layer that connects CPU to hardware:
- Manages 8255 PIA (Programmable Interface Adapter) for I/O
- Implements display multiplexing (refreshes 6 digits sequentially)
- Keyboard matrix scanning (3 rows × 7 columns)
- ROM/RAM memory mapping

**Key architectural details:**
- The 8255 PIA is memory-mapped at $FD00-$FD03:
  - $FD00 (Port A): Display segments (output) / Keyboard column data (input)
  - $FD01 (Port B): Digit select bits 0-5 / Keyboard row scan bits 0-3
  - $FD02 (Port C): Expansion port (unused)
  - $FD03: Control register
- Display updates are decoupled from PIA writes for performance - buffered and updated once per frame
- Keyboard scanning matches the ROM's timing expectations (port B values: 1, 3, 5 for rows 0, 1, 2)

### 3. display.js (~240 lines)
SVG-based seven-segment display renderer:
- 6 displays arranged as: [A3][A2][A1][A0] : [D1][D0]
- Authentic red LED appearance with glow effects
- Runs at 60fps via `requestAnimationFrame`, independent of CPU speed

**Implementation note:** Display updates are intentionally separated from the CPU loop to avoid thousands of DOM updates per second.

### 4. main.js (~490 lines)
Application initialization and UI:
- Contains the Monitor ROM data (MONITOR_ROM constant at top of file)
- Keyboard event handling (both physical keyboard and on-screen buttons)
- ROM file loading via file input
- Debug console commands exposed via global `debug` object

**Memory Map:**
```
$0000-$07FF: 2KB RAM (expandable)
$FB00-$FCFF: Cassette ROM (embedded as CASSETTE_ROM in main.js; opt-in via amico.loadCassetteROM)
$FD00-$FD03: 8255 PIA I/O ports
$FE00-$FFFF: Monitor ROM (512 bytes)
```

Both PROM regions are read-only to the running program; see ROM Write
Protection below.

## Important Implementation Notes

### Performance
The display update system is decoupled from PIA writes. The emulator runs the CPU at ~1MHz, but display updates happen once per frame (60Hz). This prevents performance issues from excessive DOM manipulation.

### Interrupt Handling
The CPU properly polls for pending NMI/IRQ before each instruction fetch. This matches real 6502 behavior and is critical for correct emulation.

### Decimal ADC/SBC
The AMICO 2000 uses an NMOS 6502. Decimal-mode ADC/SBC should follow NMOS flag
behavior: the accumulator and carry are BCD-adjusted, while Z/V and ADC's N are
derived from the underlying/intermediate binary ALU state rather than from a
65C02-style simplified decimal result. Decimal mode does **not** add an extra
cycle on NMOS 6502; base cycles are charged in `CPU6502.step()`, with only
dynamic branch/page-crossing penalties added by handlers.

### ROM Write Protection

Issue #31: the PROMs at IC9 ($FE00-$FFFF) and IC10 ($FB00-$FCFF) have no write
line, so a store into their address space is decoded and then lost. The machine
layer models this the same way it models the PIA, by registering write
callbacks over both regions in `Amico2000._protectROM()`; the generic CPU core
keeps its plain writable 64KB array and stays layout-agnostic.
`Amico2000.ROM_REGIONS` is the single place the layout is declared.

The IC10 region is protected whether or not a cassette PROM has been loaded: an
empty socket latches a store no better than a fitted chip does.

Three paths write `cpu.memory[]` directly and therefore bypass those callbacks.
Two are deliberate and must keep working: `loadMonitorROM()` and
`loadCassetteROM()` install an image the way fitting a chip does, bounded to
the size of the socket. The others validate their destination against
`_findROMOverlap()`: `loadProgram()` throws, and the trapped IC10 tape LOAD
returns the routine's own `$0000 = $FF` error status because the monitor
expects a status byte, not an exception.

Both of those bound the destination before comparing it against the regions.
`CPU6502.loadBinary()` masks every write with `& 0xFFFF`, so an address above
`$FFFF` or below zero wraps back into the address space -- `$1FE00` and
`-$200` both land on `$FE00` -- while the unmasked value overlaps no region.
`loadProgram()` rejects such an address rather than masking it, because the
board has no address line above A15 and relocating a caller's data silently
would hide the caller's bug. The tape LOAD path was already bounded by its
`loadAddress + length > memory.length` check, and its address comes from two
guest RAM bytes, so it cannot leave the 16-bit space to begin with.

The vectors are the reason this is more than cosmetic. `CPU6502.reset()` reads
its new PC from `$FFFC`, so before the fix a single `STA $FFFC` left the board
with no way back to the monitor, defeating the Reset control as well. Covered
by `tests/rom-write-protection.test.js`.

Note that `amico.writeMemory()` goes through `cpu.write()` and so cannot patch
ROM either; that is intentional, and the ROM loaders remain the way to change a
PROM image from the console.

### Reset Semantics

Issue #30: the board has two different resets, and the emulator keeps them
apart deliberately.

`Amico2000.res()` is the RES key, and RES on the real board drives the 6502
reset line rather than being a key in the scanned matrix. The CPU vectors
through `$FFFC` to the monitor's cold-start entry at `$FE22`, so it recovers a
tight loop and an illegal-opcode halt alike with no cooperation from the
running code. The manual's own description is the evidence: RES "permette di
arrestare l'esecuzione di un programma utente in qualsiasi momento passando il
controllo del sistema al monitor". The 8255's RESET pin is on the same line, so
`res()` also clears the PIA and blanks the display.

`Amico2000.reset()` is the power-on reset and keeps exactly the behavior it
always had: clear all 2KB of RAM, seed the monitor's RAM-resident IRQ/NMI
vectors at `$03FC-$03FF` to `$FE30`, then call `res()`. It is what `main.js`
runs at startup and what the bench **Cold reset** control invokes.

**RES preserves RAM.** This is a deliberate fidelity decision, not an
oversight. The Sperimentare clock tutorial has the reader press RES to stop the
program at `$0300`, then re-enter values at `$0000-$0002` and tune `$0312`; the
program is plainly still in memory afterwards. Two consequences follow, both
matching the hardware: `$03FC-$03FF` keep whatever a program left in them,
because `$FE22` reinitialises `$FA`, `$FB` and `$FE` but not those, so the
power-on reset is the only way back from a program that trashed them; and RES
does not touch `this.running`, because pausing is a debugging facility with no
counterpart on the board.

Escape and Backspace are listed in `Amico2000.resetKeys`, checked by
`keyDown()` before the matrix and exposed through `isResetKey()` so `main.js`
can still call `preventDefault()` for them. They previously sat at shared
matrix positions, so Escape also typed AD and Backspace also typed 5. Covered
by `tests/res-reset.test.js`.

### Keyboard Scanning
The ROM's TESTAS routine expects specific I/O patterns. The keyboard matrix scanning in amico2000.js matches port B values (1, 3, 5) that the ROM uses to scan rows.
Keyboard input is active-low: unpressed columns read high, and a pressed key clears the corresponding Port A bit.

The `archived/` directory is kept for historical safekeeping only. Its review
notes and handoff files can provide context, but they are not ongoing project
guidance. Treat `AGENTS.md` and the current source files as authoritative; in
particular, `archived/GEMINI3.md` contains a keyboard matrix table that does not
match the current working implementation.

### ROM Data
The MONITOR_ROM array in main.js contains the actual monitor ROM bytes. When loading ROM files:
- `prom.ic9` goes at $FE00 (Monitor ROM, 512 bytes) - **required**
- `prom.ic10` goes at $FB00 (Cassette ROM, 512 bytes) - optional
- Other .bin files load as programs at $0000

**Note on hardware PROMs**: The original AMICO 2000 used `prom.ic6` and `prom.ic7` for address decoding logic (generating chip-select signals). These are **not needed** in the emulator as address decoding is implemented in software through the CPU's memory read/write callbacks.

### Cassette Interface Reference

The Sperimentare supplement, Chapter V ("L'uso del registratore a cassette"),
documents the original cassette workflow:

- `IC10` is the cassette management PROM at $FB00-$FCFF.
- The user jumps to PC $FC54 for cassette LOAD and PC $FBBC for cassette SAVE.
- LOAD parameters: $0000 = program identifier, $0001 = desired load address low
  byte, $0002 = desired load address high byte. If $0002 is $FF, the routine
  loads at the address recorded on tape.
- SAVE parameters: $0000/$0001 = start address, $0002/$0003 = end address,
  $0004 = program identifier.
- The documented tape record structure is leader, start byte, identifier, load
  address, byte count, program data, checksum, trailing leader.
- The original analog tape rate is about 300 bit/s, with a 1KB program taking
  roughly 45 seconds including leader/trailer sections.
- Physical recorder wiring uses `GND`, `IN` to the microphone input, and `OUT`
  from the speaker output.

The emulator's current cassette support is intentionally file-backed: it traps
the IC10 entry points and reads/writes `.amtape` images instead of emulating the
analog signal path or exact Port A/B timing.

Return convention (issue #24): the IC10 routines do not end in `RTS`. They exit
with `JMP $FE22`, the monitor's reset entry and the `$FFFC` vector target, whose
preamble runs `LDX #$FF / TXS` at `$FE28-$FE2A` and reinitialises `SP` to `$FF`.
The traps therefore set `PC = $FE22` without unwinding any `JSR` frame, which
matches the original ROM and cannot leak stack space. Do not add a `pull16()`
there: the ROM also re-enters LOAD with `JMP $FC54` (no frame pushed), so an
unconditional pull would corrupt the stack on that path. Protected by
`tests/cassette-trap-stack.test.js`.

## Development Guidelines

### Code Comments
All new code and code changes should include clear, meaningful comments:

**What to comment:**
- **Why, not what**: Explain the reasoning behind implementation choices, not what the code obviously does
- **Hardware behavior**: Document how the code maps to real AMICO 2000 or 6502 hardware behavior
- **Non-obvious logic**: Clarify complex algorithms, bit manipulations, or timing-critical code
- **Edge cases**: Explain handling of special cases or boundary conditions
- **Performance choices**: Note why a particular approach was chosen for efficiency

**What NOT to comment:**
- Self-explanatory code (e.g., `i++; // increment i`)
- Redundant descriptions that just restate the code
- Commented-out code (remove it; git preserves history)

**Examples of good comments:**
```javascript
// The 8255 PIA uses partial address decoding, so $FD00-$FDFF all map to $FD00-$FD03
// This matches real hardware behavior where not all address lines are decoded

// Decouple display updates from PIA writes to avoid thousands of DOM updates per second
// Real hardware updates at ~500Hz, but we batch updates at 60fps

// Scan keyboard matrix using port B values 1, 3, 5 to match ROM's TESTAS routine expectations
```

### Changelog Maintenance
**IMPORTANT**: Whenever you make any changes to the codebase, you MUST update CHANGELOG.md:
- Add entries under the `[Unreleased]` section
- Use the appropriate category: `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated`, or `Security`
- Write clear, user-facing descriptions of what changed and why

### GitHub Issue References
When implementing changes based on a GitHub issue:
- Reference the issue number in the CHANGELOG.md entry (e.g., "Fixed display flickering (#42)")
- Include the issue reference in relevant code comments (e.g., `// Fix for #42: Handle edge case when...`)
- This maintains traceability between issues, code changes, and release notes

## Known Limitations

1. **Browser Tab Throttling**: Modern browsers throttle `requestAnimationFrame` when tabs are backgrounded, causing the emulator to pause/slow down
2. **Cassette I/O**: File-backed mock cassette LOAD/SAVE is implemented by
   trapping the IC10 ROM entry points ($FBBC and $FC54), but the analog
   300-bit/s tape waveform and Port A/B signal timing are not cycle-emulated
3. **Keyboard Matrix**: Does not simulate ghosting that occurs on real hardware when multiple keys are pressed
4. **Timing**: The CPU runs at approximately 1MHz but is not cycle-accurate; sufficient for the monitor ROM and simple programs
5. **Automated Tests**: Coverage is limited to targeted dependency-free CPU
   regression checks; running the Klaus Dormann 6502 functional suite against
   the core would provide broader confidence

## Keyboard Mappings

| Amico Key | PC Key |
|-----------|--------|
| 0-9, A-F  | 0-9, A-F |
| AD        | ↑ (Arrow Up) |
| DA        | ↓ (Arrow Down) |
| HLT       | P |
| REG       | R |
| ↑ (increment) | + or = |
| RUN       | Enter or G |
| RES       | Escape or Backspace |

RES is not a matrix key; see Reset Semantics above.

The on-screen keys are labelled with the legends silkscreened on the original
board. Two of them were previously labelled after their emulator identity rather
than the hardware: `RUN` was shown as `GO`, and `HLT` was shown as `PC`. The
`data-key` values in `index.html` still read `go` and `pc`, and the matrix
positions in `amico2000.js` are unchanged, so the rename is presentational only.
The `HLT`/`pc` correspondence is inferred from key position on the board and is
not confirmed against the monitor ROM.

## Historical Context

The AMICO 2000 was published in "Sperimentare" magazine starting December 1978, designed by ASEL (Milano) and sold as a kit. Features included:
- MOS 6502 CPU @ 1MHz
- 1KB RAM (expandable to 2KB)
- 512 bytes Monitor ROM
- 6 seven-segment LED displays
- Hexadecimal keypad (23 keys)

## Pending Source-Level Cleanups

These are small code-hygiene items, tracked here so future agents pick them up
opportunistically rather than treating them as required for any specific task:

- `amico2000.js`: the `keyMap` row/col comments are out of sync with the actual
  table (e.g. `e` is `[2, 6]` but the comments still describe row 2 bit 6 as
  unknown and row 0 bit 6 as `E`). Reconcile the comments with the table.
  While doing this, document that some function keys intentionally share
  matrix positions because the monitor ROM disambiguates them by context.
  Note that RES no longer shares a position with AD/REG: it left the matrix
  entirely in #30.
- `main.js`: `window.amico` is declared as `null` and then re-assigned inside a
  second `DOMContentLoaded` handler. Fold the assignment into the main init
  path so there is a single startup sequence.
- `cpu6502.js` / `amico2000.js`: cross-reference the RAM initialization
  behavior in comments. `cpu6502.js` initializes memory to `$FF`, while
  `amico2000.js` clears AMICO RAM to `$00` during machine reset for monitor ROM
  compatibility; both choices are intentional, but easy to misread in isolation.

## Pending Documentation Cleanups

- Fold the archive links from `original-documentation.html` into `README.md`
  under Credits, History, or References, then remove the standalone skeleton if
  it no longer adds value.
- Once the keyboard matrix comments are reconciled, archive or remove stale
  keyboard-discovery scaffolding that is no longer part of the active workflow:
  `keyboard-test.html`, `keyboard-debug.html`, `keyboard-matrix-test.js`,
  and `KEYBOARD_TESTING_GUIDE.md`.

## Pending Verification Work

- Expand the small Node-compatible regression coverage so the CPU core and
  machine layer can be smoke-tested without opening a browser.
- Run a known 6502 functional suite, such as Klaus Dormann's tests, before
  treating stack behavior, interrupt handling, BCD arithmetic, and page-crossing
  timing as settled.
