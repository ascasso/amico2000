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
        
        // Keyboard state - ROM only scans 3 rows (port B = 1, 3, 5)
        this.keyMatrix = [
            [false, false, false, false, false, false],  // Row 0 (portB=1): 0,1,2,3,4,5
            [false, false, false, false, false, false],  // Row 1 (portB=3): 6,7,8,9,A,B
            [false, false, false, false, false, false],  // Row 2 (portB=5): C,D,E,F,+,GO,RES,AD,DA,PC,REG (need to verify exact layout)
        ];

        // Key mapping: keyboard key -> [row, col]
        // Based on actual AMICO 2000 keyboard matrix from hardware testing
        // Note: Some keys share matrix positions (e.g., A and AD both at [1,4])
        // This is correct - the ROM interprets them based on context
        this.keyMap = {
            // Hex keys
            '0': [0, 0], '1': [0, 1], '2': [0, 2], '3': [0, 3],
            '4': [0, 4], '5': [0, 5],
            '6': [1, 0], '7': [1, 1], '8': [1, 2], '9': [1, 3],
            'a': [1, 4], 'b': [1, 5],
            'c': [2, 0], 'd': [2, 1], 'e': [2, 2], 'f': [2, 3],
            // Function keys (share positions with some hex/other keys)
            'ArrowUp': [1, 4],    // AD (shares with A)
            'ArrowDown': [1, 5],  // DA (shares with B)
            'p': [2, 4],          // PC (shares with +)
            'r': [2, 5],          // REG (shares with GO/Enter)
            '+': [2, 4],          // + (shares with PC)
            '=': [2, 4],          // + alternate (shares with PC)
            'Enter': [2, 5],      // GO (shares with REG)
            'g': [2, 5],          // GO alternate
            'Escape': [0, 5],     // RES (shares with 5)
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
        // Port B bits select which digit is active
        // Port A contains the segment pattern

        // Decode digit select from port B
        const digitSelect = this.pia.portB;

        // Mask off bit 7 (decimal point) as original hardware didn't use it
        const segmentPattern = this.pia.portA & 0x7F;

        // The ROM uses bits 1-6 of port B for digit selection (shifted by 1)
        // This is because bit 0 is reserved or used for other purposes
        // Display layout: [A3][A2][A1][A0] : [D1][D0]
        // Bit 1 → A3, Bit 2 → A2, Bit 3 → A1, Bit 4 → A0, Bit 5 → D1, Bit 6 → D0
        for (let i = 1; i <= 6; i++) {
            if ((digitSelect & (1 << i)) === 0) {  // Active LOW
                this.display[i - 1] = segmentPattern;  // Map bit 1->display[0], bit 2->display[1], etc.
                this.currentDigit = i - 1;
            }
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
        // Map these exact values to keyboard matrix rows
        // Port B = 1 (0b0001) → Row 0 (keys 0,1,2,3,4,5)
        // Port B = 3 (0b0011) → Row 1 (keys 6,7,8,9,A,B)
        // Port B = 5 (0b0101) → Row 2 (keys C,D,E,F,+,GO/RES/AD/DA/PC/REG)

        let row = -1;
        const scanValue = portB & 0x0F;  // Lower 4 bits used for row selection

        // Match exact port B values to rows (only 3 rows scanned)
        if (scanValue === 0x01) row = 0;
        else if (scanValue === 0x03) row = 1;
        else if (scanValue === 0x05) row = 2;

        // If a valid row is being scanned, check for pressed keys
        if (row >= 0 && row < 3) {
            for (let col = 0; col < 6; col++) {
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
            this.keyMatrix[pos[0]][pos[1]] = true;
        }
    }
    
    /**
     * Release a key (call on keyup)
     * @param {string} key - Key identifier
     */
    keyUp(key) {
        const pos = this.keyMap[key] || this.altKeyMap[key];
        if (pos) {
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
