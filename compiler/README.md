# Writing programs for the AMICO 2000

Amico is a small language for the AMICO 2000 in which every value is a byte.
`amicoc`, its compiler, runs on a computer with Node.js and turns a program
into native NMOS 6502 instructions for the board. The compiler and the source
text take up no space on the board. A program is a file ending in `.amico`.

Amico is new. It was written for this project in 2026; it is not ASEL's
software and was never part of the machine. What is planned for it is in
[NextSession.md](../NextSession.md), item 13 under Outstanding.

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
modulo four. It responds as soon as a press is confirmed. Its 186-byte image
includes debouncing, and it uses five more bytes in zero page. The manual's
transcribed assembly listing occupies 148 bytes and has different timing and
opponent logic. [Original listing](../docs/manual-extraction/listings/21-fiammiferi-0200.hex)

## Language

Write one statement per line. Names start with a lowercase letter and may
contain lowercase letters, digits and underscores. The words of the language
cannot be names: `if`, `else`, `end`, `loop`, `stop`, `const`, `table`, `byte`,
`in`, `display`, `keypad` and `call`. A `#` begins a comment.
All values are unsigned bytes. Write decimal literals as `21` or hex as
`$15`. Leading zeros change nothing, so `021` is 21 and not an octal number,
and hex digits may be capitals or small letters: `$0f`, `$0F` and `15` are
one value. A literal above 255 is refused. Arithmetic wraps modulo 256.

| Source | Effect |
| --- | --- |
| `left = 21` | Introduce or update a byte. Reading a named variable requires an assignment on every path reaching that read. |
| `left = left - take` | Compute one binary operation per expression. The operators are `+`, `-`, `&`, `\|`, and `^`. Both operands are literals, variables, or display fields. |
| `if left >= 10` | Compare bytes using `<`, `>=`, `==`, or `!=`. The left side may be an operation, a table read or a key read; the right side is one literal, variable or display field. An optional `else` starts the other arm. Close with `end`. |
| `loop` | Repeat the enclosed statements. Close with `end`. Blocks can nest. |
| `stop` | Jump to the monitor's reset entry. Reaching the end of a program does the same. The monitor then puts its own address and data on the displays, `0000` and the byte there, so whatever the program was showing is gone. To end with a result showing, end with `display.hold()`. |
| `const start = 21` | Name a byte. The name may then stand wherever a literal may: as an operand, on the right of a comparison, as a table's index or last index, and in a table's formula. Another constant may be given in place of the literal. Declare it before executable statements. A constant cannot be assigned to. |
| `byte sum at $04` | Give a memory location a name. Reading the name reads that byte and assigning to it writes it, each time. Declare it before executable statements. See Memory and ports. |
| `byte segment[6] at $8f` | Give a row of bytes a name: here six, from `$8F`. `segment[2]` is the third of them, to read or to assign to. A literal index is checked and costs what a single byte costs; a variable index is not checked, and goes through X. A row has 1 to 256 bytes, and the count may be a constant. |
| `call $ff7e` | Call the routine at an address. When it comes back nothing is taken to be known: not what is in A, and not which way the routine has left Port A, so the next key read sets that again. See Memory and ports. |
| `const squares = table byte [n in 0..15] = n * n` | Build an inclusive, zero-based table at compile time. Declare it before executable statements. Its formula is a single term or two terms joined by `+`, `-`, or `*`. |
| `const word = table byte = $77, $6d, $79, $38` | Build a table from its bytes, written out with commas between them. Each is a literal or a constant; there may be 256 of them. Declare it before executable statements. |
| `value = squares[key]` | Read a table entry. A literal index is checked and folded at compile time. A variable index becomes a native indexed load. Guard it with an `if` when its range is uncertain. An out-of-range variable index reads the byte at the resulting address. |

The compiler warns of a name that is assigned and never read:
`Line 3: lfet is assigned and never read`. It keeps no place in memory for
such a name, so the value goes nowhere. The program is compiled all the same,
and `amicoc` prints the warning on standard error. The usual cause is one name
spelt two ways.

## Display and keys

`display.high`, `display.low`, and `display.data` are the left, middle, and
right pairs of hex digits. Each names its byte in the monitor workspace:
`$FB`, `$FA` and `$F9`.
Assigning a field changes the value in RAM. `display.scan()` lights all six
digits once using the PROM. Call it repeatedly to keep a steady display.

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

That puts an A on the leftmost digit. `display.scan()` is `call $ff0c` with
one difference: the compiler knows that routine leaves Port A an input, and
knows nothing of any other.

`byte segment[6] at $8f` names all six of those bytes at once, as a row.
`segment[0]` is the first and `segment[5]` the last, and the index may be a
variable. The manual's word, ASEL, copied out of a table:

```
const word = table byte = $77, $6d, $79, $38, 0, 0
byte segment[6] at $8f
i = 0
loop
    segment[i] = word[i]
    i = i + 1
    if i == 6
        loop
            call $ff7e
        end
    end
end
```

A table is read and never written; a row is memory, and is both. An index
that is a variable is not checked against the row's length: past the end it
reaches whatever byte the instruction then addresses.

An address is `$0000` to `$FFFF`, in hex or in decimal. `$20-$7F` is refused:
the compiler keeps the program's own variables there. A named location needs
no assignment before it is read, and is never warned of as unread. Two names
may be given to one byte, and a row may lie over a named byte or another row.
A store into a PROM is lost, as on the board.

## The ROM and the memory budget

RUN restores the status saved in RAM. Generated programs start with `CLD`,
so addition and subtraction are binary and F (`$0F`) and no key (`$15`)
remain distinguishable in TASTO. A keypad read sets the 8255 to input mode
when needed. A preceding display scan has already done that work. Normal exit
goes through `$FE22`, which initializes the monitor before it scans again.

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
