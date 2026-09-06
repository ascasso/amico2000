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
 * - 8255 PIA for display/keyboard ($FD00-$FDFF, aliased to four registers)
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

        // Fix for #2: mock cassette storage used by traps for the optional IC10 ROM entry points.
        // This preserves the monitor workflow without emulating the analog tape waveform.
        this.cassette = {
            tapes: [],
            lastSavedTape: null,
            interceptROM: true
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
        };

        // Alternate key mappings for function keys
        this.altKeyMap = {};

        // Fix for #30: RES is not a key in the scanned matrix. On the real
        // board it drives the 6502 reset line, which is why the manual can say
        // it "permette di arrestare l'esecuzione di un programma utente in
        // qualsiasi momento passando il controllo del sistema al monitor" -
        // it stops a user program at any moment, whether or not that program
        // ever scans the keyboard, and even after an illegal opcode has
        // stopped the CPU dead. These keys therefore bypass keyMatrix
        // entirely and call res().
        //
        // They used to sit in the matrix at positions they shared with other
        // keys, so pressing Escape also typed AD and Backspace also typed 5.
        this.resetKeys = new Set(['Escape', 'Backspace']);
        
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
        this._setupCassetteROMTraps();
    }
    
    // =========================================================================
    // I/O Setup
    // =========================================================================
    
    _setupIO() {
        // The CPU callback layer models partial address decoding, so $FD00-$FDFF
        // aliases to these four 8255 PIA registers using the low two address bits.
        this.cpu.onRead(0xFD00, 0xFD03, (addr) => this._readPIA(addr));
        this.cpu.onWrite(0xFD00, 0xFD03, (addr, value) => this._writePIA(addr, value));

        this._protectROM();
    }

    /**
     * Fix for #31: model the read-only regions of the board.
     *
     * The PROMs at IC9 and IC10 have no write line. A store into their address
     * space is decoded and driven onto the bus, but nothing latches it, so the
     * byte is simply lost. The generic CPU core deliberately keeps a writable
     * flat 64KB array, so the machine layer declares which regions are
     * read-only exactly the way it declares the PIA: through write callbacks.
     * A store landing here is swallowed instead of reaching cpu.memory[].
     *
     * This matters beyond stray bytes in the monitor listing. $FFFA-$FFFF hold
     * the NMI/reset/IRQ vectors, so before this fix a single `STA $FFFC` left
     * the board with no way home: CPU6502.reset() takes its new PC from that
     * vector, which meant even the Reset control could not recover the machine.
     *
     * Deliberate ROM installation goes through loadMonitorROM() and
     * loadCassetteROM(), which write cpu.memory[] directly the way fitting a
     * chip into the socket does, and are unaffected by this protection.
     */
    _protectROM() {
        for (const region of Amico2000.ROM_REGIONS) {
            this.cpu.onWrite(region.start, region.end, () => {});
        }
    }

    /**
     * Fix for #31: return the read-only region that a span of `length` bytes
     * starting at `address` would land on, or null when the span is clear.
     *
     * The write callbacks above only guard the CPU's own stores. The loaders
     * below write cpu.memory[] directly, so they check their destination here.
     */
    _findROMOverlap(address, length) {
        if (length <= 0) return null;
        const end = address + length - 1;
        return Amico2000.ROM_REGIONS.find(
            (region) => address <= region.end && end >= region.start
        ) || null;
    }

    _setupCassetteROMTraps() {
        this.cpu.onBeforeExecute((pc) => this._handleCassetteROMEntry(pc));
    }

    _handleCassetteROMEntry(pc) {
        if (!this.cassette.interceptROM) return null;

        // Fix for #2: IC10 cassette ROM documented entry points: FBBC = save, FC54 = load.
        // Trapping here avoids tying browser file I/O to the original analog signal loop.
        //
        // Issue #24: redirecting to $FE22 deliberately does NOT unwind a JSR frame.
        // $FE22 is the monitor's RESET entry (it is the $FFFC vector target) and it
        // runs `LDX #$00 / STX $FA / STX $FB / LDX #$FF / TXS` before reaching the
        // main loop at $FE30, so the TXS at $FE2A reinitialises SP to $FF. Any frame
        // pushed by a `JSR $FBBC` / `JSR $FC54` is discarded by the monitor itself,
        // and repeated LOAD/SAVE cannot leak stack space.
        //
        // Pulling the frame here would be wrong rather than merely redundant: the
        // IC10 ROM re-enters LOAD with `JMP $FC54` (no frame pushed) and leaves both
        // routines with `JMP $FE22` rather than RTS, so an unconditional pull would
        // corrupt the stack on the JMP path. Covered by
        // tests/cassette-trap-stack.test.js.
        if (pc === 0xFBBC) {
            try {
                this.saveTapeFromMonitorParams();
            } catch (err) {
                console.warn('Cassette save failed:', err.message);
                this.cpu.memory[0x0000] = 0xFF;
            }
            this.cpu.PC = 0xFE22;
            return 6;
        }

        if (pc === 0xFC54) {
            this.loadTapeFromMonitorParams();
            this.cpu.PC = 0xFE22;
            return 6;
        }

        return null;
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

        // DEBUG: Log keyboard scans when keys are detected
        if (result !== 0xFF && window.debugKeyboard) {
            console.log(`[SCAN] portB=${portB.toString(16).padStart(2,'0')} row=${row} result=${result.toString(16).padStart(2,'0')} (bit cleared for pressed key)`);
        }

        return result;
    }
    
    /**
     * Press a key (call on keydown)
     * @param {string} key - Key identifier
     */
    keyDown(key) {
        // Fix for #30: the reset line is checked before the matrix, so RES
        // works with a program that never scans the keyboard and with a CPU
        // that is halted on an illegal opcode.
        if (this.isResetKey(key)) {
            if (this._keyboardDebug()) console.log(`Key pressed: "${key}" -> RES (reset line)`);
            this.res();
            return;
        }

        const pos = this.keyMap[key] || this.altKeyMap[key];
        if (pos) {
            this.keyMatrix[pos[0]][pos[1]] = true;

            if (this._keyboardDebug()) {
                console.log(`Key pressed: "${key}" -> Row ${pos[0]}, Col ${pos[1]}`);

                // Show display state after the press, delayed so ROM processing lands first
                setTimeout(() => {
                    const displayHex = this.display.map(d => d.toString(16).padStart(2, '0').toUpperCase()).join(' ');
                    console.log(`[DISPLAY] ${displayHex} | CPU halted: ${this.cpu.halted} | PC: ${this.cpu.PC.toString(16).padStart(4, '0').toUpperCase()}`);
                }, 50);
            }
        } else if (this._keyboardDebug()) {
            console.log(`Key pressed: "${key}" -> NOT MAPPED`);
        }
    }
    
    /**
     * Release a key (call on keyup)
     * @param {string} key - Key identifier
     */
    keyUp(key) {
        // A reset key holds nothing in the matrix, so there is nothing to
        // release and no way for it to leave a cell stuck down (#30).
        if (this.isResetKey(key)) return;

        const pos = this.keyMap[key] || this.altKeyMap[key];
        if (pos) {
            if (this._keyboardDebug()) console.log(`Key released: "${key}" -> Row ${pos[0]}, Col ${pos[1]}`);
            this.keyMatrix[pos[0]][pos[1]] = false;
        }
    }

    /**
     * Is this key one of the RES aliases? Fix for #30: `main.js` needs this to
     * decide whether to preventDefault, since RES no longer appears in keyMap.
     */
    isResetKey(key) {
        return this.resetKeys.has(key);
    }

    /**
     * Keyboard tracing is opt-in through `debug.enableKeyboardDebug()`, and the
     * guard has to survive Node, where the machine runs without a `window`.
     */
    _keyboardDebug() {
        return typeof window !== 'undefined' && window.debugKeyboard === true;
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
        if (!key) return;

        this.keyDown(key);

        // Fix for #30: RES is a momentary line rather than a matrix key, so
        // keyDown() has already done all of it. Scheduling a release would
        // only queue a timer that has nothing to clear.
        if (this.isResetKey(key)) return;

        // Auto-release after 100ms (simulates key click)
        setTimeout(() => this.keyUp(key), 100);
    }
    
    // =========================================================================
    // ROM Loading
    // =========================================================================
    
    /**
     * Load the monitor ROM
     * @param {Uint8Array|Array} data - ROM data (512 bytes)
     */
    loadMonitorROM(data) {
        this._installROM(data, Amico2000.MONITOR_ROM_REGION);
    }
    
    /**
     * Load the cassette ROM
     * @param {Uint8Array|Array} data - ROM data (512 bytes)
     */
    loadCassetteROM(data) {
        this._installROM(data, Amico2000.CASSETTE_ROM_REGION);
    }

    /**
     * Fix for #31: install a PROM image, bypassing the write protection the way
     * physically fitting the chip does. The size check stops a wrongly
     * identified file from running past the end of its socket, which for the
     * monitor means loadBinary()'s address masking silently wrapping the tail
     * of the image into zero page.
     */
    _installROM(data, region) {
        const capacity = region.end - region.start + 1;
        if (data.length > capacity) {
            const range = `$${region.start.toString(16).toUpperCase()}-$${region.end.toString(16).toUpperCase()}`;
            throw new Error(
                `${region.name} image is ${data.length} bytes, but ${range} holds ${capacity}`
            );
        }
        this.cpu.loadBinary(data, region.start);
    }
    
    /**
     * Load a program into RAM
     * @param {Uint8Array|Array} data - Program data
     * @param {number} address - Start address (default $0000)
     */
    loadProgram(data, address = 0x0000) {
        // Fix for #31: this writes cpu.memory[] directly, so without a check an
        // oversized or misaddressed .bin would be a way around ROM protection.
        // Replacing a PROM is a separate, deliberate act: loadMonitorROM() and
        // loadCassetteROM() exist for that.
        const clash = this._findROMOverlap(address, data.length);
        if (clash) {
            const at = `$${address.toString(16).padStart(4, '0').toUpperCase()}`;
            throw new Error(
                `Program of ${data.length} bytes at ${at} would overwrite the ` +
                `${clash.name}; use the ROM loader to replace it`
            );
        }
        this.cpu.loadBinary(data, address);
    }

    // =========================================================================
    // Cassette Tape Mock I/O
    // =========================================================================

    _readWord(loAddr) {
        return this.cpu.memory[loAddr] | (this.cpu.memory[loAddr + 1] << 8);
    }

    _writeWord(loAddr, value) {
        this.cpu.memory[loAddr] = value & 0xFF;
        this.cpu.memory[loAddr + 1] = (value >> 8) & 0xFF;
    }

    _makeTapeImage(record) {
        const magic = Amico2000.TAPE_MAGIC;
        const image = new Uint8Array(magic.length + 9 + record.data.length);
        image.set(magic, 0);
        image[magic.length] = 1;  // format version
        image[magic.length + 1] = record.id;
        image[magic.length + 2] = record.start & 0xFF;
        image[magic.length + 3] = (record.start >> 8) & 0xFF;
        image[magic.length + 4] = record.end & 0xFF;
        image[magic.length + 5] = (record.end >> 8) & 0xFF;
        image[magic.length + 6] = record.checksum;
        image[magic.length + 7] = record.data.length & 0xFF;
        image[magic.length + 8] = (record.data.length >> 8) & 0xFF;
        image.set(record.data, magic.length + 9);
        return image;
    }

    _parseTapeImage(data) {
        const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
        const magic = Amico2000.TAPE_MAGIC;
        if (bytes.length < magic.length + 9) {
            throw new Error('Tape image is too short');
        }

        for (let i = 0; i < magic.length; i++) {
            if (bytes[i] !== magic[i]) {
                throw new Error('Unrecognized AMICO 2000 tape image');
            }
        }

        if (bytes[magic.length] !== 1) {
            throw new Error(`Unsupported tape image version: ${bytes[magic.length]}`);
        }

        const length = bytes[magic.length + 7] | (bytes[magic.length + 8] << 8);
        const dataStart = magic.length + 9;
        if (bytes.length !== dataStart + length) {
            throw new Error('Tape image length does not match header');
        }

        const record = {
            id: bytes[magic.length + 1],
            start: bytes[magic.length + 2] | (bytes[magic.length + 3] << 8),
            end: bytes[magic.length + 4] | (bytes[magic.length + 5] << 8),
            checksum: bytes[magic.length + 6],
            data: bytes.slice(dataStart)
        };

        const checksum = record.data.reduce((sum, value) => (sum + value) & 0xFF, record.id);
        if (checksum !== record.checksum) {
            throw new Error('Tape image checksum mismatch');
        }

        return record;
    }

    /**
     * Import a mock cassette tape image for later LOAD through the IC10 ROM trap.
     * @param {Uint8Array|ArrayBuffer|Array} data - Tape image created by saveTapeFromMonitorParams/exportTape
     */
    loadTape(data) {
        const record = this._parseTapeImage(data);
        this.cassette.tapes = this.cassette.tapes.filter(existing => existing.id !== record.id);
        this.cassette.tapes.push(record);
        return record;
    }

    /**
     * Export a previously imported or saved tape record as a browser-downloadable binary image.
     */
    exportTape(id = null) {
        const record = id === null
            ? (this.cassette.lastSavedTape || this.cassette.tapes[this.cassette.tapes.length - 1])
            : this.cassette.tapes.find(tape => tape.id === (id & 0xFF));

        if (!record) {
            throw new Error('No matching tape record is available');
        }

        return this._makeTapeImage(record);
    }

    /**
     * Save RAM using IC10 cassette ROM parameters:
     * $0000/$0001 = start, $0002/$0003 = end, $0004 = program id.
     */
    saveTapeFromMonitorParams() {
        const start = this._readWord(0x0000);
        const end = this._readWord(0x0002);
        const id = this.cpu.memory[0x0004] & 0xFF;

        if (end < start) {
            this.cpu.memory[0x0000] = 0xFF;
            throw new Error('Cassette save end address is before start address');
        }

        const data = this.cpu.memory.slice(start, end + 1);
        const checksum = data.reduce((sum, value) => (sum + value) & 0xFF, id);
        const record = { id, start, end, checksum, data };
        this.cassette.tapes = this.cassette.tapes.filter(existing => existing.id !== id);
        this.cassette.tapes.push(record);
        this.cassette.lastSavedTape = record;

        // The original routine returns to the monitor with 0000 on success.
        this._writeWord(0x0000, 0x0000);
        return this._makeTapeImage(record);
    }

    /**
     * Load RAM using IC10 cassette ROM parameters:
     * $0000 = program id, $0001/$0002 = override start, high byte $FF = use recorded start.
     */
    loadTapeFromMonitorParams() {
        const id = this.cpu.memory[0x0000] & 0xFF;
        const override = this._readWord(0x0001);
        const record = this.cassette.tapes.find(tape => tape.id === id);

        if (!record) {
            this.cpu.memory[0x0000] = 0xFF;
            return false;
        }

        const loadAddress = this.cpu.memory[0x0002] === 0xFF ? record.start : override;
        if (loadAddress + record.data.length > this.cpu.memory.length) {
            this.cpu.memory[0x0000] = 0xFF;
            return false;
        }

        // Fix for #31: the destination comes from guest RAM ($0001/$0002) or
        // from the tape record itself, so a LOAD is the third direct-memory
        // path that could otherwise drop a program on top of the monitor.
        // Refuse it with the routine's own error convention ($0000 = $FF)
        // rather than throwing: this runs inside the trapped IC10 entry point,
        // where the monitor expects a status byte back, not an exception.
        if (this._findROMOverlap(loadAddress, record.data.length)) {
            this.cpu.memory[0x0000] = 0xFF;
            return false;
        }

        this.cpu.memory.set(record.data, loadAddress);
        this.cpu.memory[0x0000] = record.id;
        this._writeWord(0x0001, loadAddress);
        return true;
    }
    
    // =========================================================================
    // Execution Control
    // =========================================================================
    
    /**
     * Power-on reset: the state the board is in a moment after the switch is
     * flipped. Clears RAM, seeds the monitor's RAM-resident vectors, and then
     * asserts the reset line.
     *
     * This is the cold start, and it is deliberately more than RES does (#30).
     * Switching on gives you undefined RAM that the monitor expects to have
     * been cleared; pressing RES on a running board does not. Keeping the two
     * apart is why `reset()` retains exactly the behavior it always had, while
     * the RES key and its Escape/Backspace aliases go to res().
     *
     * @see res
     */
    reset() {
        // Initialize ALL RAM to $00 (not just zero page)
        // The ROM expects RAM to be cleared on power-up, and uses various RAM locations
        // for indirect jumps and function pointers. Clear all 2KB ($0000-$07FF).
        for (let i = 0; i < 0x0800; i++) {
            this.cpu.memory[i] = 0x00;
        }

        // Initialize ROM's IRQ/NMI vectors in RAM to point to main loop
        // The ROM uses indirect jumps through these RAM locations:
        // $03FC/$03FD = IRQ vector (ROM does JMP ($03FC))
        // $03FE/$03FF = NMI vector (ROM does JMP ($03FE))
        // Point both to $FE30 (main monitor loop) as safe default
        this.cpu.memory[0x03FC] = 0x30;  // Low byte of $FE30
        this.cpu.memory[0x03FD] = 0xFE;  // High byte of $FE30
        this.cpu.memory[0x03FE] = 0x30;  // Low byte of $FE30
        this.cpu.memory[0x03FF] = 0xFE;  // High byte of $FE30

        this.res();
    }

    /**
     * RES: assert the 6502 reset line, which is all the board's RES key does.
     *
     * Fix for #30. The CPU vectors through $FFFC to the monitor's cold-start
     * entry at $FE22, so this recovers a program stuck in a tight loop and a
     * CPU halted on an illegal opcode alike, with no cooperation needed from
     * the running code. The 8255's own RESET pin sits on the same line, hence
     * clearing the PIA and the display here.
     *
     * RAM is preserved, which is the part worth being explicit about. The
     * Sperimentare supplement's clock tutorial has the reader press RES to
     * stop the program at $0300, then re-enter values at $0000-$0002 and tune
     * $0312 - the program itself is still there afterwards. Wiping RAM would
     * make that workflow impossible. Power-on clearing lives in reset().
     *
     * Two consequences follow from preserving RAM, and both match the
     * hardware. The monitor's RAM-resident IRQ/NMI vectors at $03FC-$03FF keep
     * whatever a program left in them, since $FE22 reinitialises $FA, $FB and
     * $FE but not those; the emulator's power-on reset is the way back from a
     * program that trashed them. And RES does not touch the emulator's own
     * run/pause state: pausing is a debugging facility with no counterpart on
     * the board, so a paused machine stays paused, resettable and steppable
     * from $FE22.
     *
     * @see reset
     */
    res() {
        // A held key must not survive the reset as a stuck matrix cell.
        for (const row of this.keyMatrix) {
            row.fill(false);
        }

        // Unhalt CPU if it was halted
        this.cpu.halted = false;

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

Amico2000.TAPE_MAGIC = new Uint8Array([0x41, 0x4D, 0x49, 0x43, 0x4F, 0x54, 0x41, 0x50, 0x45]);

// Read-only regions of the AMICO memory map (#31). The monitor PROM at IC9 is
// always fitted; the cassette PROM at IC10 is optional, but the region is
// protected either way, because an empty socket latches a store no better than
// a PROM does. Keeping the table here rather than in cpu6502.js is what lets
// the CPU core stay a generic 6502 with plain writable memory.
Amico2000.MONITOR_ROM_REGION = { name: 'monitor ROM (IC9)', start: 0xFE00, end: 0xFFFF };
Amico2000.CASSETTE_ROM_REGION = { name: 'cassette ROM (IC10)', start: 0xFB00, end: 0xFCFF };
Amico2000.ROM_REGIONS = [Amico2000.MONITOR_ROM_REGION, Amico2000.CASSETTE_ROM_REGION];

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Amico2000 };
}
