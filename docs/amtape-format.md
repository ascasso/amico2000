# The `.amtape` File Format

An `.amtape` file holds one program as the emulator's cassette keeps it: an
identifier, the addresses it was saved from, and its bytes. It is the
emulator's own container, written by `debug.saveTape()` and read by **Load ROM
or tape**.

It is not a recording and not the layout of a real tape. The record the
board's SAVE routine puts on a cassette, with its leader, start byte, byte
count and odd byte order, is described in `AGENTS.md` under Cassette Interface
Reference, and its sound under Cassette Sound Format; `tape-audio.js` reads
and writes that as `.wav`. The two differ where it matters: an `.amtape` file
keeps every byte of a block, in ascending order, and its checksum is not the
tape's.

This describes version 1, the only version there has been. The code is
`_makeTapeImage()` and `_parseTapeImage()` in `amico2000.js`.

## Layout

The file is an 18-byte header followed by the program's bytes. Multi-byte
fields are little-endian, low byte first, as the 6502 stores an address.

| Offset | Size | Field | Contents |
| ---: | ---: | --- | --- |
| 0 | 9 | Magic | The ASCII text `AMICOTAPE`: `41 4D 49 43 4F 54 41 50 45` |
| 9 | 1 | Version | `01` |
| 10 | 1 | Identifier | The program number given to SAVE in `$0004`, and asked of LOAD in `$0000` |
| 11 | 2 | Start address | Where the first data byte was saved from |
| 13 | 2 | End address | Where the last data byte was saved from, inclusive |
| 15 | 1 | Checksum | See below |
| 16 | 2 | Length | The number of data bytes, 1 to 65535 |
| 18 | Length | Data | The program, first address first |

The file is exactly 18 bytes plus the length. There is one program to a file
and nothing after it.

## Checksum

The checksum is the low eight bits of the identifier plus every data byte:

```
checksum = (identifier + data[0] + data[1] + ... ) AND $FF
```

The addresses and the length are not part of it. It is not the checksum on a
real tape, which also takes in the start byte `$A5` and the tape's five header
bytes.

## An Example

The seven-byte program of the user guide, `A9 42 85 20 4C 22 FE`, saved from
`$0200-$0206` as program `01`, is this 25-byte file:

```
0000  41 4D 49 43 4F 54 41 50 45 01 01 00 02 06 02 FD
0010  07 00 A9 42 85 20 4C 22 FE
```

Magic, version `01`, identifier `01`, start `00 02`, end `06 02`, checksum
`FD`, length `07 00`, then the seven bytes. The checksum is
`01 + A9 + 42 + 85 + 20 + 4C + 22 + FE = $2FD`, of which the low byte is kept.

`tests/amtape-format-doc.test.js` checks that the emulator writes exactly
these bytes for that program, and that the table above describes them.

## What a Reader Checks

`_parseTapeImage()` refuses a file, with a message, when:

- it is shorter than the 18-byte header;
- it does not begin with the magic;
- its version is not `01`;
- it is not exactly 18 bytes plus its length field;
- its checksum does not match its identifier and data.

It does not compare the end address with the start address and the length.
A LOAD copies `length` bytes to the start address, or to the address the user
asked for, and never looks at the end address, which is carried only to be
shown and written back out. A file whose end address disagrees with its
length therefore loads. A writer should keep them in step: end = start +
length - 1.

Nor does it refuse a length of zero, which no SAVE produces. Such a file
imports as a program with no bytes.

## Limits

- The length field is 16 bits, so a block can be at most 65535 bytes. The
  whole address space, `$0000-$FFFF`, is one byte too many, and SAVE refuses
  it rather than write a file that could not be read back.
- A program imported with an identifier already on the emulator's cassette
  replaces the one that was there.
- The loader takes a file for an `.amtape` image when its name ends in
  `.amtape`, or contains `tape` and does not end in `.wav`. See File formats
  in the user guide.

## If the Format Changes

The version byte is there so that it can.

- A reader must refuse a version it does not know, as this one does, rather
  than guess at the layout.
- A change that an old reader would misread needs a new version number: a
  wider length, another field, a different checksum, more than one program
  to a file. The magic and the version's place at offset 9 should stay, so
  that an old reader can at least say which version it was given.
- A reader for a later version should go on reading version 1. Files of it
  exist wherever someone has saved a program from this page.
