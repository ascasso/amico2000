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
    
    // Initialize
    amico.reset();
    
    // Setup UI
    setupKeyboard();
    setupControls();
    setupFileLoader();
    
    // Turn on power LED
    document.getElementById('led-power').classList.add('on');
    
    console.log('AMICO 2000 Emulator initialized');
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
        if (amico.keyMap[key] || amico.altKeyMap[key] || 
            (key >= '0' && key <= '9') ||
            (key >= 'a' && key <= 'f') ||
            (key >= 'A' && key <= 'F')) {
            e.preventDefault();
            amico.keyDown(key.toLowerCase());
            highlightButton(key.toLowerCase());
        }
    });
    
    document.addEventListener('keyup', (e) => {
        const key = e.key;
        amico.keyUp(key.toLowerCase());
        unhighlightButton(key.toLowerCase());
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
            if (file.name.toLowerCase().includes('ic9') || 
                file.name.toLowerCase().includes('monitor')) {
                amico.loadMonitorROM(rom);
                console.log('Monitor ROM loaded:', file.name);
            } else if (file.name.toLowerCase().includes('ic10') || 
                       file.name.toLowerCase().includes('cassette')) {
                amico.loadCassetteROM(rom);
                console.log('Cassette ROM loaded:', file.name);
            } else if (rom.length === 512) {
                // Assume monitor ROM if 512 bytes
                amico.loadMonitorROM(rom);
                console.log('ROM loaded as monitor:', file.name);
            } else {
                // Load as program at $0000
                amico.loadProgram(rom, 0x0000);
                console.log('Program loaded at $0000:', file.name);
            }
            
            amico.reset();
            alert(`Loaded: ${file.name} (${rom.length} bytes)`);
        } catch (err) {
            console.error('Error loading ROM:', err);
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
    }
};

// Make amico globally accessible after init
document.addEventListener('DOMContentLoaded', () => {
    window.amico = amico;
});
