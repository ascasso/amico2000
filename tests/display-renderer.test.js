'use strict';

// The seven-segment renderer had no check at all: display.js draws into the
// DOM, so nothing in Node could see it. These checks stand it on a small
// stand-in for the DOM and pin the one thing a redrawn display must never get
// wrong: which pattern bit lights which segment, on which of the six digits.
//
// The board's displays are common-anode parts driven through the 8255: Port A
// bit 0 is segment a, bit 1 is b, and so on round to g on bit 6, with bit 7
// the decimal point. The monitor's own digit table at $FFEA is written for
// that order, so the checks below take the table straight from the ROM image
// and compare what it draws with the segment sets any seven-segment reference
// gives for 0-F.

const test = require('node:test');
const assert = require('node:assert/strict');

const { MONITOR_ROM, bootedMachine } = require('./helpers/machine');

// --- a stand-in for the few DOM calls display.js makes -----------------------

class FakeElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.attributes = new Map();
        this.children = [];
        this.textContent = '';
        this.innerHTML = '';
        this.style = {};
        this.writes = 0;            // attribute and class changes, for the no-rewrite check
        const classes = new Set();
        const el = this;
        this.classList = {
            add(...names) { names.forEach((n) => classes.add(n)); el.writes++; },
            remove(...names) { names.forEach((n) => classes.delete(n)); el.writes++; },
            toggle(name, force) {
                const on = force === undefined ? !classes.has(name) : Boolean(force);
                if (on) classes.add(name); else classes.delete(name);
                el.writes++;
                return on;
            },
            contains: (name) => classes.has(name),
        };
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); this.writes++; }
    getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
    hasAttribute(name) { return this.attributes.has(name); }
    removeAttribute(name) { this.attributes.delete(name); this.writes++; }
    appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
}

function allElements(root) {
    return [root, ...root.children.flatMap(allElements)];
}

function makeRenderer() {
    const container = new FakeElement('div');
    global.document = {
        getElementById: () => container,
        createElementNS: (namespace, tagName) => new FakeElement(tagName),
    };
    // display.js is a browser script that reads `document` when the renderer is
    // constructed, not when the file loads, so requiring it once is enough.
    const { DisplayRenderer } = require('../display');
    const renderer = new DisplayRenderer('display');
    return { renderer, container };
}

// The only place in this file that knows how the renderer marks a lit segment.
// Everything else speaks in segment names.
function isLit(renderer, segmentElement) {
    return segmentElement.getAttribute('visibility') === 'visible';
}

// Where a digit sits across the display, in the SVG's own units. renderer.digits
// is the order update() fills, which says nothing about where each one is drawn.
function digitX(renderer, digitIndex) {
    const transform = renderer.digits[digitIndex].getAttribute('transform') || '';
    const match = transform.match(/translate\(\s*(-?[\d.]+)/);
    assert.ok(match, `digit ${digitIndex} has no translate(): "${transform}"`);
    return Number(match[1]);
}

const SEGMENT_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];   // pattern bits 0-7

function litSegments(renderer, digitIndex) {
    const segments = renderer.digits[digitIndex].segments;
    return SEGMENT_NAMES.filter((name) => isLit(renderer, segments[name])).join(' ');
}

function wholeDisplay(renderer) {
    return [0, 1, 2, 3, 4, 5].map((i) => litSegments(renderer, i));
}

// --- where things are actually drawn -----------------------------------------
//
// The helpers above know a segment by its name and whether it is lit. That is
// not enough: a renderer can light exactly the right elements and still draw
// them in the wrong place, and every check built on names alone passes. The
// helpers below read the geometry the way a browser would, carrying each
// shape's points through its own transform and those of every group above it,
// so a check can ask where a named segment ends up.

const IDENTITY = [1, 0, 0, 1, 0, 0];            // a b c d e f, as in SVG's matrix()

function multiply(p, q) {
    return [
        p[0] * q[0] + p[2] * q[1], p[1] * q[0] + p[3] * q[1],
        p[0] * q[2] + p[2] * q[3], p[1] * q[2] + p[3] * q[3],
        p[0] * q[4] + p[2] * q[5] + p[4], p[1] * q[4] + p[3] * q[5] + p[5]];
}

// The two transforms display.js uses. Anything else fails here rather than
// being read as "no transform", so a new kind cannot slip past unexamined.
function matrixOf(transform) {
    const text = (transform || '').trim();
    const pattern = /(\w+)\(([^)]*)\)/g;
    let matrix = IDENTITY;
    for (const [whole, name, args] of text.matchAll(pattern)) {
        const n = args.split(/[\s,]+/).filter(Boolean).map(Number);
        if (name === 'translate') {
            matrix = multiply(matrix, [1, 0, 0, 1, n[0], n[1] || 0]);
        } else if (name === 'skewX') {
            matrix = multiply(matrix, [1, 0, Math.tan(n[0] * Math.PI / 180), 1, 0, 0]);
        } else {
            assert.fail(`this test cannot read the transform "${whole}"`);
        }
    }
    assert.equal(text.replace(pattern, '').trim(), '', `unreadable transform "${transform}"`);
    return matrix;
}

function absoluteMatrix(element) {
    const chain = [];
    for (let node = element; node; node = node.parentNode) chain.unshift(node);
    return chain.reduce((matrix, node) => multiply(matrix, matrixOf(node.getAttribute('transform'))), IDENTITY);
}

// The corner points of a shape's own outline, before any transform, or null
// for an element that draws nothing itself.
function outline(element) {
    const number = (name) => Number(element.getAttribute(name));
    switch (element.tagName) {
        case 'polygon':
            return element.getAttribute('points').trim().split(/\s+/).map((pair) => pair.split(',').map(Number));
        case 'circle':
            return [[number('cx') - number('r'), number('cy')], [number('cx') + number('r'), number('cy')],
                    [number('cx'), number('cy') - number('r')], [number('cx'), number('cy') + number('r')]];
        case 'rect':
            return [[number('x'), number('y')], [number('x') + number('width'), number('y')],
                    [number('x'), number('y') + number('height')], [number('x') + number('width'), number('y') + number('height')]];
        default:
            return null;
    }
}

function shapesIn(element) {
    return outline(element) ? [element] : element.children.flatMap(shapesIn);
}

// The box an element, or everything inside it, covers in the SVG's own units.
function drawnBox(element) {
    const points = shapesIn(element).flatMap((shape) => {
        const m = absoluteMatrix(shape);
        return outline(shape).map(([x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]);
    });
    assert.ok(points.length > 0, `<${element.tagName}> draws nothing`);
    const xs = points.map((point) => point[0]);
    const ys = points.map((point) => point[1]);
    const box = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    return { ...box, cx: (box.x0 + box.x1) / 2, cy: (box.y0 + box.y1) / 2, w: box.x1 - box.x0, h: box.y1 - box.y0 };
}

// What a seven-segment display lights for each hex digit, in the lower-case
// b and d form the monitor uses.
const HEX_GLYPHS = {
    0x0: 'a b c d e f',   0x1: 'b c',           0x2: 'a b d e g',     0x3: 'a b c d g',
    0x4: 'b c f g',       0x5: 'a c d f g',     0x6: 'a c d e f g',   0x7: 'a b c',
    0x8: 'a b c d e f g', 0x9: 'a b c d f g',   0xA: 'a b c e f g',   0xB: 'c d e f g',
    0xC: 'a d e f',       0xD: 'b c d e g',     0xE: 'a d e f g',     0xF: 'a e f g',
};

// The monitor's digit-to-segment table, $FFEA-$FFF9 in a PROM that starts at $FE00.
const ROM_SEGMENT_TABLE = MONITOR_ROM.subarray(0x1EA, 0x1FA);

// -----------------------------------------------------------------------------

test('the renderer builds one SVG holding six digits of eight segments each', () => {
    const { renderer, container } = makeRenderer();

    assert.equal(container.children.length, 1);
    assert.equal(container.children[0].tagName, 'svg');
    assert.equal(renderer.digits.length, 6);

    for (const digit of renderer.digits) {
        assert.deepEqual(Object.keys(digit.segments).sort(), [...SEGMENT_NAMES].sort());
        SEGMENT_NAMES.forEach((name, bit) => {
            assert.equal(digit.segments[name].getAttribute('data-bit'), String(bit),
                `segment ${name} should answer to pattern bit ${bit}`);
        });
    }
});

test('a new display is dark', () => {
    const { renderer } = makeRenderer();
    assert.deepEqual(wholeDisplay(renderer), ['', '', '', '', '', '']);
});

test('each pattern bit lights its own segment and no other', () => {
    const { renderer } = makeRenderer();

    SEGMENT_NAMES.forEach((name, bit) => {
        renderer.update([1 << bit, 0, 0, 0, 0, 0]);
        assert.deepEqual(wholeDisplay(renderer), [name, '', '', '', '', ''], `bit ${bit}`);
    });
});

test('each of the six patterns goes to its own digit, leftmost first', () => {
    const { renderer } = makeRenderer();

    for (let position = 0; position < 6; position++) {
        const patterns = [0, 0, 0, 0, 0, 0];
        patterns[position] = 0x06;                       // segments b and c: a "1"
        renderer.update(patterns);

        const expected = ['', '', '', '', '', ''];
        expected[position] = 'b c';
        assert.deepEqual(wholeDisplay(renderer), expected, `position ${position}`);
    }
});

test('the digits are drawn left to right, four for the address and then two for the data', () => {
    const { renderer } = makeRenderer();
    const x = [0, 1, 2, 3, 4, 5].map((i) => digitX(renderer, i));

    for (let i = 1; i < 6; i++) {
        assert.ok(x[i] > x[i - 1], `digit ${i} at ${x[i]} should be right of digit ${i - 1} at ${x[i - 1]}`);
    }
    // The board sets the two data digits apart from the four address digits.
    const pitch = x[1] - x[0];
    assert.ok(Math.abs((x[2] - x[1]) - pitch) < 0.01 && Math.abs((x[3] - x[2]) - pitch) < 0.01, 'address digits evenly spaced');
    assert.ok(Math.abs((x[5] - x[4]) - pitch) < 0.01, 'data digits on the same pitch');
    assert.ok(x[4] - x[3] > pitch * 1.2, 'a gap between the address and data groups');
});

test("the monitor's table at $FFEA draws the sixteen hex digits", () => {
    const { renderer } = makeRenderer();

    assert.equal(ROM_SEGMENT_TABLE.length, 16);
    ROM_SEGMENT_TABLE.forEach((tableByte, value) => {
        // The machine layer drops bit 7 before a pattern reaches the renderer
        // (Amico2000._updateDisplay), so do the same here.
        renderer.update([tableByte & 0x7F, 0, 0, 0, 0, 0]);
        assert.equal(litSegments(renderer, 0), HEX_GLYPHS[value],
            `$${tableByte.toString(16)} should draw ${value.toString(16).toUpperCase()}`);
    });
});

test('bit 7 is the decimal point, and only test() ever sets it', () => {
    const { renderer } = makeRenderer();

    renderer.update([0x80, 0, 0, 0, 0, 0]);
    assert.equal(litSegments(renderer, 0), 'dp');

    renderer.test();
    assert.deepEqual(wholeDisplay(renderer), Array(6).fill(SEGMENT_NAMES.join(' ')));
});

test('update() with fewer than six patterns leaves the other digits as they were', () => {
    const { renderer } = makeRenderer();

    renderer.update([0x06, 0x06, 0x06, 0x06, 0x06, 0x06]);
    renderer.update([0x07, 0x07]);

    assert.deepEqual(wholeDisplay(renderer), ['a b c', 'a b c', 'b c', 'b c', 'b c', 'b c']);
});

test('clear() darkens every segment', () => {
    const { renderer } = makeRenderer();

    renderer.test();
    renderer.clear();

    assert.deepEqual(wholeDisplay(renderer), ['', '', '', '', '', '']);
});

test('showHex() lays out four address digits, then two data digits', () => {
    const { renderer } = makeRenderer();

    renderer.showHex(0x1C2D, 0x3E);

    assert.deepEqual(wholeDisplay(renderer),
        [0x1, 0xC, 0x2, 0xD, 0x3, 0xE].map((value) => HEX_GLYPHS[value]));
});

test('what the booted monitor shows reaches the renderer as readable digits', () => {
    const { renderer } = makeRenderer();
    const amico = bootedMachine();

    // Long enough for the monitor to multiplex all six digits several times.
    for (let i = 0; i < 20000; i++) {
        amico.cpu.step();
    }
    renderer.update(amico.getDisplay());

    const glyphToValue = new Map(Object.entries(HEX_GLYPHS).map(([value, glyph]) => [glyph, Number(value)]));
    const shown = wholeDisplay(renderer).map((glyph) => {
        assert.ok(glyphToValue.has(glyph), `"${glyph}" is not a hex digit`);
        return glyphToValue.get(glyph).toString(16).toUpperCase();
    }).join('');

    // After a power-on reset the monitor shows address 0000 and the byte there,
    // which reset() has just cleared.
    assert.equal(shown, '000000');
});

test('a display that has not changed is not redrawn', () => {
    const { renderer, container } = makeRenderer();
    const everything = allElements(container.children[0]);
    const writes = () => everything.reduce((sum, el) => sum + el.writes, 0);

    // update() is called on every animation frame, nearly always with the
    // patterns it was given the frame before. That must cost no DOM work.
    renderer.showHex(0x02A5, 0x3C);
    const afterFirst = writes();
    for (let frame = 0; frame < 60; frame++) {
        renderer.showHex(0x02A5, 0x3C);
    }
    assert.equal(writes(), afterFirst, 'sixty identical frames should write nothing');

    // One digit changing from 5 to 6 lights segment e and darkens nothing
    // else, so it should be a single write, not a redraw of the display.
    renderer.showHex(0x02A6, 0x3C);
    assert.equal(writes(), afterFirst + 1);
    assert.equal(litSegments(renderer, 3), HEX_GLYPHS[0x6]);
});

test('every lit segment is drawn over its own package, on top of its unlit twin', () => {
    const { renderer } = makeRenderer();
    const packages = renderer.digits.map(drawnBox);

    // The packages stand side by side without overlapping, so "inside its own"
    // below also means "outside every other".
    for (let i = 1; i < 6; i++) {
        assert.ok(packages[i].x0 >= packages[i - 1].x1, `package ${i} overlaps package ${i - 1}`);
    }

    renderer.digits.forEach((digit, i) => {
        // Everything the package itself draws that could be an unlit window.
        const windows = shapesIn(digit)
            .filter((shape) => shape.tagName === 'polygon' || shape.tagName === 'circle')
            .map(drawnBox);

        for (const name of SEGMENT_NAMES) {
            for (const shape of shapesIn(digit.segments[name])) {
                const lit = drawnBox(shape);
                const where = `digit ${i}, segment ${name}`;
                assert.ok(lit.x0 >= packages[i].x0 && lit.x1 <= packages[i].x1 &&
                          lit.y0 >= packages[i].y0 && lit.y1 <= packages[i].y1,
                    `${where}: drawn at x ${lit.x0.toFixed(1)}-${lit.x1.toFixed(1)}, ` +
                    `outside its package at x ${packages[i].x0.toFixed(1)}-${packages[i].x1.toFixed(1)}`);
                // A lit shape may be drawn a little larger than its window, so
                // compare centres rather than edges.
                assert.ok(windows.some((w) => Math.abs(w.cx - lit.cx) < 0.5 && Math.abs(w.cy - lit.cy) < 0.5),
                    `${where}: no unlit window beneath it at (${lit.cx.toFixed(1)}, ${lit.cy.toFixed(1)})`);
            }
        }
    });
});

test('the named segments sit where a seven-segment digit has them', () => {
    const { renderer } = makeRenderer();

    renderer.digits.forEach((digit, i) => {
        const at = Object.fromEntries(SEGMENT_NAMES.map((name) => [name, drawnBox(digit.segments[name])]));
        const { a, b, c, d, e, f, g } = at;
        const say = (what) => `digit ${i}: ${what}`;

        //    aaa
        //   f   b
        //    ggg
        //   e   c
        //    ddd
        assert.ok(a.cy < g.cy && g.cy < d.cy, say('a, g and d should run top, middle, bottom'));
        for (const [name, bar] of [['a', a], ['g', g], ['d', d]]) {
            assert.ok(bar.w > bar.h, say(`${name} should be a horizontal bar`));
        }
        for (const [name, upright] of [['b', b], ['c', c], ['e', e], ['f', f]]) {
            assert.ok(upright.h > upright.w, say(`${name} should be an upright`));
        }
        assert.ok(a.cy < f.cy && f.cy < g.cy && a.cy < b.cy && b.cy < g.cy, say('f and b belong to the upper half'));
        assert.ok(g.cy < e.cy && e.cy < d.cy && g.cy < c.cy && c.cy < d.cy, say('e and c belong to the lower half'));
        assert.ok(f.cx < a.cx && a.cx < b.cx, say('f should be left of the digit and b right of it'));
        assert.ok(e.cx < d.cx && d.cx < c.cx, say('e should be left of the digit and c right of it'));

        // The real parts lean: the head of the digit is to the right of its foot.
        assert.ok(a.cx > d.cx && b.cx > c.cx && f.cx > e.cx, say('the digit should lean to the right'));

        // A decimal point belongs at the foot of the digit, beside it, never
        // inside it.
        for (const point of shapesIn(digit.segments.dp).map(drawnBox)) {
            assert.ok(point.cy > c.cy && point.cy < d.y1 + point.h, say('a decimal point should sit at the foot of the digit'));
            assert.ok(point.x1 <= e.x0 || point.x0 >= c.x1, say('a decimal point should sit beside the digit, not inside it'));
        }
    });
});

test('the renderer draws nothing but SVG and never reaches for a network resource', () => {
    const { container } = makeRenderer();

    for (const el of allElements(container.children[0])) {
        for (const [name, value] of el.attributes) {
            // The page's CSP allows same-document references only: a url(#id) is
            // fine, an http: or data: URI would be blocked and leave a hole.
            assert.ok(!/(https?:|data:)/i.test(value), `${el.tagName} ${name}="${value}"`);
        }
        assert.ok(!/(https?:|data:)/i.test(el.innerHTML), `${el.tagName} innerHTML`);
    }
});
