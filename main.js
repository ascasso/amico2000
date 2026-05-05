/**
 * =============================================================================
 * AMICO 2000 Emulator - Main Application
 * =============================================================================
 * 
 * Initializes the emulator and connects UI elements.
 * 
 * Author: Andrea Scasso / Claude
 * License: MIT
 * Date: December 2025
 * 
 * =============================================================================
 */

// ============================================================================
// Monitor ROM Data ($FE00-$FFFF, 512 bytes)
// Original ASEL Amico 2000 monitor - prom.ic9
//
// NOTE: The original hardware also had prom.ic6 and prom.ic7 for address
// decoding logic (chip-select generation). These are NOT needed in emulation
// as address decoding is handled by software memory callbacks.
// ============================================================================
const MONITOR_ROM = new Uint8Array([
    // $FE00 - Actual ASEL Amico 2000 Monitor ROM (prom.ic9)
    0x85, 0xf3, 0x68, 0x85, 0xfd, 0x68, 0x85, 0xf6, 0x85, 0xfa, 0x68, 0x85,
    0xf7, 0x85, 0xfb, 0x84, 0xf4, 0x86, 0xf5, 0xba, 0x86, 0xfe, 0x20, 0xda,
    0xfe, 0x4c, 0x30, 0xfe, 0x6c, 0xfc, 0x03, 0x6c, 0xfe, 0x03, 0xa2, 0x00,
    0x86, 0xfa, 0x86, 0xfb, 0xa2, 0xff, 0x9a, 0x86, 0xfe, 0x20, 0xda, 0xfe,
    0x20, 0x06, 0xff, 0xd0, 0x05, 0x85, 0xf2, 0x4c, 0x30, 0xfe, 0xa5, 0xf2,
    0xd0, 0xf2, 0xe6, 0xf2, 0x20, 0x06, 0xff, 0xf0, 0xeb, 0x20, 0x06, 0xff,
    0xf0, 0xe6, 0x20, 0x57, 0xff, 0xc9, 0x15, 0x10, 0xdf, 0xa2, 0x15, 0xa0,
    0xff, 0x88, 0xd0, 0xfd, 0xca, 0xd0, 0xf8, 0xc9, 0x14, 0xf0, 0x5d, 0xc9,
    0x10, 0xf0, 0x2c, 0xc9, 0x11, 0xf0, 0x2c, 0xc9, 0x12, 0xf0, 0x2f, 0xc9,
    0x13, 0xf0, 0x4a, 0x0a, 0x0a, 0x0a, 0x0a, 0x85, 0xfc, 0xa2, 0x04, 0xa4,
    0xff, 0xd0, 0x0a, 0xb1, 0xfa, 0x06, 0xfc, 0x2a, 0x91, 0xfa, 0x4c, 0x8a,
    0xfe, 0x0a, 0x26, 0xfa, 0x26, 0xfb, 0xca, 0xd0, 0xea, 0xf0, 0x08, 0xa9,
    0x01, 0xd0, 0x02, 0xa9, 0x00, 0x85, 0xff, 0x4c, 0x30, 0xfe, 0xa2, 0xff,
    0x86, 0xf0, 0x20, 0x50, 0xff, 0x20, 0x06, 0xff, 0x20, 0x57, 0xff, 0xc9,
    0x12, 0xd0, 0x07, 0xc6, 0xf0, 0xd0, 0xf2, 0x4c, 0x9e, 0xfe, 0xa2, 0xff,
    0x86, 0xf0, 0x4c, 0x30, 0xfe, 0x4c, 0xc7, 0xfe, 0xa5, 0xf6, 0x85, 0xfa,
    0xa5, 0xf7, 0x85, 0xfb, 0x4c, 0x30, 0xfe, 0xa6, 0xfe, 0x9a, 0xa5, 0xfb,
    0x48, 0xa5, 0xfa, 0x48, 0xa5, 0xfd, 0x48, 0xa6, 0xf5, 0xa4, 0xf4, 0xa5,
    0xf3, 0x40, 0xa2, 0x01, 0x86, 0xff, 0xa2, 0x99, 0x8e, 0x03, 0xfd, 0xa2,
    0x07, 0x8e, 0x01, 0xfd, 0xd8, 0x78, 0x60, 0xa0, 0x03, 0xa2, 0x01, 0xa9,
    0xff, 0x8e, 0x01, 0xfd, 0xe8, 0xe8, 0x2d, 0x00, 0xfd, 0x88, 0xd0, 0xf5,
    0xa0, 0x07, 0x8c, 0x01, 0xfd, 0x09, 0x80, 0x49, 0xff, 0x60, 0xa0, 0x00,
    0xb1, 0xfa, 0x85, 0xf9, 0xa9, 0x89, 0x8d, 0x03, 0xfd, 0xa2, 0x09, 0xa0,
    0x03, 0xb9, 0xf8, 0x00, 0x4a, 0x4a, 0x4a, 0x4a, 0x20, 0x35, 0xff, 0xb9,
    0xf8, 0x00, 0x29, 0x0f, 0x20, 0x35, 0xff, 0x88, 0xd0, 0xeb, 0x8e, 0x01,
    0xfd, 0xa9, 0x99, 0x8d, 0x03, 0xfd, 0x4c, 0xeb, 0xfe, 0x84, 0xfc, 0xa8,
    0xb9, 0xea, 0xff, 0xa0, 0x00, 0x8c, 0x00, 0xfd, 0x8e, 0x01, 0xfd, 0x8d,
    0x00, 0xfd, 0xa0, 0x7f, 0x88, 0xd0, 0xfd, 0xe8, 0xe8, 0xa4, 0xfc, 0x60,
    0xe6, 0xfa, 0xd0, 0x02, 0xe6, 0xfb, 0x60, 0xa2, 0x01, 0xa0, 0x01, 0x20,
    0xef, 0xfe, 0xd0, 0x07, 0xe0, 0x07, 0xd0, 0xf5, 0xa9, 0x15, 0x60, 0xa0,
    0xff, 0x0a, 0xb0, 0x03, 0xc8, 0x10, 0xfa, 0x8a, 0x29, 0x0f, 0x4a, 0xaa,
    0x98, 0x10, 0x03, 0x18, 0x69, 0x07, 0xca, 0xd0, 0xfa, 0x60, 0xa9, 0x89,
    0x8d, 0x03, 0xfd, 0xa2, 0x09, 0xa0, 0x00, 0xb9, 0x8f, 0x00, 0x84, 0xfc,
    0x20, 0x3b, 0xff, 0xc8, 0xc0, 0x06, 0x90, 0xf3, 0x60, 0xff, 0xff, 0xd8,
    0x18, 0xa5, 0xfa, 0xe5, 0xfb, 0x85, 0xf9, 0xc6, 0xf9, 0x20, 0x0c, 0xff,
    0x20, 0x57, 0xff, 0xc5, 0xf3, 0xf0, 0xec, 0x85, 0xf3, 0xc9, 0x10, 0xb0,
    0xe6, 0x0a, 0x0a, 0x0a, 0x0a, 0xa2, 0x04, 0x0a, 0x26, 0xfa, 0x26, 0xfb,
    0xca, 0xd0, 0xf8, 0xf0, 0xd6, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xbf, 0x86,
    0xdb, 0xcf, 0xe6, 0xed, 0xfd, 0x87, 0xff, 0xef, 0xf7, 0xfc, 0xb9, 0xde,
    0xf9, 0xf1, 0x1c, 0xfe, 0x22, 0xfe, 0x1f, 0xfe
]);

// Note: The ROM data above is the authentic ASEL Amico 2000 monitor ROM.
// You can also load different ROMs using the "Load ROM" button.

// ============================================================================
// Cassette ROM Data ($FB00-$FCFF, 512 bytes) - OPTIONAL
// Cassette interface routines - prom.ic10
// ============================================================================
const CASSETTE_ROM = new Uint8Array([
    0xb5, 0x04, 0x85, 0xf1, 0x20, 0x0a, 0xfb, 0x86, 0xef, 0x20, 0x95, 0xfb,
    0xa6, 0xef, 0xe8, 0xe0, 0xe8, 0xd0, 0xed, 0xa5, 0xeb, 0xf0, 0x1b, 0xa0,
    0x00, 0xb1, 0xe8, 0x85, 0xf1, 0x20, 0x0a, 0xfb, 0x84, 0xef, 0x20, 0x95,
    0xfb, 0xa4, 0xef, 0x88, 0xd0, 0xef, 0xe6, 0xe9, 0xc6, 0xeb, 0x30, 0x06,
    0xd0, 0xe7, 0xa4, 0xea, 0xd0, 0xe3, 0xc6, 0xe9, 0xb1, 0xe8, 0x85, 0xf1,
    0x20, 0x0a, 0xfb, 0x20, 0x95, 0xfb, 0xa5, 0xec, 0x85, 0xf1, 0x20, 0x95,
    0xfb, 0xa9, 0x05, 0x8d, 0x00, 0xfd, 0x20, 0xae, 0xfb, 0x4c, 0x22, 0xfe,
    0xa9, 0x00, 0x85, 0xf1, 0xad, 0x00, 0xfd, 0x10, 0xfb, 0xa9, 0x89, 0x20,
    0x1b, 0xfb, 0x20, 0x00, 0xfb, 0x20, 0x10, 0xfb, 0xad, 0x00, 0xfd, 0x0a,
    0x26, 0xf1, 0x20, 0x00, 0xfb, 0xa9, 0xa5, 0xc5, 0xf1, 0xd0, 0xe1, 0xd8,
    0x85, 0xec, 0xa2, 0x00, 0x86, 0xed, 0x20, 0x38, 0xfb, 0xa5, 0xf1, 0xa6,
    0xed, 0x95, 0xe7, 0x20, 0x0a, 0xfb, 0xe8, 0xe0, 0x05, 0xd0, 0xed, 0xa5,
    0xe7, 0x45, 0x00, 0xf0, 0x02, 0xa9, 0x01, 0x85, 0xee, 0xa6, 0x02, 0xe0,
    0xff, 0xf0, 0x07, 0xa5, 0x01, 0x85, 0xe8, 0x8a, 0x85, 0xe9, 0xa5, 0xeb,
    0xf0, 0x1f, 0xa0, 0x00, 0x84, 0xed, 0x20, 0x38, 0xfb, 0xa4, 0xed, 0xa5,
    0xee, 0xd0, 0x07, 0xa5, 0xf1, 0x91, 0xe8, 0x20, 0x0a, 0xfb, 0x88, 0xd0,
    0xeb, 0xe6, 0xe9, 0xc6, 0xeb, 0x30, 0x06, 0xd0, 0xe3, 0xa4, 0xea, 0xd0,
    0xdf, 0x20, 0x38, 0xfb, 0xa5, 0xee, 0xd0, 0x0b, 0xa5, 0xf1, 0xc6, 0xe9,
    0xa0, 0x00, 0x91, 0xe8, 0x20, 0x0a, 0xfb, 0x20, 0x38, 0xfb, 0xa5, 0xee,
    0xd0, 0x0d, 0xa5, 0xf1, 0xc5, 0xec, 0xf0, 0x04, 0xa9, 0xff, 0x85, 0x00,
    0x4c, 0x22, 0xfe, 0x4c, 0x54, 0xfc, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xa2, 0x00, 0x8e, 0x01, 0xfd, 0xe8, 0x8e, 0x01,
    0xfd, 0x60, 0x18, 0x65, 0xec, 0x85, 0xec, 0x60, 0xa2, 0x02, 0xa0, 0xa0,
    0x88, 0xd0, 0xfd, 0xca, 0xd0, 0xf8, 0x60, 0xa2, 0x89, 0x8e, 0x03, 0xfd,
    0x8d, 0x00, 0xfd, 0xa9, 0x87, 0x8d, 0x01, 0xfd, 0xa0, 0x90, 0x88, 0xd0,
    0xfd, 0xa9, 0x99, 0x8d, 0x03, 0xfd, 0xa9, 0x07, 0x8d, 0x01, 0xfd, 0x60,
    0xa9, 0x08, 0x85, 0xef, 0xad, 0x00, 0xfd, 0x10, 0xfb, 0xa9, 0x8a, 0x20,
    0x1b, 0xfb, 0x20, 0x00, 0xfb, 0x20, 0x10, 0xfb, 0xad, 0x00, 0xfd, 0x0a,
    0x26, 0xf1, 0x20, 0x00, 0xfb, 0xc6, 0xef, 0xd0, 0xe3, 0x60, 0xa9, 0x00,
    0x8d, 0x01, 0xfd, 0xa0, 0x10, 0x88, 0xd0, 0xfd, 0xa9, 0xe1, 0x8d, 0x01,
    0xfd, 0xa0, 0x10, 0x88, 0xd0, 0xfd, 0xa9, 0xa1, 0x8d, 0x01, 0xfd, 0x60,
    0xa0, 0x25, 0x88, 0xd0, 0xfd, 0xa2, 0x01, 0xa0, 0x00, 0x88, 0xd0, 0xfd,
    0xca, 0xd0, 0xfa, 0x60, 0x20, 0x5a, 0xfb, 0x20, 0x74, 0xfb, 0x60, 0x20,
    0x5a, 0xfb, 0x20, 0x79, 0xfb, 0x20, 0x5a, 0xfb, 0x60, 0xa9, 0x08, 0x85,
    0xf0, 0x06, 0xf1, 0x90, 0x0b, 0x20, 0x8b, 0xfb, 0x20, 0x79, 0xfb, 0xc6,
    0xf0, 0xd0, 0xf2, 0x60, 0x20, 0x84, 0xfb, 0x18, 0x90, 0xf2, 0xa9, 0x00,
    0x85, 0xed, 0x85, 0xf1, 0x20, 0x95, 0xfb, 0xc6, 0xed, 0xd0, 0xf9, 0x60,
    0xd8, 0x38, 0xa5, 0x02, 0xe5, 0x00, 0x85, 0xea, 0xa5, 0x03, 0xe5, 0x01,
    0x85, 0xeb, 0xb0, 0x03, 0x4c, 0x22, 0xfe, 0xa5, 0x00, 0x85, 0xe8, 0xa5,
    0x01, 0x85, 0xe9, 0xa5, 0x04, 0x85, 0xe7, 0xa9, 0x89, 0x8d, 0x03, 0xfd,
    0x20, 0x00, 0xfb, 0xa9, 0x05, 0x8d, 0x00, 0xfd, 0xa9, 0x86, 0x8d, 0x01,
    0xfd, 0x20, 0xae, 0xfb, 0xa9, 0xa5, 0x85, 0xf1, 0x85, 0xec, 0x20, 0x95,
    0xfb, 0xa9, 0x06, 0x8d, 0x00, 0xfd, 0xa2, 0xe3
]);

// Note: The cassette ROM provides routines for loading/saving programs to tape.
// It is NOT loaded by default. To enable cassette functionality, uncomment the
// line below in the initialization section, or use the "Load ROM" button.
// amico.loadCassetteROM(CASSETTE_ROM);

// ============================================================================
// Application State
// ============================================================================

let amico = null;
let display = null;
let isRunning = false;

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Create emulator
    amico = new Amico2000();
    
    // Create display renderer
    display = new DisplayRenderer('display');
    
    // Connect display callback
    amico.onDisplayUpdate = (patterns) => {
        display.update(patterns);
    };
    
    // Connect state callback
    amico.onStateUpdate = (state) => {
        updateStatusDisplay(state);
    };
    
    // Load monitor ROM
    amico.loadMonitorROM(MONITOR_ROM);

    // Initialize and start (CPU runs continuously like real hardware)
    amico.reset();
    amico.start();
    isRunning = true;

    // Setup UI
    setupKeyboard();
    setupControls();
    setupFileLoader();

    // Turn on power LED and run LED
    document.getElementById('led-power').classList.add('on');
    document.getElementById('led-run').classList.add('on');

    // Update run button state
    updateRunButton();

    console.log('AMICO 2000 Emulator initialized and running');
    console.log('Initial CPU state:');
    console.log('  PC:', amico.cpu.PC.toString(16).toUpperCase());
    console.log('  A:', amico.cpu.A.toString(16).toUpperCase());
    console.log('  X:', amico.cpu.X.toString(16).toUpperCase());
    console.log('  Y:', amico.cpu.Y.toString(16).toUpperCase());
    console.log('Press RES (Escape) to reset, then use hex keys to enter addresses and data');
});

// ============================================================================
// UI Setup
// ============================================================================

function setupKeyboard() {
    // Physical keyboard handler
    document.addEventListener('keydown', (e) => {
        // Prevent default for our mapped keys
        const key = e.key;
        // Only lowercase hex letter keys (A-F), preserve case for special keys (ArrowUp, Enter, etc.)
        const normalizedKey = (key.length === 1) ? key.toLowerCase() : key;

        if (amico.keyMap[normalizedKey] || amico.altKeyMap[normalizedKey] ||
            (key >= '0' && key <= '9') ||
            (key >= 'a' && key <= 'f') ||
            (key >= 'A' && key <= 'F')) {
            e.preventDefault();
            amico.keyDown(normalizedKey);
            highlightButton(normalizedKey);
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key;
        // Only lowercase hex letter keys, preserve case for special keys
        const normalizedKey = (key.length === 1) ? key.toLowerCase() : key;
        amico.keyUp(normalizedKey);
        unhighlightButton(normalizedKey);
    });
    
    // On-screen keyboard buttons
    document.querySelectorAll('.key').forEach(button => {
        const key = button.getAttribute('data-key');
        
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            amico.pressKey(key);
            button.style.transform = 'translateY(3px)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
        
        // Touch support
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            amico.pressKey(key);
            button.style.transform = 'translateY(3px)';
        });
        
        button.addEventListener('touchend', () => {
            button.style.transform = '';
        });
    });
}

function setupControls() {
    // Run/Stop button
    document.getElementById('btn-run').addEventListener('click', () => {
        amico.toggle();
        isRunning = !isRunning;
        updateRunButton();
    });
    
    // Step button
    document.getElementById('btn-step').addEventListener('click', () => {
        if (!isRunning) {
            amico.step();
        }
    });
    
    // Reset button
    document.getElementById('btn-reset').addEventListener('click', () => {
        amico.reset();
    });
    
    // Load ROM button
    document.getElementById('btn-load').addEventListener('click', () => {
        document.getElementById('rom-file').click();
    });
}

function setupFileLoader() {
    document.getElementById('rom-file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const data = await readFileAsArrayBuffer(file);
            const rom = new Uint8Array(data);
            
            // Determine ROM type based on size and name
            const lowerName = file.name.toLowerCase();

            if (lowerName.endsWith('.amtape') || lowerName.includes('tape')) {
                const record = amico.loadTape(rom);
                console.log(`Tape image loaded: ${file.name} (program ${record.id}, $${record.start.toString(16).padStart(4, '0').toUpperCase()}-$${record.end.toString(16).padStart(4, '0').toUpperCase()})`);
            } else if (lowerName.includes('ic9') ||
                file.name.toLowerCase().includes('monitor')) {
                amico.loadMonitorROM(rom);
                console.log('Monitor ROM loaded:', file.name);
                amico.reset();
            } else if (lowerName.includes('ic10') ||
                       lowerName.includes('cassette')) {
                amico.loadCassetteROM(rom);
                console.log('Cassette ROM loaded:', file.name);
                amico.reset();
            } else if (rom.length === 512) {
                // Assume monitor ROM if 512 bytes
                amico.loadMonitorROM(rom);
                console.log('ROM loaded as monitor:', file.name);
                amico.reset();
            } else {
                // Load as program at $0000.
                // Intentionally no amico.reset() here: Amico2000.reset() zeroes
                // all 2KB of RAM ($0000-$07FF), which would erase the program
                // we just wrote. The ROM and 512-byte fallback paths target
                // regions reset() does not touch, so they reset safely. See #25.
                amico.loadProgram(rom, 0x0000);
                console.log('Program loaded at $0000:', file.name);
            }

            alert(`Loaded: ${file.name} (${rom.length} bytes)`);
        } catch (err) {
            console.error('Error loading file:', err);
            alert('Error loading file: ' + err.message);
        }
        
        // Clear file input
        e.target.value = '';
    });
}

// ============================================================================
// UI Updates
// ============================================================================

function updateStatusDisplay(state) {
    document.getElementById('reg-pc').textContent = 
        state.PC.toString(16).toUpperCase().padStart(4, '0');
    document.getElementById('reg-a').textContent = 
        state.A.toString(16).toUpperCase().padStart(2, '0');
    document.getElementById('reg-x').textContent = 
        state.X.toString(16).toUpperCase().padStart(2, '0');
    document.getElementById('reg-y').textContent = 
        state.Y.toString(16).toUpperCase().padStart(2, '0');
    document.getElementById('reg-sp').textContent = 
        state.SP.toString(16).toUpperCase().padStart(2, '0');
    
    const flags = state.flags;
    const flagStr = 
        (flags.N ? 'N' : '-') +
        (flags.V ? 'V' : '-') +
        '-' +
        (flags.B ? 'B' : '-') +
        (flags.D ? 'D' : '-') +
        (flags.I ? 'I' : '-') +
        (flags.Z ? 'Z' : '-') +
        (flags.C ? 'C' : '-');
    document.getElementById('reg-flags').textContent = flagStr;
}

function updateRunButton() {
    const btn = document.getElementById('btn-run');
    const led = document.getElementById('led-run');
    
    if (isRunning) {
        btn.textContent = '⏸ Stop';
        led.classList.add('on');
    } else {
        btn.textContent = '▶ Run';
        led.classList.remove('on');
    }
}

function highlightButton(key) {
    // Map keyboard keys to button data-key attributes
    const keyMap = {
        'arrowup': 'ad',
        'arrowdown': 'da',
        'enter': 'go',
        'escape': 'res',
        'backspace': 'res',
        '=': '+',
        'p': 'pc',
        'r': 'reg',
        'g': 'go'
    };
    
    const buttonKey = keyMap[key] || key;
    const button = document.querySelector(`.key[data-key="${buttonKey}"]`);
    if (button) {
        button.style.transform = 'translateY(3px)';
    }
}

function unhighlightButton(key) {
    const keyMap = {
        'arrowup': 'ad',
        'arrowdown': 'da',
        'enter': 'go',
        'escape': 'res',
        'backspace': 'res',
        '=': '+',
        'p': 'pc',
        'r': 'reg',
        'g': 'go'
    };
    
    const buttonKey = keyMap[key] || key;
    const button = document.querySelector(`.key[data-key="${buttonKey}"]`);
    if (button) {
        button.style.transform = '';
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

function downloadBytes(filename, bytes, type = 'application/octet-stream') {
    const blob = new Blob([bytes], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

// ============================================================================
// Debug Functions (available in console)
// ============================================================================

window.amico = null;  // Will be set after init

window.debug = {
    // Dump memory range
    mem: (start, length = 16) => {
        const data = amico.getMemoryRange(start, length);
        let hex = '';
        let ascii = '';

        for (let i = 0; i < data.length; i++) {
            hex += data[i].toString(16).padStart(2, '0').toUpperCase() + ' ';
            ascii += (data[i] >= 32 && data[i] < 127) ? String.fromCharCode(data[i]) : '.';
        }

        console.log(`$${start.toString(16).padStart(4, '0')}: ${hex} ${ascii}`);
    },

    // Disassemble at PC
    dis: () => {
        const pc = amico.cpu.PC;
        const byte = amico.cpu.read(pc);
        console.log(`$${pc.toString(16).padStart(4, '0')}: ${byte.toString(16).padStart(2, '0')}`);
    },

    // Show CPU state
    state: () => {
        console.log(amico.cpu.stateToString());
    },

    // Set breakpoint (simple)
    breakAt: (addr) => {
        console.log(`Breakpoint at $${addr.toString(16).padStart(4, '0')} (not implemented yet)`);
    },

    // Track PC to see if CPU is stuck in a loop
    trackPC: (duration = 2000) => {
        const pcHistory = [];
        const startTime = Date.now();
        const interval = setInterval(() => {
            pcHistory.push(amico.cpu.PC.toString(16).padStart(4, '0').toUpperCase());
            if (pcHistory.length > 20) pcHistory.shift();
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            console.log('PC history over', duration, 'ms:');
            console.log(pcHistory.join(' -> '));

            // Count unique PCs to detect tight loops
            const unique = new Set(pcHistory);
            if (unique.size <= 3) {
                console.log('⚠️  CPU appears to be in a tight loop!');
                console.log('Unique PCs:', Array.from(unique).join(', '));
            } else {
                console.log('✓ CPU is running normally');
            }
        }, duration);

        console.log('Tracking PC for', duration, 'ms...');
    },

    // Enable/disable keyboard scan debugging
    enableKeyboardDebug: () => {
        window.debugKeyboard = true;
        console.log('Keyboard scan debugging enabled');
    },

    disableKeyboardDebug: () => {
        window.debugKeyboard = false;
        console.log('Keyboard scan debugging disabled');
    },

    // Export the most recent mock cassette save as a browser download.
    saveTape: (id = null) => {
        const bytes = amico.exportTape(id);
        const suffix = id === null ? 'last' : id.toString(16).padStart(2, '0').toUpperCase();
        downloadBytes(`amico-${suffix}.amtape`, bytes);
        console.log(`Exported tape image (${bytes.length} bytes)`);
    }
};

// Make amico globally accessible after init
document.addEventListener('DOMContentLoaded', () => {
    window.amico = amico;
});
