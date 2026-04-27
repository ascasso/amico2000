# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Keyboard Scanning
The ROM's TESTAS routine expects specific I/O patterns. The keyboard matrix scanning in amico2000.js matches port B values (1, 3, 5) that the ROM uses to scan rows.
Keyboard input is active-low: unpressed columns read high, and a pressed key clears the corresponding Port A bit.

The `archived/` directory is kept for historical safekeeping only. Its review
notes and handoff files can provide context, but they are not ongoing project
guidance. Treat `CLAUDE.md` and the current source files as authoritative; in
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
5. **Automated Tests**: There is no automated CPU test harness yet — running the Klaus Dormann 6502 functional suite against the core would be the strongest next step

## Keyboard Mappings

| Amico Key | PC Key |
|-----------|--------|
| 0-9, A-F  | 0-9, A-F |
| AD        | ↑ (Arrow Up) |
| DA        | ↓ (Arrow Down) |
| PC        | P |
| REG       | R |
| +         | + or = |
| GO        | Enter or G |
| RES       | Escape or Backspace |

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
- `amico2000.js`: gate the unconditional `Key pressed` / `Key released`
  `console.log` calls behind `window.debugKeyboard`, matching the existing
  pattern used elsewhere in the file.
- `main.js`: `window.amico` is declared as `null` and then re-assigned inside a
  second `DOMContentLoaded` handler. Fold the assignment into the main init
  path so there is a single startup sequence.
- `cpu6502.js` / `amico2000.js`: cross-reference the RAM initialization
  behavior in comments. `cpu6502.js` initializes memory to `$FF`, while
  `amico2000.js` clears AMICO RAM to `$00` during machine reset for monitor ROM
  compatibility; both choices are intentional, but easy to misread in isolation.

## Pending Documentation Cleanups

- `README.md`: update the project structure diagram. It still shows a `js/`
  subdirectory, but the JavaScript files currently live at the repository root.
- Fold the archive links from `original-documentation.html` into `README.md`
  under Credits, History, or References, then remove the standalone skeleton if
  it no longer adds value.
- Once the keyboard matrix comments are reconciled, archive or remove stale
  keyboard-discovery scaffolding that is no longer part of the active workflow:
  `keyboard-test.html`, `keyboard-debug.html`, `keyboard-matrix-test.js`,
  and `KEYBOARD_TESTING_GUIDE.md`.

## Pending Verification Work

- Add a small Node-compatible harness so the CPU core and machine layer can be
  smoke-tested without opening a browser.
- Run a known 6502 functional suite, such as Klaus Dormann's tests, before
  treating stack behavior, interrupt handling, BCD arithmetic, and page-crossing
  timing as settled.
