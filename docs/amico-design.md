# Amico: What Was Decided, and What Is Next

`compiler/` holds Amico, a small language for the AMICO 2000 in which every
value is a byte, and `amicoc`, which compiles it under Node into 6502 code
for `$0200`, as a listing, a binary or a tape. Three documents describe it,
and each has its own job:

- `compiler/README.md` is the reference for the language as it is.
- `AGENTS.md`, under Amico, says how the compiler is built and tested, and
  what an agent has to know before touching it.
- This document has what the owner decided, what the agent settled on the
  owner's behalf, what is not built yet, and how the compiler was checked.

It was the thirteenth item of Outstanding in `NextSession.md` until
2026-11-24, and the logs up to that day call it "`NextSession.md`, item 13".

**Ask before starting a step.** The owner asked on 2026-11-23 for "a
conversation about this before you start making any changes", and has
since said yes to one step at a time. What is next is in `NextSession.md`.

## Settled by the owner

All on 2026-11-23, in conversation.

- **How it began.** In the owner's words, "a thought experiment": asked
  whether such a language was feasible, Codex built all of it in one
  prompt.
- **The name is Amico:** "I'm gonna stick with Amico, .amico. It's the
  obvious choice." Source files end in `.amico`, all lowercase, and the
  compiler is `amicoc`. Write the language Amico and the machine
  AMICO 2000. Adda, Otto and Caro were offered and refused, Adda because
  search engines and people would take it for Ada. Do not reopen it.
- **The direction:** "the language should be fairly simple and be optimized
  for this board, not a generic portable language."
- **The North Star's test does not judge it.** That test is about the
  emulator, and Amico runs on another computer. It stays off the page
  unless the owner asks. It is new, and both READMEs say so, so that nobody
  takes it for ASEL's.
- **No Italian words in the language:** "Italians prefer English for
  programming (Nuova Elettronica around the time of the Amico 2000 tried
  BASIC in Italian and it was hated)".
- **Whether a program shows addresses** was left to the agent, which chose
  both: friendly names for what the board and its monitor have, and
  `byte x at $addr` and `call $addr` for the rest.

### Stays out

A list the owner approved. Do not propose these again.

- anything wider than a byte, carry, pointers;
- more than one operation on a line, parentheses, precedence;
- multiplying or dividing at run time, which a table does;
- strings and records;
- a run-time library, beyond a helper that is asked for and shows in the
  listing, and run-time checks;
- parameters, local variables and recursion;
- any other machine, and the expansion boards;
- include, modules and macros;
- `goto`, and inline assembly, since the listing is assembler source to
  carry on from;
- random numbers: a program counts while it waits for a key, as programs
  did then;
- `while`, `repeat`, `until`, `leave` and `again`: the owner chose `for`,
  `break` and `next` from five forms of loop put to it.

The compiler itself stays small, with no dependencies.

### The second kilobyte

Decided, and to be built when a program first needs it. No new word in the
language. A program that fits in 508 bytes is laid out as today and runs on
any board. A longer one starts at `$0200` all the same and steps over the
vectors at `$03FC-$03FF`, with the NMI vector set to `$FE00`, and the
listing says that it needs the RAM expansion. RUN is always from `0200`.
The owner chose this over leaving the limit where it is and over starting
long programs at `$0400`. What the image of a long program puts in the IRQ
vector is open, with the emulator's own choice of it (`docs/open-work.md`,
item 6).

What the supplement has on the matter, each read on the scan:

- The second kilobyte is in one parts list with the cassette interface,
  Tabella 10 on page 44: IC13 and IC14. The same page says the expanded
  board has "circa 1,5 kbyte di RAM nella quale possono essere scritti i
  programmi". Page 47 has its test: from `0400` to `07FF` "deve essere
  possibile scrivere dei dati". The board the home page draws has all four
  RAMs.
- Two programs of Appendix 2 run across the vectors, and both print
  `00 FE 6F F5` at `$03FC`. The calculator's row on page 99 is
  `03F0 =85 23 8A 60 E6 20 20 1F 06 60 EA EA 00 FE 6F F5`: a routine ends,
  two `NOP`s, the vectors, and the code goes on at `$0400`. The row of "Il
  gioco del 21" on page 104 is
  `03F0 =95 65 96 85 91 A2 04 B5 91 95 92 CA 00 FE 6F F5`, followed by
  `0400 =00 60`: the same four bytes straight after a `DEX`, in what reads
  as the middle of a loop. Whether that routine works as printed was not
  tried.

## Built, and the Small Print the Owner Has Not Seen

Everything here was built on 2026-11-23, and the README describes it. The
owner agreed to each construct. Its small print was the agent's to settle,
and the owner has not yet looked at it settled: these are the choices most
likely to be changed.

- **Names for the key codes** are `keypad.none`, `keypad.run` and four
  more. The agent's recap had `key.none`; a program's own variable is very
  often called `key`, and `if key == key.none` reads badly.
- **`for`:**
  - its two ends are literals or constants, never variables: the language
    has no run-time checks, and with both ends known the loop always runs
    at least once. A count that varies is a `loop` with a `break`. Ends
    that may be variables would be the change most likely to be asked for,
    and would need a decision on what a loop does when its first value
    turns out the greater;
  - it counts down when the first value is the greater, `for i in 5..0`,
    with no word for it;
  - when the loop has run its course its name is one step past the last
    value, 6 after `0..5`, and a byte wraps; left by `break`, the name
    keeps the value it had;
  - inside its own loop the name cannot be assigned, and it is a variable
    of the program's own, not a display field or a named location.
- **Conditions:** `and` and `or` cannot be mixed in one condition, since
  the language has no brackets and no precedence; they are tried in order
  and no further than it takes. `x > 255` and `x <= 255` are refused, as
  deciding nothing.
- **`decimal ... end`:**
  - the monitor's two routines that show the displays do no sums, which was
    found by running them and by following every path of them, so
    `display.scan()`, `display.show()` and `display.hold()` are called with
    decimal mode set, as the 1979 article's clock calls the scan. The key
    routine, and any routine reached by `call`, is called between a `CLD`
    and a `SED` (`docs/monitor-rom-review.md`, bug 2): two bytes more for a
    key read inside a block, and one more for a `call`;
  - a `break` or a `next` that leaves a block, for a loop the block is
    inside, clears decimal mode on its way; `stop` leaves that to the
    monitor;
  - a `for` counts in binary inside a block, as outside;
  - a literal or a constant added or subtracted in a block has to be two
    decimal digits, so `x + 10` is refused and ten is written `$10`. Only
    a sum is checked: `if seconds == 60` compiles and is never so, which
    the README warns of. The agent considered reading `10` as ten inside a
    block and did not, because the same line would then mean two things by
    where it stands. What a variable holds is not checked;
  - a block cannot be inside another;
  - with a byte that is not two decimal digits a sum is whatever the 6502
    makes of it, and that is where the emulator's CPU is known not to match
    the chip (`docs/6502-conformance.md`). Nothing in the tests depends on
    it.
- **`table segments "CIAO"`.** The owner left the alphabet to the agent
  ("I accept your suggestions"):
  - it is the manual's own, Tabella 18 on PDF page 80 of the supplement,
    and no more: the ten digits, the dash, the space, and
    A b C d E F G H I J L n o P q r S t U Y. Read it off the scan, not the
    extracted text, which has three of its bytes wrong; three readings
    made apart agree on all 32 bytes;
  - a character that is not in it is refused by name, K, M, V, W, X and Z
    among them, so the machine cannot spell AMICO; a table written out
    holds any other pattern. The agent did not add shapes the manual
    lacks, a small c, h or u, an underline, a Z drawn as a 2;
  - a letter has one shape and may be written in either case;
  - bit 7 is left clear, though the table prints it set;
  - `segments` is not a word of the language, so it may be a name;
  - a text cannot hold a `#`, which begins a comment anywhere on a line,
    or a double quote. Neither is in the alphabet;
  - **a new character goes in six places:** `ALPHABET` in `compile.js`;
    the message beside it, which lists the alphabet; the README's list;
    the test's `printed` in `tests/compiler.test.js`; `SEGMENTS_OF` in the
    reference interpreter; and the generator's string of characters.

## Not Built

### Tighter code

It changes no word of the language. What is known to tighten:

- `INC` and `DEC` for `x = x + 1` and `x = x - 1`;
- no `CMP #0` after an operation that set the flags;
- an `if` with only a `break`, a `next` or a `stop` in it is a branch over
  a jump, five bytes where a hand writes a branch of two;
- after such an `if` the accumulator still holds what it held, and is
  loaded again;
- a store into a row by the index that was just used to read loads X a
  second time;
- a table byte read by a literal index is loaded without being remembered,
  so two of the same in a row are loaded twice, where two of the same
  number are loaded once.

What must be left alone inside a `decimal` block: `INC` and `DEC` count in
binary there, and on this 6502 the flags after a sum in decimal are not
those of its result. Nor is a `SED` straight followed by a `CLD` taken
out, as a block that ends with a key read has it.

How to do it: run the old compiler beside the new on the examples and on
random programs. Every program has to compute the same, in fewer bytes or
the same, never more. The table under How to Steer It is what to measure
against. The clock's test will say when the clock wants setting again,
since its second is counted in the cycles of a `for`.

### After that, in no settled order

Subroutines, the HLT routine and the listing were agreed with the owner.
Shifts, operand reads and tighter code are from the agent's recap, which
the owner liked as a whole and did not take one by one.

- **Subroutines** with no parameters: `sub tick ... end`, called as
  `tick()`. The spelling is the agent's proposal.
- **A routine for the HLT key.** The owner said in. The agent had voted to
  leave it for now, as the hardest thing on the list: registers to save,
  and the monitor's routines shared with the program it interrupts. Its
  form is not designed.
- **Shifts,** `a << 1` and `a >> 1`.
- **A key read or a table read as an operand:**
  `k = keypad.read() & 15`.
- **The listing as the manual's Tavola A.** The supplement's page 15 has a
  program written first "nel nostro linguaggio", and Tavola A on page 16
  sets three columns side by side: "linguaggio discorsivo (il nostro, non
  comprensibile dal microelaboratore)", "linguaggio simbolico" and
  "linguaggio macchina". Amico is that first column made exact, and its
  listing is nearly the table: it has the mnemonics, the addresses and the
  bytes, and of the source only a line number. The agent proposed printing
  each source line above its instructions, with address and bytes first,
  as the manual prints a listing. The manual's word for a program that
  translates is "traduttore" (page 15), should the site ever need an
  Italian one for the compiler.
- **A table's length as a constant** would spare `slide.amico` its `last`,
  worked out by hand. It has not been put to the owner.

Subroutines and the HLT routine are new ways for control to move, and need
their edges in the oracle of `tests/compiler-assignment.test.js`.

## How to Steer It

By the project's own programs: the manual's sum (Tabella 7), the word on
the displays, the guide's LED counter, the sliding text, the 1979 clock
and 21 fiammiferi. Amico is good enough when each reads well and comes out
close to its hand-written size. All six are in `compiler/examples/`. In
bytes, with what a hand wrote where there is something to compare:

| Program | Amico | By hand |
| --- | --- | --- |
| `sum` | 11 | 10, the manual's, which has no `CLD` |
| `word` | 29 | 6, the manual's loop, and its six bytes keyed into page zero by hand |
| `leds` | 53 | 32, the guide's counter, which waits in a delay loop of two registers |
| `clock` | 90, and 2 in page zero | 63, and 4 in page zero |
| `matches` | 182, and 5 in page zero | 148, with other timing and another opponent |
| `slide` | 87, 31 of them its text | none written yet (`docs/program-shelf.md`) |

They read well. Where there is a like to compare with, they are from a
tenth to two thirds longer than the hand's, which is what tighter code is
for.

## How a Step Is Done

One unit to a commit, each with its test, and the finished series to
reviewers on other models before it is pushed: Codex on the code and a
Claude Opus subagent on the tests and the documents (`AGENTS.md`, A Review
by Several Agents, which also has what each review of 2026-11-23 taught).
Before and after touching the front end, run `AMICO_PROGRAMS=30000` on
`tests/compiler-differential.test.js` and `AMICO_STATEMENTS=6` on
`tests/compiler-assignment.test.js`. The log of 2026-11-23 has what each
series' review found; none found wrong code in an ordinary program.

Not verified by anyone: that 64tass accepts the listing, since it is not
installed, though Codex reports that a copy it had built assembled three
listings to the compiler's bytes; and a real board, and with it a real
8255A, which clears its output latches when a mode word is written, where
the emulator does not.

## History

### The first look, before anything was added

On 2026-11-23, in the compiler as Codex wrote it, by reading it, running
its tests and writing three programs in it, a clock, a die and a hex
entry, each of which ran correctly on the emulated board the first time.
What it found wanting has since been built, apart from carry.

- It is honest about cost. A line is a load, one operation and a
  store, and `squares` comes out at 40 bytes, within a byte of
  hand-written code.
- It knows the monitor: `CLD` first, Port A set to input before the
  key routine, the way out through `$FE22`, a program that would reach
  the vectors refused, and a key wait that begins by waiting for
  release, so that the RUN which started the program is not a move.
- It has no delay statement, so a program waits by scanning and cannot
  darken the displays by idling.
- It reaches the hex digits and the keypad and nothing else: no memory
  address, no port, no call, and a table only from a formula. It
  cannot write the word on the displays or the sliding text of the shelf,
  the guide's two LED programs, or the manual's first program, the
  sum, whose result it works out and stores nowhere.
- Nothing leaves a `loop`, and there is no `and` or `else if`: the
  matchstick game needs three nested `if`s to accept a move (it has
  all of them now, and the game one condition).
- It hides what the 6502 is good at: decimal mode, indexing, carry. A
  24-hour clock written in it is 140 bytes; the May 1979 article's is
  63, and four in page zero: its three limits and a count.
- Quiet surprises. A value assigned to a name nobody reads is dropped
  without a word, a misspelt name on the left of `=` included (it is
  warned of now). `stop`
  hands the board back showing `0000 00`. HLT overwrites the display
  fields, which the examples use as variables. Key codes are bare
  numbers (they have names now).

### The check of the compiler as Codex wrote it

Read only, which the owner asked for on 2026-11-23 before anything was
built on it. Five reviewers, each with its own angle and its own model:
four Claude subagents, on Opus, Sonnet, Haiku and Fable, and one Codex
instance on Astra. `AGENTS.md`, A Review by Several Agents, has how it was
run. The session that ran them reproduced every finding below. **No
ordinary program was found to compile to wrong code.** What turned up is
at the edges:

1. **A program of exactly 257 bytes cannot be loaded by the board's
   own LOAD routine.** The PROM loses the last byte of a block one
   byte longer than whole pages (`AGENTS.md`, Cassette Sound Format),
   so `$0300` keeps what it had and the closing `JMP $FE22` becomes
   `JMP $0022`. The trap, Cassette: Instant, hides it. **Fixed:**
   such an image now ends with one byte of filler, and a test loads
   it with the PROM's own routine.
2. **A source file with CR-only line endings**, as old Macs wrote
   them, is read as one line. With a `#` comment in it, everything
   after the comment is dropped and the compile succeeds. Without one
   the error is "Unknown statement", with the whole file in it.
   **Fixed:** a line ends at LF, at CR LF or at a CR alone.
3. **After HLT, the RUN that resumes the program comes back from
   `keypad.press()` as a key**, `$13`. The helper waits for release
   only when it is called, and a halted program is nearly always
   inside it. The RUN that starts a program is ignored, as designed.
   The matchstick game is safe because it discards codes above 3.
   **Noted** in the README, as the owner chose; a test pins the
   behaviour, so that a later fix changes both.
4. **When one key directly replaces another**, with no scan between
   them that shows no key, `keypad.press()` wants four samples of the
   new key where the README says three: the sample that showed the
   change is thrown away. About 4 ms.
5. **Messages and gaps in the README.**
   - The right side of a comparison must be a single value. `if a ==
     b + 1` is refused with a message naming the operator that is
     already there, and the README does not give the rule. **Fixed:**
     the message says which side, and the README has the rule.
   - The words of the language cannot be names: `byte`, `in`, `table`,
     `display`, `keypad` and the rest. The README does not list them,
     and the message is "Invalid byte variable". **Fixed:** the
     message says so, and the README lists the eleven; a test holds
     the list to the compiler's.
   - A table declared twice gets that same message. **Fixed.**
   - A misspelt `end` after `stop` is called unreachable. **Fixed:**
     it is an unknown statement.
   - `keypad.read ()` with a space is refused, where spacing is free
     everywhere else. A table's first index must be the character
     `0`, and `$0` is refused. **Fixed:** both are taken.
   - A file with no statement in it is reported at a line past its
     end. **Fixed:** it is refused as a whole, with no line.
   - The README says "The square table occupies 40 bytes", which is
     the whole program, 16 of them the table. It never says to press
     RES to leave `squares`, which runs for ever. **Fixed.**

Found sound, by the reviewers' own counts:

- Some 26,000 random programs, each run on the emulated board with its
  registers and flags randomised, decimal mode among them, and
  compared with an interpreter written from the README alone: no
  mismatch, and no write outside the program's variables and the
  display bytes.
- The rule that a name is assigned on every path before it is read,
  against an independent control-flow oracle over 5.7 million small
  programs.
- What the accumulator is taken to hold: 116,000 programs against a
  copy of the compiler with that shortcut off, and a program halted
  at every instruction and resumed.
- Port A's direction at every key read, in 402,000 programs.
- 700,000 malformed sources, none of which made the compiler throw
  anything but a "Line N:" error.
- The opcodes, the 127 and 128-byte edge of a branch, the 508-byte
  limit, the 96 variables, and the listing against the binary on
  1,102 programs.
- Every checkable claim in the README but the one above.
- The README's own instructions on the page as served, in headless
  Chrome: the tape through the file picker, the LOAD and the RUN
  keyed on the board, 64 for A and E1 for F, and the game played
  through to `DEAD 01`. The log had this down as not tried.

Not verified: that 64tass accepts the listing, since it is not
installed. Codex reports that a copy it had built assembled three
listings to the compiler's bytes; the session that ran the check did
not run it. Nor a real board, and with it a real 8255A, which clears
its output latches when a mode word is written, where the emulator
does not.

The owner's decisions on it, the same day: record this; bring the
random-program tester and the oracle into `tests/`, as a net under
the front end before it is reworked; fix findings 1, 2 and 5, each in
its own commit with a test; and give finding 3 a note in the README.
Finding 4 is left as it is.
