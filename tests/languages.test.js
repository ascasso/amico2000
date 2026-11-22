'use strict';

// The home page in two languages.
//
// index.html is in English and in Italian: a large part of the people who
// used this board read Sperimentare around 1980, and many of them do not
// read English. The Italian is written into the page beside the English, and
// lang.js chooses between them. Nothing but these checks keeps a sentence,
// a tooltip or a message from being added in one language only, so they
// hold the page to its own arrangement:
//
// - which language a visitor gets, and that a choice is remembered;
// - every string a script says exists in both languages and takes the same
//   values in each;
// - every piece of text marked for one language is followed by the other;
// - every tooltip and label has its Italian beside it;
// - main.js puts no words of its own on the page;
// - lang.js, run against a stand-in for the page, sets <html lang> at once,
//   swaps the attributes there and back, and tells main.js.
//
// What they cannot check is that the Italian says what the English says.
// That has to be read by a person.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const { AmicoLang } = require(path.join(ROOT, 'lang'));
const page = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
const langSource = fs.readFileSync(path.join(ROOT, 'lang.js'), 'utf8');

// ---------------------------------------------------------------------------
// Which language
// ---------------------------------------------------------------------------

test('the address, then the visitor\'s own choice, then the browser, then English', () => {
    const { choose } = AmicoLang;
    assert.equal(choose({}), 'en', 'nothing to go on');
    assert.equal(choose({ browser: ['it-IT', 'it', 'en'] }), 'it', 'an Italian browser');
    assert.equal(choose({ browser: ['en-US', 'it'] }), 'en', 'English before Italian in the browser\'s list');
    assert.equal(choose({ browser: ['de-DE', 'it'] }), 'it', 'the first language the page has');
    assert.equal(choose({ browser: ['fr', 'de'] }), 'en', 'neither language asked for');
    assert.equal(choose({ stored: 'en', browser: ['it'] }), 'en', 'a choice made before wins over the browser');
    assert.equal(choose({ search: '?lang=it', stored: 'en', browser: ['en'] }), 'it', 'the address wins over both');
    assert.equal(choose({ search: '?a=1&lang=IT' }), 'it', 'among other parameters, in any case');
    assert.equal(choose({ search: '?lang=fr', stored: 'it' }), 'it', 'a language the page lacks is not a choice');
    assert.equal(choose({ stored: 'italiano', browser: ['en'] }), 'en', 'nor is anything else that was stored');
});

// ---------------------------------------------------------------------------
// What scripts say
// ---------------------------------------------------------------------------

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

test('every string a script says is there in both languages, taking the same values', () => {
    const keys = Object.keys(AmicoLang.STRINGS);
    assert.ok(keys.length > 20, 'the strings are there');
    for (const key of keys) {
        const entry = AmicoLang.STRINGS[key];
        assert.deepEqual(Object.keys(entry).sort(), ['en', 'it'], `${key} has English and Italian and nothing else`);
        assert.ok(entry.en.trim() && entry.it.trim(), `${key} is not empty in either`);
        assert.deepEqual(placeholders(entry.it), placeholders(entry.en), `${key} takes the same values in both`);
    }
});

test('t() fills in the values, in the language asked for', () => {
    assert.equal(AmicoLang.t('tape.playing', { at: 3, length: 14 }, 'en'), 'Playing, 3 s of 14 s');
    assert.equal(AmicoLang.t('tape.playing', { at: 3, length: 14 }, 'it'), 'Lettura, 3 s di 14 s');
    // A dollar sign in a string is a hex prefix and is left alone.
    assert.equal(AmicoLang.t('tape.loaded', { id: '01', address: '0200' }, 'it'), 'Programma 01 caricato a $0200');
    assert.equal(AmicoLang.t('recording.howToLoad', {}, 'en'),
        'To load one at its recorded address, put its number in $0000 and FF in $0002, then run from $FC54.');
    assert.throws(() => AmicoLang.t('no.such.string'), /No string called/);
});

test('the guide quotes these words, so they are held to what it says', () => {
    // guida.html tells its reader what the page will say. If one of these
    // changes, the guide has to change with it.
    const guida = fs.readFileSync(path.join(ROOT, 'guida.html'), 'utf8');
    assert.match(AmicoLang.t('tape.end', {}, 'it'), /^Fine del nastro\./);
    assert.match(guida, /<em>Fine del nastro<\/em>/);
    assert.equal(AmicoLang.t('run', {}, 'it'), 'Avvia');
    assert.equal(AmicoLang.t('stop', {}, 'it'), 'Ferma');
    assert.match(guida, /<strong>Ferma\/Avvia<\/strong>/);
    for (const label of ['Reset a freddo', 'Carica ROM o nastro', 'Comandi dell(?:\'|&rsquo;)emulatore',
        'Stato del processore', 'Leggibili', 'Autentici', 'Immediata', 'Tempo reale', 'Passo']) {
        assert.match(page, new RegExp(`<span data-lang="it" lang="it">${label}</span>`), `the page has the label ${label}`);
        assert.match(guida, new RegExp(label.replace('&rsquo;|', '')), `and the guide names it`);
    }
    for (const word of ['in esecuzione', 'bloccato']) {
        assert.match(page, new RegExp(`content: "${word}"`), `the CPU line can say ${word}`);
        assert.match(guida, new RegExp(`<em>${word}</em>`), 'and the guide says what it means');
    }
});

test('a number is written with the language\'s own decimal mark', () => {
    assert.equal(AmicoLang.decimal(12.34, 1, 'en'), '12.3');
    assert.equal(AmicoLang.decimal(12.34, 1, 'it'), '12,3');
});

// ---------------------------------------------------------------------------
// What the machine says
// ---------------------------------------------------------------------------

// amico2000.js and tape-audio.js say why they refused something in English,
// and know nothing of the page's language. lang.js has the Italian for each
// of those messages, found by its shape. Here every one of them is made for
// real, by doing the thing that is refused, so that a message reworded in the
// machine, or a new one, fails this check and does not reach an Italian
// reader in English.

const { Amico2000, bootedMachine } = require('./helpers/machine');
const { SAVE_ENTRY, LOAD_ENTRY, machineWithCassettePROM, runRoutine } = require('./helpers/cassette-signal');
const { AmicoTapeAudio } = require(path.join(ROOT, 'tape-audio'));

/** The message of the error an action throws. */
function refusal(action) {
    try {
        action();
    } catch (err) {
        return err.message;
    }
    throw new Error('expected a refusal');
}

/** What an instant LOAD or SAVE tells the page when it cannot be done. */
function trapRefusal(entry, prepare) {
    const amico = machineWithCassettePROM();
    amico.cassette.interceptROM = true;
    const told = [];
    amico.onCassetteTrap = (outcome) => told.push(outcome);
    prepare(amico);
    runRoutine(amico, entry);
    assert.equal(told.length, 1);
    assert.ok(told[0].error, 'the trap refused');
    return told[0].error;
}

/** Every message the machine layer can hand to the page, each made for real. */
function machineMessages() {
    const amico = bootedMachine();
    const messages = [];

    // A ROM or a program from Load ROM or tape.
    messages.push(refusal(() => amico.loadMonitorROM(new Uint8Array(513))));
    messages.push(refusal(() => amico.loadCassetteROM(new Uint8Array(600))));
    messages.push(refusal(() => amico.loadProgram(new Uint8Array(4), -1)));
    messages.push(refusal(() => amico.loadProgram(new Uint8Array(4), 0x10000)));
    messages.push(refusal(() => amico.loadProgram(new Uint8Array(4), 1.5)));
    messages.push(refusal(() => amico.loadProgram(new Uint8Array(0x20), 0xFFF8)));
    messages.push(refusal(() => amico.loadProgram(new Uint8Array(0x10), 0xFE00)));
    messages.push(refusal(() => amico.loadProgram(new Uint8Array(0x10), 0xFB00)));

    // An .amtape image.
    amico.addTapeRecord({ id: 0x01, start: 0x0200, data: [1, 2, 3] });
    const image = amico.exportTape(0x01);
    const header = Amico2000.TAPE_MAGIC.length;
    const spoiled = (change) => { const copy = Uint8Array.from(image); change(copy); return copy; };
    messages.push(refusal(() => amico.loadTape(new Uint8Array(3))));
    messages.push(refusal(() => amico.loadTape(new Uint8Array(40))));
    messages.push(refusal(() => amico.loadTape(spoiled((copy) => { copy[header] = 2; }))));
    messages.push(refusal(() => amico.loadTape(image.slice(0, image.length - 1))));
    messages.push(refusal(() => amico.loadTape(spoiled((copy) => { copy[copy.length - 1] ^= 0xFF; }))));

    // A sound recording. A good one, then its header spoiled: bytes 20-21 are
    // the format tag, 22-23 the channel count.
    const wav = AmicoTapeAudio.encodeWav({ id: 0x01, start: 0x0200, data: [1, 2, 3] });
    const riff = Uint8Array.from([...'RIFF'].map((c) => c.charCodeAt(0)).concat([4, 0, 0, 0], [...'WAVE'].map((c) => c.charCodeAt(0))));
    const spoiledWav = (change) => { const copy = Uint8Array.from(wav); change(copy); return copy; };
    messages.push(refusal(() => AmicoTapeAudio.decodeWav(new Uint8Array(100))));
    messages.push(refusal(() => AmicoTapeAudio.decodeWav(riff)));
    messages.push(refusal(() => AmicoTapeAudio.decodeWav(spoiledWav((copy) => { copy[20] = 2; }))));
    messages.push(refusal(() => AmicoTapeAudio.decodeWav(spoiledWav((copy) => { copy[22] = 0; }))));

    // A program going onto the cassette.
    messages.push(refusal(() => amico.addTapeRecord({ id: 0x100, start: 0, data: [1] })));
    messages.push(refusal(() => amico.addTapeRecord({ id: 1, start: 0, data: [] })));
    messages.push(refusal(() => amico.addTapeRecord({ id: 1, start: 0xFFFF, data: [1, 2] })));

    // An instant SAVE or LOAD that is not done.
    messages.push(trapRefusal(SAVE_ENTRY, (board) => board.cpu.memory.set([0x00, 0x03, 0x00, 0x02, 0x01], 0)));
    messages.push(trapRefusal(SAVE_ENTRY, (board) => board.cpu.memory.set([0x00, 0x00, 0xFF, 0xFF, 0x01], 0)));
    messages.push(trapRefusal(LOAD_ENTRY, (board) => board.cpu.memory.set([0x55, 0x00, 0xFF], 0)));
    messages.push(trapRefusal(LOAD_ENTRY, (board) => {
        board.addTapeRecord({ id: 0x02, start: 0x0200, data: new Uint8Array(0x300) });
        board.cpu.memory.set([0x02, 0x00, 0xFE], 0);
    }));
    for (const high of [0xFA, 0xFD]) {   // onto the cassette ROM, then onto the monitor
        messages.push(trapRefusal(LOAD_ENTRY, (board) => {
            board.addTapeRecord({ id: 0x13, start: 0x0200, data: new Uint8Array(0x200) });
            board.cpu.memory.set([0x13, 0xFE, high], 0);
        }));
    }

    // What could not be read from a sound recording, and the notes on what
    // was. Tapes as SAVE would write them, then damaged.
    const tapeOf = (record) => AmicoTapeAudio.recordToTapeBytes(record);
    const read = (tape) => AmicoTapeAudio.decodePulses(AmicoTapeAudio.tapeBytesToPulseTimes(tape, 0.5));
    const good = tapeOf({ id: 0x11, start: 0x0200, data: [1, 2, 3, 4] });
    const afterLeader = AmicoTapeAudio.LEADER_BYTES + 1;     // the first byte of the header
    messages.push(...read(good.slice(0, afterLeader + 2)).problems);                 // off inside the header
    messages.push(...read(good.slice(0, afterLeader + 5 + 2)).problems);             // off inside the data
    const wrongSum = Uint8Array.from(good);
    wrongSum[afterLeader + 5 + 4] ^= 0xFF;
    messages.push(...read(wrongSum).problems);                                       // checksum
    // 257 bytes: the routines lose the last, and the record says so.
    const long = read(tapeOf({ id: 0x12, start: 0x0200, data: new Uint8Array(257) }));
    messages.push(...long.records.map((record) => record.note));
    // Past the top of memory: a block whose header says $FFFE and 4 bytes.
    const high = Uint8Array.from(good);
    const before = high[afterLeader + 1] + high[afterLeader + 2];
    high[afterLeader + 1] = 0xFE;
    high[afterLeader + 2] = 0xFF;
    high[high.length - AmicoTapeAudio.LEADER_BYTES - 1] += 0xFE + 0xFF - before;      // keep its checksum right
    messages.push(...read(high).problems);
    // One byte, as a recording made elsewhere might hold: count zero.
    const one = Uint8Array.from(tapeOf({ id: 0x14, start: 0x0200, data: [9, 9] }));
    const single = new Uint8Array(one.length - 1);
    single.set(one.slice(0, afterLeader + 5));
    single[afterLeader + 3] = 0;                                                     // count low: 0, one byte
    single[afterLeader + 5] = 9;
    single[afterLeader + 6] = (AmicoTapeAudio.START_BYTE + 0x14 + 0x00 + 0x02 + 0 + 0 + 9) & 0xFF;
    messages.push(...read(single).records.map((record) => record.note));

    return messages;
}

test('every refusal the machine can hand to the page has its Italian', () => {
    const messages = machineMessages();
    // Each kind of message was really made: one of each shape below.
    const shapes = [
        /^monitor ROM \(IC9\) image is 513 bytes/, /^cassette ROM \(IC10\) image is 600 bytes/,
        /^Load address -1 /, /^Load address 65536 /, /^Load address 1\.5 /,
        /runs past the end of the address space$/, /would overwrite the monitor ROM \(IC9\)/, /would overwrite the cassette ROM \(IC10\)/,
        /^Tape image is too short$/, /^Unrecognized AMICO 2000 tape image$/, /^Unsupported tape image version: 2$/,
        /^Tape image length does not match header$/, /^Tape image checksum mismatch$/,
        /^Not a WAV file$/, /^WAV file has no format or no sound data$/, /^Unsupported WAV encoding/, /^Unsupported WAV file: 0 channels/,
        /^Tape program identifier must be a byte, not 256$/, /^A tape record holds 1 to 65535 bytes, not 0$/, /^Tape record does not fit/,
        /^the end address is before the start address$/, /^65536 bytes is more than a tape image can hold/,
        /^program 55 is not on the cassette$/, /^program 02 would run past \$FFFF from \$FE00$/,
        /^program 13 at \$FAFE would overlap the cassette ROM \(IC10\)$/, /^program 13 at \$FDFE would overlap the monitor ROM \(IC9\)$/,
        /^Block at \d+\.\d s: the recording breaks off inside the header$/, /: the recording breaks off after \d+ of \d+ bytes$/,
        /: checksum mismatch, the tape says \$[0-9A-F]{2} and its bytes add up to \$[0-9A-F]{2}$/,
        /^the block was 1 byte longer than a whole number of pages/, /: the block runs past \$FFFF$/, /^a 1-byte block:/
    ];
    for (const shape of shapes) {
        assert.ok(messages.some((message) => shape.test(message)), `a message like ${shape} was made (${messages.join(' | ')})`);
    }
    assert.equal(messages.length, shapes.length, 'and no other');

    for (const message of messages) {
        const italian = AmicoLang.message(message, 'it');
        assert.notEqual(italian, message, `"${message}" has an Italian`);
        assert.equal(AmicoLang.message(message, 'en'), message, 'and in English it is itself');
        // The numbers and addresses in it are carried over.
        for (const value of message.match(/\$[0-9A-F]{2,4}|\b\d{2,}\b/g) || []) {
            assert.ok(italian.includes(value), `"${italian}" keeps ${value}`);
        }
        assert.ok(!/undefined|NaN|\$\{/.test(italian), `"${italian}" is whole`);
    }
});

test('a message lang.js does not know is shown as it is', () => {
    assert.equal(AmicoLang.message('Something nobody has seen before', 'it'), 'Something nobody has seen before');
    assert.equal(AmicoLang.message(undefined, 'it'), undefined);
    // A time in a recording is written the Italian way.
    assert.equal(AmicoLang.message('Block at 12.3 s: the recording breaks off inside the header', 'it'),
        'Blocco a 12,3 s: la registrazione si interrompe dentro l’intestazione');
    assert.equal(AmicoLang.message('program 55 is not on the cassette', 'it'), 'il programma 55 non è sulla cassetta');
});

// ---------------------------------------------------------------------------
// What the page tells its reader to do
// ---------------------------------------------------------------------------

test('the alert after a recording gives a LOAD that lands where the tape says', () => {
    // What the alert has its reader key, in either language: the program's
    // number in $0000, FF in $0002, and a start from $FC54.
    for (const language of ['en', 'it']) {
        const text = AmicoLang.t('recording.howToLoad', {}, language);
        assert.match(text, /\$0000/, `${language}: where the number goes`);
        assert.match(text, /\bFF in \$0002/, `${language}: FF in $0002`);
        assert.match(text, /\$FC54/, `${language}: where LOAD starts`);
    }

    // A board just switched on, a program recorded at $0200 on its cassette,
    // and these bytes keyed before an instant LOAD.
    const program = [0xA9, 0x42, 0x85, 0x20, 0x4C, 0x22, 0xFE];
    const loadAfterKeying = (keyed) => {
        const amico = machineWithCassettePROM();
        amico.cassette.interceptROM = true;
        amico.addTapeRecord({ id: 0x01, start: 0x0200, data: program });
        for (const [address, value] of keyed) amico.cpu.memory[address] = value;
        runRoutine(amico, LOAD_ENTRY);
        return amico.cpu.memory;
    };

    const asTold = loadAfterKeying([[0x0000, 0x01], [0x0002, 0xFF]]);
    assert.deepEqual([...asTold.subarray(0x0200, 0x0207)], program, 'the program is where it was recorded');
    assert.deepEqual([...asTold.subarray(0x0000, 0x0003)], [0x01, 0x00, 0xFF], 'and what was keyed is still there');

    // Why the alert has to say it. Without the FF, $0001/$0002 are an
    // address, and after a cold reset that address is $0000: the alert once
    // gave only the number, and the program went on top of it.
    const numberOnly = loadAfterKeying([[0x0000, 0x01]]);
    assert.deepEqual([...numberOnly.subarray(0x0000, 0x0007)], program, 'the program lands on its own parameters');
    assert.equal(numberOnly[0x0200], 0x00, 'and nothing reaches $0200');
});

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

/** Every start tag in the page's body, as text. */
const body = page.slice(page.indexOf('<body>'));
const tags = body.match(/<[a-zA-Z][^>]*>/g);

test('lang.js is loaded in <head>, at once, so the language is set before anything is drawn', () => {
    const head = page.slice(0, page.indexOf('</head>'));
    const tag = head.match(/<script[^>]*src="lang\.js"[^>]*>/);
    assert.ok(tag, 'lang.js is in <head>');
    assert.ok(!/\b(defer|async)\b/.test(tag[0]), 'and neither deferred nor async');
    assert.match(page, /<html lang="en">/, 'the page as written is the English one');
    assert.match(head, /html\[lang="it"\] \[data-lang="en"\],\s*html:not\(\[lang="it"\]\) \[data-lang="it"\] \{ display: none !important; \}/,
        'one style rule hides the language that is not wanted');
});

test('every piece of text in one language is followed by the same piece in the other', () => {
    const marks = [...body.matchAll(/data-lang="([^"]*)"/g)].map((match) => match[1]);
    assert.ok(marks.length >= 60, `the page's text is marked (${marks.length} marks)`);
    assert.equal(marks.length % 2, 0, 'the marks come in pairs');
    for (let i = 0; i < marks.length; i += 2) {
        assert.deepEqual([marks[i], marks[i + 1]], ['en', 'it'], `pair ${i / 2 + 1} is English and then Italian`);
    }
    for (const tag of tags.filter((each) => /data-lang="it"/.test(each))) {
        if (/class="lang-switch"/.test(tag)) continue;   // names the language it leads to
        assert.match(tag, /\slang="it"/, `Italian text is marked as Italian for a screen reader: ${tag}`);
    }
});

test('no text is left outside the two languages', () => {
    // Text nodes of the page's notes, outside anything marked for a language.
    // What is left has to be names, numbers and punctuation: the board's own
    // legends, register names, key names.
    const notes = body.slice(body.indexOf('<main class="bench">'), body.indexOf('</main>'))
        .replace(/<!--[\s\S]*?-->/g, '');
    const unmarked = notes
        .replace(/<(span|p)\b[^>]*data-lang="(?:en|it)"[^>]*>[\s\S]*?<\/\1>/g, '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/&[a-z]+;/g, ' ');
    const words = unmarked.split('\n').map((line) => line.trim()).filter((line) => /[A-Za-z]{2,}/.test(line));
    const names = ['CPU', 'PC', 'SP', 'RUN', 'REG', 'HLT', 'RES', 'FD', '--I-----',
        // Its word is the script's: Run or Stop, Avvia or Ferma (see updateRunButton()).
        'Run'];
    assert.deepEqual(words.filter((line) => !names.includes(line)), [], 'only names are left unmarked under the board');
});

test('every tooltip and every label has its Italian beside it', () => {
    // A key's label that is only what is printed on its cap is the same in
    // both languages.
    const isName = (label) => /^([0-9A-F]|RUN|DA|AD|RES|HLT|REG)$/.test(label);
    let tooltips = 0;
    for (const tag of tags) {
        if (/class="lang-switch"/.test(tag)) continue;   // worded in the language it leads to
        const title = tag.match(/\stitle="([^"]*)"/);
        if (title) {
            tooltips++;
            assert.match(tag, /\sdata-it-title="[^"]+"/, `the tooltip "${title[1].slice(0, 40)}" has an Italian one`);
        }
        const label = tag.match(/\saria-label="([^"]*)"/);
        if (label && !isName(label[1])) {
            assert.match(tag, /\sdata-it-aria-label="[^"]+"/, `the label "${label[1]}" has an Italian one`);
        }
    }
    assert.ok(tooltips >= 15, `the page's tooltips were found (${tooltips})`);
});

test('the title and the descriptions have their Italian', () => {
    const head = page.slice(0, page.indexOf('</head>'));
    assert.match(head, /<title data-it-text="[^"]+">[^<]+<\/title>/);
    for (const name of ['name="description"', 'property="og:title"', 'property="og:description"',
        'name="twitter:title"', 'name="twitter:description"']) {
        const tag = head.match(new RegExp(`<meta ${name}[^>]*>`));
        assert.ok(tag, `the page has ${name}`);
        assert.match(tag[0], /data-it-content="[^"]+"/, `${name} has an Italian one`);
    }
});

test('the page offers the other language, and each language its own guide', () => {
    const buttons = tags.filter((tag) => /class="lang-switch"/.test(tag));
    assert.equal(buttons.length, 2);
    // Shown on the English page, it leads to Italian and is worded in Italian.
    assert.match(buttons[0], /data-lang="en" data-set-lang="it" data-code="IT" lang="it"/);
    assert.match(buttons[1], /data-lang="it" data-set-lang="en" data-code="EN" lang="en"/);

    const english = [...body.matchAll(/href="guide\.html(#[\w-]+)?"/g)].map((match) => match[1] || '');
    const italian = [...body.matchAll(/href="guida\.html(#[\w-]+)?"/g)].map((match) => match[1] || '');
    assert.ok(english.length > 0, 'the page links to the guide');
    assert.deepEqual(italian, english, 'and to the same places in the Italian guide');
});

test('the words beside the run lamp are there in Italian too', () => {
    for (const [state, word] of [['', 'fermo'], ['.on', 'in esecuzione'], ['.halted', 'bloccato']]) {
        assert.ok(page.includes(`html[lang="it"] .run-lamp${state} + .run-word::after { content: "${word}"; }`),
            `the Italian for the lamp's ${state || 'resting'} state`);
    }
});

// ---------------------------------------------------------------------------
// main.js
// ---------------------------------------------------------------------------

test('main.js takes its words from lang.js', () => {
    // Everything below the debug commands is the console's, which stays in
    // English.
    const pageCode = script.slice(0, script.indexOf('window.debug = {'));
    assert.ok(pageCode.length > 1000);
    assert.ok(!/alert\(\s*['"`]/.test(pageCode), 'no alert with words of its own');
    assert.ok(!/\.(textContent|title)\s*=\s*['"`]\s*[A-Za-z]/.test(pageCode), 'no text or tooltip with words of its own');
    assert.ok(!/setAttribute\(\s*'aria-label'\s*,\s*['"`]/.test(pageCode), 'no label with words of its own');
    for (const key of [...pageCode.matchAll(/AmicoLang\.t\(\s*'([^']+)'/g)].map((match) => match[1])) {
        assert.ok(AmicoLang.STRINGS[key], `main.js asks for ${key}, which lang.js has`);
    }
    const used = new Set([...pageCode.matchAll(/'((?:tape|load|recording|switch|display)\.\w+|run|stop)'/g)].map((match) => match[1]));
    for (const key of Object.keys(AmicoLang.STRINGS)) {
        assert.ok(used.has(key), `${key} is used by main.js`);
    }
});

test('a picture of a part in the handheld layout carries no tooltip in either language', () => {
    assert.match(script, /if \(\/\^data-\(it\|en\)-\/\.test\(name\)\) element\.removeAttribute\(name\);/);
});

// ---------------------------------------------------------------------------
// lang.js against a stand-in for the page
// ---------------------------------------------------------------------------

/** An element with attributes and text, as much of one as lang.js touches. */
function element(attributes, text = '') {
    const store = new Map(Object.entries(attributes));
    const handlers = {};
    return {
        textContent: text,
        hasAttribute: (name) => store.has(name),
        getAttribute: (name) => (store.has(name) ? store.get(name) : null),
        setAttribute: (name, value) => { store.set(name, String(value)); },
        addEventListener: (type, handler) => { handlers[type] = handler; },
        click: () => handlers.click(),
        store
    };
}

/** Load lang.js as a page would, with this address, storage and browser. */
function loadInPage({ search = '', stored = null, languages = ['en-US'], storageWorks = true } = {}) {
    const elements = {
        '[data-it-title]': [element({ title: 'Cold', 'data-it-title': 'Freddo' })],
        '[data-it-aria-label]': [element({ 'aria-label': 'Single step', 'data-it-aria-label': 'Passo singolo' })],
        '[data-it-content]': [element({ content: 'In English', 'data-it-content': 'In italiano' })],
        '[data-it-text]': [element({ 'data-it-text': 'Titolo' }, 'Title')],
        '[data-set-lang]': [element({ 'data-set-lang': 'it' }), element({ 'data-set-lang': 'en' })]
    };
    const storage = new Map(stored === null ? [] : [['amico2000.lang', stored]]);
    const listeners = {};
    const replaced = [];
    const context = {
        URL,
        document: {
            documentElement: { lang: 'en' },
            querySelectorAll: (selector) => elements[selector] || [],
            addEventListener: (type, handler) => { listeners[type] = handler; }
        },
        location: { search, href: `https://example.test/index.html${search}` },
        navigator: { languages, language: languages[0] },
        localStorage: {
            getItem: (key) => { if (!storageWorks) throw new Error('blocked'); return storage.has(key) ? storage.get(key) : null; },
            setItem: (key, value) => { if (!storageWorks) throw new Error('blocked'); storage.set(key, value); }
        },
        history: { state: null, replaceState: (state, title, url) => { replaced.push(String(url)); } }
    };
    vm.createContext(context);
    vm.runInContext(`${langSource}\nthis.AmicoLang = AmicoLang;`, context);
    return { lang: context.AmicoLang, document: context.document, elements, storage, replaced, ready: () => listeners.DOMContentLoaded() };
}

test('in a page, <html lang> is set the moment lang.js is loaded', () => {
    const italian = loadInPage({ languages: ['it-IT', 'it'] });
    assert.equal(italian.document.documentElement.lang, 'it', 'before DOMContentLoaded, for an Italian browser');
    assert.equal(italian.lang.current, 'it');
    assert.equal(italian.storage.size, 0, 'the browser\'s language is not stored as if it were a choice');

    const english = loadInPage({ languages: ['en-GB'] });
    assert.equal(english.document.documentElement.lang, 'en');

    const sent = loadInPage({ search: '?lang=it', languages: ['en-US'] });
    assert.equal(sent.document.documentElement.lang, 'it', 'a link that names a language is obeyed');
    assert.equal(sent.storage.get('amico2000.lang'), 'it', 'and remembered');

    const blocked = loadInPage({ languages: ['it'], storageWorks: false });
    assert.equal(blocked.lang.current, 'it', 'storage that throws leaves the browser\'s language to decide');
});

test('the tooltips, labels and title are swapped, and swapped back', () => {
    const { lang, elements, ready } = loadInPage({ languages: ['it'] });
    const [tooltip] = elements['[data-it-title]'];
    const [label] = elements['[data-it-aria-label]'];
    const [meta] = elements['[data-it-content]'];
    const [title] = elements['[data-it-text]'];
    assert.equal(tooltip.getAttribute('title'), 'Cold', 'nothing is touched before the page is read');
    ready();
    assert.equal(tooltip.getAttribute('title'), 'Freddo');
    assert.equal(label.getAttribute('aria-label'), 'Passo singolo');
    assert.equal(meta.getAttribute('content'), 'In italiano');
    assert.equal(title.textContent, 'Titolo');

    lang.set('en');
    assert.equal(tooltip.getAttribute('title'), 'Cold', 'the English comes back, from where it was kept');
    assert.equal(label.getAttribute('aria-label'), 'Single step');
    assert.equal(meta.getAttribute('content'), 'In English');
    assert.equal(title.textContent, 'Title');

    lang.set('it');
    assert.equal(tooltip.getAttribute('title'), 'Freddo', 'and the Italian again');
    assert.equal(title.textContent, 'Titolo');
});

test('choosing a language changes the page where it stands, is remembered, and is told to main.js', () => {
    const { lang, document, elements, storage, replaced, ready } = loadInPage({ languages: ['en-US'] });
    ready();
    const heard = [];
    lang.onChange((language) => heard.push(language));

    const [toItalian, toEnglish] = elements['[data-set-lang]'];
    toItalian.click();
    assert.equal(document.documentElement.lang, 'it');
    assert.equal(lang.current, 'it');
    assert.equal(storage.get('amico2000.lang'), 'it');
    assert.deepEqual(heard, ['it']);
    assert.deepEqual(replaced, [], 'an address that names no language is left alone');

    toItalian.click();
    assert.deepEqual(heard, ['it'], 'asking for the language it is already in does nothing');
    lang.set('fr');
    assert.equal(lang.current, 'it', 'nor does asking for one the page lacks');

    toEnglish.click();
    assert.equal(document.documentElement.lang, 'en');
    assert.deepEqual(heard, ['it', 'en']);
});

test('an address that names a language is rewritten when the language changes', () => {
    const { lang, replaced, ready } = loadInPage({ search: '?lang=it' });
    ready();
    lang.set('en');
    assert.deepEqual(replaced, ['https://example.test/index.html?lang=en'],
        'or a reload would bring the old language back');
});
