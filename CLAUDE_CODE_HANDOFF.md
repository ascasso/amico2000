# AMICO 2000 Emulator - Claude Code Project Handoff

## Project Overview

This is a web-based emulator for the **AMICO 2000**, an Italian home computer from 1978. The project includes:

1. **Complete 6502 CPU emulator** (`js/cpu6502.js`) - ~900 lines
   - All 56 opcodes, 151 instruction variants
   - All addressing modes
   - BCD arithmetic
   - Interrupt handling (IRQ, NMI, BRK)
   - Memory-mapped I/O callbacks

2. **Amico 2000 machine emulation** (`js/amico2000.js`) - ~350 lines
   - 8255 PIA emulation for display/keyboard
   - Display multiplexing
   - Keyboard matrix scanning
   - ROM loading

3. **SVG display renderer** (`js/display.js`) - ~200 lines
   - 6 seven-segment displays with LED glow effects
   - Authentic red LED appearance

4. **Main application** (`js/main.js`) - ~300 lines
   - UI initialization
   - Keyboard handling (physical + on-screen)
   - File loading
   - Debug console commands

5. **HTML/CSS interface** (`index.html`)
   - Authentic 1978 styling
   - Responsive design
   - Red hex keys, blue function keys

## Current Status

- ✅ 6502 CPU core complete (with proper interrupt polling)
- ✅ Machine emulation framework complete
- ✅ Display rendering complete (decoupled from CPU loop - 60fps)
- ✅ Keyboard input complete (ROM-accurate scanning pattern)
- ✅ ROM data in main.js contains real ROM)
- ⚠️ Keyboard row/column mapping may need fine-tuning based on actual behavior
- ❌ Cassette interface not implemented (file-based)
- ❌ Single-step debugging UI not complete

### Recent Fixes (December 2025)

1. **Performance**: Display updates decoupled from PIA writes - now updates once per frame instead of thousands of times per second
2. **Interrupt handling**: CPU now properly polls for pending NMI/IRQ before each instruction fetch
3. **Keyboard scanning**: Updated to match actual ROM TESTAS routine behavior (port B values 1, 3, 5)

## Files Location

All source files are in the `amico2000_web/` directory:
- `index.html`
- `js/cpu6502.js`
- `js/amico2000.js`
- `js/display.js`
- `js/main.js`
- `README.md`

## Original ROM Files Needed

The user has these ROM dumps:
- `prom.ic9` - Monitor ROM (512 bytes, goes at $FE00)
- `prom.ic10` - Cassette ROM (512 bytes, goes at $FB00)
- `prom.ic6`, `prom.ic7` - Address decoding PROMs (not needed for emulation)

The ROM data in `main.js` is a reconstruction and should be replaced with the actual ROM bytes from `prom.ic9` converted to a JavaScript Uint8Array.

## Key Technical Details

### Memory Map
- $0000-$07FF: 2KB RAM
- $FB00-$FCFF: Cassette ROM (optional)
- $FD00-$FD03: 8255 PIA
- $FE00-$FFFF: Monitor ROM

### 8255 PIA I/O
- Port A ($FD00): Display segments (output) / Keyboard column data (input)
- Port B ($FD01): Digit select (bits 0-5) / Row scan (bits 0-3)
- Port C ($FD02): Expansion port
- Control ($FD03): 8255 mode register

### Display
6 seven-segment displays arranged as: `[A3][A2][A1][A0] : [D1][D0]`
- A3-A0: 4-digit address
- D1-D0: 2-digit data

### Keyboard Matrix (4 rows × 6 columns)
```
       COL0  COL1  COL2  COL3  COL4  COL5
ROW0:  [0]   [1]   [2]   [3]   [AD]  [PC]
ROW1:  [4]   [5]   [6]   [7]   [DA]  [REG]
ROW2:  [8]   [9]   [A]   [B]   [+]   (empty)
ROW3:  [C]   [D]   [E]   [F]   [GO]  [RES]
```

## Next Steps for Claude Code

1. **Test with real ROM**: Replace placeholder ROM data with actual bytes from `prom.ic9`

2. **Verify keyboard scanning**: The ROM's keyboard scan routine expects specific timing and I/O patterns. May need to trace through the disassembly to match exactly.

3. **Add cassette emulation**: Implement file-based LOAD/SAVE that intercepts the cassette ROM calls

4. **Improve debugging**: Add breakpoints, memory viewer, disassembly panel

5. **Test programs**: Create sample 6502 programs to verify emulation accuracy

## Related Files (from previous session)

The user also has annotated disassemblies:
- `amico2000_monitor.asm` - Full monitor ROM disassembly with comments
- `amico2000_cassette_rom.asm` - Cassette ROM disassembly

And hardware design docs for a physical replica:
- `SCHEMATIC_DESIGN.md` - PCB design for Raspberry Pi version
- `hardware_test.py` - Hardware test script

## Running the Emulator

Simply open `index.html` in a browser. No build step required.

For development, use a local server to avoid CORS issues with file loading:
```bash
cd amico2000_web
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Contact / Context

This project recreates the computer that the user's father built from a kit in 1978.
The original machine was later discarded, and this emulator serves as both a
preservation effort and a personal memorial project.
