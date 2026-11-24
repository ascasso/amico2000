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
// arms of an `if`, or in what it takes to follow a `loop` or a `stop`, would
// have to be made here too, in a different shape, to go unnoticed.
//
// "Every small program" means every nesting of `if`, `else`, `loop` and
// `stop` with assignments and reads, up to a number of statements. The
// compiler has to accept exactly the programs the oracle accepts, and refuse
// the others at the same line and for the same reason. To go deeper:
//
//     AMICO_STATEMENTS=7 node --test tests/compiler-assignment.test.js
//
// which is 5.6 million programs, 4.1 million with one name and 1.5 million
// with two, and takes about half a minute. It was one
// reviewer's harness in the check of 2026-11-23 (AGENTS.md, A Review by
// Several Agents), run then to seven statements with one name and to six
// with two.

const test = require('node:test');
const assert = require('node:assert/strict');
const { compile } = require('../compiler/compile');

const STATEMENTS = Number(process.env.AMICO_STATEMENTS) || 5;

// A program is a list of statements, each a small array:
//   ['assign', name]             name = 1
//   ['read', name]               display.data = name
//   ['stop']
//   ['loop', body]
//   ['if', then, otherwise]      otherwise is null when there is no else
// A statement's size is the number of lines it takes apart from each `end`:
// an `else` counts as one.
function size(statement) {
    const of = (body) => body.reduce((total, inner) => total + size(inner), 0);
    if (statement[0] === 'loop') return 1 + of(statement[1]);
    if (statement[0] === 'if') return 1 + of(statement[1]) + (statement[2] ? 1 + of(statement[2]) : 0);
    return 1;
}

// Every list of statements of exactly this size, nested no deeper than this.
function* bodies(total, depth, names) {
    if (total === 0) {
        yield [];
        return;
    }
    for (const first of statements(total, depth, names)) {
        for (const rest of bodies(total - size(first), depth, names)) yield [first, ...rest];
    }
}

function* statements(most, depth, names) {
    for (const name of names) {
        yield ['assign', name];
        yield ['read', name];
    }
    yield ['stop'];
    if (depth === 0) return;
    for (let inside = 0; inside <= most - 1; inside++) {
        for (const body of bodies(inside, depth - 1, names)) {
            yield ['loop', body];
            yield ['if', body, null];
        }
    }
    for (let inside = 0; inside <= most - 2; inside++) {
        for (let first = 0; first <= inside; first++) {
            for (const then of bodies(first, depth - 1, names)) {
                for (const otherwise of bodies(inside - first, depth - 1, names)) yield ['if', then, otherwise];
            }
        }
    }
}

// The source the compiler is given. A read goes to a display field, and an
// `if` tests one, so that nothing but the named variables is in question.
// `ending` is how a 'stop' statement is written: the language has two
// statements that nothing follows, `stop` and `display.hold()`.
function sourceOf(body, ending, lines = [], indent = '') {
    for (const statement of body) {
        if (statement[0] === 'assign') lines.push(`${indent}${statement[1]} = 1`);
        else if (statement[0] === 'read') lines.push(`${indent}display.data = ${statement[1]}`);
        else if (statement[0] === 'stop') lines.push(indent + ending);
        else if (statement[0] === 'loop') {
            lines.push(`${indent}loop`);
            sourceOf(statement[1], ending, lines, indent + '    ');
            lines.push(`${indent}end`);
        } else {
            lines.push(`${indent}if display.low == 0`);
            sourceOf(statement[1], ending, lines, indent + '    ');
            if (statement[2]) {
                lines.push(`${indent}else`);
                sourceOf(statement[2], ending, lines, indent + '    ');
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

    // Give each statement a node and its line, in source order. An `else`
    // and each `end` take a line and no node.
    let line = 0;
    (function number(list) {
        for (const statement of list) {
            line++;
            statement.node = nodes.length;
            nodes.push({ kind: statement[0], name: statement[1], line, next: [] });
            if (statement[0] === 'loop') {
                number(statement[1]);
                line++;
            } else if (statement[0] === 'if') {
                number(statement[1]);
                if (statement[2]) {
                    line++;
                    number(statement[2]);
                }
                line++;
            }
        }
    })(body);

    // Link a list backwards: each statement leads to the one after it, the
    // last to wherever the whole list leads. Returns where the list begins,
    // which for an empty list is where it leads.
    function link(list, leadsTo) {
        let following = leadsTo;
        for (let i = list.length - 1; i >= 0; i--) {
            const statement = list[i];
            const node = nodes[statement.node];
            if (statement[0] === 'stop') node.next = [];
            else if (statement[0] === 'loop') node.next = [link(statement[1], statement.node)];
            else if (statement[0] === 'if') {
                node.next = [link(statement[1], following), statement[2] ? link(statement[2], following) : following];
            } else node.next = [following];
            following = statement.node;
        }
        return following;
    }
    const first = link(body, AFTER);

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
    const assignedAt = nodes.map(() => new Set(names));
    if (first !== AFTER) assignedAt[first] = new Set();
    let changed = true;
    while (changed) {
        changed = false;
        for (const node of reached) {
            const leaving = new Set(assignedAt[node]);
            if (nodes[node].kind === 'assign') leaving.add(nodes[node].name);
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
        if (!reached.has(node)) return { accepted: false, line: nodes[node].line, why: 'Unreachable statement' };
        if (nodes[node].kind === 'read' && !assignedAt[node].has(nodes[node].name)) {
            return { accepted: false, line: nodes[node].line, why: 'assigned variable' };
        }
    }
    return { accepted: true };
}

// Tries every program of up to `most` statements over these names, and
// returns how many there were, how many are valid, and the first few on
// which compiler and oracle part.
function tryAll(most, depth, names, ending = 'stop') {
    const result = { programs: 0, accepted: 0, disagreements: [] };
    for (let total = 1; total <= most; total++) {
        for (const body of bodies(total, depth, names)) {
            result.programs++;
            const expected = oracle(body, names);
            const source = sourceOf(body, ending).join('\n');
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
    const result = tryAll(STATEMENTS, 3, ['x']);
    assert.deepEqual(result.disagreements, []);
    // The counts are a check on the test itself: an enumerator that stopped
    // short would still agree with the compiler on everything it tried.
    if (STATEMENTS === 5) assert.deepEqual([result.programs, result.accepted], [35662, 5974]);
});

test('two names: an assignment to one does not stand for the other', () => {
    const result = tryAll(STATEMENTS - 1, 3, ['x', 'y']);
    assert.deepEqual(result.disagreements, []);
    if (STATEMENTS === 5) assert.deepEqual([result.programs, result.accepted], [9136, 1844]);
});

// The same programs with `display.hold()` wherever they had `stop`. It scans
// the displays for ever, so for these two rules it is the same thing: a
// statement that nothing follows.
test('display.hold() ends a path as stop does', () => {
    const result = tryAll(STATEMENTS - 1, 3, ['x'], 'display.hold()');
    assert.deepEqual(result.disagreements, []);
    if (STATEMENTS === 5) assert.deepEqual([result.programs, result.accepted], [3464, 854]);
});
