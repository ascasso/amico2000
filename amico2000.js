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
            control: 0x00,  // 8255 control register
            portAInput: true  // Port A's direction, from the last mode word
        };

        // Fix for #2: mock cassette storage used by traps for the optional IC10 ROM entry points.
        // This preserves the monitor workflow without emulating the analog tape waveform.
        this.cassette = {
            tapes: [],
            lastSavedTape: null,
            interceptROM: true
        };

        // The cassette interface itself (#20), which the traps above stand in
        // for when interceptROM is set and which the real IC10 routines use
        // when it is not. See Cassette Interface Circuit further down.
        this.tape = {
            recorder: null,   // whatever is wired to REG IN and REG OUT
            latch: 0,         // the latch of two IC20 gates, read on Port A bit 7
            heardUpTo: 0,     // the CPU cycle the latch was last brought up to
            outLevel: 0       // REG IN: how many of Port B bits 5 and 6 are high
        };
        // The phase LEDs D4-D7: which are on now (bits 0-3), since which cycle,
        // and for how many cycles each has been on out of `counted`, since
        // takePhaseLEDs() last asked.
        this.phaseLEDs = { on: 0, since: 0, counted: 0, lit: [0, 0, 0, 0] };

        // Display state (6 digits, each 8 segments including DP): the pattern
        // each digit was last driven with, and the CPU cycle it was driven at.
        // A digit is only alight while something keeps driving it; see
        // getDisplay().
        this.display = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.displayDriven = new Array(6).fill(-Infinity);
        this.currentDigit = 0;
        
        // Keyboard state: the monitor scans 3 rows x 7 columns, selecting a
        // row with Port B = 1, 3, 5 and reading the columns as Port A bits 0-6.
        // Each cell holds the key named in the keyMap comment below.
        this.keyMatrix = [
            [false, false, false, false, false, false, false],  // Row 0 (portB=1)
            [false, false, false, false, false, false, false],  // Row 1 (portB=3)
            [false, false, false, false, false, false, false],  // Row 2 (portB=5)
        ];

        // Key mapping: keyboard key -> [row, col], where col is the Port A bit.
        //
        // The positions follow from the monitor's own decode, not from trial
        // and error. GETKEY at $FF57-$FF7D returns code = 7 x row + (6 - bit)
        // for the pressed key, so the 21 cells hold 21 distinct codes:
        //
        //           bit 0  bit 1  bit 2  bit 3  bit 4  bit 5  bit 6
        //   Row 0     6      5      4      3      2      1      0
        //   Row 1     D      C      B      A      9      8      7
        //   Row 2    REG    RUN     +      DA     AD     F      E
        //
        // Codes $00-$0F are the hex digits. The main loop dispatches $10-$14
        // at $FE5B-$FE6D: $10 AD selects address entry ($FF = 1), $11 DA
        // selects data entry ($FF = 0), $12 increments the address and repeats
        // while held, $13 RUN restores the saved registers and RTIs to the
        // displayed address, and $14 REG reloads the address from the saved PC
        // at $00F6/$00F7 (the manual: "REG = Registro Program Counter").
        //
        // No two keys share a cell. An earlier hand-built table put 0 on REG's
        // cell, AD and REG on RUN's, and RUN and HLT on DA's, which the monitor
        // could not tell apart; tests/keyboard-matrix.test.js now checks every
        // key against the ROM decode.
        //
        // RES and HLT are not in the matrix. RES drives the reset line (see
        // resetKeys). HLT, per the manual, "genera una interruzione a livello
        // CPU"; which interrupt line it drives is not documented, so it is not
        // emulated and has no keyboard shortcut.
        this.keyMap = {
            '0': [0, 6], '1': [0, 5], '2': [0, 4], '3': [0, 3],
            '4': [0, 2], '5': [0, 1], '6': [0, 0], '7': [1, 6],
            '8': [1, 5], '9': [1, 4], 'a': [1, 3], 'b': [1, 2],
            'c': [1, 1], 'd': [1, 0], 'e': [2, 6], 'f': [2, 5],

            'ArrowUp': [2, 4],    // AD, code $10
            'ArrowDown': [2, 3],  // DA, code $11
            '+': [2, 2],          // increment, code $12
            '=': [2, 2],          // increment, unshifted on US layouts
            'Enter': [2, 1],      // RUN, code $13
            'g': [2, 1],          // RUN alternate ("go")
            'r': [2, 0],          // REG, code $14
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
        // Called once per frame with how much of it each phase LED was on
        // (see takePhaseLEDs), and after a recording made by the real SAVE
        // routine has been read back (see _stopRecorder).
        this.onPhaseLEDs = null;
        this.onTapeRecorded = null;
        // Called with the new value whenever `running` changes, from whichever
        // caller changed it. The bench controls are not the only way to start
        // or stop the machine: the user guide's console examples call start()
        // and stop() directly, and a UI that tracked its own copy of the state
        // fell out of step with them.
        this.onRunStateChange = null;

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
        // With a recorder connected, these three addresses also work its
        // motor; see _workRecorder(). The monitor's reset entry stops the tape
        // in either mode, so RES always does.
        if (this.tape.recorder && (pc === 0xFE22 || pc === 0xFC54 || pc === 0xFBBC) &&
            (pc === 0xFE22 || !this.cassette.interceptROM)) {
            this._workRecorder(pc);
        }

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
                // Bits 0-6 are the key columns. Bit 7 is not a key: it is the
                // cassette latch (#20). The monitor never looks at it; its
                // scan at $FEF6-$FF03 forces the bit with ORA #$80.
                this._settleTapeLatch();
                return (this._scanKeyboard() & 0x7F) | (this.tape.latch << 7);
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

        // The cassette circuit hangs on these ports. Bring it up to this
        // moment under the old values before any of them changes.
        this._settleTapeLatch();
        this._countPhaseLEDs();

        switch (port) {
            case 0:  // Port A - Display segments
                this.pia.portA = value;
                this._updateDisplay();
                break;
            case 1:  // Port B - Digit select and control
                this.pia.portB = value;
                this._updateDisplay();
                this._driveTapeOut();
                break;
            case 2:  // Port C - Expansion
                this.pia.portC = value;
                break;
            case 3:  // Control register
                this.pia.control = value;
                // A mode word has bit 7 set, and its bit 4 is Port A's
                // direction. The ROMs are the evidence: the only words they
                // write are $89 and $99, which differ in that bit alone, $99
                // before reading the keys or the tape on Port A and $89
                // before writing segments or LED patterns to it.
                if (value & 0x80) {
                    this.pia.portAInput = (value & 0x10) !== 0;
                }
                break;
        }

        this.phaseLEDs.on = this._phaseLEDsNow();
    }

    // =========================================================================
    // Cassette Interface Circuit
    // =========================================================================
    //
    // Issue #20. What the supplement's schematic (page 28) puts between the
    // 8255 and the recorder, as far as a program can tell it is there:
    //
    // - Out. REG IN, the recorder's microphone input, is fed from Port B bits
    //   5 and 6 through equal resistors, so it has three levels: how many of
    //   the two are high.
    // - In. REG OUT, the recorder's speaker output, goes through an amplifier
    //   and a Schmitt gate and sets a latch made of two gates of IC20. Port A
    //   bit 7 reads the latch. Port B bit 0 low clears it.
    // - The four phase LEDs. D4-D7 are each on while Port B bit 7 and one of
    //   Port A's lines 0-3 are both high.
    //
    // Nothing here knows what a tape holds or what the signal means. That is
    // the PROM's business on one side and the recorder's on the other.

    /**
     * Wire a recorder to REG IN and REG OUT, or pass null to unplug it.
     *
     * A recorder is any object with:
     * - `state`: 'stopped', 'playing' or 'recording';
     * - `heard(from, to)`: whether the tape gave a pulse strong enough to set
     *   the latch between two moments;
     * - `level(level, time)`: told whenever the board's output changes, with
     *   the new level, 0 to 2;
     * - `play(time, programs)`, `record(time)` and `stop(time)`: its motor.
     *   `stop` returns null, or after a recording what was found on it, as
     *   `{records, problems}`.
     *
     * Times are seconds on the board's own clock, CPU cycles over 1 MHz.
     * tape-audio.js has the recorder the page uses.
     */
    connectRecorder(recorder) {
        this.tape.recorder = recorder;
        return recorder;
    }

    /** Seconds on the board's clock: the unit a recorder is told the time in. */
    _boardTime() {
        return this.cpu.cycles / Amico2000.CLOCK_HZ;
    }

    /**
     * Bring the latch up to the present.
     *
     * A pulse from the tape since the last look sets it. Otherwise Port B
     * bit 0, if low, clears it. Called before Port B changes and before the
     * latch is read, which are the only moments its state can matter.
     */
    _settleTapeLatch() {
        const tape = this.tape;
        const now = this.cpu.cycles;
        if (tape.recorder && now > tape.heardUpTo &&
            tape.recorder.heard(tape.heardUpTo / Amico2000.CLOCK_HZ, now / Amico2000.CLOCK_HZ)) {
            tape.latch = 1;
        } else if (!(this.pia.portB & 0x01)) {
            tape.latch = 0;
        }
        tape.heardUpTo = now;
    }

    /** Port B was written: pass a change of the output level to the recorder. */
    _driveTapeOut() {
        const portB = this.pia.portB;
        const level = ((portB >> 5) & 1) + ((portB >> 6) & 1);
        if (level !== this.tape.outLevel) {
            this.tape.outLevel = level;
            if (this.tape.recorder) {
                this.tape.recorder.level(level, this._boardTime());
            }
        }
    }

    /**
     * Start and stop the recorder for the user.
     *
     * On the board this is a person's job: press the recorder's key, then RUN.
     * The emulator has no recorder to press keys on, so it takes the cue from
     * the program counter instead. Entering LOAD at $FC54 rewinds the tape
     * and plays it, entering SAVE at $FBBC starts a recording, and the
     * monitor's reset entry at $FE22, where both routines end and where RES
     * leads, stops the tape. LOAD comes back to $FC54 by itself when the
     * program it has just read is not the one asked for; the tape is already
     * playing then and is left to run on.
     */
    _workRecorder(pc) {
        const recorder = this.tape.recorder;
        const now = this._boardTime();
        const wanted = pc === 0xFC54 ? 'playing' : pc === 0xFBBC ? 'recording' : 'stopped';
        if (recorder.state === wanted) return;

        // Whatever it was doing ends first: a recording that is cut off by a
        // jump into LOAD is still a recording to be read back.
        if (recorder.state !== 'stopped') this._stopRecorder(now);
        if (wanted === 'playing') {
            recorder.play(now, this.cassette.tapes);
        } else if (wanted === 'recording') {
            recorder.record(now);
        }
    }

    /**
     * Stop the tape. If it was recording, the recorder says what the real
     * SAVE routine put on it, and each program goes onto the mock cassette as
     * the latest save, exactly as a trapped SAVE's does.
     */
    _stopRecorder(now) {
        const recorded = this.tape.recorder.stop(now);
        if (!recorded) return;
        for (const record of recorded.records) {
            try {
                this.cassette.lastSavedTape = this.addTapeRecord(record);
            } catch (err) {
                recorded.problems.push(err.message);
            }
        }
        if (this.onTapeRecorded) {
            this.onTapeRecorded(recorded);
        }
    }

    /**
     * Which of D4-D7 are on at this moment, as bits 0-3.
     *
     * Each LED hangs from +5 V on an open-collector NAND gate of IC21 whose
     * inputs are Port B bit 7, shared by all four, and one of Port A's lines
     * 0-3. While Port A is an input the 8255 does not drive those lines; they
     * are the first four key columns, held high by their pull-up resistors
     * unless a pressed key pulls one down, which is what a keyboard scan
     * reads.
     */
    _phaseLEDsNow() {
        if (!(this.pia.portB & 0x80)) return 0;
        const lines = this.pia.portAInput ? this._scanKeyboard() : this.pia.portA;
        return lines & 0x0F;
    }

    /** Add the time since the last change to the LEDs that were on for it. */
    _countPhaseLEDs() {
        const leds = this.phaseLEDs;
        const elapsed = this.cpu.cycles - leds.since;
        if (elapsed > 0) {
            leds.counted += elapsed;
            for (let n = 0; n < 4; n++) {
                if ((leds.on >> n) & 1) leds.lit[n] += elapsed;
            }
        }
        leds.since = this.cpu.cycles;
    }

    /**
     * How much of the time since the last call each phase LED was on, D4 to
     * D7, as numbers from 0 to 1.
     *
     * The cassette routines switch the LEDs far faster than a screen can
     * show. SAVE has them on for all but the low half of each pulse; LOAD
     * only flashes them, for about a quarter of each bit. What the eye gets
     * is the average, so that is what this reports, and the page draws a
     * frame from it. With no time gone by, it is simply which are on.
     */
    takePhaseLEDs() {
        this._countPhaseLEDs();
        const leds = this.phaseLEDs;
        const share = leds.lit.map((cycles, n) => (
            leds.counted > 0 ? cycles / leds.counted : (leds.on >> n) & 1
        ));
        leds.lit.fill(0);
        leds.counted = 0;
        return share;
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
            this.displayDriven[digitIndex] = this.cpu.cycles;
            this.currentDigit = digitIndex;
        }

        // NOTE: Do NOT call onDisplayUpdate here!
        // The display is updated thousands of times per second due to multiplexing.
        // The UI callback is invoked once per frame in _runFrame() instead.
        // This is a critical performance optimization.
    }
    
    /**
     * What the six displays show at this moment.
     *
     * The board has no display latch. A digit is alight only while its
     * transistor is on, and the monitor keeps all six visible by driving each
     * in turn every 4 ms or so. Anything that stops scanning lets them go
     * dark: a user program that does not call the monitor's display routine,
     * and the cassette routines, of which the manual says "il display
     * indirizzi e dati del calcolatore si spegne" (#20). This used to return
     * the last pattern each digit was ever given, so a display that would be
     * dark on the board stayed frozen on the page.
     *
     * A digit counts as lit if it was driven within the last tenth of a
     * second of CPU time, or is the one being driven now, which covers a
     * program that selects a digit and leaves it on. The monitor's longest
     * pause between scans, while it waits out a key's bounce, is 31 ms, so
     * the tenth of a second never blanks a display the eye would still see;
     * it also hides that 31 ms blink, which the page has never drawn.
     *
     * @returns {Array} Array of 6 segment patterns, 0 for a dark digit
     */
    getDisplay() {
        const now = this.cpu.cycles;
        const portB = this.pia.portB;
        // The digit selected at this moment, by the test _updateDisplay() uses.
        const driven = (portB & 0x01) && (this.pia.portA & 0x7F) ? ((portB >> 1) & 0x0F) - 4 : -1;
        return this.display.map((pattern, digit) => (
            digit === driven || now - this.displayDriven[digit] <= Amico2000.DISPLAY_PERSISTENCE_CYCLES
                ? pattern
                : 0x00
        ));
    }
    
    /**
     * Convert display to hex string (for debugging)
     */
    getDisplayHex() {
        return this.getDisplay().map(d => d.toString(16).padStart(2, '0')).join(' ');
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

        // DEBUG: Log keyboard scans when keys are detected. Use the guarded
        // check: a bare `window` reference threw in Node whenever a pressed
        // key was scanned, which kept keypad tests out of the Node suite.
        if (result !== 0xFF && this._keyboardDebug()) {
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
            'ad': 'ArrowUp', 'da': 'ArrowDown', 'reg': 'r',
            '+': '+', 'go': 'Enter', 'res': 'Escape'
            // 'pc' (the HLT button) is deliberately absent: HLT is an
            // interrupt line, not a matrix key, and is not emulated.
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
     * @param {Uint8Array|Array} data - PROM image in chip order (512 bytes),
     *     as a programmer reads or writes it. That is not address order for
     *     this socket: see _installROM().
     */
    loadCassetteROM(data) {
        this._installROM(data, Amico2000.CASSETTE_ROM_REGION);
    }

    /**
     * Fix for #31: install a PROM image, bypassing the write protection the way
     * physically fitting the chip does. The size check refuses a wrongly
     * identified file outright. It was added when the excess ran past the end
     * of the socket, which for the monitor meant wrapping into zero page. The
     * loop below cannot do that, but quietly installing the first 512 bytes
     * of a larger file would be no better an answer.
     *
     * Fix for #35: an image is in chip order. Byte N is the cell the PROM
     * selects when its own address pins carry N, and a 512-cell PROM has only
     * nine of them, A0-A8. Which cell answers at a given address is therefore
     * the low nine bits of that address, not its distance from the start of
     * the socket.
     *
     * For the monitor the two agree: IC9 starts at $FE00, where A0-A8 are all
     * low. For the cassette PROM they do not. IC10 starts at $FB00, an odd
     * page, so A8 is high across $FB00-$FBFF and low across $FC00-$FCFF. The
     * first half of the image answers at $FC00 and the second half at $FB00.
     *
     * This used to copy the image in file order from the start of the socket,
     * which put the halves of IC10 the wrong way round and left both
     * documented entry points, $FBBC and $FC54, in the middle of instructions.
     */
    _installROM(data, region) {
        const capacity = region.end - region.start + 1;
        if (data.length > capacity) {
            const range = `$${region.start.toString(16).toUpperCase()}-$${region.end.toString(16).toUpperCase()}`;
            throw new Error(
                `${region.name} image is ${data.length} bytes, but ${range} holds ${capacity}`
            );
        }

        // Both sockets hold 512 cells, so this mask is A0-A8. It needs the
        // capacity to be a power of two, which a PROM's always is.
        const cellMask = capacity - 1;
        for (let address = region.start; address <= region.end; address++) {
            const cell = address & cellMask;
            // An image shorter than the chip fills only its first cells and
            // leaves the rest of the socket as it was, as it always has.
            if (cell < data.length) {
                this.cpu.memory[address] = data[cell];
            }
        }
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
        //
        // The destination is bounded before it is compared against the PROM
        // regions, because CPU6502.loadBinary() masks every write with
        // & 0xFFFF: an address outside the 6502's 16-bit space wraps back
        // into it -- $1FE00 and -$200 both land on $FE00 -- while the
        // unmasked value overlaps nothing, so the region test alone waved
        // them straight through onto the monitor.
        //
        // Out-of-range addresses are rejected rather than masked. The board
        // has no address line above A15, so a caller holding one has a bug,
        // and quietly relocating its data would only hide it.
        if (!Number.isInteger(address) || address < 0 || address >= this.cpu.memory.length) {
            throw new Error(
                `Load address ${address} is outside the 6502's $0000-$FFFF address space`
            );
        }
        if (address + data.length > this.cpu.memory.length) {
            const at = `$${address.toString(16).padStart(4, '0').toUpperCase()}`;
            throw new Error(
                `Program of ${data.length} bytes at ${at} runs past the end of ` +
                `the address space`
            );
        }

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
     * Put a program on the mock cassette for a later LOAD through the IC10
     * trap, as loadTape() does for an .amtape image. This is the way in for a
     * record that did not come from one, such as a block decoded from a sound
     * recording of a tape (#20).
     *
     * The record is checked here rather than trusted, because a LOAD copies it
     * into memory without looking at it again: the block has to lie inside the
     * 16-bit address space, and it has to fit the 16-bit byte count of the
     * .amtape format, or it could be loaded but never exported.
     *
     * @param {{id: number, start: number, data: Uint8Array|number[]}} record
     * @returns {object} The stored record, in the form the traps use
     */
    addTapeRecord({ id, start, data }) {
        const bytes = Uint8Array.from(data);
        if (!Number.isInteger(id) || id < 0 || id > 0xFF) {
            throw new Error(`Tape program identifier must be a byte, not ${id}`);
        }
        if (bytes.length < 1 || bytes.length > 0xFFFF) {
            throw new Error(`A tape record holds 1 to 65535 bytes, not ${bytes.length}`);
        }
        if (!Number.isInteger(start) || start < 0 || start + bytes.length > this.cpu.memory.length) {
            throw new Error('Tape record does not fit in the address space');
        }

        const record = {
            id,
            start,
            end: start + bytes.length - 1,
            checksum: bytes.reduce((sum, value) => (sum + value) & 0xFF, id),
            data: bytes
        };
        this.cassette.tapes = this.cassette.tapes.filter(existing => existing.id !== id);
        this.cassette.tapes.push(record);
        return record;
    }

    /**
     * The record an export should use: the one with this identifier, or with
     * no identifier the most recent SAVE, or failing that the tape imported
     * last.
     */
    findTape(id = null) {
        const record = id === null
            ? (this.cassette.lastSavedTape || this.cassette.tapes[this.cassette.tapes.length - 1])
            : this.cassette.tapes.find(tape => tape.id === (id & 0xFF));

        if (!record) {
            throw new Error('No matching tape record is available');
        }

        return record;
    }

    /**
     * Export a previously imported or saved tape record as a browser-downloadable binary image.
     */
    exportTape(id = null) {
        return this._makeTapeImage(this.findTape(id));
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

        // The .amtape header holds the byte count in 16 bits, so the one range
        // longer than that, the whole $0000-$FFFF address space, used to save
        // with a count of 0 and report success, leaving an image that could
        // never be loaded back. That range also covers the ROMs and the PIA,
        // which no program on a 2KB board needs, so refuse it like an inverted
        // range rather than change the file format and break existing tapes.
        const length = end - start + 1;
        if (length > 0xFFFF) {
            this.cpu.memory[0x0000] = 0xFF;
            throw new Error(
                `Cassette save of ${length} bytes exceeds the tape image limit of 65535`
            );
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
        // This deliberately overrides the $FF fill CPU6502's constructor gives
        // the whole address space; above $07FF that fill is left in place.
        for (let i = 0; i < 0x0800; i++) {
            this.cpu.memory[i] = 0x00;
        }

        // Initialize ROM's IRQ/NMI vectors in RAM to point to main loop
        // The ROM uses indirect jumps through these RAM locations:
        // $03FC/$03FD = NMI vector ($FFFA -> $FE1C: JMP ($03FC))
        // $03FE/$03FF = IRQ/BRK vector ($FFFE -> $FE1F: JMP ($03FE))
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
     * May 1979 Sperimentare clock article has the reader press RES to stop
     * the program at $0300, then re-enter values at $0000-$0002 and calibrate
     * the clock - the program itself is still there afterwards. Its printed
     * calibration address $0312 is an opcode; $030E matches the stated
     * adjustment direction. Wiping RAM would make that workflow impossible.
     * Power-on clearing lives in reset().
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

        // cpu.reset() restarts the cycle counter, which is the clock the
        // cassette circuit keeps time by. Close the LEDs' account under the
        // old clock first, then start everything again from zero. A recorder
        // that is running is stopped by the monitor's reset entry, a moment
        // from now; see _workRecorder().
        this._countPhaseLEDs();
        this.cpu.reset();
        this.display = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        this.displayDriven.fill(-Infinity);
        this.pia = { portA: 0, portB: 0, portC: 0, control: 0, portAInput: true };
        this.phaseLEDs.on = 0;
        this.phaseLEDs.since = 0;
        this.tape.heardUpTo = 0;
        this.tape.outLevel = 0;

        // Update display immediately on reset (user expects visual feedback)
        if (this.onDisplayUpdate) {
            this.onDisplayUpdate(this.getDisplay());
        }
        if (this.onPhaseLEDs) {
            this.onPhaseLEDs(this.takePhaseLEDs());
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
            this.onDisplayUpdate(this.getDisplay());
        }
        if (this.onPhaseLEDs) {
            this.onPhaseLEDs(this.takePhaseLEDs());
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
        this._notifyRunState();
        this.lastFrameTime = performance.now();
        this._runFrame();
    }

    /**
     * Stop the emulator
     */
    stop() {
        const wasRunning = this.running;
        this.running = false;
        if (this.frameRequest) {
            cancelAnimationFrame(this.frameRequest);
            this.frameRequest = null;
        }
        if (wasRunning) {
            this._notifyRunState();
        }
    }

    _notifyRunState() {
        if (this.onRunStateChange) {
            this.onRunStateChange(this.running);
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
            this.onDisplayUpdate(this.getDisplay());
        }
        if (this.onPhaseLEDs) {
            this.onPhaseLEDs(this.takePhaseLEDs());
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

// The board's crystal: one CPU cycle is a microsecond. The cassette circuit
// keeps time by the cycle counter and tells a recorder the time in seconds.
Amico2000.CLOCK_HZ = 1000000;

// How long a digit stays visible after it was last driven, in CPU cycles: a
// tenth of a second at 1 MHz. See getDisplay().
Amico2000.DISPLAY_PERSISTENCE_CYCLES = 100000;

// Read-only regions of the AMICO memory map (#31). The monitor PROM at IC9 is
// always fitted; the cassette PROM at IC10 is optional, but the region is
// protected either way, because an empty socket latches a store no better than
// a PROM does. Keeping the table here rather than in cpu6502.js is what lets
// the CPU core stay a generic 6502 with plain writable memory.
//
// Each region is one 512-cell PROM. _installROM() relies on that to place an
// image by the chip's address pins rather than in file order (#35).
Amico2000.MONITOR_ROM_REGION = { name: 'monitor ROM (IC9)', start: 0xFE00, end: 0xFFFF };
Amico2000.CASSETTE_ROM_REGION = { name: 'cassette ROM (IC10)', start: 0xFB00, end: 0xFCFF };
Amico2000.ROM_REGIONS = [Amico2000.MONITOR_ROM_REGION, Amico2000.CASSETTE_ROM_REGION];

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Amico2000 };
}
