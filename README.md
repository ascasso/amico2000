# AMICO 2000 Web Emulator

A browser-based emulator for the Italian AMICO 2000 home computer (ASEL Milano, 1978).

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

### Examining Memory

1. Press **RES** to reset
2. Press **AD** (Arrow Up)
3. Enter 4 hex digits for the address (e.g., `0`, `0`, `0`, `0` for $0000)
4. Press **+** to step through memory

### Entering Data

1. Go to the desired address (see above)
2. Press **DA** (Arrow Down)
3. Enter 2 hex digits for the data byte
4. Press **+** to advance and continue entering

### Running Programs

1. Enter your program starting at address $0000
2. Press **AD**, then enter the start address
3. Press **GO** (Enter) to run

### Viewing Registers

- Press **REG** (R) to cycle through CPU registers

## 💾 Loading ROMs

Click the **Load ROM** button to load:
- **prom.ic9** - Monitor ROM (loads at $FE00)
- **prom.ic10** - Cassette ROM (loads at $FB00)
- Other `.bin` files - Loaded as programs at $0000

## 🔧 Technical Details

### Memory Map

| Address | Content |
|---------|---------|
| $0000-$03FF | RAM (1KB standard) |
| $0400-$07FF | RAM (1KB expansion) |
| $FB00-$FCFF | Cassette ROM (optional) |
| $FD00-$FD03 | 8255 PIA (I/O) |
| $FE00-$FFFF | Monitor ROM |

### 8255 PIA Ports

- **$FD00** (Port A): Display segments / Keyboard data
- **$FD01** (Port B): Digit select / Control
- **$FD02** (Port C): Expansion port
- **$FD03**: 8255 Control register

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
