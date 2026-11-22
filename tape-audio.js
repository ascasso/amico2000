/**
 * =============================================================================
 * AMICO 2000 Cassette Sound Codec
 * =============================================================================
 *
 * Turns a tape record into the sound the board's cassette interface puts on
 * tape, and a recording of such a tape back into records (#20).
 *
 * Nothing here is taken from a recording: none was available. The format is
 * read from the two things that define it, the cassette PROM (IC10) and the
 * supplement's schematic of the interface (page 28), and the tests hold this
 * file to the PROM itself, by running the real SAVE and LOAD routines in the
 * emulator. tests/tape-audio.test.js is where each statement below is checked.
 *
 * The signal. The recorder's microphone input hangs on Port B bits 5 and 6
 * through R39 and R40 into R41, so it has three levels. SAVE rests it on the
 * middle one and sends pulses: both lines low for 87 microseconds, both high
 * for 87, back to rest. Every bit cell, about 3 ms long, begins with a pulse.
 * A 1 has a second pulse half way through the cell; a 0 has none. Bytes go
 * most significant bit first, with no start or stop bits.
 *
 * The other way, the recorder's speaker output goes through an LM358 (IC19)
 * and a Schmitt gate to set a latch made of two gates of IC20. LOAD reads the
 * latch on Port A bit 7 and clears it with Port B bit 0. It waits for a pulse,
 * clears the latch, waits about 2.4 ms and looks whether a second pulse came.
 * Only when pulses arrive matters, not their height or shape, and the decoder
 * here works the same way.
 *
 * This file knows nothing about the page or the machine. It is plain functions
 * over bytes and samples, so Node can test all of it. The one thing with a
 * state of its own is the recorder at the end, which the machine layer can be
 * given so that the real routines have a tape to work on.
 *
 * Author: Andrea Scasso / Claude
 * License: MIT
 * Date: November 2026
 *
 * =============================================================================
 */

// One object, because the browser scripts share a single global scope.
const AmicoTapeAudio = (() => {
    // Times in seconds, counted in CPU cycles at 1 MHz on the real SAVE routine
    // as the emulator runs it. The routine is not perfectly regular: a cell is
    // 3008 to 3010 cycles and the gap between bytes depends on which loop is
    // sending them, 28 cycles in the leader and 56 in the header and the text.
    // One value for each is well inside what LOAD accepts.
    const TIMING = {
        halfPulse: 87e-6,      // each half of a pulse: $FB5A's two delay loops
        dataPulseAt: 1491e-6,  // from the start of a cell to a 1's second pulse
        bitCell: 3009e-6,      // from the start of one cell to the next
        byteGap: 56e-6         // extra time after the eighth bit of a byte
    };

    // Leader and trailer are 256 zero bytes each ($FBAE), and the byte that
    // ends the leader is $A5 ($FBF0). LOAD shifts bits in until it sees it.
    const LEADER_BYTES = 256;
    const START_BYTE = 0xA5;

    const hex = (value, digits = 2) => value.toString(16).toUpperCase().padStart(digits, '0');

    // =========================================================================
    // The record, as bytes on tape
    // =========================================================================

    /**
     * The order in which the PROM sends, and stores, the bytes of a block.
     *
     * `count` is the 16-bit number in the tape header, the end address minus
     * the start address. The result lists, for each byte on tape in turn, its
     * offset from the block's address.
     *
     * This is the loop at $FC13-$FC38 in SAVE and its twin at $FCA6-$FCDA in
     * LOAD, step for step, because the order is not the obvious one and has
     * two surprises. The routines count Y down to zero, so a full page goes
     * out as offset 0 and then $FF down to 1, and the last, partial page from
     * its top down to 1 and then 0. That much is harmless.
     *
     * The first surprise: when the count's low byte is zero, that is when the
     * block is 1 byte longer than a whole number of pages, the last byte is
     * taken from one page too low. The DEC $E9 at $FC36 is there to undo the
     * INC $E9 that ends a page, and on this path no page has just ended. So a
     * 257-byte block sends its first byte twice and never sends its last, and
     * a 1-byte block sends the byte 256 below it instead, which shows here as
     * an offset of -256. LOAD stores the byte at the same wrong place, and the
     * checksum agrees on both sides, so nothing reports it.
     *
     * The second: DEC $EB / BMI at $FC2C treats a page count of $81 or more as
     * finished after the first page. No block on a 2KB board is that long.
     */
    function blockOffsets(count) {
        const low = count & 0xFF;          // $EA
        let pagesLeft = (count >> 8) & 0xFF;   // $EB
        let page = 0;                      // how far $E9 has been stepped
        const offsets = [];

        let y = 0;
        let sendPages = true;
        if (pagesLeft === 0) {
            y = low;                       // $FC32: LDY $EA
            sendPages = y !== 0;
        }
        while (sendPages) {
            do {
                offsets.push(page * 256 + y);
                y = (y - 1) & 0xFF;
            } while (y !== 0);
            page++;
            pagesLeft = (pagesLeft - 1) & 0xFF;
            if (pagesLeft & 0x80) break;   // BMI: the partial page is done
            if (pagesLeft !== 0) continue; // another full page, from Y = 0
            y = low;
            if (y === 0) break;
        }
        page--;                            // $FC36: DEC $E9
        offsets.push(page * 256);
        return offsets;
    }

    /**
     * How many bytes of a block of `length` bytes come back from a SAVE and a
     * LOAD on the real board. Less than `length` only in the cases
     * blockOffsets() describes.
     */
    function bytesKept(length) {
        const seen = new Set(blockOffsets(length - 1).filter((offset) => offset >= 0));
        return seen.size;
    }

    /**
     * Every byte SAVE sends for a record, leader and trailer included.
     *
     * @param {{id: number, start: number, data: Uint8Array|number[]}} record
     * @returns {Uint8Array}
     */
    function recordToTapeBytes(record) {
        const data = record.data;
        const length = data.length;
        if (length < 1 || length > 0x10000) {
            throw new Error(`A tape block holds 1 to 65536 bytes, not ${length}`);
        }
        const count = length - 1;
        const header = [
            record.id & 0xFF,
            record.start & 0xFF, (record.start >> 8) & 0xFF,
            count & 0xFF, (count >> 8) & 0xFF
        ];
        const offsets = blockOffsets(count);
        const bytes = new Uint8Array(LEADER_BYTES + 1 + header.length + offsets.length + 1 + LEADER_BYTES);
        let at = LEADER_BYTES;
        let checksum = 0;
        const send = (value) => {
            bytes[at++] = value;
            checksum = (checksum + value) & 0xFF;
        };
        send(START_BYTE);
        header.forEach(send);
        for (const offset of offsets) {
            if (offset < 0 || offset >= length) {
                // Only a 1-byte block gets here. The board would send whatever
                // sits 256 bytes below it, which a record does not hold.
                throw new Error(
                    'The AMICO 2000 SAVE routine cannot record a block of 1 byte: ' +
                    'it sends the byte 256 below it instead'
                );
            }
            send(data[offset]);
        }
        bytes[at] = checksum;
        return bytes;
    }

    // =========================================================================
    // Bytes to sound
    // =========================================================================

    /**
     * When each pulse starts, in seconds, for a run of tape bytes.
     */
    function tapeBytesToPulseTimes(bytes, startTime = 0) {
        const times = [];
        let cell = startTime;
        for (const value of bytes) {
            for (let bit = 7; bit >= 0; bit--) {
                times.push(cell);
                if ((value >> bit) & 1) times.push(cell + TIMING.dataPulseAt);
                cell += TIMING.bitCell;
            }
            cell += TIMING.byteGap;
        }
        return Float64Array.from(times);
    }

    /**
     * Draw pulses as samples between -1 and 1: rest at 0, the low half of a
     * pulse at -level and the high half at +level.
     *
     * A half pulse is under four samples at 44.1 kHz, so a pulse that merely
     * switched on the nearest sample would start up to a sample early or late.
     * Each sample is instead the average of the signal across its own
     * interval, which keeps the timing exact to a fraction of a sample.
     */
    function renderPulses(times, sampleRate, sampleCount, level = 0.8) {
        const samples = new Float32Array(sampleCount);
        const paint = (from, to, value) => {
            const first = Math.max(0, Math.floor(from * sampleRate));
            const last = Math.min(sampleCount - 1, Math.floor(to * sampleRate));
            for (let n = first; n <= last; n++) {
                const overlap = Math.min(to, (n + 1) / sampleRate) - Math.max(from, n / sampleRate);
                if (overlap > 0) samples[n] += value * overlap * sampleRate;
            }
        };
        for (const time of times) {
            paint(time, time + TIMING.halfPulse, -level);
            paint(time + TIMING.halfPulse, time + 2 * TIMING.halfPulse, level);
        }
        return samples;
    }

    /**
     * Wrap samples between -1 and 1 as a 16-bit mono WAV file.
     */
    function samplesToWav(samples, sampleRate) {
        const wav = new Uint8Array(44 + samples.length * 2);
        const view = new DataView(wav.buffer);
        const tag = (offset, text) => {
            for (let i = 0; i < text.length; i++) wav[offset + i] = text.charCodeAt(i);
        };
        tag(0, 'RIFF');
        view.setUint32(4, wav.length - 8, true);
        tag(8, 'WAVE');
        tag(12, 'fmt ');
        view.setUint32(16, 16, true);              // size of the format chunk
        view.setUint16(20, 1, true);               // PCM
        view.setUint16(22, 1, true);               // one channel
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);  // bytes per second
        view.setUint16(32, 2, true);               // bytes per frame
        view.setUint16(34, 16, true);              // bits per sample
        tag(36, 'data');
        view.setUint32(40, samples.length * 2, true);
        for (let i = 0; i < samples.length; i++) {
            const clipped = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(44 + i * 2, Math.round(clipped * 32767), true);
        }
        return wav;
    }

    /**
     * The sound of one record: what SAVE would put on tape for it, as a WAV
     * file with half a second of silence at each end.
     *
     * @param {{id: number, start: number, data: Uint8Array|number[]}} record
     * @param {{sampleRate?: number}} [options]
     * @returns {Uint8Array}
     */
    function encodeWav(record, options = {}) {
        const sampleRate = options.sampleRate || 44100;
        const silence = 0.5;
        const times = tapeBytesToPulseTimes(recordToTapeBytes(record), silence);
        const duration = times[times.length - 1] + TIMING.bitCell + silence;
        const samples = renderPulses(times, sampleRate, Math.ceil(duration * sampleRate));
        return samplesToWav(samples, sampleRate);
    }

    // =========================================================================
    // Sound to bytes
    // =========================================================================

    /**
     * Read the header of a WAV file. `channel(n)` then returns one channel's
     * samples between -1 and 1; they are converted only when asked for, so a
     * stereo file never has both channels in memory as floats at once.
     */
    function parseWav(input) {
        const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const tagAt = (offset) => String.fromCharCode(...bytes.subarray(offset, offset + 4));
        if (bytes.length < 12 || tagAt(0) !== 'RIFF' || tagAt(8) !== 'WAVE') {
            throw new Error('Not a WAV file');
        }

        let format = null;
        let dataStart = -1;
        let dataLength = 0;
        for (let at = 12; at + 8 <= bytes.length;) {
            const size = view.getUint32(at + 4, true);
            const body = at + 8;
            if (tagAt(at) === 'fmt ' && body + 16 <= bytes.length) {
                format = {
                    tag: view.getUint16(body, true),
                    channels: view.getUint16(body + 2, true),
                    sampleRate: view.getUint32(body + 4, true),
                    bits: view.getUint16(body + 14, true)
                };
                // WAVE_FORMAT_EXTENSIBLE keeps the real format tag in the
                // first two bytes of its sub-format field.
                if (format.tag === 0xFFFE && size >= 26 && body + 26 <= bytes.length) {
                    format.tag = view.getUint16(body + 24, true);
                }
            } else if (tagAt(at) === 'data') {
                dataStart = body;
                // A recorder that streamed the file may have left the size as
                // zero or all ones; take whatever follows the chunk header.
                dataLength = Math.min(size || bytes.length, bytes.length - body);
                break;
            }
            at = body + size + (size & 1);
        }
        if (!format || dataStart < 0) {
            throw new Error('WAV file has no format or no sound data');
        }

        const { tag, channels, sampleRate, bits } = format;
        const integer = tag === 1 && [8, 16, 24, 32].includes(bits);
        const float = tag === 3 && [32, 64].includes(bits);
        if (!integer && !float) {
            throw new Error(
                `Unsupported WAV encoding (format ${tag}, ${bits} bits); ` +
                'save it as uncompressed PCM'
            );
        }
        if (channels < 1 || sampleRate < 8000) {
            throw new Error(`Unsupported WAV file: ${channels} channels at ${sampleRate} Hz`);
        }

        const width = bits / 8;
        const frames = Math.floor(dataLength / (width * channels));
        const read = float
            ? (bits === 32 ? (o) => view.getFloat32(o, true) : (o) => view.getFloat64(o, true))
            : {
                8: (o) => (bytes[o] - 128) / 128,   // 8-bit WAV is unsigned
                16: (o) => view.getInt16(o, true) / 32768,
                24: (o) => ((view.getInt8(o + 2) << 16) | (bytes[o + 1] << 8) | bytes[o]) / 8388608,
                32: (o) => view.getInt32(o, true) / 2147483648
            }[bits];

        return {
            sampleRate,
            channels,
            frames,
            channel(index) {
                const samples = new Float32Array(frames);
                const stride = width * channels;
                let offset = dataStart + index * width;
                for (let i = 0; i < frames; i++, offset += stride) samples[i] = read(offset);
                return samples;
            }
        };
    }

    /** Centred moving average over 2 * half + 1 samples, shorter at the ends. */
    function movingAverage(source, half) {
        const n = source.length;
        const result = new Float32Array(n);
        let sum = 0;
        let width = 0;
        for (let i = 0; i < Math.min(half, n); i++) {
            sum += source[i];
            width++;
        }
        for (let i = 0; i < n; i++) {
            if (i + half < n) {
                sum += source[i + half];
                width++;
            }
            if (i - half - 1 >= 0) {
                sum -= source[i - half - 1];
                width--;
            }
            result[i] = sum / width;
        }
        return result;
    }

    /**
     * Find the pulses in a recording and return when each happens, in seconds.
     *
     * What a cassette deck makes of an 87 microsecond half-cycle is not known:
     * no recording was available. It is certainly band-limited into something
     * rounder, possibly upside down, at an unknown and drifting level, over
     * hum and hiss. So this looks for none of the pulse's shape, only for a
     * short burst of energy that stands out from its surroundings, which is
     * all the board's own latch responds to:
     *
     * 1. Subtract a 1 ms moving average. That removes any offset and mains
     *    hum and leaves a pulse, which is far shorter, untouched.
     * 2. Take the size of what is left and average it over about a pulse's
     *    length. Either polarity gives the same bump.
     * 3. Call it a pulse where that rises above 40% of the largest bump
     *    within 25 ms either side, so the level may drift along the tape,
     *    but never below a tenth of the loud parts of the whole recording, so
     *    hiss in a silent stretch is not taken for a signal.
     *
     * Bumps within half a millisecond of a pulse are counted as its ringing.
     * LOAD does the same, by not looking for 0.78 ms after a pulse.
     */
    function detectPulses(samples, sampleRate) {
        const n = samples.length;
        if (n === 0) return new Float64Array(0);

        const hum = movingAverage(samples, Math.max(1, Math.round(sampleRate * 0.0005)));
        const size = new Float32Array(n);
        for (let i = 0; i < n; i++) size[i] = Math.abs(samples[i] - hum[i]);
        const envelope = movingAverage(size, Math.max(1, Math.round(sampleRate * 0.000175)));

        // The largest bump in each 5 ms, as the yardstick for what is near it.
        const block = Math.max(1, Math.round(sampleRate * 0.005));
        const blocks = Math.ceil(n / block);
        const peaks = new Float32Array(blocks);
        for (let i = 0; i < n; i++) {
            const b = (i / block) | 0;
            if (envelope[i] > peaks[b]) peaks[b] = envelope[i];
        }
        // The 99th percentile rather than the maximum, so that one click, a
        // tape splice or the recorder's own switch, does not set the floor.
        const sorted = Float32Array.from(peaks).sort();
        const floor = Math.max(0.1 * sorted[Math.floor((blocks - 1) * 0.99)], 1e-6);
        const reach = 5;
        const thresholds = new Float32Array(blocks);
        for (let b = 0; b < blocks; b++) {
            let local = 0;
            for (let k = Math.max(0, b - reach); k <= Math.min(blocks - 1, b + reach); k++) {
                if (peaks[k] > local) local = peaks[k];
            }
            thresholds[b] = Math.max(0.4 * local, floor);
        }

        const ringing = 0.0005;
        const times = [];
        for (let i = 0; i < n; i++) {
            if (envelope[i] <= thresholds[(i / block) | 0]) continue;
            // A pulse is timed by the centre of its bump, which is steadier
            // than where the bump happens to cross the threshold.
            let weight = 0;
            let moment = 0;
            for (; i < n && envelope[i] > thresholds[(i / block) | 0]; i++) {
                weight += envelope[i];
                moment += envelope[i] * i;
            }
            const time = moment / weight / sampleRate;
            if (times.length === 0 || time - times[times.length - 1] >= ringing) times.push(time);
        }
        return Float64Array.from(times);
    }

    // A leader is zeros, so its pulses are one cell apart. Tape speed is taken
    // from it rather than assumed: these are the cell lengths accepted, 0.6 to
    // 1.6 times the board's own. Half or double the cell is left out on
    // purpose, or a run of 1 bits inside a block would pass for a leader.
    const CELL_MIN = TIMING.bitCell * 0.6;
    const CELL_MAX = TIMING.bitCell * 1.6;
    // Evenly spaced pulses needed before a run counts as a leader, and zero
    // bits needed before $A5 counts as the start of a block. A real leader has
    // 2048, so this still reads a recording that was started late, while two
    // zero bytes followed by $A5 inside a program are not taken for a block.
    const LEADER_RUN = 32;
    const LEADER_ZEROS = 64;

    /** The first run of evenly spaced pulses at or after `from`, or null. */
    function findLeader(times, from) {
        let runStart = from;
        let sum = 0;
        let count = 0;
        for (let k = from; k + 1 < times.length; k++) {
            const gap = times[k + 1] - times[k];
            const plausible = gap >= CELL_MIN && gap <= CELL_MAX;
            if (plausible && (count === 0 || Math.abs(gap - sum / count) <= 0.12 * sum / count)) {
                sum += gap;
                count++;
                if (count >= LEADER_RUN) return { index: runStart, cell: sum / count };
            } else if (plausible) {
                runStart = k;
                sum = gap;
                count = 1;
            } else {
                runStart = k + 1;
                sum = 0;
                count = 0;
            }
        }
        return null;
    }

    /**
     * Reads bits from pulse times the way LOAD does, starting on a pulse that
     * begins a cell: a second pulse in the middle of the cell makes the bit a
     * 1, and the next pulse after that begins the next cell.
     *
     * LOAD's windows are fixed delays, a quarter and four fifths of a cell at
     * the board's own speed. Here they are a quarter and three quarters of
     * the cell as measured on this tape, and the measure follows the tape as
     * it drifts.
     */
    function bitReader(times, index, cell) {
        let ended = false;
        return {
            get index() { return index; },
            get time() { return times[index]; },
            next() {
                if (ended) return null;
                const clock = times[index];
                let next = index + 1;
                while (next < times.length && times[next] - clock < 0.25 * cell) next++;
                let bit = 0;
                if (next < times.length && times[next] - clock < 0.75 * cell) {
                    bit = 1;
                    while (next < times.length && times[next] - clock < 0.75 * cell) next++;
                }
                // The bit is settled by its own cell. Whether another cell
                // follows only decides if there is a next bit to read.
                if (next >= times.length || times[next] - clock > 1.5 * cell) {
                    ended = true;
                    index = Math.min(next, times.length - 1);
                } else {
                    cell += 0.1 * (times[next] - clock - cell);
                    index = next;
                }
                return bit;
            }
        };
    }

    /**
     * Read every block out of a list of pulse times.
     *
     * @param {Float64Array|number[]} times - when each pulse happens, in seconds
     * @returns {{records: object[], problems: string[]}} Each record has `id`,
     *   `start` and `data` as they would be in memory after LOAD, `time`, where
     *   in the recording its start byte is, and sometimes `note`.
     */
    function decodePulses(times) {
        const records = [];
        const problems = [];
        const seconds = (time) => `${time.toFixed(1)} s`;

        let from = 0;
        for (;;) {
            const leader = findLeader(times, from);
            if (!leader) break;
            const reader = bitReader(times, leader.index, leader.cell);
            const readByte = () => {
                let value = 0;
                for (let i = 0; i < 8; i++) {
                    const bit = reader.next();
                    if (bit === null) return null;
                    value = (value << 1) | bit;
                }
                return value;
            };

            // Look for the start byte: zeros, then $A5.
            let zeros = 0;
            let found = false;
            let blockTime = 0;
            for (;;) {
                blockTime = reader.time;
                const bit = reader.next();
                if (bit === null) break;
                if (bit === 0) {
                    zeros++;
                    continue;
                }
                const rest = [];
                while (rest.length < 7) {
                    const next = reader.next();
                    if (next === null) break;
                    rest.push(next);
                }
                if (rest.length < 7) break;
                const value = rest.reduce((byte, next) => (byte << 1) | next, 1);
                if (zeros >= LEADER_ZEROS && value === START_BYTE) {
                    found = true;
                    break;
                }
                // Not a start byte. Whatever zeros ended it count toward the
                // next attempt.
                zeros = 0;
                for (let i = rest.length - 1; i >= 0 && rest[i] === 0; i--) zeros++;
            }
            if (!found) {
                // The signal stopped, or stopped making sense. Look for a new
                // leader beyond this one.
                from = Math.max(reader.index, leader.index + LEADER_RUN);
                continue;
            }

            const afterStartByte = reader.index;
            const where = `at ${seconds(blockTime)}`;
            const header = [];
            while (header.length < 5) {
                const value = readByte();
                if (value === null) break;
                header.push(value);
            }
            if (header.length < 5) {
                problems.push(`Block ${where}: the recording breaks off inside the header`);
                from = Math.max(reader.index, afterStartByte);
                continue;
            }
            const [id, addressLow, addressHigh, countLow, countHigh] = header;
            const address = addressLow | (addressHigh << 8);
            const count = countLow | (countHigh << 8);
            const name = `Program ${hex(id)} ${where}`;

            const offsets = blockOffsets(count);
            const body = new Uint8Array(offsets.length);
            let got = 0;
            while (got < offsets.length) {
                const value = readByte();
                if (value === null) break;
                body[got++] = value;
            }
            const checksumOnTape = got === offsets.length ? readByte() : null;
            if (checksumOnTape === null) {
                problems.push(`${name}: the recording breaks off after ${got} of ${offsets.length} bytes`);
                from = Math.max(reader.index, afterStartByte);
                continue;
            }
            let checksum = START_BYTE;
            for (const value of header) checksum = (checksum + value) & 0xFF;
            for (const value of body) checksum = (checksum + value) & 0xFF;
            if (checksum !== checksumOnTape) {
                problems.push(
                    `${name}: checksum mismatch, the tape says $${hex(checksumOnTape)} ` +
                    `and its bytes add up to $${hex(checksum)}`
                );
                // A slipped bit can spoil the length too, so where this block
                // ends is not known. Start again just past its start byte.
                from = afterStartByte;
                continue;
            }

            // Put the bytes where LOAD would put them, in the order it stores
            // them, so a later byte at the same place replaces an earlier one.
            let lowest = offsets[0];
            let highest = offsets[0];
            for (const offset of offsets) {
                if (offset < lowest) lowest = offset;
                if (offset > highest) highest = offset;
            }
            const data = new Uint8Array(highest - lowest + 1);
            offsets.forEach((offset, i) => { data[offset - lowest] = body[i]; });
            const start = (address + lowest) & 0xFFFF;
            if (start + data.length > 0x10000) {
                problems.push(`${name}: the block runs past $FFFF`);
            } else {
                const record = { id, start, data, time: blockTime };
                if (countLow === 0) {
                    record.note = count === 0
                        ? 'a 1-byte block: the AMICO routines put its byte 256 below the address on the tape'
                        : 'the block was 1 byte longer than a whole number of pages, ' +
                          'and the AMICO routines do not record the last byte of such a block';
                }
                records.push(record);
            }
            // The trailer is zeros too and reads as the next leader.
            from = Math.max(reader.index, afterStartByte);
        }
        return { records, problems };
    }

    /**
     * Read every block out of a WAV recording of an AMICO 2000 tape.
     *
     * A stereo file is read one channel at a time and the channel that yields
     * more is kept: adding the two together would cancel a tape recorded with
     * one channel inverted.
     *
     * @param {Uint8Array|ArrayBuffer} bytes
     * @returns {{records: object[], problems: string[], sampleRate: number, duration: number}}
     */
    function decodeWav(bytes) {
        const wav = parseWav(bytes);
        let best = null;
        for (let index = 0; index < Math.min(wav.channels, 2); index++) {
            const result = decodePulses(detectPulses(wav.channel(index), wav.sampleRate));
            if (!best || result.records.length > best.records.length ||
                (result.records.length === best.records.length &&
                 result.problems.length < best.problems.length)) {
                best = result;
            }
        }
        return { ...best, sampleRate: wav.sampleRate, duration: wav.frames / wav.sampleRate };
    }

    // =========================================================================
    // A recorder
    // =========================================================================

    /**
     * A cassette recorder to plug into the board's interface, for when the
     * real LOAD and SAVE routines run instead of being trapped (#20). It is
     * what Amico2000.connectRecorder() expects, and like the rest of this file
     * it knows nothing about the machine: it is told the time, in seconds, and
     * says when its tape gave a pulse.
     *
     * Its tape is not kept as sound. Playing, it is given the programs on the
     * emulator's cassette and lays them out one after another, each as the
     * pulses SAVE would have made for it, with half a second of blank tape
     * before each. Recording, it notes when the board made a pulse, and when
     * stopped reads the programs back out of those pulses with the same
     * decoder that reads a sound file. So in both directions the PROM's own
     * routine does the work, on a signal timed as the board times it.
     */
    function createRecorder() {
        const BLANK = 0.5;
        const pulseLength = 2 * TIMING.halfPulse;
        let state = 'stopped';
        let origin = 0;                     // when the tape started moving
        let pulses = new Float64Array(0);   // playing: when each pulse starts
        let next = 0;                       // first pulse not yet wholly past
        let length = 0;                     // playing: where the tape ends
        let rises = [];                     // recording: when the line went high
        let skipped = [];

        return {
            get state() { return state; },
            /** How long the tape being played is, in seconds. */
            get length() { return length; },
            /** Programs left off the tape being played, as `{id, reason}`. */
            get skipped() { return skipped; },
            /** How far the tape has run since it was started, in seconds. */
            position(time) {
                return state === 'stopped' ? 0 : time - origin;
            },

            /** Rewind, load the tape with these programs and start playing. */
            play(time, programs) {
                const runs = [];
                let at = 0;
                let count = 0;
                skipped = [];
                for (const program of programs) {
                    let bytes;
                    try {
                        bytes = recordToTapeBytes(program);
                    } catch (err) {
                        // A block SAVE could not have written, such as one of
                        // a single byte, has no place on a tape.
                        skipped.push({ id: program.id, reason: err.message });
                        continue;
                    }
                    const times = tapeBytesToPulseTimes(bytes, at + BLANK);
                    runs.push(times);
                    count += times.length;
                    at = times[times.length - 1] + TIMING.bitCell;
                }
                pulses = new Float64Array(count);
                let filled = 0;
                for (const times of runs) {
                    pulses.set(times, filled);
                    filled += times.length;
                }
                length = at;
                next = 0;
                origin = time;
                state = 'playing';
            },

            /** Start recording on a blank tape. */
            record(time) {
                rises = [];
                origin = time;
                state = 'recording';
            },

            /**
             * Stop the tape. After a recording, returns the programs found
             * on it and what could not be read, as decodePulses() does.
             * After playing, returns null.
             */
            stop() {
                const wasRecording = state === 'recording';
                state = 'stopped';
                if (!wasRecording) return null;
                // The line goes high half way through a pulse. The low half
                // before it cannot be relied on: the board's first pulse has
                // none, because the line starts low.
                const times = Float64Array.from(rises, (time) => time - TIMING.halfPulse);
                rises = [];
                return decodePulses(times);
            },

            /** Whether the tape gave a pulse between two moments. */
            heard(from, to) {
                if (state !== 'playing') return false;
                const since = from - origin;
                const until = to - origin;
                while (next < pulses.length && pulses[next] + pulseLength <= since) next++;
                return next < pulses.length && pulses[next] < until;
            },

            /** The board's output changed to this level, 0 to 2. */
            level(level, time) {
                if (state === 'recording' && level === 2) rises.push(time - origin);
            }
        };
    }

    return {
        TIMING,
        LEADER_BYTES,
        START_BYTE,
        blockOffsets,
        bytesKept,
        recordToTapeBytes,
        tapeBytesToPulseTimes,
        renderPulses,
        samplesToWav,
        encodeWav,
        parseWav,
        detectPulses,
        decodePulses,
        decodeWav,
        createRecorder
    };
})();

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AmicoTapeAudio };
}
