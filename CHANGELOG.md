# Changelog

All notable changes to the **Antigravity Multi-Account Switcher** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.0.0] - 2026-05-31

### Added
- **Native Antigravity Design Parity**: Matched exact Tailwind color tokens, border radius (`rounded-lg`), font size (`13px`), and Google Material Symbols.
- **Far-Right Checkmark**: Active account checkmark pinned to the far right edge, exactly matching the native model menu.
- **Inline Rename Dialog**: Rename accounts directly from the dropdown with keyboard shortcuts (`Enter` to save, `Esc` to cancel).
- **Full-Screen Opaque Transition Screen**: 100% solid theme overlay (`#FAFAFA` / `#131313`) with animated dot-pulse loader preventing underlying editor bleed-through.
- **Automated Install & Uninstall Scripts**: Safe `install.sh` and `uninstall.sh` with automatic backup (`app.asar.backup`) and ad-hoc code signing.
- **System Doctor Script**: Diagnostic utility (`doctor.sh`) to inspect Antigravity installation and accounts manifest.
- **Bilingual Documentation**: Comprehensive English (`README.md`) and Persian (`README.fa.md`) guides with RTL markdown support and 5 high-resolution screenshots.

### Changed
- Refactored UI injection to inline cleanly into Electron's sandboxed `preload.js`.
- Dropdown positioning anchored upward (`bottom`) to avoid overflow off-screen.

---

## [v0.8.0] - 2026-04-30

### Added
- **Renderer UI Injection**: Preload DOM observer mounting the switcher button beside `[data-testid="model-selector-trigger"]`.
- **CLI Utility (`agy-switch`)**: Terminal commands `agy-switch list`, `current`, and `switch <id>`.
- **Test Suite**: Automated unit tests for account CRUD, paths, tokens, and UI tokens.
- **GitHub Actions CI**: Automated testing workflow on macOS runner.

---

## [v0.5.0] - 2026-04-15

### Added
- **ASAR Patcher**: Automatic extraction, backup creation, and repacking preserving unpacked `chrome-devtools-mcp` modules.
- **Electron IPC Bridge**: Registered `accounts:list`, `accounts:switch`, `accounts:add`, `accounts:remove`, and `accounts:rename` handlers in main process.
- **Google OAuth Loopback Listener**: Local HTTP server for handling OAuth redirect callback safely.

---

## [v0.1.0] - 2026-03-18

### Added
- **Initial Core Architecture**: `AccountManager` class managing token files in `~/.gemini/accounts/`.
- **macOS Keychain Integration**: `security` CLI wrapper for accessing `service: gemini, account: antigravity`.
- **Token Helper**: JWT decoding and user profile extraction.
- **Project Scaffold**: MIT License, `.gitignore`, and base `package.json`.
