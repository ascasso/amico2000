/**
 * =============================================================================
 * AMICO 2000 Emulator - 6502 CPU Core
 * =============================================================================
 * 
 * A clean, readable 6502 emulator written specifically for the Amico 2000
 * Italian home computer (ASEL, 1978).
 * 
 * Author: Andrea Scasso / Claude
 * License: MIT
 * Date: December 2025
 * 
 * Features:
 * - Complete 6502 instruction set (56 opcodes, 151 instruction variants)
 * - All addressing modes
 * - Accurate flag handling
 * - Memory-mapped I/O callback support
 * - BCD mode support
 * - Interrupt handling (IRQ, NMI, BRK)
 * 
 * This is an interpreter-style emulator optimized for clarity and correctness
 * rather than maximum speed. For the 1MHz Amico 2000, this is more than adequate.
 * 
 * =============================================================================
 */

class CPU6502 {
    constructor() {
        // Registers
        this.A = 0x00;      // Accumulator
        this.X = 0x00;      // X Index Register
        this.Y = 0x00;      // Y Index Register
        this.SP = 0xFD;     // Stack Pointer (starts at $01FD)
        this.PC = 0x0000;   // Program Counter
        
        // Status Register (P) flags
        this.flags = {
            C: 0,   // Carry
            Z: 0,   // Zero
            I: 1,   // Interrupt Disable (starts set)
            D: 0,   // Decimal Mode
            B: 0,   // Break Command
            U: 1,   // Unused (always 1)
            V: 0,   // Overflow
            N: 0    // Negative
        };

        // Memory (64KB)
        // Initialize to $FF instead of $00 to match real hardware behavior where
        // RAM typically powers up with bits high or random values. Using $FF prevents
        // issues with indirect jumps reading uninitialized RAM (common pattern in 6502 ROMs).
        // $FF as address = $FFFF (ROM), $FF as opcode = invalid (clear error).
        this.memory = new Uint8Array(65536);
        this.memory.fill(0xFF);
        
        // I/O callbacks for memory-mapped devices
        this.readCallbacks = new Map();
        this.writeCallbacks = new Map();
        
        // Cycle counter
        this.cycles = 0;
        
        // Halted state
        this.halted = false;
        
        // Interrupt pending flags
        this.nmiPending = false;
        this.irqPending = false;
        
        // Build instruction table
        this._buildInstructionTable();
    }
    
    // =========================================================================
    // Memory Access with I/O Callbacks
    // =========================================================================
    
    /**
     * Read a byte from memory, checking for I/O callbacks
     */
    read(address) {
        address &= 0xFFFF;

        // Check for PIA partial address decoding ($FD00-$FDFF maps to $FD00-$FD03)
        // This matches real 6502 hardware where partial decoding was common to save on logic chips
        let callbackAddress = address;
        if ((address & 0xFF00) === 0xFD00) {
            // Map any address in $FDxx to one of the 4 PIA registers
            callbackAddress = 0xFD00 | (address & 0x0003);
        }

        // Check for I/O callback
        if (this.readCallbacks.has(callbackAddress)) {
            return this.readCallbacks.get(callbackAddress)(address) & 0xFF;
        }

        return this.memory[address];
    }
    
    /**
     * Write a byte to memory, checking for I/O callbacks
     */
    write(address, value) {
        address &= 0xFFFF;
        value &= 0xFF;

        // Check for PIA partial address decoding ($FD00-$FDFF maps to $FD00-$FD03)
        // This matches real 6502 hardware where partial decoding was common to save on logic chips
        let callbackAddress = address;
        if ((address & 0xFF00) === 0xFD00) {
            // Map any address in $FDxx to one of the 4 PIA registers
            callbackAddress = 0xFD00 | (address & 0x0003);
        }

        // Check for I/O callback
        if (this.writeCallbacks.has(callbackAddress)) {
            this.writeCallbacks.get(callbackAddress)(address, value);
            return;
        }

        this.memory[address] = value;
    }
    
    /**
     * Read a 16-bit word (little-endian)
     */
    read16(address) {
        const lo = this.read(address);
        const hi = this.read((address + 1) & 0xFFFF);
        return (hi << 8) | lo;
    }
    
    /**
     * Read 16-bit word with 6502 page-wrap bug (for indirect addressing)
     */
    read16wrap(address) {
        const lo = this.read(address);
        // High byte wraps within the same page
        const hiAddr = (address & 0xFF00) | ((address + 1) & 0x00FF);
        const hi = this.read(hiAddr);
        return (hi << 8) | lo;
    }
    
    /**
     * Register an I/O read callback for an address range
     */
    onRead(startAddr, endAddr, callback) {
        for (let addr = startAddr; addr <= endAddr; addr++) {
            this.readCallbacks.set(addr, callback);
        }
    }
    
    /**
     * Register an I/O write callback for an address range
     */
    onWrite(startAddr, endAddr, callback) {
        for (let addr = startAddr; addr <= endAddr; addr++) {
            this.writeCallbacks.set(addr, callback);
        }
    }
    
    // =========================================================================
    // Stack Operations
    // =========================================================================
    
    push(value) {
        this.write(0x0100 + this.SP, value & 0xFF);
        this.SP = (this.SP - 1) & 0xFF;
    }
    
    push16(value) {
        this.push(value & 0xFF);          // Low byte first
        this.push((value >> 8) & 0xFF);  // High byte second
    }

    pull() {
        this.SP = (this.SP + 1) & 0xFF;
        return this.read(0x0100 + this.SP);
    }

    pull16() {
        const hi = this.pull();  // High byte first (was pushed second, so on top)
        const lo = this.pull();  // Low byte second (was pushed first, so below)
        return (hi << 8) | lo;
    }
    
    // =========================================================================
    // Status Register Operations
    // =========================================================================
    
    getP() {
        return (this.flags.C << 0) |
               (this.flags.Z << 1) |
               (this.flags.I << 2) |
               (this.flags.D << 3) |
               (this.flags.B << 4) |
               (1 << 5) |              // Unused bit always 1
               (this.flags.V << 6) |
               (this.flags.N << 7);
    }
    
    setP(value) {
        this.flags.C = (value >> 0) & 1;
        this.flags.Z = (value >> 1) & 1;
        this.flags.I = (value >> 2) & 1;
        this.flags.D = (value >> 3) & 1;
        this.flags.B = (value >> 4) & 1;
        // Bit 5 ignored (always 1)
        this.flags.V = (value >> 6) & 1;
        this.flags.N = (value >> 7) & 1;
    }
    
    /**
     * Update Zero and Negative flags based on value
     */
    setZN(value) {
        this.flags.Z = (value & 0xFF) === 0 ? 1 : 0;
        this.flags.N = (value & 0x80) ? 1 : 0;
    }
    
    // =========================================================================
    // Addressing Modes
    // =========================================================================
    
    // Immediate: #$nn
    addrImmediate() {
        return this.PC++;
    }
    
    // Zero Page: $nn
    addrZeroPage() {
        return this.read(this.PC++);
    }
    
    // Zero Page,X: $nn,X
    addrZeroPageX() {
        return (this.read(this.PC++) + this.X) & 0xFF;
    }
    
    // Zero Page,Y: $nn,Y
    addrZeroPageY() {
        return (this.read(this.PC++) + this.Y) & 0xFF;
    }
    
    // Absolute: $nnnn
    addrAbsolute() {
        const addr = this.read16(this.PC);
        this.PC += 2;
        return addr;
    }
    
    // Absolute,X: $nnnn,X
    addrAbsoluteX() {
        const base = this.read16(this.PC);
        this.PC += 2;
        const addr = (base + this.X) & 0xFFFF;
        // Extra cycle if page boundary crossed
        if ((base & 0xFF00) !== (addr & 0xFF00)) {
            this.cycles++;
        }
        return addr;
    }
    
    // Absolute,X (no extra cycle variant for stores)
    addrAbsoluteXStore() {
        const base = this.read16(this.PC);
        this.PC += 2;
        return (base + this.X) & 0xFFFF;
    }
    
    // Absolute,Y: $nnnn,Y
    addrAbsoluteY() {
        const base = this.read16(this.PC);
        this.PC += 2;
        const addr = (base + this.Y) & 0xFFFF;
        if ((base & 0xFF00) !== (addr & 0xFF00)) {
            this.cycles++;
        }
        return addr;
    }
    
    // Absolute,Y (no extra cycle variant for stores)
    addrAbsoluteYStore() {
        const base = this.read16(this.PC);
        this.PC += 2;
        return (base + this.Y) & 0xFFFF;
    }
    
    // Indirect: ($nnnn) - only used by JMP
    addrIndirect() {
        const ptr = this.read16(this.PC);
        this.PC += 2;
        // 6502 bug: wraps within page
        return this.read16wrap(ptr);
    }
    
    // Indexed Indirect: ($nn,X)
    addrIndirectX() {
        const base = this.read(this.PC++);
        const ptr = (base + this.X) & 0xFF;
        return this.read16wrap(ptr);
    }
    
    // Indirect Indexed: ($nn),Y
    addrIndirectY() {
        const ptr = this.read(this.PC++);
        const base = this.read16wrap(ptr);
        const addr = (base + this.Y) & 0xFFFF;
        if ((base & 0xFF00) !== (addr & 0xFF00)) {
            this.cycles++;
        }
        return addr;
    }
    
    // Indirect Indexed (no extra cycle for stores)
    addrIndirectYStore() {
        const ptr = this.read(this.PC++);
        const base = this.read16wrap(ptr);
        return (base + this.Y) & 0xFFFF;
    }
    
    // Relative: for branches
    addrRelative() {
        let offset = this.read(this.PC++);
        if (offset & 0x80) {
            offset = offset - 256;  // Sign extend
        }
        return (this.PC + offset) & 0xFFFF;
    }
    
    // =========================================================================
    // Instruction Implementations
    // =========================================================================
    
    // --- Load/Store ---
    
    opLDA(addr) {
        this.A = this.read(addr);
        this.setZN(this.A);
    }
    
    opLDX(addr) {
        this.X = this.read(addr);
        this.setZN(this.X);
    }
    
    opLDY(addr) {
        this.Y = this.read(addr);
        this.setZN(this.Y);
    }
    
    opSTA(addr) {
        this.write(addr, this.A);
    }
    
    opSTX(addr) {
        this.write(addr, this.X);
    }
    
    opSTY(addr) {
        this.write(addr, this.Y);
    }
    
    // --- Transfer ---
    
    opTAX() {
        this.X = this.A;
        this.setZN(this.X);
    }
    
    opTAY() {
        this.Y = this.A;
        this.setZN(this.Y);
    }
    
    opTXA() {
        this.A = this.X;
        this.setZN(this.A);
    }
    
    opTYA() {
        this.A = this.Y;
        this.setZN(this.A);
    }
    
    opTSX() {
        this.X = this.SP;
        this.setZN(this.X);
    }
    
    opTXS() {
        this.SP = this.X;
    }
    
    // --- Stack ---
    
    opPHA() {
        this.push(this.A);
    }
    
    opPHP() {
        // B flag is set when pushed by PHP or BRK
        this.push(this.getP() | 0x10);
    }
    
    opPLA() {
        this.A = this.pull();
        this.setZN(this.A);
    }
    
    opPLP() {
        this.setP(this.pull());
    }
    
    // --- Arithmetic ---
    
    opADC(addr) {
        const value = this.read(addr);
        
        if (this.flags.D) {
            // BCD mode
            let lo = (this.A & 0x0F) + (value & 0x0F) + this.flags.C;
            let hi = (this.A >> 4) + (value >> 4);
            
            if (lo > 9) {
                lo -= 10;
                hi++;
            }
            
            // Set flags before decimal adjust of high nibble
            const sum = this.A + value + this.flags.C;
            this.flags.Z = (sum & 0xFF) === 0 ? 1 : 0;
            this.flags.N = (hi & 0x08) ? 1 : 0;
            this.flags.V = (~(this.A ^ value) & (this.A ^ (hi << 4)) & 0x80) ? 1 : 0;
            
            if (hi > 9) {
                hi -= 10;
                this.flags.C = 1;
            } else {
                this.flags.C = 0;
            }
            
            this.A = ((hi << 4) | (lo & 0x0F)) & 0xFF;
        } else {
            // Binary mode
            const sum = this.A + value + this.flags.C;
            
            this.flags.C = sum > 0xFF ? 1 : 0;
            this.flags.V = (~(this.A ^ value) & (this.A ^ sum) & 0x80) ? 1 : 0;
            
            this.A = sum & 0xFF;
            this.setZN(this.A);
        }
    }
    
    opSBC(addr) {
        const value = this.read(addr);
        
        if (this.flags.D) {
            // BCD mode
            let lo = (this.A & 0x0F) - (value & 0x0F) - (1 - this.flags.C);
            let hi = (this.A >> 4) - (value >> 4);
            
            if (lo < 0) {
                lo += 10;
                hi--;
            }
            if (hi < 0) {
                hi += 10;
                this.flags.C = 0;
            } else {
                this.flags.C = 1;
            }
            
            const diff = this.A - value - (1 - this.flags.C);
            this.flags.Z = (diff & 0xFF) === 0 ? 1 : 0;
            this.flags.N = (diff & 0x80) ? 1 : 0;
            this.flags.V = ((this.A ^ value) & (this.A ^ diff) & 0x80) ? 1 : 0;
            
            this.A = ((hi << 4) | (lo & 0x0F)) & 0xFF;
        } else {
            // Binary mode (same as ADC with inverted value)
            const diff = this.A - value - (1 - this.flags.C);
            
            this.flags.C = diff >= 0 ? 1 : 0;
            this.flags.V = ((this.A ^ value) & (this.A ^ diff) & 0x80) ? 1 : 0;
            
            this.A = diff & 0xFF;
            this.setZN(this.A);
        }
    }
    
    // --- Increment/Decrement ---
    
    opINC(addr) {
        const value = (this.read(addr) + 1) & 0xFF;
        this.write(addr, value);
        this.setZN(value);
    }
    
    opINX() {
        this.X = (this.X + 1) & 0xFF;
        this.setZN(this.X);
    }
    
    opINY() {
        this.Y = (this.Y + 1) & 0xFF;
        this.setZN(this.Y);
    }
    
    opDEC(addr) {
        const value = (this.read(addr) - 1) & 0xFF;
        this.write(addr, value);
        this.setZN(value);
    }
    
    opDEX() {
        this.X = (this.X - 1) & 0xFF;
        this.setZN(this.X);
    }
    
    opDEY() {
        this.Y = (this.Y - 1) & 0xFF;
        this.setZN(this.Y);
    }
    
    // --- Logical ---
    
    opAND(addr) {
        this.A &= this.read(addr);
        this.setZN(this.A);
    }
    
    opORA(addr) {
        this.A |= this.read(addr);
        this.setZN(this.A);
    }
    
    opEOR(addr) {
        this.A ^= this.read(addr);
        this.setZN(this.A);
    }
    
    // --- Shift/Rotate ---
    
    opASL_A() {
        this.flags.C = (this.A >> 7) & 1;
        this.A = (this.A << 1) & 0xFF;
        this.setZN(this.A);
    }
    
    opASL(addr) {
        let value = this.read(addr);
        this.flags.C = (value >> 7) & 1;
        value = (value << 1) & 0xFF;
        this.write(addr, value);
        this.setZN(value);
    }
    
    opLSR_A() {
        this.flags.C = this.A & 1;
        this.A = this.A >> 1;
        this.setZN(this.A);
    }
    
    opLSR(addr) {
        let value = this.read(addr);
        this.flags.C = value & 1;
        value = value >> 1;
        this.write(addr, value);
        this.setZN(value);
    }
    
    opROL_A() {
        const carry = this.flags.C;
        this.flags.C = (this.A >> 7) & 1;
        this.A = ((this.A << 1) | carry) & 0xFF;
        this.setZN(this.A);
    }
    
    opROL(addr) {
        let value = this.read(addr);
        const carry = this.flags.C;
        this.flags.C = (value >> 7) & 1;
        value = ((value << 1) | carry) & 0xFF;
        this.write(addr, value);
        this.setZN(value);
    }
    
    opROR_A() {
        const carry = this.flags.C;
        this.flags.C = this.A & 1;
        this.A = (this.A >> 1) | (carry << 7);
        this.setZN(this.A);
    }
    
    opROR(addr) {
        let value = this.read(addr);
        const carry = this.flags.C;
        this.flags.C = value & 1;
        value = (value >> 1) | (carry << 7);
        this.write(addr, value);
        this.setZN(value);
    }
    
    // --- Compare ---
    
    opCMP(addr) {
        const value = this.read(addr);
        const result = this.A - value;
        this.flags.C = this.A >= value ? 1 : 0;
        this.setZN(result & 0xFF);
    }
    
    opCPX(addr) {
        const value = this.read(addr);
        const result = this.X - value;
        this.flags.C = this.X >= value ? 1 : 0;
        this.setZN(result & 0xFF);
    }
    
    opCPY(addr) {
        const value = this.read(addr);
        const result = this.Y - value;
        this.flags.C = this.Y >= value ? 1 : 0;
        this.setZN(result & 0xFF);
    }
    
    opBIT(addr) {
        const value = this.read(addr);
        this.flags.Z = (this.A & value) === 0 ? 1 : 0;
        this.flags.N = (value >> 7) & 1;
        this.flags.V = (value >> 6) & 1;
    }
    
    // --- Branch ---
    
    branch(condition) {
        const target = this.addrRelative();
        if (condition) {
            this.cycles++;
            if ((this.PC & 0xFF00) !== (target & 0xFF00)) {
                this.cycles++;  // Page boundary crossed
            }
            this.PC = target;
        }
    }
    
    opBCC() { this.branch(this.flags.C === 0); }
    opBCS() { this.branch(this.flags.C === 1); }
    opBEQ() { this.branch(this.flags.Z === 1); }
    opBNE() { this.branch(this.flags.Z === 0); }
    opBMI() { this.branch(this.flags.N === 1); }
    opBPL() { this.branch(this.flags.N === 0); }
    opBVC() { this.branch(this.flags.V === 0); }
    opBVS() { this.branch(this.flags.V === 1); }
    
    // --- Jump/Call ---
    
    opJMP(addr) {
        this.PC = addr;
    }
    
    opJSR() {
        const target = this.read16(this.PC);
        this.PC += 2;
        // Push PC-1 (address of last byte of JSR instruction)
        this.push16(this.PC - 1);
        this.PC = target;
    }
    
    opRTS() {
        this.PC = this.pull16() + 1;
    }
    
    opRTI() {
        this.setP(this.pull());
        this.PC = this.pull16();
    }
    
    // --- Flag Operations ---
    
    opCLC() { this.flags.C = 0; }
    opSEC() { this.flags.C = 1; }
    opCLI() { this.flags.I = 0; }
    opSEI() { this.flags.I = 1; }
    opCLD() { this.flags.D = 0; }
    opSED() { this.flags.D = 1; }
    opCLV() { this.flags.V = 0; }
    
    // --- System ---
    
    opBRK() {
        this.PC++;  // BRK has a padding byte
        this.push16(this.PC);
        this.push(this.getP() | 0x10);  // B flag set
        this.flags.I = 1;
        this.PC = this.read16(0xFFFE);
    }
    
    opNOP() {
        // Do nothing
    }
    
    // =========================================================================
    // Instruction Table
    // =========================================================================
    
    _buildInstructionTable() {
        // Each entry: [function, cycles]
        // Addressing mode is encoded in how we call the function
        
        this.instructions = new Array(256).fill(null);
        
        // Helper to add instruction
        const add = (opcode, handler, cycles) => {
            this.instructions[opcode] = { handler, cycles };
        };
        
        // LDA
        add(0xA9, () => this.opLDA(this.addrImmediate()), 2);
        add(0xA5, () => this.opLDA(this.addrZeroPage()), 3);
        add(0xB5, () => this.opLDA(this.addrZeroPageX()), 4);
        add(0xAD, () => this.opLDA(this.addrAbsolute()), 4);
        add(0xBD, () => this.opLDA(this.addrAbsoluteX()), 4);
        add(0xB9, () => this.opLDA(this.addrAbsoluteY()), 4);
        add(0xA1, () => this.opLDA(this.addrIndirectX()), 6);
        add(0xB1, () => this.opLDA(this.addrIndirectY()), 5);
        
        // LDX
        add(0xA2, () => this.opLDX(this.addrImmediate()), 2);
        add(0xA6, () => this.opLDX(this.addrZeroPage()), 3);
        add(0xB6, () => this.opLDX(this.addrZeroPageY()), 4);
        add(0xAE, () => this.opLDX(this.addrAbsolute()), 4);
        add(0xBE, () => this.opLDX(this.addrAbsoluteY()), 4);
        
        // LDY
        add(0xA0, () => this.opLDY(this.addrImmediate()), 2);
        add(0xA4, () => this.opLDY(this.addrZeroPage()), 3);
        add(0xB4, () => this.opLDY(this.addrZeroPageX()), 4);
        add(0xAC, () => this.opLDY(this.addrAbsolute()), 4);
        add(0xBC, () => this.opLDY(this.addrAbsoluteX()), 4);
        
        // STA
        add(0x85, () => this.opSTA(this.addrZeroPage()), 3);
        add(0x95, () => this.opSTA(this.addrZeroPageX()), 4);
        add(0x8D, () => this.opSTA(this.addrAbsolute()), 4);
        add(0x9D, () => this.opSTA(this.addrAbsoluteXStore()), 5);
        add(0x99, () => this.opSTA(this.addrAbsoluteYStore()), 5);
        add(0x81, () => this.opSTA(this.addrIndirectX()), 6);
        add(0x91, () => this.opSTA(this.addrIndirectYStore()), 6);
        
        // STX
        add(0x86, () => this.opSTX(this.addrZeroPage()), 3);
        add(0x96, () => this.opSTX(this.addrZeroPageY()), 4);
        add(0x8E, () => this.opSTX(this.addrAbsolute()), 4);
        
        // STY
        add(0x84, () => this.opSTY(this.addrZeroPage()), 3);
        add(0x94, () => this.opSTY(this.addrZeroPageX()), 4);
        add(0x8C, () => this.opSTY(this.addrAbsolute()), 4);
        
        // Transfer
        add(0xAA, () => this.opTAX(), 2);
        add(0xA8, () => this.opTAY(), 2);
        add(0x8A, () => this.opTXA(), 2);
        add(0x98, () => this.opTYA(), 2);
        add(0xBA, () => this.opTSX(), 2);
        add(0x9A, () => this.opTXS(), 2);
        
        // Stack
        add(0x48, () => this.opPHA(), 3);
        add(0x08, () => this.opPHP(), 3);
        add(0x68, () => this.opPLA(), 4);
        add(0x28, () => this.opPLP(), 4);
        
        // ADC
        add(0x69, () => this.opADC(this.addrImmediate()), 2);
        add(0x65, () => this.opADC(this.addrZeroPage()), 3);
        add(0x75, () => this.opADC(this.addrZeroPageX()), 4);
        add(0x6D, () => this.opADC(this.addrAbsolute()), 4);
        add(0x7D, () => this.opADC(this.addrAbsoluteX()), 4);
        add(0x79, () => this.opADC(this.addrAbsoluteY()), 4);
        add(0x61, () => this.opADC(this.addrIndirectX()), 6);
        add(0x71, () => this.opADC(this.addrIndirectY()), 5);
        
        // SBC
        add(0xE9, () => this.opSBC(this.addrImmediate()), 2);
        add(0xE5, () => this.opSBC(this.addrZeroPage()), 3);
        add(0xF5, () => this.opSBC(this.addrZeroPageX()), 4);
        add(0xED, () => this.opSBC(this.addrAbsolute()), 4);
        add(0xFD, () => this.opSBC(this.addrAbsoluteX()), 4);
        add(0xF9, () => this.opSBC(this.addrAbsoluteY()), 4);
        add(0xE1, () => this.opSBC(this.addrIndirectX()), 6);
        add(0xF1, () => this.opSBC(this.addrIndirectY()), 5);
        
        // INC
        add(0xE6, () => this.opINC(this.addrZeroPage()), 5);
        add(0xF6, () => this.opINC(this.addrZeroPageX()), 6);
        add(0xEE, () => this.opINC(this.addrAbsolute()), 6);
        add(0xFE, () => this.opINC(this.addrAbsoluteXStore()), 7);
        
        // INX, INY
        add(0xE8, () => this.opINX(), 2);
        add(0xC8, () => this.opINY(), 2);
        
        // DEC
        add(0xC6, () => this.opDEC(this.addrZeroPage()), 5);
        add(0xD6, () => this.opDEC(this.addrZeroPageX()), 6);
        add(0xCE, () => this.opDEC(this.addrAbsolute()), 6);
        add(0xDE, () => this.opDEC(this.addrAbsoluteXStore()), 7);
        
        // DEX, DEY
        add(0xCA, () => this.opDEX(), 2);
        add(0x88, () => this.opDEY(), 2);
        
        // AND
        add(0x29, () => this.opAND(this.addrImmediate()), 2);
        add(0x25, () => this.opAND(this.addrZeroPage()), 3);
        add(0x35, () => this.opAND(this.addrZeroPageX()), 4);
        add(0x2D, () => this.opAND(this.addrAbsolute()), 4);
        add(0x3D, () => this.opAND(this.addrAbsoluteX()), 4);
        add(0x39, () => this.opAND(this.addrAbsoluteY()), 4);
        add(0x21, () => this.opAND(this.addrIndirectX()), 6);
        add(0x31, () => this.opAND(this.addrIndirectY()), 5);
        
        // ORA
        add(0x09, () => this.opORA(this.addrImmediate()), 2);
        add(0x05, () => this.opORA(this.addrZeroPage()), 3);
        add(0x15, () => this.opORA(this.addrZeroPageX()), 4);
        add(0x0D, () => this.opORA(this.addrAbsolute()), 4);
        add(0x1D, () => this.opORA(this.addrAbsoluteX()), 4);
        add(0x19, () => this.opORA(this.addrAbsoluteY()), 4);
        add(0x01, () => this.opORA(this.addrIndirectX()), 6);
        add(0x11, () => this.opORA(this.addrIndirectY()), 5);
        
        // EOR
        add(0x49, () => this.opEOR(this.addrImmediate()), 2);
        add(0x45, () => this.opEOR(this.addrZeroPage()), 3);
        add(0x55, () => this.opEOR(this.addrZeroPageX()), 4);
        add(0x4D, () => this.opEOR(this.addrAbsolute()), 4);
        add(0x5D, () => this.opEOR(this.addrAbsoluteX()), 4);
        add(0x59, () => this.opEOR(this.addrAbsoluteY()), 4);
        add(0x41, () => this.opEOR(this.addrIndirectX()), 6);
        add(0x51, () => this.opEOR(this.addrIndirectY()), 5);
        
        // ASL
        add(0x0A, () => this.opASL_A(), 2);
        add(0x06, () => this.opASL(this.addrZeroPage()), 5);
        add(0x16, () => this.opASL(this.addrZeroPageX()), 6);
        add(0x0E, () => this.opASL(this.addrAbsolute()), 6);
        add(0x1E, () => this.opASL(this.addrAbsoluteXStore()), 7);
        
        // LSR
        add(0x4A, () => this.opLSR_A(), 2);
        add(0x46, () => this.opLSR(this.addrZeroPage()), 5);
        add(0x56, () => this.opLSR(this.addrZeroPageX()), 6);
        add(0x4E, () => this.opLSR(this.addrAbsolute()), 6);
        add(0x5E, () => this.opLSR(this.addrAbsoluteXStore()), 7);
        
        // ROL
        add(0x2A, () => this.opROL_A(), 2);
        add(0x26, () => this.opROL(this.addrZeroPage()), 5);
        add(0x36, () => this.opROL(this.addrZeroPageX()), 6);
        add(0x2E, () => this.opROL(this.addrAbsolute()), 6);
        add(0x3E, () => this.opROL(this.addrAbsoluteXStore()), 7);
        
        // ROR
        add(0x6A, () => this.opROR_A(), 2);
        add(0x66, () => this.opROR(this.addrZeroPage()), 5);
        add(0x76, () => this.opROR(this.addrZeroPageX()), 6);
        add(0x6E, () => this.opROR(this.addrAbsolute()), 6);
        add(0x7E, () => this.opROR(this.addrAbsoluteXStore()), 7);
        
        // CMP
        add(0xC9, () => this.opCMP(this.addrImmediate()), 2);
        add(0xC5, () => this.opCMP(this.addrZeroPage()), 3);
        add(0xD5, () => this.opCMP(this.addrZeroPageX()), 4);
        add(0xCD, () => this.opCMP(this.addrAbsolute()), 4);
        add(0xDD, () => this.opCMP(this.addrAbsoluteX()), 4);
        add(0xD9, () => this.opCMP(this.addrAbsoluteY()), 4);
        add(0xC1, () => this.opCMP(this.addrIndirectX()), 6);
        add(0xD1, () => this.opCMP(this.addrIndirectY()), 5);
        
        // CPX
        add(0xE0, () => this.opCPX(this.addrImmediate()), 2);
        add(0xE4, () => this.opCPX(this.addrZeroPage()), 3);
        add(0xEC, () => this.opCPX(this.addrAbsolute()), 4);
        
        // CPY
        add(0xC0, () => this.opCPY(this.addrImmediate()), 2);
        add(0xC4, () => this.opCPY(this.addrZeroPage()), 3);
        add(0xCC, () => this.opCPY(this.addrAbsolute()), 4);
        
        // BIT
        add(0x24, () => this.opBIT(this.addrZeroPage()), 3);
        add(0x2C, () => this.opBIT(this.addrAbsolute()), 4);
        
        // Branches
        add(0x90, () => this.opBCC(), 2);
        add(0xB0, () => this.opBCS(), 2);
        add(0xF0, () => this.opBEQ(), 2);
        add(0xD0, () => this.opBNE(), 2);
        add(0x30, () => this.opBMI(), 2);
        add(0x10, () => this.opBPL(), 2);
        add(0x50, () => this.opBVC(), 2);
        add(0x70, () => this.opBVS(), 2);
        
        // JMP
        add(0x4C, () => this.opJMP(this.addrAbsolute()), 3);
        add(0x6C, () => this.opJMP(this.addrIndirect()), 5);
        
        // JSR, RTS, RTI
        add(0x20, () => this.opJSR(), 6);
        add(0x60, () => this.opRTS(), 6);
        add(0x40, () => this.opRTI(), 6);
        
        // Flags
        add(0x18, () => this.opCLC(), 2);
        add(0x38, () => this.opSEC(), 2);
        add(0x58, () => this.opCLI(), 2);
        add(0x78, () => this.opSEI(), 2);
        add(0xD8, () => this.opCLD(), 2);
        add(0xF8, () => this.opSED(), 2);
        add(0xB8, () => this.opCLV(), 2);
        
        // BRK, NOP
        add(0x00, () => this.opBRK(), 7);
        add(0xEA, () => this.opNOP(), 2);
    }
    
    // =========================================================================
    // Execution
    // =========================================================================
    
    /**
     * Reset the CPU (like pulling the RESET pin low)
     */
    reset() {
        this.A = 0;
        this.X = 0;
        this.Y = 0;
        this.SP = 0xFD;
        this.flags = { C: 0, Z: 0, I: 1, D: 0, B: 0, U: 1, V: 0, N: 0 };
        this.PC = this.read16(0xFFFC);  // Reset vector
        this.cycles = 0;
        this.halted = false;
        this.nmiPending = false;
        this.irqPending = false;
    }
    
    /**
     * Signal NMI (Non-Maskable Interrupt)
     * Sets pending flag - will be serviced before next instruction
     */
    nmi() {
        this.nmiPending = true;
    }
    
    /**
     * Signal IRQ (Maskable Interrupt)
     * Sets pending flag - will be serviced before next instruction if I flag clear
     */
    irq() {
        this.irqPending = true;
    }
    
    /**
     * Clear IRQ signal (called when interrupt source is cleared)
     */
    clearIrq() {
        this.irqPending = false;
    }
    
    /**
     * Internal: Handle NMI interrupt
     */
    _handleNMI() {
        this.push16(this.PC);
        this.push(this.getP() & ~0x10);  // B flag clear
        this.flags.I = 1;
        this.PC = this.read16(0xFFFA);
        this.cycles += 7;
    }
    
    /**
     * Internal: Handle IRQ interrupt
     */
    _handleIRQ() {
        this.push16(this.PC);
        this.push(this.getP() & ~0x10);  // B flag clear
        this.flags.I = 1;
        this.PC = this.read16(0xFFFE);
        this.cycles += 7;
    }
    
    /**
     * Execute one instruction
     * @returns {number} Cycles consumed
     */
    step() {
        if (this.halted) return 0;
        
        const startCycles = this.cycles;
        
        // Check for pending interrupts BEFORE fetch (correct 6502 behavior)
        if (this.nmiPending) {
            this._handleNMI();
            this.nmiPending = false;
            return this.cycles - startCycles;
        }
        
        if (this.irqPending && this.flags.I === 0) {
            this._handleIRQ();
            // Note: IRQ line stays asserted until source clears it
            // Don't clear irqPending here - let the interrupt handler do it
            return this.cycles - startCycles;
        }
        
        // Fetch and execute instruction
        const opcode = this.read(this.PC++);
        const instruction = this.instructions[opcode];
        
        if (!instruction) {
            console.warn(`Unknown opcode: $${opcode.toString(16).padStart(2, '0')} at $${(this.PC - 1).toString(16).padStart(4, '0')}`);
            this.halted = true;
            return 0;
        }
        
        this.cycles += instruction.cycles;
        instruction.handler();
        
        return this.cycles - startCycles;
    }
    
    /**
     * Run for a specified number of cycles
     * @param {number} cyclesToRun - Target cycles to execute
     * @returns {number} Actual cycles executed
     */
    run(cyclesToRun) {
        const startCycles = this.cycles;
        const targetCycles = this.cycles + cyclesToRun;
        
        while (this.cycles < targetCycles && !this.halted) {
            this.step();
        }
        
        return this.cycles - startCycles;
    }
    
    // =========================================================================
    // Debug/Utility
    // =========================================================================
    
    /**
     * Load binary data into memory at specified address
     */
    loadBinary(data, address) {
        for (let i = 0; i < data.length; i++) {
            this.memory[(address + i) & 0xFFFF] = data[i];
        }
    }
    
    /**
     * Get formatted CPU state for debugging
     */
    getState() {
        return {
            PC: this.PC,
            A: this.A,
            X: this.X,
            Y: this.Y,
            SP: this.SP,
            P: this.getP(),
            flags: { ...this.flags },
            cycles: this.cycles
        };
    }
    
    /**
     * Format state as string for display
     */
    stateToString() {
        const s = this.getState();
        const flagStr = 
            (this.flags.N ? 'N' : '-') +
            (this.flags.V ? 'V' : '-') +
            '-' +
            (this.flags.B ? 'B' : '-') +
            (this.flags.D ? 'D' : '-') +
            (this.flags.I ? 'I' : '-') +
            (this.flags.Z ? 'Z' : '-') +
            (this.flags.C ? 'C' : '-');
        
        return `PC:${s.PC.toString(16).padStart(4,'0').toUpperCase()} ` +
               `A:${s.A.toString(16).padStart(2,'0').toUpperCase()} ` +
               `X:${s.X.toString(16).padStart(2,'0').toUpperCase()} ` +
               `Y:${s.Y.toString(16).padStart(2,'0').toUpperCase()} ` +
               `SP:${s.SP.toString(16).padStart(2,'0').toUpperCase()} ` +
               `[${flagStr}]`;
    }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CPU6502 };
}
