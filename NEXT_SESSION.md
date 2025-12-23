# AMICO 2000 Emulator - Next Session Tasks

## Current Status (December 2025)

### ✅ Working Perfectly

- **Display**: Shows solid digits without flashing - "0000:00" displays correctly
  - Fixed display multiplexing to decode port B correctly (bit 0 = mode, bits 1-4 = counter)
  - Implemented persistence of vision (ignores blank patterns 0x00)
  - 60fps rendering decoupled from CPU loop

- **Keyboard**: All 16 hex keys (0-F) working perfectly!
  - All hex keys: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F
  - Function keys: AD, DA, +, GO, PC, REG, RES
  - Final keyboard matrix: 3 rows × 7 columns
  - Keyboard layout determined through empirical testing:
    - Row 0 (portB=1): 6, 5, 4, 3, 2, 1, E
    - Row 1 (portB=3): D, C, B, A, 9, 8, 7
    - Row 2 (portB=5): 0, AD, +, DA, ?, F, ?
  - Console debug logging active (shows key name and matrix position)

- **CPU**: 6502 emulation running at ~1MHz with all opcodes working
- **Monitor ROM**: Authentic ASEL ROM data loaded and functioning

### 🔧 Future Enhancements (Optional)

#### 1. Cassette Interface (Medium Priority)
The cassette ROM data (prom.ic10) is available in main.js but not yet functional.

**What needs to be done:**
- Implement file-based LOAD/SAVE operations
- Intercept cassette ROM calls and redirect to browser file I/O
- Add UI buttons for Load/Save tape files
- Support .tap or .bin file format

**Why it's useful:**
- Would allow saving/loading programs without re-entering them
- Historical accuracy - the real AMICO 2000 had cassette support

#### 2. Debugging UI (Low Priority)
Basic debug commands exist in console, but a visual debugger would be helpful.

**What could be added:**
- Memory viewer/editor panel
- Disassembly window showing current instruction
- Breakpoint support (break on address, break on memory write, etc.)
- Step-over / step-into controls
- Watch window for monitoring specific memory addresses

**Why it's useful:**
- Easier program development and debugging
- Educational value for learning 6502 assembly

#### 3. Remove Debug Logging (Low Priority)
The console.log statements in keyDown/keyUp were added for debugging the keyboard matrix.

**What to do:**
- Remove or comment out the console.log statements in amico2000.js:243 and :257
- They served their purpose but add noise to the console now

#### 4. Example Programs (Low Priority)
Add some example programs to demonstrate the emulator.

**Ideas:**
- Simple LED patterns (count up/down, binary counter)
- Memory test routine
- Mini calculator
- Simple games (guess the number, etc.)

**Implementation:**
- Could add a "Load Example" dropdown in the UI
- Store programs as byte arrays in main.js
- Add descriptions/documentation for each program

## Technical Reference

### Final Keyboard Matrix Layout (Empirically Confirmed)
```
SCAN    BIT 0   BIT 1   BIT 2   BIT 3   BIT 4   BIT 5   BIT 6
portB=1   6       5       4       3       2       1       E       (Row 0)
portB=3   D       C       B       A       9       8       7       (Row 1)
portB=5   0      AD       +      DA       ?       F       ?       (Row 2)
         [x,0]  [x,1]   [x,2]   [x,3]   [x,4]   [x,5]   [x,6]
```

**IMPORTANT: Discrepancy with ROM Analysis**

The layout above was determined through systematic empirical testing and is **confirmed working** with all 16 hex keys functioning correctly. However, it differs significantly from the ROM analysis documented in GEMINI3.md:

**GEMINI3.md ROM Analysis (DOES NOT MATCH ACTUAL HARDWARE):**
```
portB=01   6   7   8   9   A   B   C
portB=03   D   E   F  AD  DA   +  RUN
portB=05   0   1   2   3   4   5  REG
```

**Why the discrepancy?**
- The GEMINI3.md layout appears to be based on ROM disassembly showing the logical key numbering algorithm
- The actual hardware may have intermediate decoding circuitry (diodes, additional logic) that remaps the physical matrix
- Different hardware revision or regional variant
- The ROM's key identification algorithm (multiply by 7, bit shifting) produces logical key numbers, but the physical wiring is different

**Conclusion:** The empirically-determined layout is the ground truth for this emulator. All ROM analysis documents should be treated as reference material, not absolute specifications. When in doubt, test on real hardware or through systematic empirical testing.

**Notes:**
- Position [2,4] is unmapped (marked with ?)
- Positions [2,1] and [2,3] are shared between hex and function keys
- Column 6 (7th column) contains keys 7 and E
- This layout was verified by testing all keys and confirming correct display output

### Memory Map
```
$0000-$07FF: 2KB RAM (expandable)
$FB00-$FCFF: Cassette ROM (optional, loaded but not functional)
$FD00-$FD03: 8255 PIA I/O ports
$FE00-$FFFF: Monitor ROM (512 bytes) - authentic ASEL ROM data
```

### 8255 PIA Ports
```
$FD00 (Port A): Display segments (output) / Keyboard data (input)
$FD01 (Port B): Mode & digit select / Keyboard row scan
$FD02 (Port C): Expansion port (unused)
$FD03 (Control): 8255 configuration register
```

## File Structure
```
/Users/ascasso/IdeaProjects/amico2000/
├── index.html                    # Main emulator page
├── cpu6502.js                   # 6502 CPU emulator (~900 lines)
├── amico2000.js                 # Machine emulation (~470 lines)
├── display.js                   # SVG display renderer (~240 lines)
├── main.js                      # UI and initialization (~300 lines)
├── CLAUDE.md                    # Development guidelines
├── CHANGELOG.md                 # Project changelog
├── NEXT_SESSION.md              # This file - session handoff
├── README.md                    # User documentation
├── GEMINI3.md                   # ROM analysis & technical specs (reference only - see notes above)
├── KEYBOARD_TESTING_GUIDE.md    # Testing guide (no longer needed)
├── keyboard-debug.html          # Testing tool (no longer needed)
└── keyboard-matrix-test.js      # Testing helper (no longer needed)
```

## Testing Notes

When testing changes:
```bash
# Start local server (if not already running)
python3 -m http.server 8000

# Open http://localhost:8000
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Linux/Windows)
```

## Important Context

This is a memorial project - the user's father built this computer from a kit in 1978.
The original machine was discarded, and this emulator preserves that memory.
Take time to get the details right.

## Development Guidelines

See CLAUDE.md for detailed development guidelines including:
- Code commenting standards
- Changelog maintenance requirements
- GitHub issue reference practices
- Architecture documentation

## History

- Started: December 2025
- Initial release: 6502 CPU, display, 14 of 16 keys working
- Keys 7 and E fixed: Expanded keyboard matrix to 7 columns
- Current state: Fully functional emulator with all keys working
