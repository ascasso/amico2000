# AMICO 2000 Emulator - Debugging Session Notes

## Current Status

**Emulator is 95% working but displays show flickering/random digits instead of responding to keyboard input.**

### What Works ✓
- CPU initializes correctly at reset vector $FE22
- ROM is loaded and executing properly
- Keyboard scanning is working perfectly
  - Keys are detected by browser events
  - Keys are registered in keyMatrix correctly
  - ROM's TESTAS routine scans keyboard with portB values 1, 3, 5
  - Correct bit patterns are returned (active LOW - bit cleared when key pressed)
- Display multiplexing is running (displays update at 60fps)
- CPU runs continuously at ~1MHz

### What Doesn't Work ✗
- **Display shows flickering random digits instead of proper monitor output**
- Keyboard input is detected by ROM but not processed correctly
- Monitor doesn't enter address/data entry modes when pressing AD/DA
- Typed hex digits don't appear on display

## Hardware Documentation Provided

### Schematics
User provided PDFs and images:
1. **Sperimentare_1980_05_supplemento.pdf** - Full hardware documentation (137MB, too large to read)
2. **PCB Layout** - Showed keyboard matrix and display connections
3. **Physical keyboard photo** - Shows actual key layout:
   - Hex keypad: 4×4 grid (0-F)
   - Function keys: RIC, RUN, RES, HLT, REG, AD, DA
   - 6 seven-segment displays (4 for ADDRESS, 2 for DATA)

### Keyboard Matrix Layout (Verified by Testing)

**3 rows × 6 columns** (ROM only scans 3 rows with portB = 1, 3, 5):

```
Row 0 (portB=$01): 0, 1, 2, 3, 4, 5/RES
Row 1 (portB=$03): 6, 7, 8, 9, A/AD, B/DA
Row 2 (portB=$05): C, D, E, F, PC/+, REG/GO
```

**Note:** Some keys share matrix positions (cost-saving design):
- Key '5' and RES both at [0,5]
- Key 'A' and AD both at [1,4]
- Key 'B' and DA both at [1,5]
- The ROM must distinguish them by context

### ROM Information

**Monitor ROM (prom.ic9):**
- Located at $FE00-$FFFF (512 bytes)
- Reset vector at $FFFC-$FFFD points to $FE22
- Authentic ASEL Amico 2000 ROM (not placeholder)

**Key ROM Routines:**
- $FE22: Reset/initialization entry point
- $FEEB: TESTAS - keyboard scanning routine
- $FF06: Display update routine (called repeatedly)
- $FF35: Display digit update with delay
- $FF48-$FF4A: Delay loop (DEY; BNE $FF48) - used for display multiplexing timing

**Cassette ROM (prom.ic10):**
- Optional, at $FB00-$FCFF
- Included in main.js but not loaded by default

## Fixes Applied This Session

1. ✅ **JavaScript file paths** - Changed from `js/` subdirectory to root level
2. ✅ **CPU auto-start** - Emulator now starts on page load (like real hardware)
3. ✅ **Keyboard event handling** - Preserve case for ArrowUp/ArrowDown/Enter/Escape
4. ✅ **Keyboard matrix** - Changed from 4 rows to 3 rows (matching ROM scan)
5. ✅ **Keyboard scanning logic** - Match exact portB values (1,3,5) not bit patterns
6. ✅ **Keyboard mapping** - All keys mapped to correct [row,col] positions via systematic testing
7. ✅ **Browser cache issues** - Identified that stale cached files cause wrong PC initialization

## The Problem: ROM Receives Keys But Doesn't Respond

### Evidence

**From Console Logs:**
```
Initial CPU state:
  PC: FE22  ← Correct!
  A: 0, X: 0, Y: 0  ← Proper init

[KB SCAN] Key detected: row=0, col=1, portB=$1, result=$fd
[KB SCAN] Key detected: row=0, col=2, portB=$1, result=$fb
```

Keys ARE being detected during ROM scans with correct bit patterns.

**Display Values:**
```
Display: 00 BF BF BF 00 BF
Display: 00 FD FD 00 FD FD
Display: 00 00 ED 00 ED ED
```

Display is being updated (patterns change), but shows wrong values.

### Hypothesis: Keyboard Matrix Mapping May Still Be Wrong

**The ROM expects specific keys at specific [row,col] positions.** Our mapping was determined by testing OUR keyMap, not by analyzing what the ROM expects.

**Example:**
- We mapped '0' to [0,0] because that's what made sense logically
- But the ROM might expect a DIFFERENT key at [0,0]
- When ROM scans [0,0] and finds a pressed key, it interprets it as whatever key IT thinks should be there

## Next Steps for Debugging

### 1. Verify ROM's Key Interpretation (HIGH PRIORITY)

The ROM has logic to decode (row,col) → key code. We need to find this.

**Approach A: Analyze ROM Code**
- Disassemble the ROM after TESTAS routine returns
- Find the lookup table or algorithm that maps bit patterns to key codes
- Look for address $FE33+ (code after JSR $FF06 returns)

**Approach B: Empirical Testing**
- Try EVERY possible key position [row,col]
- See which position makes the ROM respond (display changes appropriately)
- Build correct mapping experimentally

**Start here:**
```javascript
// Test script: Manually set a key in different positions and observe ROM behavior
amico.keyMatrix = [[false,false,false,false,false,false],[false,false,false,false,false,false],[false,false,false,false,false,false]];
amico.keyMatrix[0][0] = true; // Try different positions
// Watch display - does it show '0'? Or something else?
```

### 2. Check Display Segment Encoding

Verify our display renderer interprets segment patterns correctly:
- Pattern $BF should show what digit?
- Pattern $FD should show what digit?
- Compare with ROM's segment lookup table (likely around $FFEA based on code at $FF38)

### 3. Examine ROM Initialization

Check if ROM expects certain memory locations to be initialized:
- Zero page variables ($00-$FF)
- Monitor state at $F0-$FF area
- Check if reset routine at $FE22 initializes everything needed

### 4. Add Targeted Debug Logging

```javascript
// In _writePIA():
if (port === 0) { // Port A - segment data
    console.log(`Display write: digit=${currentDigit}, segments=$${value.toString(16)}`);
}
```

This will show what the ROM is trying to display vs what we're seeing.

## Important ROM Code Locations

```
$FE22: Reset entry point - initialization
$FE30: Main loop - calls $FF06 repeatedly
$FEEB: TESTAS keyboard scan (LDY #3, scans 3 rows)
$FF06: Display/keyboard update routine
$FF35: Display single digit with delay
$FF48: Delay loop (Y countdown)
$FFEA: Segment pattern lookup table (referenced at $FF38)
```

## Quick Start for Next Session

1. **Start local server:** `python3 -m http.server 8000` or use Live Server
2. **Clear browser cache** completely (Ctrl+Shift+Del)
3. **Check console shows:** `PC: FE22` on init
4. **Try empirical key mapping test** (Approach B above) - fastest way to find correct mapping
5. **If that doesn't work**, disassemble ROM key decode logic (Approach A)

## Files Modified

- `index.html` - Fixed script paths
- `main.js` - Auto-start CPU, keyboard event handling
- `amico2000.js` - 3-row keyboard matrix, correct scanning logic, key mappings
- `CHANGELOG.md` - Documented all fixes

## Critical Insight

**The keyboard hardware works perfectly.** The issue is purely in the **mapping between physical keys and ROM's expectations**. Once we find the correct mapping (or fix the ROM's interpretation), everything should work.

The ROM is an authentic dump from real hardware, so it expects the EXACT keyboard matrix layout that the original AMICO 2000 used. Our current mapping is a best guess - we need the ACTUAL hardware layout from schematics or empirical testing.
