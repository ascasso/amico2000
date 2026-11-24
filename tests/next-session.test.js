'use strict';

// NextSession.md is what the owner reads at the start of a session: what to
// work on next, and what else is open, a line or two to an item. Nothing
// stopped it from growing. Cut to 102 lines on 2026-11-21 at the owner's
// request, it was 1,000 lines three days later, 411 of them one item, and
// the owner asked again. AGENTS.md (Agent Operating Contract) says where the
// rest goes; this holds the file to its length, and its items to the
// documents that have their detail.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

// Room for a few more items, and none for an account of how one was done.
const LINES_AT_MOST = 120;

/** The open items of NextSession.md, as {number, text}: a bullet that begins with a number in bold. */
function listed() {
    return read('NextSession.md').split(/\n(?=- )/)
        .map((bullet) => /^- \*\*(\d+)\. /.exec(bullet) && { number: Number(/^- \*\*(\d+)\. /.exec(bullet)[1]), text: bullet })
        .filter(Boolean);
}

test('NextSession.md is short', () => {
    const lines = read('NextSession.md').trimEnd().split('\n').length;
    assert.ok(lines <= LINES_AT_MOST, 'NextSession.md has ' + lines + ' lines, and ' + LINES_AT_MOST + ' is the most: ' +
        'what was done goes to the changelog and the log, a decision or a detail to the document for it (AGENTS.md)');
});

test('every document NextSession.md names is there', () => {
    const named = [...read('NextSession.md').matchAll(/`((?:docs\/)?[\w.-]+\.md)`/g)].map((match) => match[1]);
    assert.ok(named.includes('docs/open-work.md') && named.includes('docs/amico-design.md'), 'the documents with the detail are named');
    for (const name of named) assert.ok(fs.existsSync(path.join(ROOT, name)), name + ' is named in NextSession.md and is not in the repository');
});

test('an open item has its detail under the same number, or names the document that has it', () => {
    const items = listed();
    assert.ok(items.length >= 1, 'NextSession.md lists its open items as bullets that begin with a number in bold');
    assert.equal(new Set(items.map((item) => item.number)).size, items.length, 'no number is used twice');
    const detailed = [...read('docs/open-work.md').matchAll(/^## (\d+)\. /gm)].map((match) => Number(match[1]));
    for (const item of items) {
        const elsewhere = /`docs\/(?!open-work)[\w.-]+\.md`/.test(item.text);
        assert.ok(elsewhere || detailed.includes(item.number),
            'item ' + item.number + ' has no section "## ' + item.number + '." in docs/open-work.md and names no other document');
    }
    // The other way round: a section nobody lists is work nobody will be told of.
    for (const number of detailed) {
        assert.ok(items.some((item) => item.number === number), 'docs/open-work.md has item ' + number + ', which NextSession.md does not list');
    }
});
