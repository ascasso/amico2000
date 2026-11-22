'use strict';

// Issue #19: docs/amtape-format.md is the written reference for the .amtape
// file. A reference that drifts from the code is worse than none, so these
// checks read the document itself: its example has to be the bytes the
// emulator writes, its table has to describe those bytes, and what it says a
// reader refuses or accepts has to be what the reader does.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { bootedMachine } = require('./helpers/machine');

const DOC = fs.readFileSync(path.join(__dirname, '..', 'docs', 'amtape-format.md'), 'utf8');
const PROGRAM = [0xA9, 0x42, 0x85, 0x20, 0x4C, 0x22, 0xFE];

/** The example dump in the document, as bytes. */
function exampleBytes() {
    const block = DOC.match(/## An Example[\s\S]*?```\n([\s\S]*?)```/);
    assert.ok(block, 'the document must contain its example dump');
    return block[1].trim().split('\n').flatMap((line) =>
        line.trim().split(/\s+/).slice(1).map((byte) => parseInt(byte, 16)));
}

/** The layout table, as {offset, size, field} rows. */
function layout() {
    const rows = [...DOC.matchAll(/^\| (\d+) \| (\d+|Length) \| ([^|]+) \|/gm)];
    return rows.map(([, offset, size, field]) => ({
        offset: Number(offset),
        size: size === 'Length' ? null : Number(size),
        field: field.trim()
    }));
}

/** Save the guide's program from $0200-$0206 as program 01, through the machine. */
function savedImage() {
    const amico = bootedMachine();
    amico.cpu.memory.set(PROGRAM, 0x0200);
    amico.cpu.memory.set([0x00, 0x02, 0x06, 0x02, 0x01], 0x0000);
    return Array.from(amico.saveTapeFromMonitorParams());
}

test('the example in the format reference is the file the emulator writes (#19)', () => {
    assert.deepEqual(exampleBytes(), savedImage());
});

test('the layout table in the format reference describes that file (#19)', () => {
    const image = savedImage();
    const rows = layout();
    assert.deepEqual(rows.map((row) => row.field),
        ['Magic', 'Version', 'Identifier', 'Start address', 'End address', 'Checksum', 'Length', 'Data']);

    // The fields follow one another with no gaps, and the data runs to the end.
    let offset = 0;
    for (const row of rows.slice(0, -1)) {
        assert.equal(row.offset, offset, `${row.field} starts where the field before it ends`);
        offset += row.size;
    }
    assert.equal(rows.at(-1).offset, offset);
    assert.equal(offset, 18, 'which makes the header 18 bytes');

    const at = (name) => rows.find((row) => row.field === name);
    const field = (name) => image.slice(at(name).offset, at(name).offset + at(name).size);
    const word = (name) => field(name)[0] | (field(name)[1] << 8);
    assert.equal(String.fromCharCode(...field('Magic')), 'AMICOTAPE');
    assert.deepEqual(field('Version'), [1]);
    assert.deepEqual(field('Identifier'), [0x01]);
    assert.equal(word('Start address'), 0x0200);
    assert.equal(word('End address'), 0x0206);
    assert.equal(word('Length'), PROGRAM.length);
    assert.deepEqual(image.slice(at('Data').offset), PROGRAM);

    // "The low eight bits of the identifier plus every data byte."
    const sum = PROGRAM.reduce((total, value) => total + value, 0x01);
    assert.equal(sum, 0x2FD, 'the sum the document works out');
    assert.deepEqual(field('Checksum'), [sum & 0xFF]);
    assert.equal(image.length, 18 + PROGRAM.length);
});

test('a reader refuses and accepts what the format reference says it does (#19)', () => {
    const image = savedImage();
    const load = (bytes) => bootedMachine().loadTape(Uint8Array.from(bytes));
    const changed = (offset, value) => image.map((byte, i) => (i === offset ? value : byte));

    assert.throws(() => load(image.slice(0, 17)), /too short/);
    assert.throws(() => load(changed(0, 0x61)), /Unrecognized AMICO 2000 tape image/);
    assert.throws(() => load(changed(9, 2)), /Unsupported tape image version: 2/);
    assert.throws(() => load([...image, 0x00]), /length does not match header/);
    assert.throws(() => load(image.slice(0, -1)), /length does not match header/);
    assert.throws(() => load(changed(15, image[15] ^ 1)), /checksum mismatch/);

    // An end address that disagrees with the length: accepted, and LOAD goes
    // by the length.
    const wrongEnd = load(changed(13, 0xFF));
    assert.equal(wrongEnd.end, 0x02FF);
    assert.equal(wrongEnd.data.length, PROGRAM.length);

    // A length of zero: accepted, as a program with no bytes.
    const empty = image.slice(0, 18);
    empty[15] = 0x01;   // the identifier alone
    empty[16] = 0x00;
    assert.equal(load(empty).data.length, 0);
});
