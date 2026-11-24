# Writing programs for the AMICO 2000

Amico is a small language for the AMICO 2000 in which every value is a byte.
`amicoc`, its compiler, runs on a computer with Node.js and turns a program
into native NMOS 6502 instructions for the board. The compiler and the source
text take up no space on the board. A program is a file ending in `.amico`.

Amico is new. It was written for this project in 2026; it is not ASEL's
software and was never part of the machine. What was decided for it, and
what is planned, is in [docs/amico-design.md](../docs/amico-design.md).

## Try the square table

From the repository root, choose the output you need. Each command writes to
standard output. The compiler needs only Node.js.

```sh
node compiler/amicoc.js --asm  compiler/examples/squares.amico > squares.asm
node compiler/amicoc.js --bin  compiler/examples/squares.amico > squares.bin
node compiler/amicoc.js --tape compiler/examples/squares.amico > squares.amtape
```

- **At the emulator**, choose Instant cassette mode and import `squares.amtape`
  with **Load ROM or tape**. Key `AD 0000 DA 01 + 00 + FF`, then
  `AD FC54 RUN` to load program 01 at its recorded address. Key `AD 0200 RUN`
  to start it. Press A for `64` or F for `E1` on the two right-hand digits.
  The program runs until RES is pressed. The ordinary file picker's raw
  binary load address is `$0000`, so use the tape output for this workflow.
- **At a board**, enter the bytes from the listing starting at `$0200` and RUN
  there. The raw binary also starts at `$0200` and has no address header.
- **At an assembler**, the listing is 64tass source. The comments give the
  address, bytes, and originating source line for keypad entry and single step.
  An independent check is `64tass -b -o check.bin squares.asm` followed by
  `cmp check.bin squares.bin`.

The square-table program occupies 40 bytes, 16 of them its table. Open the
[example](examples/squares.amico) next to the assembly. The source variable
`key` stays in A for the comparison and moves to X for the lookup.

## Play 21 fiammiferi

Compile [matches.amico](examples/matches.amico) using the same commands
and keypad sequence, substituting `matches` for `squares`. If `squares` is
still running, press RES first: until then the keys go to it and not to the
monitor. Start with 21
matches. Press 1, 2, or 3 to take that many and leave at least one. The
AMICO replies. The three display pairs give your move, the board's move,
and the number left in decimal. The player left with the last match loses.
The final display reads `5AFE 01` or `DEAD 01`. Use RES and `AD 0200 RUN`
to play again.

This adaptation of the manual's game opens with a reply of one, giving the
human player an opening to discover. Subsequent moves aim to leave one match
modulo four. It responds as soon as a press is confirmed. Its 182-byte image
includes debouncing, and it uses five more bytes in zero page. The manual's
transcribed assembly listing occupies 148 bytes and has different timing and
opponent logic. [Original listing](../docs/manual-extraction/listings/21-fiammiferi-0200.hex)

## A sum, a word, the LEDs, a clock and a sliding text

Five more short programs. Each compiles with the commands above and starts
with `AD 0200 RUN`.

- [sum.amico](examples/sum.amico) is the manual's first program, Tabella 7:
  it adds the bytes at `0006` and `0007` into `0004`. Key the two numbers in
  first, `AD 0006 DA 09 + 01`, run it, and read the sum with `AD 0004`. Its 11
  bytes are a `CLD` and the manual's ten, with the `CLC` after the load where
  the manual has it before.
- [word.amico](examples/word.amico) writes the manual's word, ASEL, on the
  displays, a byte of segments to a digit. Change the six bytes for another
  word. RES ends it.
- [leds.amico](examples/leds.amico) counts in binary on the four LEDs D4 to
  D7, twice a second, by writing to the 8255's ports. The displays stay
  dark, as they should. RES ends it.
- [clock.amico](examples/clock.amico) is a clock, after the one in
  Sperimentare of May 1979: hours, minutes and seconds on the six digits,
  counted in a `decimal` block. Key the time to start from first, two decimal
  digits each for the seconds, the minutes and the hours:
  `AD 0000 DA 56 + 34 + 12` for 12:34:56. RUN at `0200` when that time comes.
  On the emulated board one of its seconds is 1,000,002 cycles of the
  processor. A board's crystal is not so exact, and a line of the program is
  there to set the clock by, thirteen millionths of a second to a step. It is
  90 bytes and two in page zero, where the article's is 63 and four.
  [The article's listing](../docs/manual-extraction/listings/orologio-1979-05.txt)
  The time is kept in the display fields, as the article keeps it, so HLT
  loses it. RES ends the clock.
- [slide.amico](examples/slide.amico) slides a text across the six displays,
  a digit at a time, four steps a second. The text is a line of the program,
  `table segments "..."`, in the manual's alphabet for seven segments, which
  cannot spell the machine's own name: it has no M. Change the text, and
  `last` with its length. 87 bytes, 31 of them the text. RES ends it.

## Language

Write one statement per line. Names start with a lowercase letter and may
contain lowercase letters, digits and underscores. The words of the language
cannot be names: `if`, `else`, `end`, `and`, `or`, `loop`, `for`, `break`,
`next`, `stop`, `decimal`, `const`, `table`, `byte`, `in`, `display`, `keypad`
and `call`.
A `#` begins a comment.
All values are unsigned bytes. Write decimal literals as `21` or hex as
`$15`. Leading zeros change nothing, so `021` is 21 and not an octal number,
and hex digits may be capitals or small letters: `$0f`, `$0F` and `15` are
one value. A literal above 255 is refused. Arithmetic wraps modulo 256.

| Source | Effect |
| --- | --- |
| `left = 21` | Introduce or update a byte. Reading a named variable requires an assignment on every path reaching that read. |
| `left = left - take` | Compute one binary operation per expression. The operators are `+`, `-`, `&`, `\|`, and `^`. Both operands are literals, constants, variables, display fields or named locations. |
| `if left >= 10` | Compare bytes using `<`, `<=`, `>`, `>=`, `==`, or `!=`. The left side may be an operation, a read from a table or a row, or a key read; the right side is one value: a literal, a constant, a variable, a display field or a named location. Several comparisons may be joined by `and` or by `or`. `else if` tries another condition, and an optional `else` starts the last arm. Close with `end`. See Conditions. |
| `loop` | Repeat the enclosed statements until a `break`, or for ever. Close with `end`. Blocks can nest. |
| `for i in 0..5` | Repeat the enclosed statements once for each value from the first to the last, both included, with the name holding the value. Close with `end`. See Loops. |
| `break` | Leave the `loop` or `for` the statement is in, and go on after its `end`. See Loops. |
| `next` | Go round the `loop` or `for` the statement is in again, at once. See Loops. |
| `decimal` | Count in decimal: in the enclosed statements `+` and `-` take a byte as two decimal digits, so that `$59 + 1` is `$60`. Close with `end`. See Decimal. |
| `stop` | Jump to the monitor's reset entry. Reaching the end of a program does the same. The monitor then puts its own address and data on the displays, `0000` and the byte there, so whatever the program was showing is gone. To end with a result showing, end with `display.hold()`. |
| `const start = 21` | Name a byte. The name may then stand wherever a literal may: as an operand, on the right of a comparison, as a table's index or last index, and in a table's formula. Another constant may be given in place of the literal. Declare it before executable statements. A constant cannot be assigned to. |
| `byte sum at $04` | Give a memory location a name. Reading the name reads that byte and assigning to it writes it, each time. Declare it before executable statements. See Memory and ports. |
| `byte segment[6] at $8f` | Give a row of bytes a name: here six, from `$8F`. `segment[2]` is the third of them, to read or to assign to. A literal index is checked and costs what a single byte costs; a variable index is not checked, and goes through X. A row has 1 to 256 bytes, and the count may be a constant. |
| `call $ff7e` | Call the routine at an address. When it comes back nothing is taken to be known: not what is in A, and not which way the routine has left Port A, so the next key read sets that again. Decimal mode is cleared, in case the routine set it; inside a `decimal` block it is cleared for the call and set again after it. See Memory and ports. |
| `const squares = table byte [n in 0..15] = n * n` | Build an inclusive, zero-based table at compile time. Declare it before executable statements. Its formula is a single term or two terms joined by `+`, `-`, or `*`. |
| `const word = table byte = $77, $6d, $79, $38` | Build a table from its bytes, written out with commas between them. Each is a literal or a constant; there may be 256 of them. Declare it before executable statements. |
| `const hello = table segments "CIAO"` | Build a table from a text, a byte of segments to each character, for the six digits. The alphabet is the manual's. Declare it before executable statements. See Words on the displays. |
| `value = squares[key]` | Read a table entry. A literal index is checked and folded at compile time. A variable index becomes a native indexed load. Guard it with an `if` when its range is uncertain. An out-of-range variable index reads the byte at the resulting address. |

The compiler warns of a name that is assigned and never read:
`Line 3: lfet is assigned and never read`. It keeps no place in memory for
such a name, so the value goes nowhere. The program is compiled all the same,
and `amicoc` prints the warning on standard error. The usual cause is one name
spelt two ways.

## Conditions

An `if` compares two bytes as unsigned numbers, with `<`, `<=`, `>`, `>=`,
`==` or `!=`.

The 6502's compare answers four of the six with one flag, and so with one
branch. `>` and `<=` take two flags and two branches, two bytes more when the
statements under the `if` are short enough for a branch to cross; The ROM
and the memory budget has what a branch costs when they are not. Against a
literal or a constant they cost nothing more: the compiler writes `x > 5`
as `x >= 6` and `x <= 5` as `x < 6`, as one would by hand. That leaves
`x > 255` and `x <= 255` with no next number, and they are refused: the first
is never so, and the second always.

Several comparisons can be joined into one condition, all by `and` or all by
`or`:

```
if take >= 1 and take < 4 and take < left
if key == keypad.run or key == keypad.reg
```

With `and` the condition holds if every comparison does, and with `or` if
any one does. They are tried in the order written, and no further than it
takes: after one that fails an `and` tries no more, and after one that holds
neither does an `or`. So a key read in a later comparison happens only if
the earlier ones have left the matter open.

The two words cannot be mixed in one condition, since the language has no
brackets and no rule for which would come first: put the second question in
an `if` of its own. `and` and `or` join comparisons; for the bits of a byte
the operators are `&` and `|`. A condition joined by `and` compiles to
exactly what the same comparisons cost as one `if` inside another.

An `if` can go on to try other conditions, each with `else if`, before its
`else` or its `end`:

```
if key < 10
    display.data = key
else if key == keypad.run
    display.data = $aa
else
    display.data = $ee
end
```

The conditions are tried in order. The statements under the first that holds
are run, or those under `else` if none holds and there is an `else`, and the
program goes on after the `end`. One `end` closes the whole. It is the same
bytes as an `if` inside the `else` of another, without the second `end` and
the deeper margin.

## Loops

`loop` repeats its statements until a `break` leaves it, and for ever if
there is none. `for` repeats them a counted number of times:

```
for i in 0..5
    display.segment[i] = word[i]
end
```

The statements run once for each value from the first to the last, both
included, and the name holds the value: here 0, 1, 2, 3, 4 and 5. The two
ends are literals or constants, so the count is known when the program is
compiled: once round at least, 256 times at most. When the first is the
greater the count goes down, and `for i in 5..0` takes 5, 4, 3, 2, 1 and 0.

The name is a variable like any other, and may be read inside the loop and
after it. Inside its own loop it cannot be assigned: the loop keeps the
count. When the loop is over, the name is one step past the last value: 6
after `0..5`. A byte wraps, so after `0..255` it is 0 and after `5..0` it is
255.

A `for` adds twelve bytes to its statements: four to start the count, and at
the foot an increment or a decrement, a load, a compare and a branch. When
the statements are too long for that branch to reach back over them it takes
its long form, and the `for` adds fifteen.

`break` leaves the loop it is in, a `loop` or a `for`, and the program goes
on with what follows that loop's `end`. `next` goes round again at once: to
the top of a `loop`, and in a `for` to the next value, or out of it if that
was the last. With one loop inside another, both concern the inner one. They
are nearly always inside an `if`:

```
loop
    key = keypad.press()
    if key == keypad.run
        break
    end
    if key >= 10
        next
    end
    display.data = key
end
display.hold()
```

That shows each digit from 0 to 9 as it is pressed, passes over the other
keys, and ends at RUN with the last digit still showing.

Nothing can follow a `break` or a `next` in the same block: no statement
there could be reached. What follows a `loop` is reached only through a
`break`, so after a `loop` with none there can be no statement at all.

A `for` left by `break` leaves its name at the value it had, which says how
far the loop got. This looks for a key's code in a row of six bytes, and
`i` is 6 only if it was not there:

```
for i in 0..5
    if codes[i] == key
        break
    end
end
```

Each `break` and each `next` is one jump, three bytes; one that leaves a
`decimal` block has a `CLD` before it, and is four.

## Decimal

The hex displays show a byte as two digits, so a number that is there to be
read is best kept as two decimal digits, one in each half of its byte:
fifty-nine as `$59`. The 6502 adds and subtracts such bytes in its decimal
mode, and a `decimal` block is where a program asks for that:

```
decimal
    seconds = seconds + 1
end
```

Inside the block `+` and `-` count in decimal. `$59 + 1` is `$60`, where
outside the block it is `$5A`. A byte holds 00 to 99 and wraps there: `$99 +
1` is `$00`, and `$00 - 1` is `$99`. The numbers are written in hex, so that
they read in the program as they will on the displays.

The block is the 6502's `SED` at its head and `CLD` at its `end`, two bytes,
and the sums between are the instructions they are anywhere. Nothing else
changes inside it:

- `&`, `|` and `^` work on bits as before, and a comparison compares two
  bytes as they are. Bytes of decimal digits compare as their numbers do:
  `$10` is greater than `$09`.
- A `for` counts as it does anywhere, by one in binary, since its name is
  most often an index: after `$09` it holds `$0A`.
- `display.scan()`, `display.show()` and `display.hold()` do no sums and are
  called as they are.
- The monitor's key routine does add, and called in decimal mode it gives F
  and no key the same code. So for `keypad.read()` and `keypad.press()` the
  compiler leaves decimal mode and comes back to it, a `CLD` before the call
  and a `SED` after, two bytes more for each one inside a block, and the
  codes are the same inside a block as outside. It does the same for a
  `call`: a routine is always called in binary, and whatever it does with
  decimal mode, the block has it set again afterwards. That is one byte more
  than a `call` outside a block, which has a `CLD` after it already.
- A `break` or a `next` that leaves the block, for a loop the block is
  inside, clears decimal mode on its way, one byte more. `stop` needs none:
  the monitor clears it.

Both bytes of a sum have to be two decimal digits. A literal or a constant is
checked: `seconds + 10` is refused, because 10 is the byte `$0A`, and ten is
written `$10`. Only a sum is checked. A number that is assigned or compared
is a byte like any other, inside a block as outside, so `if seconds == 60`
compiles, and is never so for a count in decimal: sixty is `$60` there too.
What a variable holds cannot be checked. With a byte that is
not two decimal digits, such as a key's code above 9 or the count of a `for`
past 9, the result is whatever the 6502 makes of it, and that is the one
place where the emulator is known not to do what the chip does
([6502 conformance](../docs/6502-conformance.md)).

A block cannot be inside another: there is one decimal mode, and the inner
`end` would clear it for the rest of the outer block.

A program halted with HLT inside a block is resumed by RUN where it stopped,
still counting in decimal. But the monitor keeps the status it saved at the
halt, decimal mode with it, and gives it to whatever is RUN next, RES or no
RES. A program compiled from Amico begins with `CLD` and is not troubled. One
keyed in by hand without a `CLD`, as the manual's are, then adds in decimal;
the [monitor review](../docs/monitor-rom-review.md) has this as its first
bug.

## Display and keys

`display.high`, `display.low`, and `display.data` are the left, middle, and
right pairs of hex digits. Each names its byte in the monitor workspace:
`$FB`, `$FA` and `$F9`.
Assigning a field changes the value in RAM. `display.scan()` lights all six
digits once using the PROM. Call it repeatedly to keep a steady display.

`display.segment[0]` to `display.segment[5]` are the six digits again, from
the left, as raw segments: one byte to a digit, bit 0 for segment a, bit 1
for b, and so on round to bit 6 for g, the middle bar. They are the monitor's
bytes at `$8F-$94`, and are a row like any other. `display.show()` lights the
six digits once from them, as `display.scan()` does from the three hex
bytes. The two share the displays: what shows is whichever is being called.
The routine behind `display.show()` leaves the rightmost digit lit when it
returns, so a program that does much else between calls shows that digit
brighter; and it leaves Port A an output, so the next key read sets it to
input again.

## Words on the displays

`const hello = table segments "CIAO"` makes a table of four bytes, one to a
character: the segments that draw it on a digit. It is a table like any
other, read by an index, and the listing shows its bytes under the text they
came from. Put into `display.segment` and shown with `display.show()`, the
word is on the displays:

```
const hello = table segments "CIAO  "
for i in 0..5
    display.segment[i] = hello[i]
end
loop
    display.show()
end
```

The alphabet is the manual's own, Tabella 18 of the Sperimentare supplement,
"Esempio di alfabeto per display a sette segmenti":

```
0 $3F   1 $06   2 $5B   3 $4F   4 $66   5 $6D   6 $7D   7 $07   8 $7F   9 $6F
A $77   b $7C   C $39   d $5E   E $79   F $71   G $3D   H $76   I $06   J $1E
L $38   n $54   o $3F   P $73   q $67   r $50   S $6D   t $78   U $3E   Y $6E
- $40   space $00
```

Seven segments cannot draw every letter, and the manual's table has no K, M,
V, W, X or Z: a text with one of those, or with any other character, is
refused. Each letter has the one shape, printed above in the case that
looks like it, and a text may be written in either case: `"CIAO"` and
`"ciao"` are the same four bytes. Some shapes are shared: I is a 1, S is a 5,
and the manual's o is the round of a 0. A space is a dark digit, and spaces
count wherever they stand in the text, at its ends too.

The manual prints most of these bytes with bit 7 set as well, `F7` for A, as
the monitor's own table of the sixteen hex digits has every one of its own,
and says that bit 7 is not used. Here it is left clear, as in the manual's
first ASEL, `77 6D 79 38`.

A text is everything between its two double quotes, on the one line, and
the line ends at the second. It cannot hold a double quote, nor a `#`,
which begins a comment wherever it stands and so cuts the text short;
neither is in the alphabet.

For a shape that is not in the alphabet, write the table out, a byte to a
digit, as `const word = table byte = $77, $6d, $79, $38`. A text holds 256
characters at most. A character read by a literal index costs no table at
all: `hello[0]` is the byte `$39`.

`display.hold()` scans the six digits for ever. It is `loop`,
`display.scan()`, `end` in one word and the same six bytes, and nothing after
it is reached. Use it to end a program with its result showing; RES returns
to the monitor.

`keypad.read()` samples the keypad immediately. It returns 0 through 15 for
the hex keys, `$10-$14` for AD, DA, increment, RUN and REG, and `$15` for no
key. Those six have names, which are constants: `keypad.ad`, `keypad.da`,
`keypad.inc`, `keypad.run`, `keypad.reg` and `keypad.none`. A held key can be
sampled repeatedly. With several keys held the PROM
chooses one according to its scan order.

`keypad.press()` waits for three released scans and then three matching
samples of a pressed key. It refreshes the display as it waits. Use it for
one move per press in a game. The shared routine occupies 46 bytes and two
temporary zero-page bytes in a program that calls it. RES and HLT retain
their hardware functions.

After HLT, the RUN that resumes the program is itself returned by
`keypad.press()`, as `$13`. The helper waits for release when it is called,
not when a halted program takes up again, and a program waiting for a key is
nearly always halted inside it. A program should pass over a key it has no
use for, as the matchstick game passes over everything but 1, 2 and 3.

HLT also gives the three display fields to the monitor. It writes the address
at which the program was halted into `display.high` and `display.low` and the
byte at that address into `display.data`, and RUN does not put back what was
there. A program that keeps a count or a state in a display field has lost it
after a halt, and so has one stepped with the NOR/SS switch at SS. Keep what
matters in a variable and write the field from it.

## Memory and ports

`byte sum at $04` gives a memory location a name. From then on the name is
that byte: reading it reads the location and assigning to it writes there, at
once and every time, with nothing kept in a register between. So a name can
stand for a byte keyed in at the monitor before RUN, for a result to look at
afterwards, or for one of the 8255's ports.

The manual's first program, which adds the bytes at `$06` and `$07` into
`$04`, is four lines:

```
byte a at $06
byte b at $07
byte sum at $04
sum = a + b
```

It compiles to the manual's own ten bytes, the `CLC` after the load and not
before it, with a `CLD` in front. Key the two numbers in, RUN at `0200`, and
read the sum with `AD 0004`.

The four LEDs D4 to D7 are lit through three of the 8255's registers: the
mode word, then Port B, then Port A, whose four low bits are the LEDs.

```
byte port_a at $fd00
byte port_b at $fd01
byte control at $fd03
control = $89
port_b = $87
port_a = 5
loop
end
```

`call $ff7e` calls a routine by its address, with `JSR`: one of the monitor's,
or one keyed in somewhere else in memory. It has to end by returning. The
monitor's routine at `$FF7E` shows the six bytes at `$8F-$94` on the six
digits, one bit to a segment, which is how a program shows letters:

```
byte first at $8f
first = $77
loop
    call $ff7e
end
```

That puts an A on the leftmost digit. `display.scan()` is `call $ff0c`
without the two things the compiler does about a routine it does not know:
it clears decimal mode, with a `CLD` straight after the call, or before it
and a `SED` after in a `decimal` block, and it sets Port A to input again
before the next key read.

`byte segment[6] at $8f` names all six of those bytes at once, as a row.
`segment[0]` is the first and `segment[5]` the last, and the index may be a
variable. The manual's word, ASEL, copied out of a table:

```
const word = table byte = $77, $6d, $79, $38, 0, 0
byte segment[6] at $8f
for i in 0..5
    segment[i] = word[i]
end
loop
    call $ff7e
end
```

A table is read and never written; a row is memory, and is both. An index
that is a variable is not checked against the row's length: past the end it
reaches whatever byte the instruction then addresses.

An address is `$0000` to `$FFFF`, in hex or in decimal. `$20-$7F` is refused:
the compiler keeps the program's own variables there. A named location needs
no assignment before it is read, and is never warned of as unread. Two names
may be given to one byte, and a row may lie over a named byte or another row.
A store into a PROM is lost, as on the board. After a store anywhere in
`$FD00-$FDFF`, where the 8255 answers, the compiler no longer takes Port A to
be an input, and the next key read sets it so again. A store by a variable
index counts as one that may reach any of the 256 bytes from the row's
first, since the index is not checked: a row that starts at `$FC01` or above
costs a mode word before the next key read, however short it is.

## The ROM and the memory budget

RUN restores the status saved in RAM. Generated programs start with `CLD`,
so addition and subtraction are binary wherever a `decimal` block does not
ask otherwise, and F (`$0F`) and no key (`$15`) remain distinguishable in
TASTO, which is never called in decimal mode. A keypad read sets the 8255 to input mode
when needed. A preceding display scan has already done that work. Normal exit
goes through `$FE22`, which initializes the monitor before it scans again.

A 6502 branch reaches 127 bytes forward and 128 back. Where one has further
to go, the compiler writes the opposite branch round a `JMP`, five bytes
where a branch is two, and the listing shows it as `*+5`. So an `if`, an
`else if` or a `for` whose statements come to more than that costs three
bytes more for each branch that has to cross them: one for most conditions,
and two for a `>` against anything but a literal or a constant.

The compiler resolves branch addresses itself. Using the monitor's branch
calculator manually while a program is halted can still overwrite saved A,
and the calculator can count a bouncing key twice. The debouncing above
belongs to the running program. The original PROM behavior is documented in
the [monitor review](../docs/monitor-rom-review.md).

Code, used tables, and any input helper share the 508 bytes from `$0200`
through `$03FB`. A larger image produces a compile error. An image that would
come to 257 bytes is given one byte of filler at its end: the cassette PROM's
routines lose the last byte of a block one byte longer than a whole number of
pages, and their checksum does not notice. The emulator's Instant cassette
hides that; its Real time cassette and a board do not. Program variables
that require storage occupy `$20-$7F` in zero page. The 6502 hardware stack,
monitor and cassette workspaces, and interrupt vectors keep their own locations.
The first compiler targets the original 1 KB configuration. Its types and
control flow cover byte calculations, tables, and keypad programs.
