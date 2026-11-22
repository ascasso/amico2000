'use strict';

// The guide in two languages.
//
// guide.html is the guide in English and guida.html the same guide in
// Italian, for the people who used the board around 1980. They are two
// files written by hand, so nothing but a check keeps one from being changed
// without the other. These checks hold them to the same skeleton:
//
// - the same sections and anchors, so that a link such as
//   guida.html#file-formats lands where guide.html#file-formats does;
// - the same listings, byte for byte, because tests/user-leds.test.js and
//   tests/guide-console-example.test.js run the listings of guide.html only,
//   and a listing that is identical in guida.html is covered by them too;
// - the same hex values, addresses, file names and console commands in the
//   running text, which is where a translation would most easily drop or
//   mistype one;
// - each page pointing at the other, for a reader and for a search engine.
//
// What they cannot check is the prose itself: that the Italian says what the
// English says has to be read by a person.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://ascasso.github.io/amico2000/';

const english = fs.readFileSync(path.join(ROOT, 'guide.html'), 'utf8');
const italian = fs.readFileSync(path.join(ROOT, 'guida.html'), 'utf8');

/** Every capture of a pattern's first group, in page order. */
function all(page, pattern) {
    return [...page.matchAll(pattern)].map((match) => match[1]);
}

const ids = (page) => all(page, /\sid="([^"]+)"/g);
const listings = (page) => all(page, /<pre><code>([\s\S]*?)<\/code><\/pre>/g);
const codeSpans = (page) => all(page, /<code>([\s\S]*?)<\/code>/g);
const keys = (page) => all(page, /<kbd>([\s\S]*?)<\/kbd>/g);
// Sorted, because a sentence in Italian need not name things in the order
// the English one does.
const sorted = (list) => [...list].sort();

/** The page's <nav>, the list of its sections. */
function contents(page) {
    const nav = page.match(/<nav[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(nav, 'the guide has a list of its sections');
    return all(nav[1], /href="([^"]+)"/g);
}

test('the two guides say which language they are in', () => {
    assert.match(english, /<html lang="en">/);
    assert.match(italian, /<html lang="it">/);
});

test('both guides have the same sections and anchors, in the same order', () => {
    assert.ok(ids(english).length >= 11, 'the English guide has its anchors');
    assert.deepEqual(ids(italian), ids(english));
    assert.equal(new Set(ids(english)).size, ids(english).length, 'no id is used twice');
});

test('both guides print the same listings, byte for byte', () => {
    assert.ok(listings(english).length >= 8, 'the English guide has its listings');
    assert.deepEqual(listings(italian), listings(english));
});

test('both guides name the same values, addresses, files and commands', () => {
    assert.deepEqual(sorted(codeSpans(italian)), sorted(codeSpans(english)));
});

test('both guides name the same keys of the computer keyboard', () => {
    assert.deepEqual(sorted(keys(italian)), sorted(keys(english)));
});

test('both guides list the same sections at the top, and every link within a page has somewhere to land', () => {
    assert.deepEqual(contents(italian), contents(english));
    for (const [name, page] of [['guide.html', english], ['guida.html', italian]]) {
        const known = new Set(ids(page));
        for (const anchor of all(page, /href="#([^"]*)"/g)) {
            assert.ok(known.has(anchor), `${name} links to #${anchor}, which it does not have`);
        }
    }
});

test('each guide links to the other, for a reader and for a search engine', () => {
    assert.match(english, /<a class="lang" href="guida\.html" lang="it" hreflang="it">Italiano<\/a>/);
    assert.match(italian, /<a class="lang" href="guide\.html" lang="en" hreflang="en">English<\/a>/);

    // The same three alternates on both pages: a search engine takes a pair
    // only when each page names the other and itself.
    const alternates = (page) => [...page.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)]
        .map(([, language, address]) => [language, address]);
    const expected = [
        ['en', SITE + 'guide.html'],
        ['it', SITE + 'guida.html'],
        ['x-default', SITE + 'guide.html']
    ];
    assert.deepEqual(alternates(english), expected);
    assert.deepEqual(alternates(italian), expected);

    assert.match(english, new RegExp(`<link rel="canonical" href="${SITE}guide\\.html">`));
    assert.match(italian, new RegExp(`<link rel="canonical" href="${SITE}guida\\.html">`));
});

test('the Italian guide sends its reader back to the emulator in Italian', () => {
    const home = all(italian, /href="(index\.html[^"]*)"/g);
    assert.equal(home.length, 2, 'a link back at the top and one at the foot');
    for (const address of home) {
        assert.equal(address, 'index.html?lang=it');
    }
    assert.equal(all(english, /href="(index\.html[^"]*)"/g).length, 2);
});

test('both guides carry the same Content-Security-Policy', () => {
    const policy = (page) => page.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
    assert.ok(policy(english), 'guide.html has its policy');
    assert.ok(policy(italian), 'guida.html has its policy');
    assert.equal(policy(italian)[1], policy(english)[1]);
});
