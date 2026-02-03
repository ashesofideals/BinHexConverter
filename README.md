# BIN ⇄ Intel HEX Converter

A lightweight, responsive, and pure front-end tool designed to convert files between Binary (BIN) and Intel HEX formats directly in your browser.

![License](https://img.shields.io/github/license/ashesofideals/BinHexConverter)
![Language](https://img.shields.io/github/languages/top/ashesofideals/BinHexConverter)

## ✨ Features

- **Plug & Play**: No installation required. Runs entirely in any modern web browser.
- **Drag & Drop**: Supports dragging files directly into the interface for quick loading.
- **Privacy Focused**: 100% client-side processing. Your files are never uploaded to any server, ensuring firmware security.
- **Smart BIN → HEX**:
  - Supports custom **Base Address** (Offset).
  - **Auto-Trimming**: Intelligently identifies and removes redundant `0xFF` or `0x00` padding at the end of BIN files to produce compact HEX files.
- **Robust HEX → BIN**:
  - Full support for **Extended Linear Address Records (Type 04)**.
  - Strict **Checksum Validation**: Errors are caught with precise line numbers and details if a HEX file is corrupted.
- **Cross-Platform**: Works on Chrome, Edge, Firefox, Safari, and even mobile browsers.

## 🚀 How to Use

1. **Select File**: Click the "📂 Choose File" button or simply **drag and drop** a `.bin` or `.hex` file into the container.
2. **Set Offset** (Optional): If converting BIN to HEX, you can modify the starting hex address in the `BIN2HEX OFFSET` field.
3. **Convert**:
   - Click **BIN → HEX** to generate an Intel Standard Hexadecimal file.
   - Click **HEX → BIN** to generate a raw binary image.
4. **Download**: Once processed, the browser will automatically prompt you to save the output file.

## ⚠️ Note on "Directory Memory"

This version uses the standard Browser File API to ensure **maximum compatibility** across all devices (including mobile and older systems). Due to browser security restrictions, standard APIs cannot "remember" or "lock" your last-used local directory. This is a security feature designed to protect your file system.

## 📝 License

This project is licensed under the [MIT License](LICENSE).
