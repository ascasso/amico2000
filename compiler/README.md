# Writing programs for the AMICO 2000

`amicoc` cross-compiles a small byte-oriented language on a computer with Node.js.
The AMICO runs native NMOS 6502 instructions. The compiler and its source text
take up no space on the board.

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
  The ordinary file picker's raw binary load address is `$0000`, so use the
  tape output for this workflow.
- **At a board**, enter the bytes from the listing starting at `$0200` and RUN
  there. The raw binary also starts at `$0200` and has no address header.
- **At an assembler**, the listing is 64tass source. The comments give the
  address, bytes, and originating source line for keypad entry and single step.
  An independent check is `64tass -b -o check.bin squares.asm` followed by
  `cmp check.bin squares.bin`.

The square table occupies 40 bytes including its 16 constants. Open the
[example](examples/squares.amico) next to the assembly. The source variable
`key` stays in A for the comparison and moves to X for the lookup.

## Language

Write one statement per line. Names start with a lowercase letter and may
contain lowercase letters, digits and underscores. A `#` begins a comment.
All values are unsigned bytes. Write decimal literals as `21` or hex as
`$15`. Arithmetic wraps modulo 256.

| Source | Effect |
| --- | --- |
| `left = 21` | Introduce or update a byte. Reading a named variable requires an assignment on every path reaching that read. |
| `left = left - take` | Compute one binary operation per expression. The operators are `+`, `-`, `&`, `\|`, and `^`. Both operands are literals, variables, or display fields. |
| `if left >= 10` | Compare bytes using `<`, `>=`, `==`, or `!=`. An optional `else` starts the other arm. Close with `end`. |
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
through `$03FB`. A larger image produces a compile error. Program variables
that require storage occupy `$20-$7F` in zero page. The 6502 hardware stack,
monitor and cassette workspaces, and interrupt vectors keep their own locations.
The first compiler targets the original 1 KB configuration. Its types and
control flow cover byte calculations, tables, and keypad programs.
