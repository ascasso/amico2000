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
// You can also load different ROMs using the "Load ROM or tape" button.

// ============================================================================
// Cassette ROM Data (IC10 at $FB00-$FCFF, 512 bytes) - fitted at startup
// Cassette interface routines - prom.ic10
//
// The bytes are in chip order, as read from an original machine and published
// as amico2000_replica_PROM_IC10.bin. That is not address order (#35). A
// 512-cell PROM is addressed by A0-A8 and this socket starts on an odd page,
// so the first 256 bytes answer at $FC00-$FCFF and the last 256 at
// $FB00-$FBFF. Amico2000.loadCassetteROM() does that mapping. Keep the array
// as it is: tests/cassette-rom-mapping.test.js pins it to the published dump.
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

// The page fits this PROM at startup, next to the monitor. On the real machine
// it was part of an option: the supplement's parts list marks IC10, with the
// LEDs D4-D7 and IC19-IC21, as "fornito per completare il microcomputer AMICO
// 2000/A con l'interfaccia per il registratore a cassette" (page 33, note 1).
// The board drawn on the page has that interface, so the emulated socket is
// filled to match: AD shows FBBC D8 and FC54 A9, as the manual prints them.
//
// Cassette LOAD and SAVE do not depend on it: the emulator traps the entry
// points $FBBC and $FC54 before the CPU fetches from the socket. To present
// the bare board instead, empty the socket from the browser console with
// amico.loadCassetteROM(new Uint8Array(512).fill(0xFF)); an empty socket
// reads $FF, because the CPU starts with every unused byte at $FF.

// ============================================================================
// Application State
// ============================================================================

let amico = null;
let display = null;
let recorder = null;

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Create emulator. A top-level `let` does not become a window property,
    // so publish it explicitly for the console commands the guide documents
    // (amico.cpu.PC, amico.writeMemory() and so on).
    amico = new Amico2000();
    window.amico = amico;

    // Create display renderer
    display = new DisplayRenderer('display');
    labelDisplay();

    // Choose how the displays are drawn before the first frame paints.
    setupDisplayLook();

    // Connect display callback
    amico.onDisplayUpdate = (patterns) => {
        display.update(patterns);
    };
    
    // Connect state callback
    amico.onStateUpdate = (state) => {
        updateStatusDisplay(state);
        updateTapeStatus();
    };

    // The cassette recorder, wired to the board's interface. It runs only
    // while the real LOAD and SAVE routines do, which is the Cassette: Real
    // time setting. The phase LEDs D4-D7 are lit by the same routines (#20),
    // and by any program that sets Port B bit 7 and their Port A lines, at
    // either setting: the machine reports them every frame regardless.
    recorder = amico.connectRecorder(AmicoTapeAudio.createRecorder());
    amico.onPhaseLEDs = updatePhaseLEDs;
    amico.onTapeRecorded = reportRecording;
    amico.onCassetteTrap = reportTrap;
    setupCassetteMode();
    setupSingleStepSwitch();

    // The machine owns its run state; the bench controls only reflect it, so
    // a console start() or stop() updates the label and the run lamp as well.
    amico.onRunStateChange = updateRunButton;

    // Fit both PROMs: the monitor (IC9), which every board has, and the
    // cassette PROM (IC10), which a board built with the cassette interface
    // has. See the note after CASSETTE_ROM. Neither is touched by reset().
    amico.loadMonitorROM(MONITOR_ROM);
    amico.loadCassetteROM(CASSETTE_ROM);

    // Initialize and start (CPU runs continuously like real hardware)
    amico.reset();
    amico.start();

    // Setup UI
    setupKeyboard();
    setupControls();
    setupFileLoader();

    // After the keys have their handlers: the pictures of them that this
    // leaves in the board drawing must not get any.
    setupHandheldLayout();

    // The page can change language where it stands (lang.js). Its text and
    // tooltips change by themselves; these are the words this file puts
    // there. The tape's status line needs nothing: it is worked out afresh
    // every frame.
    AmicoLang.onChange(() => {
        labelDisplay();
        updateRunButton();
        titleSingleStepSwitch();
    });

    // The Run/Stop label and the run lamp beside the registers were already
    // set by onRunStateChange when start() ran.

    console.log('AMICO 2000 Emulator initialized and running');
    console.log('Initial CPU state:');
    console.log('  PC:', amico.cpu.PC.toString(16).toUpperCase());
    console.log('  A:', amico.cpu.A.toString(16).toUpperCase());
    console.log('  X:', amico.cpu.X.toString(16).toUpperCase());
    console.log('  Y:', amico.cpu.Y.toString(16).toUpperCase());
    console.log('Press RES (Escape) to return to the monitor, then use hex keys to enter addresses and data');
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

        // Fix for #30: RES is no longer in keyMap, so it needs naming here or
        // Backspace falls through to the browser's own history navigation.
        // HLT is not in keyMap either: it is the NMI line, not a matrix key.
        if (amico.isResetKey(normalizedKey) || amico.isHaltKey(normalizedKey) ||
            amico.keyMap[normalizedKey] || amico.altKeyMap[normalizedKey] ||
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
        
        // Touch support. On the board as drawn a key presses the moment it is
        // touched, as it always has. In the handheld layout the keypad fills
        // most of the screen, and a thumb that starts a swipe on it would
        // type instead of scrolling the page, so there a key presses when
        // the finger lifts having not moved: a touch that moves is a scroll.
        // The press shows from the first touch either way.
        let touchStart = null;
        button.addEventListener('touchstart', (e) => {
            button.style.transform = 'translateY(3px)';
            if (!handheldLayoutOn()) {
                e.preventDefault();
                amico.pressKey(key);
                return;
            }
            // A touch event made by a script may carry no touch point.
            const touch = e.touches && e.touches[0];
            touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
        });

        button.addEventListener('touchmove', (e) => {
            const touch = e.touches && e.touches[0];
            if (!touchStart || !touch) return;
            if (Math.hypot(touch.clientX - touchStart.x, touch.clientY - touchStart.y) > TAP_SLOP_PX) {
                touchStart = null;
                button.style.transform = '';
            }
        });

        button.addEventListener('touchcancel', () => {
            touchStart = null;
            button.style.transform = '';
        });

        button.addEventListener('touchend', (e) => {
            button.style.transform = '';
            if (!touchStart) return;
            touchStart = null;
            // Stops the browser sending the mouse events it makes up after a
            // touch, which would press the key a second time.
            e.preventDefault();
            amico.pressKey(key);
        });
    });
}

// The displays can be drawn as a photograph of a powered board shows them,
// blooming, or held to their segments so they read easily on a screen (see
// DisplayRenderer.LOOKS). Readable is the default; the choice is remembered in
// this browser only. Storage can be unavailable or throw (private windows,
// blocked site data), and then the page simply starts with the default.
const DISPLAY_LOOK_KEY = 'amico2000.displayLook';
const DEFAULT_DISPLAY_LOOK = 'readable';

function setupDisplayLook() {
    const buttons = document.querySelectorAll('.look-btn');

    const apply = (look) => {
        display.setLook(look);
        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.look === look));
        });
    };

    let saved = null;
    try {
        saved = localStorage.getItem(DISPLAY_LOOK_KEY);
    } catch (err) {
        // Storage blocked: keep the default.
    }
    apply(Object.hasOwn(DisplayRenderer.LOOKS, saved) ? saved : DEFAULT_DISPLAY_LOOK);

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            apply(button.dataset.look);
            try {
                localStorage.setItem(DISPLAY_LOOK_KEY, button.dataset.look);
            } catch (err) {
                // Storage blocked: the choice lasts until the page is reloaded.
            }
        });
    });
}

// How cassette LOAD and SAVE run (#20). 'instant' is the trap: the emulator
// does the routine's job itself, at once. 'realtime' leaves the IC10 PROM to
// do it, on the recorder's tape, in the time the board takes, with the
// displays dark and the phase LEDs lit as the manual describes. Instant is the
// default because a real LOAD is seven seconds at the least and a real SAVE
// thirteen. The choice is remembered like the display look, and for the same
// reason may not be.
const CASSETTE_MODE_KEY = 'amico2000.cassetteMode';
const CASSETTE_MODES = ['instant', 'realtime'];

function setupCassetteMode() {
    const buttons = document.querySelectorAll('.tape-btn');

    const apply = (mode) => {
        // A routine that is already running is not interrupted: the trap acts
        // only at the two entry points, and the tape runs until the routine
        // hands back to the monitor or RES is pressed.
        amico.cassette.interceptROM = mode !== 'realtime';
        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.tape === mode));
        });
    };

    let saved = null;
    try {
        saved = localStorage.getItem(CASSETTE_MODE_KEY);
    } catch (err) {
        // Storage blocked: keep the default.
    }
    apply(CASSETTE_MODES.includes(saved) ? saved : CASSETTE_MODES[0]);

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            apply(button.dataset.tape);
            try {
                localStorage.setItem(CASSETTE_MODE_KEY, button.dataset.tape);
            } catch (err) {
                // Storage blocked: the choice lasts until the page is reloaded.
            }
        });
    });
}

// The NOR/SS slide switch on the board: single step. At SS the machine raises
// an NMI after every instruction of a user's program, so that each RUN
// executes one and the monitor comes back showing the address of the next.
// See Amico2000.setSingleStep().
//
// The page always opens with it at NOR. A real switch stays where it was
// left, but a page that came back at SS would open with a RUN key that
// seemed not to run anything.
function setupSingleStepSwitch() {
    const button = document.getElementById('ss-switch');

    const move = (toSS) => {
        amico.setSingleStep(toSS);
        button.setAttribute('aria-checked', String(toSS));
        titleSingleStepSwitch();
        // The class goes on the cell, because the printed slot beside the
        // switch changes sides with it. Every cell: on a phone the board
        // drawing holds a picture of the switch as well, which follows it.
        document.querySelectorAll('.switch-cell').forEach((cell) => cell.classList.toggle('ss', toSS));
    };

    button.addEventListener('click', () => move(!amico.singleStep));
    move(false);
}

// The switch's tooltip says where it stands, so it is set here and not in the
// page, and again when the language changes.
function titleSingleStepSwitch() {
    document.getElementById('ss-switch').title = AmicoLang.t(amico.singleStep ? 'switch.ss' : 'switch.nor');
}

// What a screen reader is told the displays are. display.js writes the
// English when it draws them; this puts it in the page's language.
function labelDisplay() {
    const drawing = document.querySelector('#display svg');
    if (drawing) drawing.setAttribute('aria-label', AmicoLang.t('display.label'));
}

// ============================================================================
// Handheld layout: a phone held upright
// ============================================================================

// The board is drawn three times as wide as it is tall, with keys about 30 px
// across at its smallest, so a phone held upright can show it whole or show
// it usable, not both. On such a screen the parts a person works are moved
// out of the drawing into one column above it, sized for a thumb, and inert
// pictures of them are left in the drawing, which shrinks to a picture of the
// whole board. The styles are under "Handheld layout" in index.html.
//
// The query is deliberately narrow. Width and orientation alone would also
// catch a desktop window dragged tall and thin, and the desktop layout is
// meant to stay exactly as it is; a mouse is a fine pointer, a finger a
// coarse one, so requiring a coarse pointer leaves every desktop alone.
// Landscape on a phone keeps the board as drawn, which then fits the width.
//
// Tablets held upright are included. The board fits their width, but at
// 744-1032 px its keys are 31-39 px and its displays a fifth of the screen:
// the owner found them too small on an iPad Pro 11" (834 px), and the same
// iPad turned sideways, keys at 45 px, fine. 1100 px takes in every iPad
// upright, the widest being the 13" Pro at 1032.
const HANDHELD_QUERY = '(max-width: 1100px) and (orientation: portrait) and (pointer: coarse)';

// How far a finger may drift on a key in the handheld layout and still count
// as a tap rather than the start of a scroll.
const TAP_SLOP_PX = 10;

function handheldLayoutOn() {
    return document.documentElement.classList.contains('handheld');
}

// What moves, in the order the panel shows it: the displays at the top, then
// the four LEDs, then the function keys with the NOR/SS switch, and the hex
// keys at the bottom, nearest the thumb. Each block keeps its own arrangement
// from the board.
const HANDHELD_PARTS = ['.display-block', '.led-bank', '.keyfield.func', '.keyfield.hex'];

function setupHandheldLayout() {
    const panel = document.getElementById('handheld-panel');
    const root = document.documentElement;
    const query = window.matchMedia(HANDHELD_QUERY);
    // Each live part with the picture that stands in for it in the drawing,
    // kept for every switch, so that a part always goes back to exactly
    // where it came from. The pictures are taken now, at startup, whatever
    // the screen: the board is unlit and no key is down, which is what a
    // picture should show. Taken on the first switch instead, they would
    // keep whatever happened to be lit or pressed at that moment.
    const parts = HANDHELD_PARTS.map((selector) => {
        const live = document.querySelector(`.pcb > .part${selector}`);
        return { live, picture: pictureOf(live) };
    });

    const apply = () => {
        const wanted = query.matches;
        if (wanted === handheldLayoutOn()) return;
        // Taking an element out of the page loses its focus; give it back.
        const focused = document.activeElement;
        if (wanted) {
            // Above the maker's mark, which stays at the panel's foot.
            const mark = panel.querySelector('.handheld-mark');
            for (const { live, picture } of parts) {
                live.replaceWith(picture);
                panel.insertBefore(live, mark);
            }
        } else {
            for (const { live, picture } of parts) {
                picture.replaceWith(live);
            }
        }
        root.classList.toggle('handheld', wanted);
        if (focused && focused !== document.activeElement && parts.some(({ live }) => live.contains(focused))) {
            focused.focus({ preventScroll: true });
        }
    };

    // Rotating the phone, or a split screen on a tablet, moves them back and
    // forth. The event handlers and the elements display.js and the rest of
    // this file hold references to are the same elements throughout. Safari
    // before 14 has only the older addListener().
    if (query.addEventListener) {
        query.addEventListener('change', apply);
    } else {
        query.addListener(apply);
    }
    apply();
}

// A copy of a part for the board drawing, as a picture: nothing in it can be
// pressed, focused or read out, and it carries no id or data-key, so that
// getElementById() and the key lookups in this file still find only the live
// part. It is taken at startup, so the displays and LEDs in it are unlit; it
// is not kept up to date, except for the switch, which setupSingleStepSwitch()
// moves with the real one.
function pictureOf(live) {
    const picture = live.cloneNode(true);
    for (const element of [picture, ...picture.querySelectorAll('*')]) {
        element.removeAttribute('id');
        element.removeAttribute('data-key');
        element.removeAttribute('title');
        // Nor the Italian tooltip and the English one kept beside it
        // (lang.js), or a change of language would give the picture a
        // tooltip back.
        for (const name of element.getAttributeNames()) {
            if (/^data-(it|en)-/.test(name)) element.removeAttribute(name);
        }
    }
    // The press of a key is an inline style; a picture shows every key up.
    picture.querySelectorAll('.key').forEach((button) => button.removeAttribute('style'));
    picture.setAttribute('inert', '');
    picture.setAttribute('aria-hidden', 'true');
    return picture;
}

// The phase LEDs D4-D7. The machine reports how much of the last frame each
// was on. SAVE has its two on nearly all the time; LOAD flashes its two for
// about a quarter of it, which reads as lit but dimmer. A class is changed
// only when the look changes, so a steady LED costs nothing.
const PHASE_LED_IDS = ['led-d4', 'led-d5', 'led-d6', 'led-d7'];
const phaseLEDLooks = ['', '', '', ''];

function updatePhaseLEDs(share) {
    share.forEach((on, n) => {
        const look = on < 0.04 ? '' : on < 0.6 ? 'dim' : 'on';
        if (look === phaseLEDLooks[n]) return;
        phaseLEDLooks[n] = look;
        const led = document.getElementById(PHASE_LED_IDS[n]);
        led.classList.toggle('on', look !== '');
        led.classList.toggle('dim', look === 'dim');
    });
}

// What the recorder is doing, in words beside the Cassette buttons. This is
// the emulator's own indicator, like the run lamp: the board has none, and a
// user of the real machine watches the recorder. Called every frame; the text
// changes at most once a second, or when the page changes language.
let tapeStatusText = '';
// The outcome of the last LOAD or SAVE, shown while the recorder is stopped.
// A function and not a string, so that it is said in whatever language the
// page is in when it is read, not the one it was in when it happened.
let tapeStatusNote = null;
let tapeWasPlaying = false;

function updateTapeStatus() {
    const playing = recorder.state === 'playing';
    if (playing && !tapeWasPlaying && recorder.skipped.length) {
        recorder.skipped.forEach(({ id, reason }) => {
            console.warn(`Program ${hexByte(id)} was left off the tape. ${reason}`);
        });
    }
    tapeWasPlaying = playing;

    let text = tapeStatusNote ? tapeStatusNote() : '';
    if (recorder.state !== 'stopped') {
        tapeStatusNote = null;
        const at = Math.floor(recorder.position(amico.cpu.cycles / Amico2000.CLOCK_HZ));
        if (recorder.state === 'recording') {
            text = AmicoLang.t('tape.recording', { at });
        } else if (recorder.length === 0) {
            text = AmicoLang.t('tape.empty');
        } else if (at >= recorder.length) {
            text = AmicoLang.t('tape.end');
        } else {
            text = AmicoLang.t('tape.playing', { at, length: Math.ceil(recorder.length) });
        }
    }
    if (text !== tapeStatusText) {
        tapeStatusText = text;
        document.getElementById('tape-status').textContent = text;
    }
}

// A recording made by the real SAVE routine has been read back and its
// programs put on the cassette. Say what they were, and what was not readable,
// which is all there is after a RES in the middle of a SAVE.
function reportRecording(result) {
    result.records.forEach((record) => {
        const end = record.start + record.data.length - 1;
        console.log(
            `Saved program ${hexByte(record.id)}: $${hexWord(record.start)}-$${hexWord(end)}, ` +
            `${record.data.length} bytes` + (record.note ? ` (${record.note})` : '')
        );
    });
    result.problems.forEach((problem) => console.warn(`Not saved. ${problem}`));

    const ids = result.records.map((record) => hexByte(record.id)).join(', ');
    if (result.records.length === 0) {
        tapeStatusNote = () => AmicoLang.t('tape.nothingSaved');
    } else {
        // Italian says one program and several differently.
        const key = result.records.length === 1 ? 'tape.saved' : 'tape.savedSeveral';
        tapeStatusNote = () => AmicoLang.t(key, { ids });
    }
}

// An instant LOAD or SAVE has been done, or could not be. The routines these
// stand in for leave nothing in memory to say how a SAVE went, and the traps
// now do the same (#41), so this line and the console are where a user finds
// out that a range was not saved, and why.
function reportTrap(outcome) {
    // Each outcome is said twice: on the page in the page's language, and in
    // the console in English, as everything there is.
    let key;
    let values;
    let detail = '';
    if (outcome.error) {
        key = outcome.operation === 'save' ? 'tape.notSaved' : 'tape.notLoaded';
        // The reason is the machine's, in English; lang.js has its Italian.
        values = (language) => ({ why: AmicoLang.message(outcome.error, language) });
    } else {
        const record = outcome.record;
        const size = `${record.data.length} byte${record.data.length === 1 ? '' : 's'}`;
        if (outcome.operation === 'save') {
            key = 'tape.saved';
            values = { ids: hexByte(record.id) };
            detail = `: $${hexWord(record.start)}-$${hexWord(record.end)}, ${size}`;
        } else {
            key = 'tape.loaded';
            values = { id: hexByte(record.id), address: hexWord(outcome.address) };
            detail = `, ${size}`;
        }
    }
    const say = (language) => AmicoLang.t(key, typeof values === 'function' ? values(language) : values, language);
    tapeStatusNote = () => say(AmicoLang.current);
    const inEnglish = say('en') + detail;
    if (outcome.error) {
        console.warn(inEnglish);
    } else {
        console.log(inEnglish);
    }
}

function setupControls() {
    // Run/Stop button
    document.getElementById('btn-run').addEventListener('click', () => {
        amico.toggle();
    });

    // Step button
    document.getElementById('btn-step').addEventListener('click', () => {
        if (!amico.running) {
            amico.step();
        }
    });
    
    // Power-on reset. This is the emulator's control panel, not the board, so
    // it is deliberately the cold start: it clears RAM as switching the machine
    // on does. The board's own RES key is on the keypad and preserves RAM (#30).
    document.getElementById('btn-reset').addEventListener('click', () => {
        amico.reset();
    });
    
    // Load ROM or tape button
    document.getElementById('btn-load').addEventListener('click', () => {
        document.getElementById('rom-file').click();
    });
}

// Nothing larger than this can load: a ROM or program cannot exceed the 6502's
// 64KB address space, and a tape image adds only an 18-byte header to that.
// Twice the address space leaves headroom, so the limit never refuses a file
// a loader would accept.
const MAX_LOAD_BYTES = 2 * 0x10000;

// A sound recording of a tape is far larger than what it holds: a 1KB program
// is about 37 seconds, some 3 MB as 16-bit mono at 44.1 kHz. This allows about
// twelve minutes of that, or six in stereo. The decoder works on the whole
// recording in memory, at a few times the file's size, so a whole cassette
// side is refused here and has to be cut into pieces first.
const MAX_RECORDING_BYTES = 64 * 1024 * 1024;

const hexByte = (value) => value.toString(16).padStart(2, '0').toUpperCase();
const hexWord = (value) => value.toString(16).padStart(4, '0').toUpperCase();

/**
 * An error of the page's own making, which can be said in either language:
 * it names a string of lang.js and gives the values that go in it. Its
 * message is the English, for the console.
 *
 * `values` may be a function of the language, for a value that is itself
 * worded differently in each. `detail`, also a function of the language, is
 * added after the string.
 */
class PageError extends Error {
    constructor(key, values = {}, detail = () => '') {
        const valuesFor = typeof values === 'function' ? values : () => values;
        super(AmicoLang.t(key, valuesFor('en'), 'en') + detail('en'));
        this.key = key;
        this.valuesFor = valuesFor;
        this.detail = detail;
    }

    text(language = AmicoLang.current) {
        return AmicoLang.t(this.key, this.valuesFor(language), language) + this.detail(language);
    }
}

/**
 * What went wrong, in the page's language. An error of the page's own says
 * itself; one thrown by the machine or the tape codec is English, and
 * lang.js has the Italian for it.
 */
function errorText(err) {
    return err instanceof PageError ? err.text() : AmicoLang.message(err.message);
}

/**
 * Put the programs decoded from a sound recording on the mock cassette and
 * say what was found, in the words the load alert shows (#20).
 *
 * A recording with nothing readable on it is an error. One with some programs
 * read and others damaged is not: the good ones are kept and the damage is
 * listed under them.
 *
 * @returns {function(string): string} What was found, said in the language
 *     asked for: the alert asks for the page's, the console for English.
 */
function importTapeRecording(name, result) {
    const length = (language) => AmicoLang.t('recording.length', {
        seconds: AmicoLang.decimal(result.duration, 1, language),
        rate: result.sampleRate
    }, language);
    // What the decoder could not read, one line each. Its words are English;
    // lang.js has the Italian for them.
    const damage = (language, indent) =>
        result.problems.map((problem) => indent + AmicoLang.message(problem, language)).join('\n');
    if (result.records.length === 0) {
        throw new PageError(
            'recording.nothing',
            (language) => ({ name, length: length(language) }),
            (language) => (result.problems.length ? '\n' + damage(language, '') : '')
        );
    }

    const stored = result.records.map((decoded) => ({ decoded, record: amico.addTapeRecord(decoded) }));
    const count = stored.length;
    return (language) => {
        const lines = stored.map(({ decoded, record }) =>
            AmicoLang.t('recording.program', {
                id: hexByte(record.id),
                start: hexWord(record.start),
                end: hexWord(record.end),
                bytes: record.data.length,
                time: AmicoLang.decimal(decoded.time, 1, language)
            }, language) + (decoded.note ? `\n      (${AmicoLang.message(decoded.note, language)})` : ''));
        let summary = AmicoLang.t(count === 1 ? 'recording.readOne' : 'recording.readSeveral',
            { count, name, length: length(language) }, language) + '\n' +
            lines.join('\n') + '\n' +
            AmicoLang.t('recording.howToLoad', {}, language);
        if (result.problems.length) {
            summary += '\n\n' + AmicoLang.t('recording.notRead', {}, language) + '\n' + damage(language, '  ');
        }
        return summary;
    };
}

function setupFileLoader() {
    document.getElementById('rom-file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Check the size before reading: the loaders would refuse an
            // oversized file anyway, but only after FileReader had pulled all
            // of it into memory, and a multi-gigabyte file picked by mistake
            // could stall the tab first.
            const lowerName = file.name.toLowerCase();
            // A sound recording is told by its extension alone, and first, so
            // that a file called tape.wav is not taken for an .amtape image.
            const isRecording = lowerName.endsWith('.wav');
            if (isRecording && file.size > MAX_RECORDING_BYTES) {
                throw new PageError('load.recordingTooLarge', {
                    name: file.name,
                    size: Math.round(file.size / (1024 * 1024)),
                    limit: MAX_RECORDING_BYTES / (1024 * 1024)
                });
            }
            if (!isRecording && file.size > MAX_LOAD_BYTES) {
                throw new PageError('load.fileTooLarge', {
                    name: file.name,
                    size: file.size,
                    limit: MAX_LOAD_BYTES
                });
            }

            const data = await readFileAsArrayBuffer(file);
            const rom = new Uint8Array(data);
            // What the alert will say, as a function of the language, so that
            // the console can have the same thing in English.
            let summary = (language) => AmicoLang.t('load.done', { name: file.name, bytes: rom.length }, language);

            // Determine ROM type based on size and name
            if (isRecording) {
                summary = importTapeRecording(file.name, AmicoTapeAudio.decodeWav(rom));
                console.log(summary('en'));
            } else if (lowerName.endsWith('.amtape') || lowerName.includes('tape')) {
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

            alert(summary(AmicoLang.current));
        } catch (err) {
            console.error('Error loading file:', err);
            alert(AmicoLang.t('load.error', { message: errorText(err) }));
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

    // The CPU core stops itself on an opcode it does not implement, but the
    // emulator's frame loop keeps going so that RES can still bring the board
    // back. Without this the lamp beside the registers would go on saying
    // "running" over a processor that is executing nothing.
    document.getElementById('led-run').classList.toggle('halted', amico.cpu.halted);
}

function updateRunButton() {
    const btn = document.getElementById('btn-run');
    const led = document.getElementById('led-run');

    // The one bench button whose word changes, so the word comes from
    // lang.js and not from the page.
    btn.textContent = AmicoLang.t(amico.running ? 'stop' : 'run');
    led.classList.toggle('on', amico.running);
}

// Keyboard keys whose on-screen button has a different data-key; every other
// key ('0'-'f', '+') is its own data-key. One table serves press and release,
// so the two cannot drift apart.
const BUTTON_FOR_KEY = {
    'arrowup': 'ad',
    'arrowdown': 'da',
    'enter': 'go',
    'escape': 'res',
    'backspace': 'res',
    '=': '+',
    'r': 'reg',
    'g': 'go',
    // HLT. The button's data-key is still 'pc', from when it was labelled
    // after an emulator function and not after the key on the board.
    'h': 'pc'
};

function keyButton(key) {
    // The table is keyed lowercase but `key` keeps its case for named keys, so
    // 'Escape' missed 'escape' and the RES cap never moved. Same for the other
    // named keys (#30).
    const buttonKey = BUTTON_FOR_KEY[key.toLowerCase()] || key;
    // `key` is the browser's KeyboardEvent.key, so it can be any character,
    // and every keyup arrives here, mapped or not: escape it so a double quote
    // cannot break the selector.
    return document.querySelector(`.key[data-key="${CSS.escape(buttonKey)}"]`);
}

function highlightButton(key) {
    const button = keyButton(key);
    if (button) {
        button.style.transform = 'translateY(3px)';
    }
}

function unhighlightButton(key) {
    const button = keyButton(key);
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
    },

    // Export a tape record as the sound the board would put on tape for it: a
    // WAV file a recorder could play back to a real AMICO 2000 (#20).
    saveTapeAudio: (id = null) => {
        const record = amico.findTape(id);
        const bytes = AmicoTapeAudio.encodeWav(record);
        // The board's own SAVE routine drops the last byte of some blocks, and
        // the sound is what that routine would send. Say so, because the
        // .amtape export of the same record keeps every byte.
        const kept = AmicoTapeAudio.bytesKept(record.data.length);
        if (kept < record.data.length) {
            console.warn(
                `This block is ${record.data.length} bytes, 1 more than a whole number of ` +
                'pages. The AMICO 2000 SAVE routine does not record the last byte of such ' +
                `a block, so the recording holds ${kept} of them.`
            );
        }
        downloadBytes(`amico-${hexByte(record.id)}.wav`, bytes, 'audio/wav');
        const seconds = (bytes.length - 44) / 2 / 44100;
        console.log(`Exported program ${hexByte(record.id)} as sound (${seconds.toFixed(1)} s, ${bytes.length} bytes)`);
    }
};
