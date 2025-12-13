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
 * Date: December 2024
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
        
        // Keyboard state
        this.keyMatrix = [
            [false, false, false, false, false, false],  // Row 0: 0,1,2,3,AD,PC
            [false, false, false, false, false, false],  // Row 1: 4,5,6,7,DA,REG
            [false, false, false, false, false, false],  // Row 2: 8,9,A,B,+,(empty)
            [false, false, false, false, false, false]   // Row 3: C,D,E,F,GO,RES
        ];
        
        // Key mapping: keyboard key -> [row, col]
        this.keyMap = {
            '0': [0, 0], '1': [0, 1], '2': [0, 2], '3': [0, 3],
            '4': [1, 0], '5': [1, 1], '6': [1, 2], '7': [1, 3],
            '8': [2, 0], '9': [2, 1], 'a': [2, 2], 'b': [2, 3],
            'c': [3, 0], 'd': [3, 1], 'e': [3, 2], 'f': [3, 3],
            // Function keys (mapped to convenient PC keys)
            'Enter': [3, 4],      // GO
            'Escape': [3, 5],     // RES
            '+': [2, 4],          // +
            '=': [2, 4],          // + (alternate)
            'ArrowUp': [0, 4],    // AD
            'ArrowDown': [1, 4],  // DA
            'p': [0, 5],          // PC
            'r': [1, 5],          // REG
        };
        
        // Alternate key mappings for function keys
        this.altKeyMap = {
            'g': [3, 4],          // GO
            'Backspace': [3, 5],  // RES
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
        // Port B lower bits select which digit is active (active LOW)
        // Port A contains the segment pattern
        
        // Decode digit select from port B
        // In the original, bits 0-5 of port B select digits (active low)
        const digitSelect = this.pia.portB & 0x3F;
        
        // Find which digit is selected (only one at a time in normal operation)
        for (let i = 0; i < 6; i++) {
            if ((digitSelect & (1 << i)) === 0) {  // Active LOW
                this.display[i] = this.pia.portA;
                this.currentDigit = i;
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
        // The Amico 2000 keyboard scanning works as follows (from TESTAS routine):
        // 
        // ROM code at TESTAS ($FEEB):
        //   LDY #$03          ; 3 rows to scan
        //   LDX #$01          ; Start with port B = 1
        // LOOP:
        //   STX PORTB         ; Select row (values: 1, 3, 5)
        //   INX               ; 
        //   INX               ; Skip by 2
        //   AND PORTA         ; Read columns, AND with accumulator
        //   DEY               ; Next row
        //   BNE LOOP
        //
        // Port B values 1, 3, 5 select rows via bits:
        //   $01 = bit 0 = Row for digits 0,1,2,3 and function keys
        //   $03 = bits 0,1 = additional row
        //   $05 = bits 0,2 = another row
        //
        // This is a simplified model - the actual hardware may use specific
        // bit patterns. Port A is read and AND'd with $FF initially.
        // Keys pressed return 0 in their bit position (active LOW).
        
        const portB = this.pia.portB;
        let result = 0xFF;  // No keys pressed (all bits high)
        
        // The ROM scans with specific port B values
        // We map keyboard matrix rows based on port B bit patterns
        // Row mapping depends on actual hardware - this is an approximation
        
        // Check if any row selection bit is active
        // Port B bits 0-2 appear to be used for row selection
        
        for (let row = 0; row < 4; row++) {
            // Determine if this row is currently being scanned
            // Based on ROM: values 1, 3, 5 are used (bits 0, 0+1, 0+2)
            let rowActive = false;
            
            if (row === 0 && (portB & 0x01)) rowActive = true;
            if (row === 1 && (portB & 0x02)) rowActive = true;
            if (row === 2 && (portB & 0x04)) rowActive = true;
            if (row === 3 && (portB & 0x08)) rowActive = true;
            
            if (rowActive) {
                // Check columns for this row
                for (let col = 0; col < 6; col++) {
                    if (this.keyMatrix[row][col]) {
                        // Key pressed - clear bit (active LOW)
                        result &= ~(1 << col);
                    }
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
