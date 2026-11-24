'use strict';

// Two rules of the language, tried on every small program there is:
//
// - a name has to be assigned on every path that reaches a read of it;
// - every statement has to be reachable.
//
// The compiler decides both as it goes down the source, block by block. The
// oracle here decides them another way, on a graph: one node for a statement,
// an edge wherever control can pass, reachability by search from the first
// statement, and the names certainly assigned at each node by going round
// the graph until nothing changes. A mistake in how the compiler joins the
// arms of an `if`, or in what it takes to follow a `loop`, a `stop` or a
// `break`, would have to be made here too, in a different shape, to go
// unnoticed.
//
// "Every small program" means every nesting of `if`, `else`, `loop`, `for`,
// `break`, `next` and `stop` with assignments and reads, up to a number of
// statements. The
// compiler has to accept exactly the programs the oracle accepts, and refuse
// the others at the same line and for the same reason. To go deeper:
//
//     AMICO_STATEMENTS=6 node --test tests/compiler-assignment.test.js
//
// which takes a little over a minute. It was one reviewer's harness in the
// check of 2026-11-23 (AGENTS.md, A Review by Several Agents), run then to
// seven statements with one name and to six with two. That was before
// there was a `for`, a `break` or a `next`; with them there are many more
// programs of each size.

const test = require('node:test');
const assert = require('node:assert/strict');
const { compile } = require('../compiler/compile');

const STATEMENTS = Number(process.env.AMICO_STATEMENTS) || 5;
// Every `for` in these programs counts in this one name, which nothing else
// assigns. So a read of it is a read of a name that only a `for` can have
// assigned, and a `for` inside a `for` is the mistake of counting two loops
// in one name.
const COUNT = 'k';

// A program is a list of statements, each a small array:
//   ['assign', name]             name = 1
//   ['read', name]               display.data = name
//   ['stop']
//   ['break']
//   ['next']
//   ['loop', body]
//   ['for', body]                for k in 0..1
//   ['if', then, otherwise]      otherwise is null when there is no else
// A statement's size is the number of lines it takes apart from each `end`:
// an `else` counts as one.
function size(statement) {
    const of = (body) => body.reduce((total, inner) => total + size(inner), 0);
    if (statement[0] === 'loop' || statement[0] === 'for') return 1 + of(statement[1]);
    if (statement[0] === 'if') return 1 + of(statement[1]) + (statement[2] ? 1 + of(statement[2]) : 0);
    return 1;
}

// Every list of statements of exactly this size, nested no deeper than this.
// `made` says what the programs are made of: `names`, the names assigned and
// read; `counts`, whether there are `for` loops and reads of their name; and
// `jumps`, whether there are `break` and `next`.
function* bodies(total, depth, made) {
    if (total === 0) {
        yield [];
        return;
    }
    for (const first of statements(total, depth, made)) {
        for (const rest of bodies(total - size(first), depth, made)) yield [first, ...rest];
    }
}

function* statements(most, depth, made) {
    for (const name of made.names) {
        yield ['assign', name];
        yield ['read', name];
    }
    if (made.counts) yield ['read', COUNT];
    yield ['stop'];
    if (made.jumps) {
        yield ['break'];
        yield ['next'];
    }
    if (depth === 0) return;
    for (let inside = 0; inside <= most - 1; inside++) {
        for (const body of bodies(inside, depth - 1, made)) {
            yield ['loop', body];
            yield ['if', body, null];
            if (made.counts) yield ['for', body];
        }
    }
    for (let inside = 0; inside <= most - 2; inside++) {
        for (let first = 0; first <= inside; first++) {
            for (const then of bodies(first, depth - 1, made)) {
                for (const otherwise of bodies(inside - first, depth - 1, made)) yield ['if', then, otherwise];
            }
        }
    }
}

// The source the compiler is given, and with it the line each statement is
// on, which the oracle reports. A read goes to a display field, and an `if`
// tests one, so that nothing but the named variables is in question.
// `how.ending` is how a 'stop' statement is written: the language has two
// statements that nothing follows, `stop` and `display.hold()`. With
// `how.chains`, an `else` that holds one `if` and nothing more is written as
// `else if`, which is the same thing with one `end` fewer.
function sourceOf(body, how, lines = [], indent = '') {
    for (const statement of body) {
        if (statement[0] === 'assign') lines.push(`${indent}${statement[1]} = 1`);
        else if (statement[0] === 'read') lines.push(`${indent}display.data = ${statement[1]}`);
        else if (statement[0] === 'stop') lines.push(indent + how.ending);
        else if (statement[0] === 'break' || statement[0] === 'next') lines.push(indent + statement[0]);
        else if (statement[0] === 'loop' || statement[0] === 'for') lines.push(indent + (statement[0] === 'loop' ? 'loop' : `for ${COUNT} in 0..1`));
        else lines.push(`${indent}if display.low == 0`);
        statement.line = lines.length;
        if (statement[0] === 'loop' || statement[0] === 'for') {
            sourceOf(statement[1], how, lines, indent + '    ');
            lines.push(`${indent}end`);
        } else if (statement[0] === 'if') {
            for (let test = statement; ;) {
                sourceOf(test[1], how, lines, indent + '    ');
                const other = test[2];
                if (!(how.chains && other && other.length === 1 && other[0][0] === 'if')) {
                    if (other) {
                        lines.push(`${indent}else`);
                        sourceOf(other, how, lines, indent + '    ');
                    }
                    break;
                }
                test = other[0];
                lines.push(`${indent}else if display.low == 0`);
                test.line = lines.length;
            }
            lines.push(`${indent}end`);
        }
    }
    return lines;
}

/**
 * What the compiler ought to say: `{ accepted: true }`, or the line of the
 * first statement in source order that is wrong, and why.
 */
function oracle(body, names) {
    const nodes = [];
    const AFTER = -1; // where control goes when it runs off the program's end

    // Give each statement a node, in source order, with the line the source
    // has it on. A `for` is two nodes: the statement, which starts the count
    // and so assigns its name, and the step at its foot, which is no
    // statement and has no line.
    (function number(list, counting) {
        for (const statement of list) {
            statement.node = nodes.length;
            nodes.push({ kind: statement[0], name: statement[0] === 'for' ? COUNT : statement[1], line: statement.line, next: [] });
            if (statement[0] === 'for') {
                nodes[statement.node].twice = counting;
                statement.step = nodes.length;
                nodes.push({ kind: 'step', next: [] });
                number(statement[1], true);
            } else if (statement[0] === 'loop') {
                number(statement[1], counting);
            } else if (statement[0] === 'if') {
                number(statement[1], counting);
                if (statement[2]) number(statement[2], counting);
            }
        }
    })(body, false);

    // Link a list backwards: each statement leads to the one after it, the
    // last to wherever the whole list leads. Returns where the list begins,
    // which for an empty list is where it leads. `around` is the loop the
    // list is in, if it is in one: where a `break` goes, `out`, and where a
    // `next` goes, `again`.
    function link(list, leadsTo, around) {
        let following = leadsTo;
        for (let i = list.length - 1; i >= 0; i--) {
            const statement = list[i];
            const node = nodes[statement.node];
            if (statement[0] === 'stop') node.next = [];
            else if (statement[0] === 'break' || statement[0] === 'next') {
                node.next = around ? [statement[0] === 'break' ? around.out : around.again] : [];
                node.astray = !around;
            } else if (statement[0] === 'loop') {
                node.next = [link(statement[1], statement.node, { out: following, again: statement.node })];
            } else if (statement[0] === 'for') {
                // Into the statements, which lead to the step; from the step
                // round again, or on when the count is done.
                const inside = link(statement[1], statement.step, { out: following, again: statement.step });
                node.next = [inside];
                nodes[statement.step].next = [inside, following];
            } else if (statement[0] === 'if') {
                node.next = [link(statement[1], following, around), statement[2] ? link(statement[2], following, around) : following];
            } else node.next = [following];
            following = statement.node;
        }
        return following;
    }
    const first = link(body, AFTER, null);

    const reached = new Set();
    const pending = [first];
    while (pending.length) {
        const node = pending.pop();
        if (node === AFTER || reached.has(node)) continue;
        reached.add(node);
        pending.push(...nodes[node].next);
    }

    // The names certainly assigned on arrival at a node: those assigned on
    // every path into it. Start by supposing all of them everywhere but at
    // the first statement, and take away whatever some path lacks.
    const assignedAt = nodes.map(() => new Set([...names, COUNT]));
    if (first !== AFTER) assignedAt[first] = new Set();
    let changed = true;
    while (changed) {
        changed = false;
        for (const node of reached) {
            const leaving = new Set(assignedAt[node]);
            if (nodes[node].kind === 'assign' || nodes[node].kind === 'for') leaving.add(nodes[node].name);
            for (const next of nodes[node].next) {
                if (next === AFTER) continue;
                for (const name of [...assignedAt[next]]) {
                    if (!leaving.has(name)) {
                        assignedAt[next].delete(name);
                        changed = true;
                    }
                }
            }
        }
    }

    for (let node = 0; node < nodes.length; node++) {
        if (nodes[node].kind === 'step') continue;
        // Wrong wherever it stands, so told before whether it can be reached.
        if (nodes[node].astray) return { accepted: false, line: nodes[node].line, why: 'there is none round it' };
        if (!reached.has(node)) return { accepted: false, line: nodes[node].line, why: 'Unreachable statement' };
        if (nodes[node].twice) return { accepted: false, line: nodes[node].line, why: 'already counting' };
        if (nodes[node].kind === 'read' && !assignedAt[node].has(nodes[node].name)) {
            return { accepted: false, line: nodes[node].line, why: 'assigned variable' };
        }
    }
    return { accepted: true };
}

// Tries every program of up to `most` statements made of these things, and
// returns how many there were, how many are valid, and the first few on
// which compiler and oracle part.
function tryAll(most, depth, made, how = {}) {
    const result = { programs: 0, accepted: 0, chains: 0, disagreements: [] };
    for (let total = 1; total <= most; total++) {
        for (const body of bodies(total, depth, made)) {
            result.programs++;
            // The source first: writing it gives each statement its line.
            const source = sourceOf(body, { ending: 'stop', ...how }).join('\n');
            const expected = oracle(body, made.names);
            if (source.includes('else if')) result.chains++;
            let said = 'accepted';
            try {
                compile(source);
            } catch (error) {
                said = error.message;
            }
            if (expected.accepted) result.accepted++;
            const agree = expected.accepted
                ? said === 'accepted'
                : said.startsWith(`Line ${expected.line}: `) && said.includes(expected.why);
            if (!agree && result.disagreements.length < 3) {
                const wanted = expected.accepted ? 'accepted' : `Line ${expected.line}: ... ${expected.why}`;
                result.disagreements.push(`${source}\n  the compiler says: ${said}\n  it should say:     ${wanted}`);
            }
        }
    }
    return result;
}

test('one name: the compiler accepts and refuses exactly what the oracle does', () => {
    const result = tryAll(STATEMENTS, 3, { names: ['x'] });
    assert.deepEqual(result.disagreements, []);
    // The counts are a check on the test itself: an enumerator that stopped
    // short would still agree with the compiler on everything it tried.
    if (STATEMENTS === 5) assert.deepEqual([result.programs, result.accepted], [35662, 5974]);
});

test('two names: an assignment to one does not stand for the other', () => {
    const result = tryAll(STATEMENTS - 1, 3, { names: ['x', 'y'] });
    assert.deepEqual(result.disagreements, []);
    if (STATEMENTS === 5) assert.deepEqual([result.programs, result.accepted], [9136, 1844]);
});

// The same programs with `display.hold()` wherever they had `stop`. It scans
// the displays for ever, so for these two rules it is the same thing: a
// statement that nothing follows.
test('display.hold() ends a path as stop does', () => {
    const result = tryAll(STATEMENTS - 1, 3, { names: ['x'] }, { ending: 'display.hold()' });
    assert.deepEqual(result.disagreements, []);
    if (STATEMENTS === 5) assert.deepEqual([result.programs, result.accepted], [3464, 854]);
});

// A `for` assigns its own name before its statements run, which they do at
// least once, so the name can be read inside the loop and after it, and what
// the statements assign on every path through them is assigned afterwards.
// One name cannot count two loops at once.
test('for: the loop assigns its name, and runs its statements at least once', () => {
    const result = tryAll(STATEMENTS, 3, { names: ['x'], counts: true });
    assert.deepEqual(result.disagreements, []);
    if (STATEMENTS === 5) assert.deepEqual([result.programs, result.accepted], [187126, 26321]);
});

// `break` leads to what follows the loop it is in, and `next` to the top of
// a `loop` or the foot of a `for`. Nothing follows either in its own block,
// what follows a `loop` is reached only by a `break`, and a name can be read
// after a loop only if every way out of it had assigned it.
test('break and next: what follows a loop is what its ways out lead to', () => {
    const result = tryAll(STATEMENTS, 3, { names: ['x'], counts: true, jumps: true });
    assert.deepEqual(result.disagreements, []);
    if (STATEMENTS === 5) assert.deepEqual([result.programs, result.accepted], [457408, 36545]);
});

// The same programs again, with every `else` that holds one `if` and nothing
// more written as `else if`. It is the same nest, closed by one `end`, so the
// same programs are valid, and each refusal is at the line the shorter source
// has the statement on.
test('else if: a chain is the nest it stands for', () => {
    const plain = tryAll(STATEMENTS, 3, { names: ['x'] }, { chains: true });
    assert.deepEqual(plain.disagreements, []);
    // How many of them have a chain is counted, so that this cannot pass by
    // having written none.
    if (STATEMENTS === 5) assert.deepEqual([plain.programs, plain.accepted, plain.chains], [35662, 5974, 398]);
    const loops = tryAll(STATEMENTS - 1, 3, { names: ['x'], counts: true, jumps: true }, { chains: true });
    assert.deepEqual(loops.disagreements, []);
    if (STATEMENTS === 5) assert.deepEqual([loops.programs, loops.accepted, loops.chains], [27007, 3569, 41]);
});
