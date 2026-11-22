'use strict';

// The handheld layout, for a phone held upright, was added on the condition
// that the desktop page stays exactly as it was. It was checked pixel for
// pixel in a browser when it was written; these checks guard the two things
// that keep it true, so that a later change cannot break it unnoticed:
//
// - every style rule for the layout applies only while it is on, that is
//   under html.handheld, which main.js sets, apart from the one rule that
//   keeps its two new elements hidden everywhere else;
// - main.js turns it on only for a narrow, upright screen with a coarse
//   pointer, which a desktop with a mouse never has, however its window is
//   shaped.
//
// What the layout looks like and that its keys work by touch can only be
// checked in a browser; see "Handheld layout" in AGENTS.md.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');

/** The rules between the handheld markers, as [selectors, body] pairs. */
function handheldRules() {
    const block = page.match(/\/\* handheld:begin \*\/([\s\S]*?)\/\* handheld:end \*\//);
    assert.ok(block, 'index.html must mark its handheld styles with handheld:begin and handheld:end');
    const css = block[1].replace(/\/\*[\s\S]*?\*\//g, '');
    assert.ok(!css.includes('@'), 'no at-rules inside the block: the layout is switched by a class, not by @media');
    return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, body]) => [
        selectors.split(',').map((selector) => selector.trim()).filter(Boolean),
        body.trim()
    ]);
}

test('every handheld style applies only while the handheld layout is on', () => {
    const rules = handheldRules();
    assert.ok(rules.length > 10, `the block should hold the layout's rules, found ${rules.length}`);

    for (const [selectors, body] of rules) {
        const always = selectors.every((s) => s === '.handheld-panel' || s === '.board-caption');
        if (always) {
            // The one rule that is not scoped: it hides the two elements the
            // layout added, which is what keeps them out of the desktop page.
            assert.equal(body.replace(/\s+/g, ' '), 'display: none;',
                'the unscoped rule may only hide the panel and the caption');
            continue;
        }
        for (const selector of selectors) {
            assert.ok(selector.startsWith('html.handheld '),
                `"${selector}" must start with html.handheld, or it reaches the desktop page`);
        }
    }
});

test('nothing outside the block styles the handheld layout', () => {
    const outside = page.replace(/\/\* handheld:begin \*\/[\s\S]*?\/\* handheld:end \*\//, '');
    const style = outside.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\/\*[\s\S]*?\*\//g, '');
    assert.ok(!/html\.handheld|\.handheld-panel|\.handheld-mark|\.board-caption/.test(style));
});

test('main.js turns the layout on only for an upright touch screen', () => {
    const query = script.match(/const HANDHELD_QUERY = '([^']+)';/);
    assert.ok(query, 'main.js must declare HANDHELD_QUERY');
    const parts = query[1].split(/\s+and\s+/).map((part) => part.trim());
    assert.ok(parts.includes('(orientation: portrait)'), 'portrait only');
    assert.ok(parts.includes('(pointer: coarse)'), 'a coarse pointer only: a desktop with a mouse never matches');
    const width = parts.find((part) => part.startsWith('(max-width:'));
    assert.ok(width, 'a narrow screen only');
    assert.ok(parseInt(width.match(/\d+/)[0], 10) < 760,
        'below the board\'s minimum width, so that any screen the board fits keeps the board');

    // It is the class, set by main.js and by nothing else, that switches the styles.
    assert.match(script, /root\.classList\.toggle\('handheld', wanted\)/);
});

test('the page has the panel and the caption, and they start empty and hidden', () => {
    const panel = page.match(/<section class="handheld-panel" id="handheld-panel"[^>]*>([\s\S]*?)<\/section>/);
    assert.ok(panel, 'the handheld panel is in the page');
    assert.ok(!/class="key|id="display"|class="led/.test(panel[1]),
        'it holds no live parts in the page as served: main.js moves them in');
    assert.match(panel[1], /class="handheld-mark"/);
    assert.match(page, /<p class="board-caption">/);

    // And they come before and inside the board, in that order, so that the
    // panel is the first thing under the title on a phone.
    assert.ok(page.indexOf('id="handheld-panel"') < page.indexOf('<div class="board-scroll">'));
});

test('what moves into the panel is each of the parts a person works', () => {
    const list = script.match(/const HANDHELD_PARTS = \[([^\]]+)\];/);
    assert.ok(list);
    const selectors = [...list[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    assert.deepEqual(selectors, ['.display-block', '.led-bank', '.keyfield.func', '.keyfield.hex']);
    // Each is exactly one direct child of the board in the page as served.
    for (const selector of selectors) {
        const classes = selector.slice(1).split('.');
        const pattern = new RegExp(`<div class="part ${classes.join(' ')}"`, 'g');
        assert.equal((page.match(pattern) || []).length, 1, `one ${selector} on the board`);
    }
});
