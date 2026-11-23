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
`in`, `display` and `keypad`. A `#` begins a comment.
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
| `stop` | Jump to the monitor's reset entry. Reaching the end of a program does the same. |
| `const squares = table byte [n in 0..15] = n * n` | Build an inclusive, zero-based table at compile time. Declare it before executable statements. Its formula is a single term or two terms joined by `+`, `-`, or `*`. |
| `value = squares[key]` | Read a table entry. A literal index is checked and folded at compile time. A variable index becomes a native indexed load. Guard it with an `if` when its range is uncertain. An out-of-range variable index reads the byte at the resulting address. |

## Display and keys

`display.high`, `display.low`, and `display.data` are the left, middle, and
right pairs of hex digits. Each names its byte in the monitor workspace.
Assigning a field changes the value in RAM. `display.scan()` lights all six
digits once using the PROM. Call it repeatedly to keep a steady display.

`keypad.read()` samples the keypad immediately. It returns 0 through 15 for
the hex keys, `$10-$14` for AD, DA, increment, RUN and REG, and `$15` for no
key. A held key can be sampled repeatedly. With several keys held the PROM
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
