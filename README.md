# AMICO 2000 Web Emulator

A browser-based emulator for the Italian AMICO 2000 home computer (ASEL Milano, 1978).

The AMICO 2000 lives again. 🇮🇹💾✨

## 🚀 Quick Start

1. Open `index.html` in any modern web browser
2. Press **ESC** (or click RES) to reset the machine
3. Use the hex keypad to enter programs
4. Press **Enter** (or click GO) to run

## 📁 Project Structure

```
amico2000_web/
├── index.html          # Main HTML page with UI
├── js/
│   ├── cpu6502.js      # Complete 6502 CPU emulator
│   ├── amico2000.js    # Amico 2000 machine emulation
│   ├── display.js      # SVG 7-segment display renderer
│   └── main.js         # Application initialization
└── README.md           # This file
```

## ⌨️ Keyboard Mappings

| Amico Key | PC Key |
|-----------|--------|
| 0-9, A-F  | 0-9, A-F |
| AD        | ↑ (Arrow Up) |
| DA        | ↓ (Arrow Down) |
| PC        | P |
| REG       | R |
| +         | + or = |
| GO        | Enter or G |
| RES       | Escape or Backspace |

## 🎮 How to Use

The AMICO 2000 Monitor ROM uses a state machine — follow the exact sequence for your task.

### Initial Setup

Press **RES** (Escape) to reset the machine to a clean state.

### Data Entry Mode (DA)

1. Press **DA** (Arrow Down) to enter data mode
2. Type 2 hex digits (e.g., `E A` for byte $EA)
3. Press **+** (Plus) to increment address and continue
4. Repeat steps 2-3 for each byte

Example: `DA → E A → + → E A → + → F0`

### Address Entry Mode (AD)

1. Press **AD** (Arrow Up) to enter address mode
2. Type 4 hex digits (e.g., `0 0 2 0` for address $0020)
3. Press **DA** (Arrow Down) to switch to data mode
4. Type 2 hex digits for the first data byte
5. Press **+** to continue entering data at subsequent addresses

Example: `AD → 0 0 2 0 → DA → E A → + → F0`

### Running Programs

1. Enter your program at the desired address
2. Press **AD**, then enter the start address
3. Press **GO** (Enter) to run

### Viewing Registers

- Press **REG** (R) to cycle through CPU registers

### ⚠️ Important Notes

- **Don't press AD multiple times** without completing the sequence. Each function key expects specific input: AD expects 4 hex digits, then you must press DA.
- If you break the sequence, press **RES** to start over — there's no undo.
- Pressing **+** advances to the next address in memory.

## 💾 Loading ROMs And Tapes

Click the **Load ROM/Tape** button to load:
- **prom.ic9** - Monitor ROM (loads at $FE00)
- **prom.ic10** - Cassette ROM (loads at $FB00)
- **.amtape** - Mock cassette tape image for the IC10 LOAD routine
- Other `.bin` files - Loaded as programs at $0000

The optional cassette ROM entry points are intercepted at $FBBC (SAVE) and
$FC54 (LOAD). This provides file-backed cassette behavior without emulating the
original analog tape waveform. Use `debug.saveTape()` after running the cassette
SAVE routine to download the most recent mock tape image.

## 🔧 Technical Details

### Memory Map

| Address | Content |
|---------|---------|
| $0000-$03FF | RAM (1KB standard) |
| $0400-$07FF | RAM (1KB expansion) |
| $FB00-$FCFF | Cassette ROM (optional) |
| $FD00-$FDFF | 8255 PIA (I/O, partially decoded) |
| $FE00-$FFFF | Monitor ROM |

### 8255 PIA Ports

The 8255 PIA exposes four registers at $FD00-$FD03. AMICO 2000 address
decoding is intentionally modeled as partial, so any address in $FD00-$FDFF
aliases back to those four registers using the low two address bits.

- **$FD00, $FD04, ...** (Port A): Display segments / Keyboard data
- **$FD01, $FD05, ...** (Port B): Digit select / Control
- **$FD02, $FD06, ...** (Port C): Expansion port
- **$FD03, $FD07, ...**: 8255 Control register

### CPU

- MOS 6502 @ 1MHz (emulated)
- All documented opcodes implemented
- BCD mode supported
- Accurate flag handling

## 🐛 Debug Console

Open browser DevTools (F12) and use:

```javascript
// Dump memory
debug.mem(0x0000, 16)

// Show CPU state
debug.state()

// Access emulator directly
amico.cpu.PC        // Program Counter
amico.cpu.A         // Accumulator
amico.readMemory(0xFE00)  // Read memory
```

## 📚 History

The **AMICO 2000** (Advanced MIcro COmputer) was published in the Italian
electronics magazine "Sperimentare" starting December 1978. It was designed
by ASEL (Milano) and sold as a kit for hobbyists to build.

Features:
- MOS 6502 CPU @ 1MHz
- 1KB RAM (expandable to 2KB)
- 512 bytes Monitor ROM
- 6 seven-segment LED displays
- Hexadecimal keypad (23 keys)
- Optional cassette interface
- Expansion bus for additional boards

## 🙏 Credits

- **Original Design**: ASEL Milano, 1978
- **Documentation**: Sperimentare magazine
- **Preservation**: [ComputerHistory.it](https://www.computerhistory.it)
- **Emulator**: Andrea Scasso, 2025

## 📄 License

MIT License - See source files for details.

The original AMICO 2000 ROM is included for preservation purposes.

## ⚠️ Known Limitations

1. **Background Tab Throttling**: Modern browsers throttle `requestAnimationFrame` when the tab is in the background. The emulator will pause or slow down significantly if you switch tabs. This is by design to save battery/CPU.

2. **Keyboard Ghosting**: The emulator does not simulate keyboard matrix ghosting that occurs on real hardware when pressing multiple keys simultaneously. For normal operation this doesn't matter, but some edge cases may behave differently.

3. **Timing Accuracy**: The emulator runs at approximately 1MHz but is not cycle-accurate. This is sufficient for the monitor ROM and simple programs.
