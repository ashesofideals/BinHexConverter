# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0]

### 🚀 New Features
- **Drag & Drop Support**: Users can now drop files directly onto the converter UI for a faster workflow.
- **Dynamic UI Feedback**: Added visual highlights (`drag-over` state) when a file is hovered over the container.
- **Smart Filename Handling**: Automatically preserves the original filename and replaces the extension (e.g., `firmware.bin` -> `firmware.hex`) during download.
- **Enhanced Error Reporting**: HEX parsing failures now display the specific error type, line number, expected checksum, and raw line content.

### 🏗 Improvements & Refactoring
- **Code Modularization**: Refactored the monolithic `index.html` into three clean modules: `index.html`, `style.css`, and `script.js`.
- **API Stability**: Reverted to Standard File Input API to ensure 100% compatibility across all browsers and resolve issues with re-selecting the same file.
- **UI/UX Polish**: Improved container shadows, button hover effects, and mobile responsiveness.

### 🐞 Bug Fixes
- Fixed a potential truncation issue when BIN data length was not perfectly aligned to 16 bytes.
- Fixed an issue where the hex address padding was incorrect under specific large memory offsets.

---

## [1.1.0]
- Refined the core Intel HEX parsing and generation algorithms.
- Introduced Base Address offset support for BIN to HEX conversion.

## [1.0.0]
- Initial release with basic BIN ⇄ HEX conversion and download functionality.
