/**
 * =============================================================================
 * AMICO 2000 Machine Emulator
 * =============================================================================
 * 
 * Emulates the complete Amico 2000 system:
 * - 6502 CPU @ 1MHz
 * - 1-2KB RAM ($0000-$07FF)
 * - Monitor ROM ($FE00-$FFFF)
 * - Cassette ROM ($FB00-$FCFF) [optional]
 * - 8255 PIA for display/keyboard ($FD00-$FD03)
 * 
 * Author: Andrea Scasso / Claude
 * License: MIT
 * Date: December 2025
 * 
 * =============================================================================
 */

class Amico2000 {
    constructor() {
        // Create CPU
        this.cpu = new CPU6502();
        
        // 8255 PIA state
        this.pia = {
            portA: 0x00,    // Display segments / keyboard data
            portB: 0x00,    // Digit select / control
            portC: 0x00,    // General I/O (expansion port)
            control: 0x00   // 8255 control register
        };
        
        // Display state (6 digits, each 8 segments including DP)
        this.display = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.currentDigit = 0;
        
        // Keyboard state - ROM scans 3 rows × 7 columns (port B = 1, 3, 5)
        // Final empirically-determined layout - ALL 16 HEX KEYS WORKING!
        this.keyMatrix = [
            [false, false, false, false, false, false, false],  // Row 0 (portB=1): 6,5,4,3,2,1,E
            [false, false, false, false, false, false, false],  // Row 1 (portB=3): D,C,B,A,9,8,7
            [false, false, false, false, false, false, false],  // Row 2 (portB=5): 0,AD,+,DA,?,F,?
        ];

        // Key mapping: keyboard key -> [row, col]
        // Final empirically-determined layout - ALL 16 HEX KEYS WORKING!
        // Row 0 (portB=1): bit 0=6, bit 1=5, bit 2=4, bit 3=3, bit 4=2, bit 5=1, bit 6=E
        // Row 1 (portB=3): bit 0=D, bit 1=C, bit 2=B, bit 3=A, bit 4=9, bit 5=8, bit 6=7
        // Row 2 (portB=5): bit 0=0, bit 1=AD, bit 2=+, bit 3=DA, bit 4=?, bit 5=F, bit 6=?
        //
        this.keyMap = {
            // Hex keys - ALL 16 KEYS CONFIRMED WORKING!
            '0': [2, 0], '1': [0, 5], '2': [0, 4], '3': [0, 3],
            '4': [0, 2], '5': [0, 1], '6': [0, 0], '7': [1, 6],
            '8': [1, 5], '9': [1, 4], 'a': [1, 3], 'b': [1, 2],
            'c': [1, 1], 'd': [1, 0], 'e': [2, 6], 'f': [2, 5],

            // Function keys - known working positions
            'ArrowUp': [2, 1],    // AD
            'ArrowDown': [2, 3],  // DA
            '+': [2, 2],          // +
            '=': [2, 2],          // + alternate
            'Enter': [2, 3],      // GO (shares with DA)
            'g': [2, 3],          // GO alternate
            'r': [2, 1],          // REG (shares with AD)
            'p': [2, 3],          // PC (shares with DA/GO)
            'Escape': [2, 1],     // RES (shares with AD/REG)
        };

        // Alternate key mappings for function keys
        this.altKeyMap = {
            'Backspace': [0, 5],  // RES (alternate, shares with 5)
        };
        
        // Single-step mode
        this.singleStep = false;
        
        // Running state
        this.running = false;
        this.frameRequest = null;
        
        // Timing
        this.cyclesPerFrame = 16667;  // ~1MHz / 60fps
        this.lastFrameTime = 0;
        
        // Callbacks for UI
        this.onDisplayUpdate = null;
        this.onStateUpdate = null;
        
        // Setup I/O
        this._setupIO();
    }
    
    // =========================================================================
    // I/O Setup
    // =========================================================================
    
    _setupIO() {
        // 8255 PIA at $FD00-$FD03
        this.cpu.onRead(0xFD00, 0xFD03, (addr) => this._readPIA(addr));
        this.cpu.onWrite(0xFD00, 0xFD03, (addr, value) => this._writePIA(addr, value));
    }
    
    _readPIA(addr) {
        const port = addr & 0x03;
        
        switch (port) {
            case 0:  // Port A - Keyboard data input
                return this._scanKeyboard();
            case 1:  // Port B
                return this.pia.portB;
            case 2:  // Port C
                return this.pia.portC;
            case 3:  // Control register
                return this.pia.control;
        }
        return 0xFF;
    }
    
    _writePIA(addr, value) {
        const port = addr & 0x03;
        
        switch (port) {
            case 0:  // Port A - Display segments
                this.pia.portA = value;
                this._updateDisplay();
                break;
            case 1:  // Port B - Digit select and control
                this.pia.portB = value;
                this._updateDisplay();
                break;
            case 2:  // Port C - Expansion
                this.pia.portC = value;
                break;
            case 3:  // Control register
                this.pia.control = value;
                break;
        }
    }
    
    // =========================================================================
    // Display Emulation
    // =========================================================================
    
    _updateDisplay() {
        // The Amico 2000 multiplexes the display
        // Port B contains both mode selection and digit index
        // Port A contains the segment pattern

        const portB = this.pia.portB;
        const segmentPattern = this.pia.portA & 0x7F;

        // Bit 0 of port B distinguishes keyboard scan (0) from display mode (1)
        // Keyboard scan: portB & 0x01 == 0 (values: 0x00, 0x02, 0x04, 0x06...)
        // Display mode: portB & 0x01 == 1 (values: 0x09, 0x0B, 0x0D, 0x0F, 0x11, 0x13, 0x15)
        if ((portB & 0x01) === 0) {
            // Keyboard scanning mode, don't update display
            return;
        }

        // In display mode, bits 1-4 encode a counter value
        // The ROM uses values 0x09-0x15, which when shifted give indices 4-10
        // We need to subtract 4 to get digit indices 0-5
        const digitIndex = ((portB >> 1) & 0x0F) - 4;

        // Update the display if digit index is valid (0-5)
        // Ignore blank patterns (0x00) - the ROM blanks digits between updates to prevent
        // ghosting, but we want persistence of vision in the emulator
        if (digitIndex >= 0 && digitIndex < 6 && segmentPattern !== 0) {
            this.display[digitIndex] = segmentPattern;
            this.currentDigit = digitIndex;
        }

        // NOTE: Do NOT call onDisplayUpdate here!
        // The display is updated thousands of times per second due to multiplexing.
        // The UI callback is invoked once per frame in _runFrame() instead.
        // This is a critical performance optimization.
    }
    
    /**
     * Get current display state
     * @returns {Array} Array of 6 segment patterns
     */
    getDisplay() {
        return [...this.display];
    }
    
    /**
     * Convert display to hex string (for debugging)
     */
    getDisplayHex() {
        return this.display.map(d => d.toString(16).padStart(2, '0')).join(' ');
    }
    
    // =========================================================================
    // Keyboard Emulation
    // =========================================================================
    
    _scanKeyboard() {
        const portB = this.pia.portB;
        let result = 0xFF;  // No keys pressed (all bits high)

        // The ROM scans with specific port B values: 1, 3, 5 (incrementing by 2)
        // Only 3 rows are scanned based on ROM's TESTAS routine (LDY #$03)
        // Map these exact values to keyboard matrix rows:
        // Port B = 1 (0b0001) → Row 0 (keys 0-6)
        // Port B = 3 (0b0011) → Row 1 (keys 7-D)
        // Port B = 5 (0b0101) → Row 2 (keys E,F + function keys)

        let row = -1;
        const scanValue = portB & 0x0F;  // Lower 4 bits used for row selection

        // Match exact port B values to rows (only 3 rows scanned)
        if (scanValue === 0x01) row = 0;
        else if (scanValue === 0x03) row = 1;
        else if (scanValue === 0x05) row = 2;

        // If a valid row is being scanned, check for pressed keys
        // The ROM scans 7 columns (bits 0-6)
        if (row >= 0 && row < 3) {
            for (let col = 0; col < 7; col++) {
                if (this.keyMatrix[row][col]) {
                    // Key pressed - clear bit (active LOW)
                    result &= ~(1 << col);
                }
            }
        }

        return result;
    }
    
    /**
     * Press a key (call on keydown)
     * @param {string} key - Key identifier
     */
    keyDown(key) {
        const pos = this.keyMap[key] || this.altKeyMap[key];
        if (pos) {
            console.log(`Key pressed: "${key}" -> Row ${pos[0]}, Col ${pos[1]}`);
            this.keyMatrix[pos[0]][pos[1]] = true;
        } else {
            console.log(`Key pressed: "${key}" -> NOT MAPPED`);
        }
    }
    
    /**
     * Release a key (call on keyup)
     * @param {string} key - Key identifier
     */
    keyUp(key) {
        const pos = this.keyMap[key] || this.altKeyMap[key];
        if (pos) {
            console.log(`Key released: "${key}" -> Row ${pos[0]}, Col ${pos[1]}`);
            this.keyMatrix[pos[0]][pos[1]] = false;
        }
    }
    
    /**
     * Press a key by name (for on-screen buttons)
     * @param {string} name - Key name like '0', 'A', 'GO', 'RES'
     */
    pressKey(name) {
        const keyName = name.toLowerCase();
        
        // Map key names to keyboard keys
        const nameToKey = {
            '0': '0', '1': '1', '2': '2', '3': '3',
            '4': '4', '5': '5', '6': '6', '7': '7',
            '8': '8', '9': '9', 'a': 'a', 'b': 'b',
            'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f',
            'ad': 'ArrowUp', 'da': 'ArrowDown',
            'pc': 'p', 'reg': 'r',
            '+': '+', 'go': 'Enter', 'res': 'Escape'
        };
        
        const key = nameToKey[keyName];
        if (key) {
            this.keyDown(key);
            // Auto-release after 100ms (simulates key click)
            setTimeout(() => this.keyUp(key), 100);
        }
    }
    
    // =========================================================================
    // ROM Loading
    // =========================================================================
    
    /**
     * Load the monitor ROM
     * @param {Uint8Array|Array} data - ROM data (512 bytes)
     */
    loadMonitorROM(data) {
        this.cpu.loadBinary(data, 0xFE00);
    }
    
    /**
     * Load the cassette ROM
     * @param {Uint8Array|Array} data - ROM data (512 bytes)
     */
    loadCassetteROM(data) {
        this.cpu.loadBinary(data, 0xFB00);
    }
    
    /**
     * Load a program into RAM
     * @param {Uint8Array|Array} data - Program data
     * @param {number} address - Start address (default $0000)
     */
    loadProgram(data, address = 0x0000) {
        this.cpu.loadBinary(data, address);
    }
    
    // =========================================================================
    // Execution Control
    // =========================================================================
    
    /**
     * Reset the machine
     */
    reset() {
        this.cpu.reset();
        this.display = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.pia = { portA: 0, portB: 0, portC: 0, control: 0 };
        
        // Update display immediately on reset (user expects visual feedback)
        if (this.onDisplayUpdate) {
            this.onDisplayUpdate(this.display);
        }
        if (this.onStateUpdate) {
            this.onStateUpdate(this.cpu.getState());
        }
    }
    
    /**
     * Execute one CPU instruction (for single-stepping)
     */
    step() {
        const cycles = this.cpu.step();
        
        // Update display after step (user is single-stepping, wants to see changes)
        if (this.onDisplayUpdate) {
            this.onDisplayUpdate(this.display);
        }
        if (this.onStateUpdate) {
            this.onStateUpdate(this.cpu.getState());
        }
        
        return cycles;
    }
    
    /**
     * Run the emulator
     */
    start() {
        if (this.running) return;
        
        this.running = true;
        this.lastFrameTime = performance.now();
        this._runFrame();
    }
    
    /**
     * Stop the emulator
     */
    stop() {
        this.running = false;
        if (this.frameRequest) {
            cancelAnimationFrame(this.frameRequest);
            this.frameRequest = null;
        }
    }
    
    /**
     * Toggle running state
     */
    toggle() {
        if (this.running) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    /**
     * Internal: Run one frame of emulation
     */
    _runFrame() {
        if (!this.running) return;
        
        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        // Calculate how many cycles to run
        // Adjust for actual frame time to maintain speed
        const cyclesToRun = Math.min(
            this.cyclesPerFrame * (elapsed / 16.667),
            this.cyclesPerFrame * 2  // Cap at 2x to prevent spiral
        );
        
        // Execute cycles
        this.cpu.run(cyclesToRun);
        
        // Update display ONCE per frame (critical performance fix)
        // The display state is updated internally during CPU execution,
        // but we only render to DOM here at 60fps
        if (this.onDisplayUpdate) {
            this.onDisplayUpdate(this.display);
        }
        
        // Update state display
        if (this.onStateUpdate) {
            this.onStateUpdate(this.cpu.getState());
        }
        
        // Schedule next frame
        this.frameRequest = requestAnimationFrame(() => this._runFrame());
    }
    
    // =========================================================================
    // State Access
    // =========================================================================
    
    /**
     * Get CPU state
     */
    getCPUState() {
        return this.cpu.getState();
    }
    
    /**
     * Read memory
     */
    readMemory(address) {
        return this.cpu.read(address);
    }
    
    /**
     * Write memory
     */
    writeMemory(address, value) {
        this.cpu.write(address, value);
    }
    
    /**
     * Get memory range as array
     */
    getMemoryRange(start, length) {
        const data = [];
        for (let i = 0; i < length; i++) {
            data.push(this.cpu.read(start + i));
        }
        return data;
    }
    
    /**
     * Set single-step mode
     */
    setSingleStep(enabled) {
        this.singleStep = enabled;
    }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Amico2000 };
}
