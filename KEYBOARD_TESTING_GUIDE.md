# Keyboard Testing Guide - Finding Keys 7 and E

This guide helps you systematically test the keyboard matrix to find the missing keys 7 and E.

## Quick Start

### Method 1: Using the Console Helper (Recommended)

1. **Start the emulator**:
   ```bash
   python3 -m http.server 8000
   # Open http://localhost:8000 in your browser
   ```

2. **Open browser console** (F12 or Cmd+Option+I on Mac)

3. **Load the testing script**:
   ```javascript
   // Copy and paste the contents of keyboard-matrix-test.js into the console
   ```

4. **Display the current layout**:
   ```javascript
   showLayout()
   ```

5. **Test unknown positions**:
   ```javascript
   testUnknownPositions()
   // Watch the emulator display to see what each position does
   ```

6. **Search for specific keys**:
   ```javascript
   findKey("7")  // Test each unknown position looking for key 7
   findKey("E")  // Test each unknown position looking for key E
   ```

7. **Test mode-dependent entry**:
   ```javascript
   testModeDependentEntry()
   // This tests if 7/E need AD mode to be pressed first
   ```

### Method 2: Using the Visual Grid

1. Open `keyboard-debug.html` in a new browser tab

2. Make sure the main emulator is running in another tab/window

3. Click buttons in the grid to test each position

4. Watch the emulator display to see what happens

### Method 3: Manual Console Testing

If the helper script doesn't work, you can test positions manually:

```javascript
// Test position [2,1]
amico.keyMatrix[2][1] = true;  // Press
setTimeout(() => { amico.keyMatrix[2][1] = false; }, 300);  // Release after 300ms

// Test position [2,3]
amico.keyMatrix[2][3] = true;
setTimeout(() => { amico.keyMatrix[2][3] = false; }, 300);

// Test position [2,4]
amico.keyMatrix[2][4] = true;
setTimeout(() => { amico.keyMatrix[2][4] = false; }, 300);
```

## What We Know So Far

### Working Keys (14/16)
```
Row 0: 6, 5, 4, 3, 2, 1
Row 1: D, C, B, A, 9, 8
Row 2: 0, ?, +, ?, ?, F
       ↑  ↑     ↑  ↑
      [0][1]   [3][4]  ← Unknown positions
```

### Missing Keys
- **Key 7**: Position unknown
- **Key E**: Position unknown

### Unknown Positions
- **[2,1]**: Currently mapped to AD/REG/RES function keys
- **[2,3]**: Currently mapped to DA/GO/PC function keys
- **[2,4]**: Completely unmapped, no keys assigned

## Testing Strategies

### Strategy 1: Direct Position Testing
Test each unknown position and record what appears on the display:

```
Position [2,1]: ___________ (write what happens)
Position [2,3]: ___________ (write what happens)
Position [2,4]: ___________ (write what happens)
```

### Strategy 2: Mode-Dependent Testing
Some keys might only work in specific modes:

1. Press AD (address mode) - mapped to [2,1]
2. Try entering different values at unknown positions
3. Check if 7 or E appears

Repeat with:
1. Press DA (data mode) - mapped to [2,3]
2. Try entering different values
3. Check if 7 or E appears

### Strategy 3: Combination Testing
Maybe 7 and E require multiple keys pressed simultaneously:

```javascript
// Test combinations
amico.keyMatrix[2][1] = true;
amico.keyMatrix[2][4] = true;
setTimeout(() => {
    amico.keyMatrix[2][1] = false;
    amico.keyMatrix[2][4] = false;
}, 300);
```

### Strategy 4: Check the Original Manual
The Sperimentare PDF (`Sperimentare_1980_05_supplemento.pdf`) should contain:
- Keyboard schematic showing physical wiring
- Matrix layout diagram
- Any notes about key limitations

Look for:
- Circuit diagrams showing keyboard connections
- Tables showing key positions
- Assembly instructions mentioning keyboard layout

## Recording Your Findings

When you find something, update `amico2000.js`:

```javascript
// In the keyMap object, add the mappings:
this.keyMap = {
    // ... existing mappings ...
    '7': [row, col],  // Add when found
    'e': [row, col],  // Add when found
};
```

Then update `CHANGELOG.md`:
```markdown
### Fixed
- Fixed keyboard matrix mapping for keys 7 and E - found at positions [row,col] through systematic testing
```

And update `NEXT_SESSION.md` to remove them from the "Known Issues" section.

## Possible Explanations

If keys 7 and E cannot be found:

1. **Original keyboard limitation**: The 1978 AMICO 2000 kit might not have included all 16 hex keys to reduce cost. Check the original manual/photos.

2. **Mode-dependent entry**: The ROM might have a special input sequence for 7 and E (e.g., press AD then some other key).

3. **Decimal mode keys**: Some early systems had separate decimal (0-9) and hex (A-F) modes. Keys 7 and E might require a mode switch.

4. **Shared positions**: Keys 7 and E might share physical positions with function keys, distinguished by press duration or scan timing.

5. **Software input**: The monitor ROM might allow entering 7 and E using key combinations (e.g., 8-1 for 7, F-1 for E).

## Examining the ROM

If hardware testing doesn't reveal the keys, examine the Monitor ROM code:

1. Look for the keyboard scanning routine (TESTAS or similar)
2. Check how it processes scanned values
3. Look for any special handling of specific key combinations
4. Check if there's a decimal/hex mode flag

The ROM disassembly should show:
- How scan codes map to hex values
- Any mode-dependent key interpretation
- Special input sequences

## Next Steps

1. ☐ Test all 3 unknown positions systematically
2. ☐ Try mode-dependent entry (AD first, then test positions)
3. ☐ Check Sperimentare PDF for keyboard layout
4. ☐ If not found, examine ROM disassembly for clues
5. ☐ Consider that keys might not exist on original hardware
6. ☐ Document findings in CHANGELOG.md

Good luck! This is detective work that helps preserve an important piece of computing history.
