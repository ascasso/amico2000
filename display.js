/**
 * =============================================================================
 * AMICO 2000 Display Renderer
 * =============================================================================
 *
 * Draws the board's six seven-segment displays in SVG.
 *
 * The board carries six separate TIL312 packages (the manual's parts list,
 * IC18/1-6), not one display bar: four for the address, a gap about half a
 * package wide where the board shows through, then two for the data. There is
 * no colon and no caption on the board. The geometry and colours below were
 * measured on a photograph of a surviving board taken from straight above,
 * called unit B in the comments; that photograph is private and is not in the
 * repository. What a photograph cannot settle, the lean of the digit and the
 * number of decimal points, is from Texas Instruments' data sheet for the
 * TIL312 family (bulletin DL-S 12129, November 1974, revised July 1978).
 *
 * Author: Andrea Scasso / Claude
 * License: MIT
 * Date: December 2025
 *
 * =============================================================================
 */

// Everything about the displays' size and wiring, kept in one object because the
// browser scripts share a single global scope and plain names such as PITCH or
// DP would be easy to collide with.
//
// Lengths are in units where one package face is 100 wide. Measured on unit B:
// a face is 105 x 188 px, so 100 x 179 here; the packages stand on a 111 px
// pitch; and the first data package starts 1.46 pitches after the last address
// package, which leaves a gap of about half a package between the two groups.
const DISPLAY_LAYOUT = (() => {
    const faceW = 100;
    const pitch = 106;
    const groupGap = 154.4;         // left of digit 3 to left of digit 4
    const digitX = [0, pitch, 2 * pitch, 3 * pitch, 3 * pitch + groupGap, 4 * pitch + groupGap];
    return Object.freeze({
        faceW,
        faceH: 179,
        digitX: Object.freeze(digitX),
        totalW: digitX[5] + faceW,
        sideW: 5,                   // strip left of each face, see _createPackage()

        // The digit: 44.5 x 77 before it is slanted, strokes 10 thick. It
        // sits in the middle of the face, so nearly a third of the package
        // above and below it is blank. The data sheet's drawing gives the
        // lean as 10 degrees; unit B measures between 7 and 10 depending on
        // the edge taken, so the drawn figure is the maker's. glyphX puts the
        // middle of the leaning digit on the package's centre line, where the
        // data sheet has it.
        glyphW: 44.5,
        glyphH: 77,
        stroke: 10,
        segmentGap: 1.1,
        slantDegrees: 10,
        glyphX: 34.5,               // top-left corner of the unslanted digit box
        glyphY: 50.6,

        // A TIL312 has two decimal points, one each side of the digit's foot
        // and the same distance from its centre line (data sheet: "common
        // anode, two decimals", pins 6 and 9). The displays are fitted with
        // the points toward the keys (manual, PDF page 25). On unit B the
        // left one has the segments' tint and the right one looks greyer;
        // they are drawn as photographed, and why they differ is not known.
        decimalPoints: Object.freeze({
            left: Object.freeze({ x: 11, y: 125.6, r: 2.7 }),
            right: Object.freeze({ x: 89, y: 125.6, r: 2.7 }),
        }),

        // Segment name -> pattern bit. Port A bit 0 drives segment a, round to
        // g on bit 6:
        //
        //     aaa
        //    f   b
        //     ggg
        //    e   c
        //     ddd
        //  dp     dp
        //
        // Bit 7 is called dp here, but the board does not appear to wire it
        // to either decimal point: the monitor's digit table sets bit 7 in
        // all sixteen entries, and unit A, powered and showing 0000 1C, has
        // no point lit. The machine layer drops the bit before a pattern
        // gets here. What it lights is therefore this renderer's own choice,
        // and it lights both points, so that test() shows every light the
        // part has.
        segmentBits: Object.freeze({ a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, dp: 7 }),
    });
})();

class DisplayRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.digits = [];

        // Colors. A lit TIL312 is a deep red, about 660 nm, with none of the
        // orange an early red LED is often drawn with. Unit A's photograph
        // records it as #fe085b; cameras push that wavelength toward pink,
        // so the red here is the same hue pulled back a little.
        this.colorOn = '#ff1f45';       // Lit segment
        // An unlit segment on unit B is not a flat bar: it is a dusty red
        // window with a paler rim, darker in the middle, so the idle "8"
        // looks drawn in outline.
        this.colorOff = '#64263f';
        this.colorOffRim = '#a84a66';
        this.colorFace = '#231d28';     // Package face

        // The pattern each digit currently shows. update() is called on every
        // frame with patterns that almost never change; comparing against this
        // is what keeps a steady display from touching the DOM at all.
        this._shown = [0, 0, 0, 0, 0, 0];

        this._createDisplay();
    }

    /**
     * Create the SVG display structure
     */
    _createDisplay() {
        const L = DISPLAY_LAYOUT;
        const svg = this._el('svg', {
            viewBox: `${-L.sideW} 0 ${L.totalW + L.sideW} ${L.faceH}`,
            class: 'amico-display',
            role: 'img',
            'aria-label': 'Six seven-segment displays: four address digits, then two data digits',
        });

        const defs = this._el('defs', {}, svg);

        // Bloom for lit segments. On unit A, powered, a lit segment spreads
        // well past its window: the bars swell, the hairlines between them
        // close, and a dim red halo lies on the face around the digit. Two
        // blurs give that, a tight one for the swelling and a wide faint one
        // for the halo. It is one filter over one group holding every lit
        // segment, with a fixed region, so it is computed for the whole
        // display at once and only when a segment actually changes.
        const glow = this._el('filter', {
            id: 'amico-display-glow',
            filterUnits: 'userSpaceOnUse',
            x: -L.sideW, y: 0, width: L.totalW + L.sideW, height: L.faceH,
            'color-interpolation-filters': 'sRGB',
        }, defs);
        this._el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 9, result: 'wide' }, glow);
        const dim = this._el('feComponentTransfer', { in: 'wide', result: 'halo' }, glow);
        this._el('feFuncA', { type: 'linear', slope: 0.6 }, dim);
        this._el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 2.6, result: 'bloom' }, glow);
        const merge = this._el('feMerge', {}, glow);
        this._el('feMergeNode', { in: 'halo' }, merge);
        this._el('feMergeNode', { in: 'bloom' }, merge);
        this._el('feMergeNode', { in: 'SourceGraphic' }, merge);

        // The face is matt plastic, a shade lighter toward the top where the
        // light comes from.
        const face = this._el('linearGradient', { id: 'amico-display-face', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        this._el('stop', { offset: 0, 'stop-color': '#2c2531' }, face);
        this._el('stop', { offset: 0.25, 'stop-color': this.colorFace }, face);
        this._el('stop', { offset: 1, 'stop-color': '#1a151e' }, face);

        const packages = this._el('g', { class: 'packages' }, svg);
        const lit = this._el('g', { class: 'lit', filter: 'url(#amico-display-glow)' }, svg);

        // Layout: [A3][A2][A1][A0]   [D1][D0]
        for (let i = 0; i < 6; i++) {
            this.digits.push(this._createPackage(L.digitX[i], packages, lit));
        }

        this.container.appendChild(svg);
    }

    /**
     * Create an SVG element with attributes, optionally appended to a parent
     */
    _el(name, attributes = {}, parent = null) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', name);
        for (const [key, value] of Object.entries(attributes)) {
            el.setAttribute(key, value);
        }
        if (parent) parent.appendChild(el);
        return el;
    }

    /**
     * Outlines of the seven segments in the unslanted digit box: bars with
     * pointed ends that meet at the corners with a hairline between them.
     */
    static _segmentOutlines() {
        const { glyphW, glyphH, stroke, segmentGap } = DISPLAY_LAYOUT;
        const half = stroke / 2;
        const mid = glyphH / 2;
        const horizontal = (cy) => {
            const x1 = half + segmentGap;
            const x2 = glyphW - half - segmentGap;
            return [[x1, cy], [x1 + half, cy - half], [x2 - half, cy - half],
                    [x2, cy], [x2 - half, cy + half], [x1 + half, cy + half]];
        };
        const vertical = (cx, y1, y2) => [
            [cx, y1], [cx + half, y1 + half], [cx + half, y2 - half],
            [cx, y2], [cx - half, y2 - half], [cx - half, y1 + half]];
        const upper = [half + segmentGap, mid - segmentGap];
        const lower = [mid + segmentGap, glyphH - half - segmentGap];
        return {
            a: horizontal(half),
            b: vertical(glyphW - half, ...upper),
            c: vertical(glyphW - half, ...lower),
            d: horizontal(glyphH - half),
            e: vertical(half, ...lower),
            f: vertical(half, ...upper),
            g: horizontal(mid),
        };
    }

    /**
     * Create one display package: the body, its unlit segments, and a lit copy
     * of each segment that stays hidden until its pattern bit is set.
     *
     * Returns the package's group. Its `segments` property maps each segment
     * name to the lit element for it, which is what update() switches.
     */
    _createPackage(x, packagesLayer, litLayer) {
        const L = DISPLAY_LAYOUT;
        const group = this._el('g', { transform: `translate(${x}, 0)` }, packagesLayer);

        // The package stands a few millimetres proud of the board, so it
        // throws a short shadow down and to the right, away from the light.
        this._el('rect', { x: 1.6, y: 2.6, width: L.faceW, height: L.faceH, rx: 2.2, fill: '#000', opacity: 0.42 }, group);

        // Both photographs show a pale line between neighbouring packages: the
        // light side wall of the moulding, caught in the gap. Drawn as a strip
        // on the left of each face.
        this._el('rect', { x: -L.sideW + 1, y: 1.5, width: L.sideW - 1.5, height: L.faceH - 3, fill: '#c9c4c1' }, group);
        this._el('rect', { x: 0, y: 0, width: L.faceW, height: L.faceH, rx: 2.2, fill: 'url(#amico-display-face)' }, group);

        // Real segments lean: the top of the digit is to the right of its foot.
        const slant = `translate(${L.glyphX}, ${L.glyphY}) skewX(${-L.slantDegrees})`;
        const unlit = this._el('g', {
            transform: slant, fill: this.colorOff,
            stroke: this.colorOffRim, 'stroke-width': 1.1, 'stroke-linejoin': 'round',
        }, group);

        // The lit copies live in the shared glow layer, under the same transform.
        const litGroup = this._el('g', { transform: `translate(${x}, 0)` }, litLayer);
        const litGlyph = this._el('g', { transform: slant }, litGroup);

        // A lit segment is drawn with a round-jointed stroke of its own
        // colour, so it stands wider than its unlit window, loses its sharp
        // points and closes the hairline to its neighbours, as on unit A.
        const segments = {};
        for (const [name, outline] of Object.entries(DisplayRenderer._segmentOutlines())) {
            const points = outline.map(([px, py]) => `${px},${py}`).join(' ');
            this._el('polygon', { points }, unlit);
            segments[name] = this._el('polygon', {
                points, fill: this.colorOn,
                stroke: this.colorOn, 'stroke-width': 3.2, 'stroke-linejoin': 'round',
                class: 'segment', 'data-bit': L.segmentBits[name], visibility: 'hidden',
            }, litGlyph);
        }

        // The two decimal points, unlit as photographed on unit B, and a lit
        // copy of each in one group that bit 7 shows or hides.
        const { left, right } = L.decimalPoints;
        this._el('circle', {
            cx: left.x, cy: left.y, r: left.r, fill: this.colorOff,
            stroke: this.colorOffRim, 'stroke-width': 0.6,
        }, group);
        this._el('circle', { cx: right.x, cy: right.y, r: right.r, fill: '#55454f' }, group);
        segments.dp = this._el('g', {
            class: 'segment', 'data-bit': L.segmentBits.dp, visibility: 'hidden',
        }, litGroup);
        for (const point of [left, right]) {
            this._el('circle', { cx: point.x, cy: point.y, r: point.r + 1.2, fill: this.colorOn }, segments.dp);
        }

        group.segments = segments;
        return group;
    }

    /**
     * Update the display with new segment patterns
     * @param {Array} patterns - Array of 6 bytes, one per digit
     */
    update(patterns) {
        for (let i = 0; i < 6 && i < patterns.length; i++) {
            this._updateDigit(i, patterns[i]);
        }
    }

    /**
     * Update a single digit, switching only the segments whose bit changed
     */
    _updateDigit(digitIndex, pattern) {
        const digit = this.digits[digitIndex];
        if (!digit || !digit.segments) return;

        const next = pattern & 0xFF;
        const changed = next ^ this._shown[digitIndex];
        if (changed === 0) return;
        this._shown[digitIndex] = next;

        for (const [name, element] of Object.entries(digit.segments)) {
            const mask = 1 << DISPLAY_LAYOUT.segmentBits[name];
            if (changed & mask) {
                element.setAttribute('visibility', (next & mask) ? 'visible' : 'hidden');
            }
        }
    }

    /**
     * Clear the display
     */
    clear() {
        this.update([0, 0, 0, 0, 0, 0]);
    }

    /**
     * Test pattern - all segments on
     */
    test() {
        this.update([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    }

    /**
     * Show a hex value (address + data format)
     * @param {number} address - 16-bit address
     * @param {number} data - 8-bit data
     */
    showHex(address, data) {
        const patterns = [
            this._hexToSegments((address >> 12) & 0xF),
            this._hexToSegments((address >> 8) & 0xF),
            this._hexToSegments((address >> 4) & 0xF),
            this._hexToSegments(address & 0xF),
            this._hexToSegments((data >> 4) & 0xF),
            this._hexToSegments(data & 0xF)
        ];
        this.update(patterns);
    }

    /**
     * Convert hex digit to segment pattern
     * Uses authentic ASEL AMICO 2000 ROM segment table from address $FFEA
     */
    _hexToSegments(hex) {
        // Authentic Amico 2000 segment table from ROM address $FFEA
        // These are the exact patterns the original designers intended
        // Note: Bit 7 (decimal point) is masked off as the original hardware
        // didn't use it - all digits display without decimal points
        const patterns = [
            0xBF, 0x86, 0xDB, 0xCF, 0xE6, 0xED, 0xFD, 0x87,
            0xFF, 0xEF, 0xF7, 0xFC, 0xB9, 0xDE, 0xF9, 0xF1
        ];
        return patterns[hex & 0xF] & 0x7F;  // Mask off bit 7 (DP)
    }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DisplayRenderer };
}
