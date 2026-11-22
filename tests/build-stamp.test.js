'use strict';

// The home page carries a build date, and AGENTS.md has the rule for it: the
// stamp is the calendar date of the commit it is in, on the committer's own
// calendar, which is what `git log --format=%cs` prints.
//
// "On the committer's own calendar" is easy to get wrong from outside. GitHub
// reports every time in UTC, so a commit made in the evening in a western time
// zone looks as though it were made the next day. The automated review of
// PR #47 read a commit made at 21:36 on 21 November, UTC-8, as one of the
// 22nd, and reported the stamp a day behind when it was right. This check asks
// git, which keeps the time zone each commit was made in, so that the answer
// does not depend on who is asking or where.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

function stamp() {
    const page = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const match = page.match(/<time id="build-date" datetime="([^"]*)">([^<]*)<\/time>/);
    assert.ok(match, 'index.html must carry the build-date stamp');
    return { attribute: match[1], text: match[2] };
}

/** Run git in the repository, or return null where there is no git or no repository. */
function git(...args) {
    try {
        return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch (err) {
        return null;
    }
}

test('the build stamp says one date, in both of its forms', () => {
    const { attribute, text } = stamp();
    assert.match(attribute, /^\d{4}-\d{2}-\d{2}$/, 'the datetime attribute is YYYY-MM-DD');
    assert.equal(text, attribute.replaceAll('-', ''), 'and the text is the same date as YYYYMMDD');
    const date = new Date(`${attribute}T00:00:00Z`);
    assert.equal(date.toISOString().slice(0, 10), attribute, 'and it is a date that exists');
});

test('the build stamp is the date of the latest commit, on the committer\'s own calendar (PR #47)', (t) => {
    // The latest commit that somebody made, as opposed to a merge.
    const latest = git('log', '-1', '--no-merges', '--format=%cs%x09%ce');
    if (!latest) {
        t.skip('not a git checkout, so there is no commit to compare with');
        return;
    }
    const [committed, committer] = latest.split('\t');
    if (committer === 'noreply@github.com') {
        // A commit GitHub made itself, by squashing or rebasing a pull
        // request, is dated in UTC whatever the author's time zone was.
        t.skip('the latest commit was made on GitHub, which dates its commits in UTC');
        return;
    }

    const { attribute } = stamp();
    const clean = git('status', '--porcelain', '--untracked-files=no') === '';
    if (clean) {
        assert.equal(attribute, committed,
            `index.html says Build ${attribute}, but the latest commit was made on ${committed} ` +
            '(git log -1 --no-merges --format=%cs). See the build-date rule in AGENTS.md.');
        return;
    }

    // Work in progress. The commit it becomes will be dated today, here, so
    // the stamp may already have been advanced to today; until then it is
    // still the last commit's. Anything else is wrong. A stamp that is merely
    // waiting to be advanced is pointed out but does not fail, or this check
    // would start failing at midnight with nothing changed.
    const now = new Date();
    const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
        .map((part) => String(part).padStart(2, '0')).join('-');
    assert.ok(attribute === committed || attribute === today,
        `index.html says Build ${attribute}; with uncommitted changes it should be ` +
        `${committed}, the latest commit's date, or ${today}, today's.`);
    if (attribute !== today) {
        t.diagnostic(`a commit made now must carry Build ${today.replaceAll('-', '')}; index.html still says ${attribute}`);
    }
});
