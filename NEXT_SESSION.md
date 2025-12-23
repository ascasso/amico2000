# AMICO 2000 Emulator - Next Session Tasks

## Current Status (December 2025)

### ✅ Working Perfectly
- **Display**: Shows solid digits without flashing - "0000:00" displays correctly
  - Fixed display multiplexing to decode port B correctly (bit 0 = mode, bits 1-4 = counter)
  - Implemented persistence of vision (ignores blank patterns 0x00)
  - 60fps rendering decoupled from CPU loop

- **Keyboard**: 14 out of 16 hex keys working correctly
  - Working keys: 0-6, 8-D, F
  - Working function keys: AD, DA, +, GO/PC (partial)

### ❌ Known Issues

#### 1. Keys 7 and E Not Working (PRIORITY)
**Problem**: These two hex keys don't respond when pressed.

**What we know**:
- All other hex keys work correctly
- Row 0 (portB=1): Contains keys 6,5,4,3,2,1 (bits 0-5)
- Row 1 (portB=3): Contains keys D,C,B,A,9,8 (bits 0-5)
- Row 2 (portB=5): Contains keys 0,F,+ and function keys
  - Confirmed: [2,0]=0, [2,2]=+, [2,5]=F
  - Unknown: positions [2,1], [2,3], [2,4]

**Attempts made**:
- Tried mapping 7 to [2,1], [2,2], [2,3] - none worked
- Tried mapping E to [2,3], [2,4] - none worked
- Position [2,2] activates '+' function (confirmed)
- Position [2,3] activates DA function (confirmed)

**Next steps to try**:
1. Check the Sperimentare PDF (`Sperimentare_1980_05_supplemento.pdf`) for actual keyboard schematic
   - NOTE: PDF not yet in repository, needs to be added
2. Use the new keyboard testing tools:
   - `keyboard-debug.html` - Interactive visual testing grid
   - `keyboard-matrix-test.js` - Console-based testing script (paste into browser console)
3. Test if 7 and E might be entered differently (shift state, mode-dependent, etc.)
4. Systematically test all unknown positions: [2,1], [2,3], [2,4]
5. Consider that the original keyboard might not have had 7 and E physically present

**New Testing Tools Created**:
- `keyboard-debug.html` - Visual grid for testing each matrix position
- `keyboard-matrix-test.js` - Console helper with commands:
  - `showLayout()` - Display current known layout
  - `testKey(row, col)` - Test specific position
  - `testUnknownPositions()` - Test all 3 unknown positions in row 2
  - `findKey("7")` or `findKey("E")` - Search for specific key
  - `testModeDependentEntry()` - Test if keys need AD mode first

**Alternative Theories**:
Why might keys 7 and E be missing?

1. **Theory 1: Keys 7 and E share positions with function keys**
   - Position [2,1] currently has AD/REG/RES
   - Position [2,3] currently has DA/GO/PC
   - Position [2,4] is completely unmapped
   - Maybe 7 and E are at these positions but require a different mode or timing

2. **Theory 2: Original keyboard didn't have all 16 hex keys**
   - The AMICO 2000 was a budget kit from 1978
   - Some early 6502 systems only had 10-14 keys
   - The monitor ROM might have alternate input methods for 7 and E
   - Check if the ROM documentation mentions this limitation

3. **Theory 3: Keys require mode-dependent entry**
   - Some systems require pressing AD (address mode) before hex entry
   - Try: Press AD → Press key at [2,1] or [2,3] or [2,4] → See if 7 or E appears
   - The ROM might interpret the same physical key differently based on mode

4. **Theory 4: Keys use decimal/hexadecimal toggle**
   - Early systems sometimes had a decimal/hex mode switch
   - Keys 7 and E might only work in hex mode
   - Look for mode-switching code in the ROM disassembly

5. **Theory 5: Matrix scanning timing issue**
   - The emulator might be scanning too fast or too slow
   - Keys 7 and E might require specific timing that other keys don't
   - Less likely since other keys work correctly

**How to test these theories**:
```javascript
// Theory 1: Test all unknown positions
testUnknownPositions()

// Theory 3: Mode-dependent entry
testModeDependentEntry()

// Theory 2: Check ROM for alternate input methods
// (requires examining the Monitor ROM disassembly)

// Theory 4: Look for mode bits in PIA port C
// Check if portC is used for mode selection
console.log('Port C value:', amico.pia.portC.toString(2).padStart(8, '0'))
```

#### 2. Function Keys Partially Working
- AD (address mode) works at [2,1]
- DA (data mode) "kind of" works at [2,3]
- Other function keys (REG, PC, GO, RES) share positions with hex/mode keys

## Technical Details

### Display Multiplexing (FIXED)
The ROM uses a non-standard multiplexing scheme:
```javascript
// Port B bit 0: Mode select (0=keyboard scan, 1=display)
// Port B bits 1-4: Counter value (4-10 maps to digits 0-5)
const digitIndex = ((portB >> 1) & 0x0F) - 4;

// Display update: ignore blank patterns for persistence of vision
if (digitIndex >= 0 && digitIndex < 6 && segmentPattern !== 0) {
    this.display[digitIndex] = segmentPattern;
}
```

### Keyboard Matrix Layout (CONFIRMED)
ROM expects keys in descending order for rows 0-1:

```
SCAN    BIT 0   BIT 1   BIT 2   BIT 3   BIT 4   BIT 5
portB=1   6       5       4       3       2       1     (Row 0)
portB=3   D       C       B       A       9       8     (Row 1)
portB=5   0      AD?      +      DA?      ?       F     (Row 2)
          [2,0]  [2,1]   [2,2]   [2,3]   [2,4]   [2,5]

? = Unknown (possibly 7, E, or function keys)
```

### Current keyMap in amico2000.js
```javascript
// Hex keys that work:
'0': [2, 0], '1': [0, 5], '2': [0, 4], '3': [0, 3],
'4': [0, 2], '5': [0, 1], '6': [0, 0],
'8': [1, 5], '9': [1, 4],
'a': [1, 3], 'b': [1, 2], 'c': [1, 1], 'd': [1, 0],
'f': [2, 5],

// NOT MAPPED (need to find correct positions):
// '7': ???
// 'e': ???

// Function keys:
'ArrowUp': [2, 1],    // AD (address mode)
'ArrowDown': [2, 3],  // DA (data mode)
'+': [2, 2],          // Increment address
```

## File Structure
```
/Users/ascasso/IdeaProjects/amico2000/
├── index.html                    # Main emulator page
├── cpu6502.js                   # 6502 CPU emulator (~900 lines)
├── amico2000.js                 # Machine emulation (~460 lines)
├── display.js                   # SVG display renderer (~240 lines)
├── main.js                      # UI and initialization (~300 lines)
├── CLAUDE.md                    # Development guidelines
├── CHANGELOG.md                 # Project changelog
├── NEXT_SESSION.md              # This file - session handoff
├── KEYBOARD_TESTING_GUIDE.md    # Step-by-step guide for finding keys 7 and E
├── keyboard-debug.html          # Visual keyboard matrix testing tool
└── keyboard-matrix-test.js      # Console-based testing helper
```

## Memory Map
```
$0000-$07FF: 2KB RAM (expandable)
$FB00-$FCFF: Cassette ROM (optional, not implemented)
$FD00-$FD03: 8255 PIA I/O ports
$FE00-$FFFF: Monitor ROM (512 bytes) - authentic ASEL ROM data
```

## 8255 PIA Ports
```
$FD00 (Port A): Display segments (output) / Keyboard data (input)
$FD01 (Port B): Mode & digit select / Keyboard row scan
$FD02 (Port C): Expansion port (unused)
$FD03 (Control): 8255 configuration register
```

## Next Session Action Plan

**→ START HERE: See KEYBOARD_TESTING_GUIDE.md for detailed step-by-step instructions**

### Priority 1: Fix Keys 7 and E

1. **Use the testing tools**:
   - Open `keyboard-matrix-test.js` and paste into browser console
   - Run `showLayout()` to see current state
   - Run `testUnknownPositions()` to test all 3 unknown positions
   - Run `findKey("7")` and `findKey("E")` to search systematically
   - See KEYBOARD_TESTING_GUIDE.md for complete instructions

2. **Read the PDF** (when available): Open `Sperimentare_1980_05_supplemento.pdf` and look for:
   - Keyboard schematic/layout diagram
   - Key matrix wiring
   - Any mention of keys 7 and E
   - Photos of the original keyboard

3. **Test mode-dependent entry**:
   ```javascript
   testModeDependentEntry()  // Tests if keys need AD mode first
   ```

4. **Manual testing** (if tools don't work):
   ```javascript
   // Test what each position does when activated
   amico.keyMatrix[2][1] = true;  // Test [2,1]
   amico.keyMatrix[2][3] = true;  // Test [2,3]
   amico.keyMatrix[2][4] = true;  // Test [2,4]
   ```

### Priority 2: Complete Keyboard Mapping
- Verify all function keys (AD, DA, PC, REG, GO, RES)
- Document which keys share positions
- Update comments in amico2000.js with confirmed layout

### Priority 3: Future Enhancements (Low Priority)
- Cassette interface (file-based LOAD/SAVE)
- Breakpoint debugging UI
- Memory viewer
- Disassembly panel

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
Take time to get the details right, especially the keyboard behavior.

## References from Old Handoff (CLAUDE_CODE_HANDOFF.md)
Most information from old handoff is now obsolete. Key items preserved:
- ✅ 6502 CPU core complete with proper interrupt polling
- ✅ Display rendering complete (decoupled, 60fps)
- ✅ ROM data contains authentic ASEL Monitor ROM
- ❌ Cassette interface still not implemented
- ❌ Debugging UI still incomplete

The old keyboard matrix diagram in CLAUDE_CODE_HANDOFF.md was INCORRECT - ignore it.
Use the confirmed layout documented above instead.
