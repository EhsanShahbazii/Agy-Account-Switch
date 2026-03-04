# Antigravity Account Switcher Architecture

## Overview
Antigravity stores its primary authentication state in macOS Keychain and local JSON tokens:
- **Keychain**: `service: gemini`, `account: antigravity`
- **Filesystem**:
  - `~/.gemini/jetski-standalone-oauth-token`
  - `~/.gemini/google_accounts.json`

## Solution Design
1. **Core Account Manager**:
   - Manages a directory of account tokens: `~/.gemini/accounts/<id>.token`
   - Keeps an index in `~/.gemini/accounts/manifest.json`
   - Synchronizes tokens into Keychain and filesystem atomically.
2. **Main Process IPC**:
   - Registered handlers in Electron main process (`accounts:list`, `accounts:switch`, `accounts:add`, `accounts:remove`, `accounts:rename`).
3. **Renderer UI**:
   - Injected into prompt toolbar beside the model selector.
   - Fully native UI styled with Tailwind tokens matching Antigravity.
