'use strict';

// The back end accepts only the documented NMOS instructions the language uses.
// Both the binary and the annotated assembly are made from these same records.
const ORIGIN = 0x0200;
const LIMIT = 0x03fc; // The four bytes here are the monitor's interrupt vectors.
// The cassette PROM loses the last byte of a block that is one byte longer
// than a whole number of pages: SAVE takes it, and LOAD stores it, one page
// too low, and the checksum agrees on both sides (AGENTS.md, Cassette Sound
// Format). An image of such a length is given one more byte, which nothing
// executes, so that the board's own routines can carry the program. NOP is
// what the manual's listings fill with (supplement, page 99).
const FILLER = 0xea;
const OPCODES = {
    // SED is written only where a `decimal` block begins, and after a routine
    // that such a block had to call with the flag clear.
    CLD: 0xd8, SED: 0xf8, CLC: 0x18, SEC: 0x38, TAX: 0xaa, RTS: 0x60,
    // The absolute forms are for a memory location the program names, which
    // may be anywhere; the compiler's own variables are all in page zero.
    LDA: { imm: 0xa9, zp: 0xa5, abs: 0xad, zpX: 0xb5, absX: 0xbd },
    STA: { zp: 0x85, abs: 0x8d, zpX: 0x95, absX: 0x9d }, INC: { zp: 0xe6 }, DEC: { zp: 0xc6 },
    // X is loaded on its own only to store into a row of bytes: A holds the
    // value by then, and a load of the index into A would lose it.
    LDX: { imm: 0xa2, zp: 0xa6, abs: 0xae },
    ADC: { imm: 0x69, zp: 0x65, abs: 0x6d }, SBC: { imm: 0xe9, zp: 0xe5, abs: 0xed },
    AND: { imm: 0x29, zp: 0x25, abs: 0x2d }, ORA: { imm: 0x09, zp: 0x05, abs: 0x0d },
    EOR: { imm: 0x49, zp: 0x45, abs: 0x4d }, CMP: { imm: 0xc9, zp: 0xc5, abs: 0xcd },
    JSR: { abs: 0x20 }, JMP: { abs: 0x4c },
    BEQ: { rel: 0xf0 }, BNE: { rel: 0xd0 }, BCS: { rel: 0xb0 }, BCC: { rel: 0x90 }
};
const INVERSE = { BEQ: 'BNE', BNE: 'BEQ', BCS: 'BCC', BCC: 'BCS' };
const WIDTH = { implied: 1, imm: 2, zp: 2, abs: 3, zpX: 2, absX: 3, rel: 2 };

function hex(n, width = 2) {
    return n.toString(16).toUpperCase().padStart(width, '0');
}

function layout(items, symbols) {
    // A forward jump can grow when a branch between it and its destination
    // grows. Recompute addresses until all remaining short branches fit.
    let end;
    let changed;
    do {
        end = ORIGIN;
        for (const item of items) {
            item.pc = end;
            if (item.label) symbols.set(item.label, end);
            else if (item.bytes) end += item.bytes.length;
            else end += item.long ? 5 : WIDTH[item.mode];
        }
        changed = false;
        for (const item of items) {
            if (item.mode !== 'rel' || item.long) continue;
            const offset = symbols.get(item.arg) - (item.pc + 2);
            if (offset < -128 || offset > 127) {
                item.long = true;
                changed = true;
            }
        }
    } while (changed);
    if (end > LIMIT) {
        throw new Error(`Program needs ${end - ORIGIN} bytes. Only ${LIMIT - ORIGIN} fit below the interrupt vectors at $03FC.`);
    }
    return end;
}

function assemble(items) {
    // A named byte can spend its whole lifetime in A. Drop its stores and
    // reserve RAM only if another instruction actually reads that byte.
    const variables = new Set(items.filter(i => i.mode === 'zp' && i.op !== 'STA' && typeof i.arg === 'string').map(i => i.arg));
    items = items.filter(i => !(i.op === 'STA' && typeof i.arg === 'string' && !variables.has(i.arg)));
    if (variables.size > 0x80 - 0x20) throw new Error('Program exceeds 96 bytes of variable storage.');
    const symbols = new Map();
    const listing = ['* = $0200'];
    for (const name of variables) {
        const address = 0x20 + symbols.size;
        symbols.set(name, address);
        listing.push(`${name} = $${hex(address)}`);
    }
    // The filler goes after everything else, so adding it moves nothing.
    if ((layout(items, symbols) - ORIGIN) % 256 === 1) {
        items.push({ bytes: [FILLER], filler: true });
        layout(items, symbols);
    }
    const binary = [];
    function row(pc, bytes, asm, line) {
        listing.push('    ' + asm.padEnd(27) + ' ; $' + hex(pc, 4) + '  ' +
            bytes.map(b => hex(b)).join(' ') + (line ? '  line ' + line : ''));
        binary.push(...bytes);
    }
    for (const item of items) {
        const { op, mode, arg, pc, line } = item;
        if (item.label) {
            listing.push(item.label + ':');
        } else if (item.bytes) {
            if (item.filler) listing.push('; filler: the cassette PROM loses the last byte of a block one byte over whole pages');
            // A table made from a text says which, since its bytes do not.
            if (item.comment) listing.push('; ' + item.comment);
            for (let i = 0; i < item.bytes.length; i += 8) {
                const bytes = item.bytes.slice(i, i + 8);
                row(pc + i, bytes, '.byte ' + bytes.map(b => '$' + hex(b)).join(', '), line);
            }
        } else {
            const value = typeof arg === 'string' ? symbols.get(arg) : arg;
            if (mode !== 'implied' && !Number.isInteger(value)) throw new Error('Undefined assembly operand ' + arg);
            const operand = typeof arg === 'string' ? arg : '$' + hex(value ?? 0, WIDTH[mode] === 3 ? 4 : 2);
            if (item.long) {
                row(pc, [OPCODES[INVERSE[op]].rel, 3], INVERSE[op] + ' *+5', line);
                row(pc + 2, [0x4c, value & 255, value >> 8], 'JMP ' + operand, line);
            } else if (mode === 'implied') {
                row(pc, [OPCODES[op]], op, line);
            } else {
                const bytes = [OPCODES[op][mode], mode === 'rel' ? (value - pc - 2) & 255 : value & 255];
                if (WIDTH[mode] === 3) bytes.push(value >> 8);
                row(pc, bytes, op + ' ' + (mode === 'imm' ? '#' : '') + operand + (mode === 'absX' || mode === 'zpX' ? ',X' : ''), line);
            }
        }
    }
    return { assembly: listing.join('\n') + '\n', binary: Uint8Array.from(binary), origin: ORIGIN };
}

module.exports = { assemble };
