'use strict';

// Issue #20: reading and writing cassette tapes as sound.
//
// No recording of a real AMICO 2000 tape was available when tape-audio.js was
// written, so these checks do not compare it with one. They hold it to the
// cassette PROM instead, which is what defines the format:
//
// - the bytes and the pulse timing the codec writes are compared with what the
//   real SAVE routine does when the emulated CPU runs it;
// - a WAV file the codec writes is played to the real LOAD routine, which has
//   to load it;
// - the signal the real SAVE routine produces is given to the decoder, which
//   has to read it, and to read it as the real LOAD routine would.
//
// The rest is the decoder against the things a tape deck does to a signal.
// Those are simulated, and a simulation is only as good as its guesses: the
// first real recording may still need the pulse detector adjusted.

const test = require('node:test');
const assert = require('node:assert/strict');

const { AmicoTapeAudio } = require('../tape-audio');
const { realSave, realLoad } = require('./helpers/cassette-signal');

const { TIMING } = AmicoTapeAudio;
const RATE = 44100;
// realLoad() fills RAM with this, so test data must not contain it.
const FILLER = 0xEE;

/** Deterministic noise, so a failure can be reproduced. */
function random(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function program(length, seed = 1) {
    const next = random(seed);
    return Uint8Array.from({ length }, () => {
        const value = Math.floor(next() * 256);
        return value === FILLER ? 0x11 : value;
    });
}

/** When a list of [cycle, level] edges holds the given level, as intervals. */
function intervalsAtLevel(edges, level, fromCycle = 0) {
    const intervals = [];
    for (let i = 0; i + 1 < edges.length; i++) {
        if (edges[i][1] === level && edges[i + 1][0] > fromCycle) {
            intervals.push([Math.max(0, edges[i][0] - fromCycle), edges[i + 1][0] - fromCycle]);
        }
    }
    return intervals;
}

/**
 * When a sampled signal would set the board's latch: wherever it swings past
 * a third of full scale in the direction `sign`. Which direction the real
 * amplifier answers to depends on the recorder, so both are tried.
 */
function intervalsFromSamples(samples, sampleRate, sign, fromSeconds = 0) {
    const intervals = [];
    const cycle = (n) => (n / sampleRate - fromSeconds) * 1e6;
    for (let n = Math.ceil(fromSeconds * sampleRate); n < samples.length; n++) {
        if (sign * samples[n] <= 0.33) continue;
        const first = n;
        while (n < samples.length && sign * samples[n] > 0.33) n++;
        intervals.push([cycle(first), cycle(n)]);
    }
    return intervals;
}

/**
 * The real SAVE routine's output as samples, drawn without tape-audio.js: the
 * level at each sample instant, with the line at level 0, where the monitor
 * leaves it, before and after.
 */
function samplesFromEdges(edges, totalCycles, sampleRate = RATE, leadIn = 0.3) {
    const count = Math.ceil((leadIn + totalCycles / 1e6 + leadIn) * sampleRate);
    const samples = new Float32Array(count).fill(-0.5);
    let edge = 0;
    for (let n = Math.floor(leadIn * sampleRate); n < count; n++) {
        const cycle = (n / sampleRate - leadIn) * 1e6;
        if (cycle > totalCycles) break;
        while (edge + 1 < edges.length && edges[edge + 1][0] <= cycle) edge++;
        samples[n] = (edges[edge][1] - 1) * 0.5;
    }
    return samples;
}

/** A WAV file in any of the encodings the parser accepts. */
function wavFile(channels, sampleRate, { bits = 16, float = false } = {}) {
    const frames = channels[0].length;
    const width = bits / 8;
    const wav = new Uint8Array(44 + frames * width * channels.length);
    const view = new DataView(wav.buffer);
    const tag = (offset, text) => [...text].forEach((c, i) => { wav[offset + i] = c.charCodeAt(0); });
    tag(0, 'RIFF');
    view.setUint32(4, wav.length - 8, true);
    tag(8, 'WAVE');
    tag(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, float ? 3 : 1, true);
    view.setUint16(22, channels.length, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * width * channels.length, true);
    view.setUint16(32, width * channels.length, true);
    view.setUint16(34, bits, true);
    tag(36, 'data');
    view.setUint32(40, frames * width * channels.length, true);
    let at = 44;
    for (let i = 0; i < frames; i++) {
        for (const channel of channels) {
            const value = Math.max(-1, Math.min(1, channel[i]));
            if (float) view.setFloat32(at, value, true);
            else if (bits === 8) wav[at] = Math.round(value * 127) + 128;
            else if (bits === 16) view.setInt16(at, Math.round(value * 32767), true);
            else if (bits === 24) {
                const n = Math.round(value * 8388607);
                wav[at] = n & 0xFF;
                wav[at + 1] = (n >> 8) & 0xFF;
                wav[at + 2] = (n >> 16) & 0xFF;
            }
            at += width;
        }
    }
    return wav;
}

// The real routines are slow to emulate, about a third of a second for each
// run, so every check that needs the same run shares it.
const saves = new Map();
function savedByTheBoard(start, length, options = {}) {
    const key = JSON.stringify([start, length, options]);
    if (!saves.has(key)) {
        const data = program(length, length);
        saves.set(key, { data, ...realSave({ id: 0x13, start, data, ...options }) });
    }
    return saves.get(key);
}

const sameBytes = (actual, expected, message = 'the bytes differ') =>
    assert.deepEqual(Array.from(actual), Array.from(expected), message);

// =============================================================================
// The codec against the real SAVE routine
// =============================================================================

test('the codec puts on tape the bytes the real SAVE routine sends (#20)', () => {
    // One short block with its trailer, to see the whole record once.
    const whole = savedByTheBoard(0x0200, 16);
    sameBytes(AmicoTapeAudio.recordToTapeBytes({ id: 0x13, start: 0x0200, data: whole.data }), whole.bytes);
    assert.equal(whole.bytes.length, 256 + 1 + 5 + 16 + 1 + 256);

    // The others without it: the lengths either side of a page boundary, where
    // the order the bytes go out in changes, and one that runs to three pages.
    for (const length of [2, 255, 256, 257, 258, 700]) {
        const { data, bytes } = savedByTheBoard(0x0200, length, { trailer: false });
        const ours = AmicoTapeAudio.recordToTapeBytes({ id: 0x13, start: 0x0200, data });
        sameBytes(ours.subarray(0, ours.length - 256), bytes, `a block of ${length} bytes`);
        assert.ok(ours.subarray(ours.length - 256).every((value) => value === 0), 'the trailer is zeros');
    }
});

test('a block one byte longer than whole pages loses its last byte on the board, and the codec says so (#20)', () => {
    // Read from the PROM listing and confirmed here by running it: with the
    // count's low byte zero, SAVE's last byte comes from a page too low.
    const { data, bytes } = savedByTheBoard(0x0200, 257, { trailer: false });
    const text = bytes.slice(256 + 1 + 5, -1);
    assert.equal(text.length, 257);
    assert.equal(text[256], data[0], 'the last byte sent is the first byte of the block again');
    assert.equal(AmicoTapeAudio.bytesKept(257), 256);
    assert.equal(AmicoTapeAudio.bytesKept(256), 256);
    assert.equal(AmicoTapeAudio.bytesKept(258), 258);
    assert.equal(AmicoTapeAudio.bytesKept(513), 512);

    // A single byte is the same case with no page above it: the board sends
    // the byte 256 below the one asked for. A record does not hold that byte,
    // so the codec refuses rather than send something made up.
    const below = savedByTheBoard(0x0300, 1, { memory: [[0x0200, [0x5A]]], trailer: false });
    assert.equal(below.bytes[256 + 1 + 5], 0x5A);
    assert.equal(AmicoTapeAudio.bytesKept(1), 0);
    assert.throws(
        () => AmicoTapeAudio.recordToTapeBytes({ id: 1, start: 0x0300, data: [0x77] }),
        /cannot record a block of 1 byte/
    );
});

test('the codec times its pulses as the real SAVE routine does (#20)', () => {
    const { data, edges } = savedByTheBoard(0x0200, 16);

    // A pulse is the line low for 87 cycles and then high for 87. The first
    // pulse's low half does not show, because the line starts low.
    const lows = intervalsAtLevel(edges, 0).slice(1);
    const highs = intervalsAtLevel(edges, 2);
    assert.ok(lows.every(([from, to]) => to - from === 87), 'every low half is 87 cycles');
    assert.ok(highs.every(([from, to]) => to - from === 87), 'every high half is 87 cycles');
    assert.equal(TIMING.halfPulse, 87e-6);

    // Compare the middles of the pulses, which every pulse shows. The routine
    // is not perfectly regular and the codec is, so the gaps between pulses
    // agree to within 40 microseconds, about 1%, and the whole record to a
    // quarter of a percent.
    const theirs = highs.map(([from]) => from / 1e6);
    const ours = Array.from(
        AmicoTapeAudio.tapeBytesToPulseTimes(AmicoTapeAudio.recordToTapeBytes({ id: 0x13, start: 0x0200, data })),
        (time) => time + TIMING.halfPulse
    );
    assert.equal(ours.length, theirs.length, 'the same number of pulses');
    for (let i = 1; i < ours.length; i++) {
        const difference = (ours[i] - ours[i - 1]) - (theirs[i] - theirs[i - 1]);
        assert.ok(Math.abs(difference) <= 40e-6,
            `gap before pulse ${i} differs by ${(difference * 1e6).toFixed(0)} microseconds`);
    }
    const length = (times) => times[times.length - 1] - times[0];
    assert.ok(Math.abs(length(ours) / length(theirs) - 1) < 0.0025, 'the record is the same length');
});

// =============================================================================
// The codec against the real LOAD routine
// =============================================================================

test('the real LOAD routine loads a WAV file the codec wrote (#20)', () => {
    const data = program(40, 7);
    const record = { id: 0x13, start: 0x0210, data };
    // The leader is six seconds of nothing but zeros. Playing the routine the
    // last second of it is enough, and saves emulating the rest.
    const from = 5.5;

    for (const sampleRate of [44100, 48000]) {
        const wav = AmicoTapeAudio.parseWav(AmicoTapeAudio.encodeWav(record, { sampleRate }));
        const samples = wav.channel(0);
        for (const sign of [-1, 1]) {
            const what = `${sampleRate} Hz, ${sign < 0 ? 'low' : 'high'} half sets the latch`;
            const loaded = realLoad(intervalsFromSamples(samples, sampleRate, sign, from), { id: 0x13 });
            assert.ok(loaded.done, `${what}: the routine must finish`);
            assert.notEqual(loaded.status, 0xFF, `${what}: no checksum error`);
            sameBytes(loaded.memory.slice(0x0210, 0x0210 + 40), data, what);
            assert.equal(loaded.memory[0x020F], FILLER, `${what}: nothing stored below the block`);
            assert.equal(loaded.memory[0x0210 + 40], FILLER, `${what}: nothing stored above the block`);
        }
    }

    // And where the user asks for it rather than where the tape says.
    const samples = AmicoTapeAudio.parseWav(AmicoTapeAudio.encodeWav(record)).channel(0);
    const moved = realLoad(intervalsFromSamples(samples, RATE, -1, from), { id: 0x13, at: 0x0500 });
    assert.ok(moved.done);
    sameBytes(moved.memory.slice(0x0500, 0x0500 + 40), data, 'loaded at $0500');
    assert.equal(moved.memory[0x0210], FILLER, 'and not at the recorded address');
});

// =============================================================================
// The decoder against the real SAVE routine
// =============================================================================

test('the decoder reads the signal the real SAVE routine produces (#20)', () => {
    for (const [length, options] of [[2, { trailer: false }], [16, {}], [258, { trailer: false }], [700, { trailer: false }]]) {
        const { data, edges, cycles } = savedByTheBoard(0x0200, length, options);
        const wav = AmicoTapeAudio.samplesToWav(samplesFromEdges(edges, cycles), RATE);
        const { records, problems } = AmicoTapeAudio.decodeWav(wav);
        assert.deepEqual(problems, [], `a block of ${length} bytes`);
        assert.equal(records.length, 1, `a block of ${length} bytes`);
        assert.equal(records[0].id, 0x13);
        assert.equal(records[0].start, 0x0200);
        assert.equal(records[0].note, undefined);
        sameBytes(records[0].data, data, `a block of ${length} bytes`);
    }
});

test('the decoder reads an odd-length block the way the real LOAD routine stores it (#20)', () => {
    // 257 bytes: the tape carries 257, of which the last is the first again.
    // LOAD stores it over the first, and never touches the 257th address.
    const { data, edges, cycles } = savedByTheBoard(0x0200, 257, { trailer: false });
    const { records, problems } = AmicoTapeAudio.decodeWav(
        AmicoTapeAudio.samplesToWav(samplesFromEdges(edges, cycles), RATE));
    assert.deepEqual(problems, []);
    assert.equal(records.length, 1);
    assert.equal(records[0].start, 0x0200);
    sameBytes(records[0].data, data.subarray(0, 256), 'the first 256 bytes');
    assert.match(records[0].note, /do not record the last byte/);

    // The real routine, given the same signal from five seconds in.
    const loaded = realLoad(intervalsAtLevel(edges, 0, 5000000), { id: 0x13 });
    assert.ok(loaded.done);
    sameBytes(loaded.memory.slice(0x0200, 0x0300), records[0].data, 'what LOAD stored is what the decoder returned');
    assert.equal(loaded.memory[0x0300], FILLER, 'LOAD stored nothing at the 257th address');

    // One byte: the tape says $0300, and the byte belongs 256 below.
    const one = savedByTheBoard(0x0300, 1, { memory: [[0x0200, [0x5A]]], trailer: false });
    const decoded = AmicoTapeAudio.decodeWav(
        AmicoTapeAudio.samplesToWav(samplesFromEdges(one.edges, one.cycles), RATE));
    assert.deepEqual(decoded.problems, []);
    assert.equal(decoded.records[0].start, 0x0200);
    sameBytes(decoded.records[0].data, [0x5A]);
    assert.match(decoded.records[0].note, /256 below/);
});

// =============================================================================
// The decoder against what a tape deck does
// =============================================================================

const RECORD = { id: 0x2A, start: 0x0200, data: program(300, 42) };
let cleanSamples = null;
function clean() {
    if (!cleanSamples) cleanSamples = AmicoTapeAudio.parseWav(AmicoTapeAudio.encodeWav(RECORD)).channel(0);
    return cleanSamples;
}

function assertReads(wav, what, record = RECORD) {
    const { records, problems } = AmicoTapeAudio.decodeWav(wav);
    assert.deepEqual(problems, [], what);
    assert.equal(records.length, 1, `${what}: one block`);
    assert.equal(records[0].id, record.id, what);
    assert.equal(records[0].start, record.start, what);
    sameBytes(records[0].data, record.data, what);
}

/** One-pole low-pass and high-pass filters, enough to round a pulse off. */
function lowPass(samples, cutoff, sampleRate = RATE) {
    const k = 1 - Math.exp(-2 * Math.PI * cutoff / sampleRate);
    const out = new Float32Array(samples.length);
    let y = 0;
    for (let i = 0; i < samples.length; i++) {
        y += k * (samples[i] - y);
        out[i] = y;
    }
    return out;
}
const highPass = (samples, cutoff) => {
    const low = lowPass(samples, cutoff);
    return samples.map((value, i) => value - low[i]);
};
const bandLimited = (samples) => highPass(lowPass(lowPass(samples, 4000), 4000), 300);
const withHum = (samples) => samples.map(
    (value, i) => 0.4 * value + 0.3 * Math.sin(2 * Math.PI * 50 * i / RATE) + 0.15);
function withHiss(samples, level, seed = 3) {
    const next = random(seed);
    return samples.map((value) => value + level * (next() + next() + next() - 1.5));
}
/** Play the tape at a speed that wanders: `depth` either way, `rate` times a second. */
function withWow(samples, depth, rate) {
    const out = new Float32Array(samples.length);
    let position = 0;
    for (let i = 0; i < out.length && position < samples.length - 1; i++) {
        const whole = Math.floor(position);
        out[i] = samples[whole] + (position - whole) * (samples[whole + 1] - samples[whole]);
        position += 1 + depth * Math.sin(2 * Math.PI * rate * i / RATE);
    }
    return out;
}

test('the decoder reads its own WAV file back, at several sample rates and encodings (#20)', () => {
    for (const sampleRate of [22050, 44100, 48000, 96000]) {
        assertReads(AmicoTapeAudio.encodeWav(RECORD, { sampleRate }), `${sampleRate} Hz`);
    }
    assertReads(wavFile([clean()], RATE, { bits: 8 }), '8-bit');
    assertReads(wavFile([clean()], RATE, { bits: 24 }), '24-bit');
    assertReads(wavFile([clean()], RATE, { bits: 32, float: true }), '32-bit float');

    // A stereo recording with the tape on one side only and hum on the other.
    const hum = clean().map((value, i) => 0.5 * Math.sin(2 * Math.PI * 50 * i / RATE));
    assertReads(wavFile([hum, clean()], RATE), 'stereo, tape on the right');
    assertReads(wavFile([clean(), hum], RATE), 'stereo, tape on the left');
});

test('the decoder reads a signal a tape deck has been at (#20)', () => {
    const cases = {
        'upside down': clean().map((value) => -value),
        'very quiet': clean().map((value) => 0.02 * value),
        'band-limited to 300 Hz - 4 kHz': bandLimited(clean()),
        'over mains hum and an offset': withHum(clean()),
        'over hiss': withHiss(clean(), 0.06),
        'with wow of 2%': withWow(clean(), 0.02, 0.8),
        'all of those at once': withHiss(withHum(bandLimited(withWow(clean(), 0.02, 0.8))), 0.01)
            .map((value) => -value)
    };
    for (const [what, samples] of Object.entries(cases)) {
        assertReads(wavFile([samples], RATE), what);
    }

    // A deck running fast or slow: the same samples, played at another rate.
    for (const speed of [0.85, 0.94, 1.06, 1.15, 1.3]) {
        assertReads(wavFile([clean()], Math.round(RATE * speed)), `tape speed x${speed}`);
    }
});

test('the decoder reads every program on a tape and says where each is (#20)', () => {
    const second = { id: 0x07, start: 0x0400, data: program(33, 9) };
    const a = clean();
    const b = AmicoTapeAudio.parseWav(AmicoTapeAudio.encodeWav(second)).channel(0);
    const tape = new Float32Array(a.length + b.length);
    tape.set(a, 0);
    tape.set(b, a.length);

    const { records, problems } = AmicoTapeAudio.decodeWav(wavFile([tape], RATE));
    assert.deepEqual(problems, []);
    assert.deepEqual(records.map((record) => record.id), [0x2A, 0x07]);
    sameBytes(records[0].data, RECORD.data);
    sameBytes(records[1].data, second.data);
    assert.equal(records[1].start, 0x0400);

    // Each start byte follows half a second of silence and a leader of 256
    // bytes, about 6.2 seconds.
    const leader = 0.5 + 256 * (8 * TIMING.bitCell + TIMING.byteGap);
    assert.ok(Math.abs(records[0].time - leader) < 0.01, `first block at ${records[0].time}`);
    assert.ok(Math.abs(records[1].time - (a.length / RATE + leader)) < 0.01, `second block at ${records[1].time}`);
});

test('the decoder reads a recording that was started late (#20)', () => {
    // Six seconds in, with a quarter of a second of leader left.
    assertReads(wavFile([clean().subarray(Math.round(6.0 * RATE))], RATE), 'started late');
});

// =============================================================================
// Recordings that cannot be read
// =============================================================================

test('a damaged block is reported and the next one is still read (#20)', () => {
    const second = { id: 0x07, start: 0x0400, data: program(33, 9) };
    const b = AmicoTapeAudio.parseWav(AmicoTapeAudio.encodeWav(second)).channel(0);

    // A dropout of a fifth of a second in the middle of the first program.
    const dropout = Float32Array.from(clean());
    dropout.fill(0, Math.round(9.0 * RATE), Math.round(9.2 * RATE));
    let tape = new Float32Array(dropout.length + b.length);
    tape.set(dropout, 0);
    tape.set(b, dropout.length);
    let result = AmicoTapeAudio.decodeWav(wavFile([tape], RATE));
    assert.deepEqual(result.records.map((record) => record.id), [0x07]);
    assert.equal(result.problems.length, 1);
    assert.match(result.problems[0], /^Program 2A at 6\.\d s: the recording breaks off after \d+ of 300 bytes$/);

    // One pulse missing from the text, so that a 1 is read as a 0: every byte
    // is still there, and one of them is wrong.
    const pulses = AmicoTapeAudio.tapeBytesToPulseTimes(AmicoTapeAudio.recordToTapeBytes(RECORD), 0.5);
    const textStarts = 0.5 + (256 + 1 + 5) * (8 * TIMING.bitCell + TIMING.byteGap);
    // A 1's second pulse is the only kind that follows another by this much.
    const victim = pulses.findIndex((time, i) =>
        time > textStarts && Math.abs(time - pulses[i - 1] - TIMING.dataPulseAt) < 1e-6);
    assert.ok(victim > 0, 'the text must hold a 1 bit to spoil');
    const flipped = Float32Array.from(clean());
    flipped.fill(0, Math.floor((pulses[victim] - 1e-4) * RATE), Math.ceil((pulses[victim] + 3e-4) * RATE));
    tape = new Float32Array(flipped.length + b.length);
    tape.set(flipped, 0);
    tape.set(b, flipped.length);
    result = AmicoTapeAudio.decodeWav(wavFile([tape], RATE));
    assert.deepEqual(result.records.map((record) => record.id), [0x07]);
    assert.equal(result.problems.length, 1);
    assert.match(result.problems[0], /^Program 2A at 6\.\d s: checksum mismatch, the tape says \$[0-9A-F]{2} and its bytes add up to \$[0-9A-F]{2}$/);
});

test('a damaged length cannot hide the programs that follow it (PR #47)', () => {
    // A block is as long as its own count says. Spoil the count's high byte
    // to $20 and a two-byte block claims 8194, which runs through its
    // trailer, the next program's leader and the next program itself before
    // the recording gives out. The decoder used to carry on from wherever
    // that left it, at the end, and so returned nothing at all, though the
    // second program reads perfectly well by itself. Found by review.
    const first = AmicoTapeAudio.recordToTapeBytes({ id: 0x11, start: 0x0200, data: [1, 2] });
    const second = AmicoTapeAudio.recordToTapeBytes({ id: 0x22, start: 0x0300, data: [3, 4] });
    const countHigh = 256 + 1 + 4;
    first[countHigh] = 0x20;

    // Back to back, with no silence between them to break the reading off.
    const tape = new Uint8Array(first.length + second.length);
    tape.set(first, 0);
    tape.set(second, first.length);
    const { records, problems } = AmicoTapeAudio.decodePulses(AmicoTapeAudio.tapeBytesToPulseTimes(tape, 0.5));

    assert.equal(problems.length, 1);
    assert.match(problems[0], /^Program 11 at 6\.\d s: the recording breaks off after \d+ of 8194 bytes$/);
    assert.deepEqual(records.map((record) => record.id), [0x22], 'the program after the damage is still read');
    assert.equal(records[0].start, 0x0300);
    sameBytes(records[0].data, [3, 4]);

    // The same when the damage claims a length that does fit: the block then
    // fails its checksum instead, and the search resumes from the same place.
    first[countHigh] = 0x01;
    tape.set(first, 0);
    const again = AmicoTapeAudio.decodePulses(AmicoTapeAudio.tapeBytesToPulseTimes(tape, 0.5));
    assert.equal(again.problems.length, 1);
    assert.match(again.problems[0], /^Program 11 at 6\.\d s: checksum mismatch/);
    assert.deepEqual(again.records.map((record) => record.id), [0x22]);
});

test('a recording that stops early, or holds no tape at all, is reported as such (#20)', () => {
    const cut = AmicoTapeAudio.decodeWav(wavFile([clean().subarray(0, Math.round(8.0 * RATE))], RATE));
    assert.deepEqual(cut.records, []);
    assert.equal(cut.problems.length, 1);
    assert.match(cut.problems[0], /^Program 2A at 6\.\d s: the recording breaks off after \d+ of 300 bytes$/);

    const silence = AmicoTapeAudio.decodeWav(wavFile([new Float32Array(RATE)], RATE));
    assert.deepEqual(silence.records, []);
    assert.deepEqual(silence.problems, []);
    assert.equal(silence.duration, 1);
    assert.equal(silence.sampleRate, RATE);

    const hiss = AmicoTapeAudio.decodeWav(wavFile([withHiss(new Float32Array(2 * RATE), 0.2)], RATE));
    assert.deepEqual(hiss.records, []);
    assert.deepEqual(hiss.problems, []);
});

test('files that are not uncompressed WAV are refused with a reason (#20)', () => {
    assert.throws(() => AmicoTapeAudio.decodeWav(new Uint8Array(100)), /Not a WAV file/);
    assert.throws(() => AmicoTapeAudio.decodeWav(Uint8Array.from([0x52, 0x49])), /Not a WAV file/);

    // Format tag 85 is MPEG layer 3 inside a WAV wrapper.
    const mp3 = wavFile([new Float32Array(10)], RATE);
    new DataView(mp3.buffer).setUint16(20, 85, true);
    assert.throws(() => AmicoTapeAudio.decodeWav(mp3), /Unsupported WAV encoding \(format 85, 16 bits\)/);

    const noData = wavFile([new Float32Array(10)], RATE).subarray(0, 36);
    assert.throws(() => AmicoTapeAudio.decodeWav(noData), /no format or no sound data/);
});
