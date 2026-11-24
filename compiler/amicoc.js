'use strict';

const fs = require('node:fs');
const { compile } = require('./compile');

function tapeImage({ origin, binary }) {
    // Use the same public tape writer as the browser, including its checksum.
    global.CPU6502 = require('../cpu6502').CPU6502;
    const { Amico2000 } = require('../amico2000');
    const machine = new Amico2000();
    machine.addTapeRecord({ id: 1, start: origin, data: binary });
    return machine.exportTape(1);
}

const [format, file, ...extra] = process.argv.slice(2);
if (!['--asm', '--bin', '--tape'].includes(format) || !file || extra.length) {
    console.error('Usage: node compiler/amicoc.js <--asm|--bin|--tape> source.amico');
    process.exitCode = 1;
} else {
    try {
        const result = compile(fs.readFileSync(file, 'utf8'));
        // On standard error, so that a warning never lands in a listing, a
        // binary or a tape that is being redirected to a file.
        for (const warning of result.warnings) console.error(`${file}: warning: ${warning}`);
        const output = format === '--asm' ? result.assembly : format === '--bin' ? result.binary : tapeImage(result);
        process.stdout.write(output);
    } catch (error) {
        console.error(file + ': ' + error.message);
        process.exitCode = 1;
    }
}
