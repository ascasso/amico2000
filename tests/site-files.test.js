'use strict';

// The files a search engine depends on and nobody looks at: an empty
// .nojekyll, Google's verification file, and the sitemap. Each is easy to
// delete or let drift without anything on the page showing it.
//
// The check of 2026-11-23 (docs/logs) is what they come from. Without
// .nojekyll, GitHub Pages ran Jekyll over the repository and published every
// Markdown document as a web page of its own, AGENTS.md and the session
// handover among them, 22 pages beside the three the site means to have.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://ascasso.github.io/amico2000/';
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');

/** The sitemap's entries, as {loc, lastmod, file}. */
function sitemap() {
    return [...read('sitemap.xml').matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)]
        .map(([, loc, lastmod]) => ({ loc, lastmod, file: loc === SITE ? 'index.html' : loc.slice(SITE.length) }));
}

test('.nojekyll is at the root, so the documents are not published as pages', () => {
    assert.ok(fs.existsSync(path.join(ROOT, '.nojekyll')),
        'without .nojekyll GitHub Pages renders every .md file as a page of the site');
    assert.ok(!fs.existsSync(path.join(ROOT, '_config.yml')), 'there is no Jekyll build to configure');
});

test('Google\'s verification file is in place, as Google wrote it', () => {
    assert.equal(read('google7a632e30a7a507df.html'),
        'google-site-verification: google7a632e30a7a507df.html');
});

test('the sitemap lists each public page at its canonical address', () => {
    const entries = sitemap();
    assert.deepEqual(entries.map((entry) => entry.file).sort(), ['guida.html', 'guide.html', 'index.html']);
    for (const { loc, file } of entries) {
        const canonical = read(file).match(/<link rel="canonical" href="([^"]+)">/);
        assert.ok(canonical, `${file} must name its canonical address`);
        assert.equal(canonical[1], loc, `${file}: the sitemap and the page must give the same address`);
    }
});

test('no page in the sitemap is dated after the build stamp', () => {
    // AGENTS.md: a page's lastmod is the date of the commit that last changed
    // what a visitor sees on it. The stamp is the date of the latest commit,
    // so a lastmod beyond it is a date that has not happened yet.
    const stamp = read('index.html').match(/<time id="build-date" datetime="([^"]*)">/)[1];
    for (const { loc, lastmod } of sitemap()) {
        assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/, `${loc}: lastmod is a plain date`);
        assert.ok(lastmod <= stamp, `${loc}: lastmod ${lastmod} is after the build stamp ${stamp}`);
    }
});

test('the two guides name each other as the same page in another language', () => {
    const alternates = (file) => [...read(file).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)]
        .map(([, lang, href]) => `${lang} ${href}`).sort();
    const expected = [`en ${SITE}guide.html`, `it ${SITE}guida.html`, `x-default ${SITE}guide.html`];
    assert.deepEqual(alternates('guide.html'), expected);
    assert.deepEqual(alternates('guida.html'), expected);
});

test('robots.txt blocks nothing and names the sitemap', () => {
    const rules = read('robots.txt').split('\n').filter((line) => line && !line.startsWith('#'));
    assert.deepEqual(rules, ['User-agent: *', 'Allow: /', `Sitemap: ${SITE}sitemap.xml`]);
});
