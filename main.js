/**
 * =============================================================================
 * AMICO 2000 Emulator - Main Application
 * =============================================================================
 * 
 * Initializes the emulator and connects UI elements.
 * 
 * Author: Andrea Scasso / Claude
 * License: MIT
 * Date: December 2024
 * 
 * =============================================================================
 */

// ============================================================================
// Monitor ROM Data ($FE00-$FFFF, 512 bytes)
// Original ASEL Amico 2000 monitor - prom.ic9
// ============================================================================
const MONITOR_ROM = new Uint8Array([
    // $FE00 - NMI/BRK handler entry
    0x48, 0x8A, 0x48, 0x98, 0x48, 0xD8, 0xA2, 0x19,
    0x9A, 0xA9, 0x00, 0x85, 0xF2, 0x85, 0xF3, 0x85,
    // $FE10
    0xF4, 0x85, 0xF5, 0xA9, 0x06, 0x85, 0xF6, 0x4C,
    0x67, 0xFE, 0xA9, 0x99, 0x8D, 0x03, 0xFD, 0xA2,
    // $FE20 - Reset entry point
    0x05, 0xA9, 0x07, 0x8D, 0x00, 0xFD, 0x20, 0xC3,
    0xFE, 0xCA, 0x10, 0xF5, 0xC6, 0xF6, 0xD0, 0xED,
    // $FE30
    0xA9, 0x99, 0x8D, 0x03, 0xFD, 0xA9, 0x06, 0x85,
    0xF6, 0xA2, 0x05, 0xB5, 0xF0, 0x0A, 0x0A, 0x0A,
    // $FE40
    0x0A, 0xA8, 0xB9, 0xEA, 0xFF, 0x8D, 0x00, 0xFD,
    0xA9, 0x00, 0x38, 0x2A, 0xCA, 0x10, 0x01, 0x0A,
    // $FE50
    0x8D, 0x01, 0xFD, 0x20, 0xC3, 0xFE, 0xA6, 0xF6,
    0xCA, 0x10, 0xDD, 0x20, 0xAD, 0xFE, 0x30, 0xFB,
    // $FE60
    0xC9, 0x10, 0xB0, 0xC3, 0x4C, 0xD5, 0xFE, 0xA9,
    0x89, 0x8D, 0x03, 0xFD, 0xAD, 0x00, 0xFD, 0x29,
    // $FE70
    0x3F, 0xC9, 0x3F, 0xD0, 0x14, 0xA0, 0x14, 0x88,
    0xD0, 0xFD, 0xAD, 0x00, 0xFD, 0x29, 0x3F, 0xC9,
    // $FE80
    0x3F, 0xF0, 0xEE, 0x20, 0x9D, 0xFE, 0x4C, 0x2E,
    0xFE, 0xA9, 0x89, 0x8D, 0x03, 0xFD, 0xAD, 0x00,
    // $FE90
    0xFD, 0x29, 0x3F, 0xC9, 0x3F, 0xF0, 0xF7, 0x4A,
    0x4A, 0x4A, 0xAA, 0xBD, 0xDA, 0xFE, 0x60, 0xA0,
    // $FEA0
    0x64, 0x88, 0xD0, 0xFD, 0xAD, 0x00, 0xFD, 0x29,
    0x3F, 0xC9, 0x3F, 0xD0, 0x01, 0x60, 0xA9, 0xFF,
    // $FEB0
    0x60, 0xA2, 0x14, 0xA0, 0x00, 0x88, 0xD0, 0xFD,
    0xCA, 0xD0, 0xF8, 0x60, 0xA9, 0x07, 0x8D, 0x01,
    // $FEC0
    0xFD, 0x60, 0xA0, 0x28, 0x88, 0xD0, 0xFD, 0x60,
    0xE6, 0xF1, 0xD0, 0x02, 0xE6, 0xF0, 0x60, 0xC6,
    // $FED0
    0xF1, 0xA5, 0xF1, 0xC9, 0xFF, 0xD0, 0x02, 0xC6,
    0xF0, 0x60, 0x00, 0x10, 0x11, 0x12, 0x13, 0x14,
    // $FEE0
    0x15, 0x16, 0x17, 0x01, 0x02, 0x03, 0x04, 0x05,
    0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D,
    // $FEF0
    0x0E, 0x0F, 0x18, 0x19, 0xA5, 0xF6, 0xC9, 0x06,
    0xD0, 0x08, 0xA5, 0xF2, 0x85, 0xF0, 0xA5, 0xF3,
    // $FF00
    0x85, 0xF1, 0xA6, 0xF6, 0xCA, 0xCA, 0x30, 0x1D,
    0xB5, 0xF0, 0x4A, 0x4A, 0x4A, 0x4A, 0x18, 0x65,
    // $FF10
    0xF7, 0x85, 0xF7, 0xB5, 0xF0, 0x29, 0x0F, 0x0A,
    0x0A, 0x0A, 0x0A, 0x85, 0xF8, 0xE8, 0xB5, 0xF0,
    // $FF20
    0x4A, 0x4A, 0x4A, 0x4A, 0x05, 0xF8, 0x95, 0xEF,
    0x4C, 0x04, 0xFF, 0xA5, 0xF6, 0xC9, 0x04, 0xB0,
    // $FF30
    0x08, 0xA6, 0xF6, 0xB5, 0xF0, 0x9D, 0xED, 0x00,
    0xA5, 0xF6, 0xC9, 0x06, 0xD0, 0x1E, 0xA5, 0xF2,
    // $FF40
    0x8D, 0xFC, 0x00, 0xA5, 0xF3, 0x8D, 0xFD, 0x00,
    0xA0, 0x00, 0xB1, 0xF0, 0x85, 0xF4, 0xA5, 0xF4,
    // $FF50
    0x4A, 0x4A, 0x4A, 0x4A, 0x85, 0xF5, 0xA5, 0xF4,
    0x29, 0x0F, 0x85, 0xF4, 0x4C, 0x2E, 0xFE, 0xA5,
    // $FF60
    0xF6, 0xC9, 0x04, 0xB0, 0x15, 0xA6, 0xF6, 0xB5,
    0xF0, 0x0A, 0x0A, 0x0A, 0x0A, 0x85, 0xF8, 0xBD,
    // $FF70
    0xED, 0x00, 0x29, 0x0F, 0x05, 0xF8, 0x9D, 0xED,
    0x00, 0xA5, 0xF6, 0xC9, 0x02, 0xD0, 0x1E, 0xA5,
    // $FF80
    0xF4, 0x0A, 0x0A, 0x0A, 0x0A, 0x05, 0xF5, 0xA0,
    0x00, 0x91, 0xF0, 0xA9, 0x06, 0x85, 0xF6, 0x20,
    // $FF90
    0xC8, 0xFE, 0x4C, 0x2E, 0xFE, 0xA5, 0xF7, 0xC9,
    0x10, 0xB0, 0x05, 0x20, 0xA1, 0xFF, 0xD0, 0xE7,
    // $FFA0
    0x4C, 0x1C, 0xFE, 0xA2, 0x00, 0xBD, 0xBE, 0xFF,
    0xF0, 0x0B, 0xC5, 0xF7, 0xF0, 0x04, 0xE8, 0x4C,
    // $FFB0
    0xA5, 0xFF, 0xBD, 0xBF, 0xFF, 0x85, 0xF7, 0x60,
    0x10, 0xF4, 0x11, 0x2B, 0x12, 0xC8, 0x13, 0xCF,
    // $FFC0
    0x14, 0x5E, 0x15, 0x00, 0x16, 0xED, 0x17, 0xF0,
    0x18, 0xFA, 0x19, 0x00, 0x00, 0x00, 0x00, 0x00,
    // $FFD0
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    // $FFE0
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x7E, 0x30, 0x6D, 0x79, 0x33, 0x5B,
    // $FFF0 - 7-segment lookup table
    0x5F, 0x70, 0x7F, 0x7B, 0x00, 0xFE, 0x22, 0xFE,
    0xFC, 0x00, 0x00, 0xFE, 0x00, 0xFE, 0x00, 0xFE
]);

// Note: The ROM data above is a reconstruction. You should replace it with
// the actual ROM dump from prom.ic9 for authentic operation.
// The actual ROM can be loaded using the "Load ROM" button.

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
