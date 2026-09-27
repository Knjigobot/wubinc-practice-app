# Wubi Trainer 3 - Wubi 06 New Century CJK (五笔字型新世纪版10万+超大字库练习器)

An offline, cross-platform touch-typing trainer for mastering the **Wubi 06 (New Century / 新世纪版)** Chinese input method with the massive **100,000+ character Unicode CJK** dataset.

Optimized for building continuous muscle memory, fast radical recognition, handling code collisions with multiple choices, and rhythmic 4-letter auto-commit typing.

---

## Features

- **Massive 100,000+ Character Set**: Complete Unicode CJK coverage across CJK Basic, Extensions A, B, C, D, E, F, G, H, I, J, and Compatibility Ideographs (102,999 characters total).
- **Multiple Choices for Same Key Combinations (重码候选)**: Whenever multiple characters share the exact same key sequence, candidates are cleanly displayed with index numbers (`1. 的  2. 扚  3. 𫼖`). You can switch candidates with number keys `1`-`9` or click any candidate directly.
- **Default 4-Key Continuous Flow**: Starts immediately in 4-keystroke mode. Practice full 4-letter codes that automatically advance upon completing the 4th letter.
- **Custom Wubi 06 Keyboard Chart**: High-resolution "五笔字型新世纪版简体繁体字根图" integrated directly beneath the practice area.
- **Always-On Radical Guide**: Direct visual decomposition of each Chinese character into its component keys (`[R] [Q] [Y] [Y]`).
- **Instant Visual Indicators**: Crisp visual confirmation beneath keys as you type.
- **Immediate Input Focus**: Starts in active typing mode immediately upon opening—no extra clicks required.
- **100% Offline & Self-Contained**: Zero external network dependencies.
- **Cross-Platform**: Works on Windows, Linux, macOS, and any modern web browser.

---

## Quick Start

### Windows
- **Option 1**: Double-click `start.bat`
- **Option 2**: Run via command prompt or PowerShell:
  ```cmd
  python server.py --open
  ```

### Linux & macOS
1. Open your terminal in the project directory.
2. Make `start.sh` executable and run it:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   *(Or alternatively: `python3 server.py --open`)*

The trainer will start locally and automatically open in your default web browser at `http://127.0.0.1:8767/app/#/practice`.

---

## Command-Line Options

```bash
python server.py [OPTIONS]

Options:
  -p, --port PORT    Port number to bind (default: 8767, or set via PORT env variable)
  -o, --open         Automatically launch your default browser to the practice view
  --no-browser       Do not automatically open the browser
```

---

## Keyboard Layout & Standard

- **Input Standard**: Wubi 06 New Century (王码五笔新世纪版)
- **Character Base**: Unicode CJK + Extensions A-J (102,999 characters)
- **Keyboard Map**: Included in `app/img/wubi06_custom.png`
