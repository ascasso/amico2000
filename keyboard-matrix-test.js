/**
 * AMICO 2000 Keyboard Matrix Testing Helper
 *
 * Paste this into the browser console while the emulator is running
 * to systematically test keyboard matrix positions.
 *
 * Usage:
 *   testKey(row, col)           - Test a specific position
 *   testRow(row)                - Test all positions in a row
 *   findKey(expectedDigit)      - Test all unknown positions to find a key
 *   testUnknownPositions()      - Test all 3 unknown positions in row 2
 */

// Test a specific matrix position
function testKey(row, col, duration = 300) {
    if (!window.amico) {
        console.error('Emulator not found! Make sure the emulator is running.');
        return;
    }

    console.log(`%cTesting position [${row},${col}]`, 'color: #ff4400; font-weight: bold;');
    console.log('Watch the emulator display...');

    amico.keyMatrix[row][col] = true;

    setTimeout(() => {
        amico.keyMatrix[row][col] = false;
        console.log(`%cReleased [${row},${col}]`, 'color: #00ff00;');
    }, duration);
}

// Test all 6 columns in a specific row
function testRow(row) {
    console.log(`%cTesting all positions in Row ${row}`, 'color: #ff4400; font-weight: bold; font-size: 14px;');
    let col = 0;

    const testNext = () => {
        if (col >= 6) {
            console.log(`%cRow ${row} testing complete`, 'color: #00ff00; font-weight: bold;');
            return;
        }

        console.log(`Testing [${row},${col}]...`);
        testKey(row, col, 500);
        col++;
        setTimeout(testNext, 1000);
    };

    testNext();
}

// Test only the unknown positions in row 2
function testUnknownPositions() {
    const positions = [
        { pos: [2, 1], desc: 'Currently mapped to AD/REG/RES' },
        { pos: [2, 3], desc: 'Currently mapped to DA/GO/PC' },
        { pos: [2, 4], desc: 'Completely unknown' }
    ];

    console.log('%cTesting unknown positions in Row 2', 'color: #ff4400; font-weight: bold; font-size: 14px;');
    console.log('These are the only unmapped positions where keys 7 and E could be.\n');

    let i = 0;
    const testNext = () => {
        if (i >= positions.length) {
            console.log('%cAll unknown positions tested', 'color: #00ff00; font-weight: bold;');
            return;
        }

        const { pos, desc } = positions[i];
        console.log(`\nTesting [${pos[0]},${pos[1]}]: ${desc}`);
        console.log('Press this position and watch what happens...');
        testKey(pos[0], pos[1], 500);
        i++;
        setTimeout(testNext, 1500);
    };

    testNext();
}

// Comprehensive test to find a specific key
function findKey(expectedKey) {
    console.log(`%cSearching for key "${expectedKey}"`, 'color: #ff4400; font-weight: bold; font-size: 14px;');
    console.log('This will test each unknown position.');
    console.log('Watch the display to see if the expected digit appears.\n');

    const unknownPositions = [
        [2, 1],
        [2, 3],
        [2, 4]
    ];

    let i = 0;
    const testNext = () => {
        if (i >= unknownPositions.length) {
            console.log(`%cSearch complete. Did you find key "${expectedKey}"?`, 'color: #00ff00; font-weight: bold;');
            return;
        }

        const [row, col] = unknownPositions[i];
        console.log(`Testing [${row},${col}] - looking for "${expectedKey}"...`);
        testKey(row, col, 800);
        i++;
        setTimeout(testNext, 1500);
    };

    testNext();
}

// Display the current known layout
function showLayout() {
    console.log('%cKnown Keyboard Matrix Layout:', 'color: #ff4400; font-weight: bold; font-size: 16px;');
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Row 0 (portB=1):  [6]  [5]  [4]  [3]  [2]  [1]         ║
║  Row 1 (portB=3):  [D]  [C]  [B]  [A]  [9]  [8]         ║
║  Row 2 (portB=5):  [0]  [?]  [+]  [?]  [?]  [F]         ║
╚═══════════════════════════════════════════════════════════╝

Working keys: 0,1,2,3,4,5,6,8,9,A,B,C,D,F  (14/16)
Missing keys: 7, E

Unknown positions in Row 2:
  [2,1] - Currently: AD/REG/RES function keys
  [2,3] - Currently: DA/GO/PC function keys
  [2,4] - Completely unmapped

Possible explanations for missing keys 7 and E:
  1. They occupy positions [2,1], [2,3], or [2,4]
  2. They require a mode switch or modifier key
  3. The original keyboard may not have had all 16 hex keys
`);
}

// Direct matrix manipulation for advanced testing
function setMatrix(row, col, state) {
    if (!window.amico) {
        console.error('Emulator not found!');
        return;
    }
    amico.keyMatrix[row][col] = state;
    console.log(`Set matrix[${row}][${col}] = ${state}`);
}

// Show current matrix state
function showMatrix() {
    if (!window.amico) {
        console.error('Emulator not found!');
        return;
    }

    console.log('%cCurrent Keyboard Matrix State:', 'color: #ff4400; font-weight: bold;');
    for (let row = 0; row < 3; row++) {
        const rowState = amico.keyMatrix[row].map((pressed, col) =>
            pressed ? `[${row},${col}]✓` : '[ ]'
        ).join(' ');
        console.log(`Row ${row}: ${rowState}`);
    }
}

// Test if keys 7 and E might be mode-dependent
function testModeDependentEntry() {
    console.log('%cTesting mode-dependent entry for keys 7 and E', 'color: #ff4400; font-weight: bold; font-size: 14px;');
    console.log('\nSome keyboards require entering address mode (AD) first.');
    console.log('Let\'s try entering AD, then testing the unknown positions...\n');

    // Press AD first
    console.log('1. Pressing AD (address mode)...');
    testKey(2, 1, 500);

    setTimeout(() => {
        console.log('2. Now testing unknown positions while in address mode...');
        testUnknownPositions();
    }, 1000);
}

// Initialize
console.log('%c═══════════════════════════════════════════════════════', 'color: #ff4400;');
console.log('%c   AMICO 2000 Keyboard Matrix Testing Helper Loaded   ', 'color: #ff4400; font-weight: bold;');
console.log('%c═══════════════════════════════════════════════════════', 'color: #ff4400;');
console.log('\nAvailable commands:');
console.log('  %cshowLayout()%c              - Display known matrix layout', 'color: #00ff00;', '');
console.log('  %ctestKey(row, col)%c        - Test a specific position', 'color: #00ff00;', '');
console.log('  %ctestRow(row)%c             - Test all 6 positions in a row', 'color: #00ff00;', '');
console.log('  %ctestUnknownPositions()%c   - Test the 3 unknown positions', 'color: #00ff00;', '');
console.log('  %cfindKey("7")%c             - Search for key 7 or E', 'color: #00ff00;', '');
console.log('  %ctestModeDependentEntry()%c - Test if 7/E need AD mode first', 'color: #00ff00;', '');
console.log('  %cshowMatrix()%c             - Show current matrix state', 'color: #00ff00;', '');
console.log('  %csetMatrix(row,col,true)%c  - Manually set a position', 'color: #00ff00;', '');
console.log('\nStart with: %cshowLayout()%c\n', 'color: #00ff00; font-weight: bold;', '');