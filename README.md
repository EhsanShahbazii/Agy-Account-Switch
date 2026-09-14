# Antigravity Multi-Account Switcher

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-macOS-lightgrey.svg)](https://apple.com)
[![Antigravity](https://img.shields.io/badge/Antigravity-v2.x-purple.svg)](https://gemini.google.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/EhsanShahbazii/agy-account-switch/pulls)

A seamless, production-ready multi-account switcher natively injected directly into Google's **Antigravity** desktop app for macOS. Switch, add, rename, and manage multiple Gemini Pro accounts instantly from your prompt input toolbar.

> 🌍 **فارسی (Persian)**: برای مطالعه مستندات جامع به زبان فارسی، به [README.fa.md](README.fa.md) مراجعه فرمایید.

---

## 📖 Table of Contents

- [Why Antigravity Account Switcher?](#-why-antigravity-account-switcher)
- [Visual Tour & Screenshots](#-visual-tour--screenshots)
- [Key Features](#-key-features)
- [How It Works (Architecture)](#-how-it-works-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [CLI Tool](#-cli-tool)
- [Diagnostics & Doctor](#-diagnostics--doctor)
- [Uninstallation](#-uninstallation)
- [Security & Privacy](#-security--privacy)
- [FAQ & Troubleshooting](#-faq--troubleshooting)
- [License](#-license)

---

## 💡 Why Antigravity Account Switcher?

Developers and power users utilizing Google's Antigravity application often maintain multiple Google accounts:
- **Work vs. Personal**: Isolating company repositories from personal projects.
- **Quota & Rate Limits**: Moving between Gemini Pro accounts when encountering hourly or weekly token limit thresholds.
- **Client Environments**: Switching to customer-owned Google Cloud tenancies.

Normally, switching accounts requires signing out completely, losing current workspace context, and walking through a full browser re-authentication cycle. **Antigravity Account Switcher** solves this by securely storing token profiles in your macOS Keychain and filesystem, providing a **1-click instant switch** right where you type prompts.

---

## 📸 Visual Tour & Screenshots

### 1. Native Dropdown Menu
The account switcher button sits directly inside the prompt input bar next to the model picker. The popover matches Antigravity's native design tokens, typography, and soft `shadow-md`. The active account checkmark is pinned to the far right edge.

<p align="center">
  <img src="screenshots/1.png" alt="Native Dropdown Menu" width="850" />
</p>

- **Active Profile**: Highlighting current account with official Google check icon.
- **Fast Profile Switch**: Single click on any saved profile switches the active token instantly.
- **Item Hover Actions**: Rename (pencil icon) and delete (trash icon) appear on hover.

---

### 2. Add Account View
Add new Gemini Pro accounts directly from the popover without opening external browser windows manually.

<p align="center">
  <img src="screenshots/2.png" alt="Add Account View" width="850" />
</p>

- **Custom Account Label**: Assign names like "Work", "Personal", or "Client A".
- **One-Click Auth**: Initiates Google's secure OAuth loopback authentication.

---

### 3. Google Sign-In Integration
Triggers Antigravity's native authentication flow, allowing you to authenticate any additional Google account safely.

<p align="center">
  <img src="screenshots/3.png" alt="Google Sign-In Flow" width="850" />
</p>

---

### 4. Full-Screen Opaque Transition Screen
During an account switch, Antigravity displays a dedicated, 100% opaque transition overlay with your account avatar, email, and animated dot-pulse loader.

<p align="center">
  <img src="screenshots/4.png" alt="Switching Transition Screen" width="850" />
</p>

- **Zero Bleed-Through**: Solid theme background (`#FAFAFA` in light mode, `#131313` in dark mode) prevents underlying editor text from showing.
- **Fluid Visual Feedback**: Displays active account details while the language server resets authentication credentials.

---

### 5. Verified Active Session in Settings
Once switched, Antigravity instantly reflects the newly activated identity throughout the entire application, including the internal Settings modal and prompt bar.

<p align="center">
  <img src="screenshots/5.png" alt="Active Account in Settings" width="850" />
</p>

---

## ⚡ Key Features

- **Direct In-App Injection**: Injected into Electron's renderer via preload scripts. No extra apps or menubar items required.
- **Antigravity Component Parity**: Uses Antigravity's exact Tailwind palette, border radius (`rounded-lg`), font size (`13px`), and Google Material Symbols.
- **Pixel-Perfect Alignment**: Dropdown expands upwards into empty space without overflowing off the bottom of the screen.
- **Inline Account Renaming**: Click the pencil icon to rename any profile directly in the menu with keyboard shortcuts (`Enter` to save, `Esc` to cancel).
- **macOS Keychain Integration**: Credentials remain encrypted inside your local macOS Keychain (`service: gemini`, `account: antigravity`).
- **Safe Automatic Backup**: Your original `app.asar` is preserved as `app.asar.backup` prior to applying any patches.
- **One-Click Reversible**: Easily uninstall and restore factory defaults at any time via `./scripts/uninstall.sh`.

---

## 🏗️ How It Works (Architecture)

Antigravity stores its primary authentication state in two places:
1. **macOS Keychain**: Service `gemini`, Account `antigravity`.
2. **Filesystem Tokens**: `~/.gemini/jetski-standalone-oauth-token` and `~/.gemini/google_accounts.json`.

```
┌─────────────────────────────────────────────────────────┐
│              Google Antigravity UI                      │
│  [Model: Gemini 3.8 Flash]  [Account: Ehsan Shahbazi ▾] │
└──────────────────────────┬──────────────────────────────┘
                           │ IPC invoke ('accounts:switch')
                           ▼
┌─────────────────────────────────────────────────────────┐
│             Electron Main Process (IPC)                 │
│              src/ipc/ipcHandlers.js                     │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│               AccountManager Engine                     │
│              src/core/accountManager.js                 │
├──────────────────────────┬──────────────────────────────┤
│ 1. Read Token Profile    │ ~/.gemini/accounts/<id>.token│
│ 2. Write System Keychain │ security add-generic-password│
│ 3. Sync Token Files      │ ~/.gemini/jetski-standalone..│
│ 4. Terminate LS Process  │ pkill -f language_server     │
│ 5. Reload WebContents    │ win.webContents.reload()     │
└─────────────────────────────────────────────────────────┘
```

When switching accounts:
1. The new account's token is read from `~/.gemini/accounts/<id>.token`.
2. The active token in macOS Keychain is updated atomically via `security`.
3. The filesystem token in `~/.gemini/jetski-standalone-oauth-token` is updated.
4. The background `language_server` binary is signaled to restart with the new credentials.
5. The application window is refreshed seamlessly.

---

## 📋 Prerequisites

- **Operating System**: macOS (Apple Silicon or Intel).
- **Target Application**: Google Antigravity installed at `/Applications/Antigravity.app`.
- **Node.js**: v18.0.0 or higher.
- **npm / npx**: Available in your `$PATH`.

---

## 🚀 Installation

### Automated Installation (Recommended)

Clone the repository and run the installer script:

```bash
git clone https://github.com/EhsanShahbazii/agy-account-switch.git
cd agy-account-switch
./scripts/install.sh
```

The script will:
1. Verify macOS environment and Antigravity installation.
2. Create an automated backup: `/Applications/Antigravity.app/Contents/Resources/app.asar.backup`.
3. Extract `app.asar`, preserving unpacked MCP components (`chrome-devtools-mcp`).
4. Inject IPC handlers into `dist/main.js` and UI into `dist/preload.js`.
5. Repack the archive and apply a valid local ad-hoc code signature (`codesign`).

Once complete, restart Antigravity to begin using your account switcher!

---

## 🎯 Usage Guide

### Switching Accounts
1. Click the **Account** button in the prompt toolbar (next to model selector).
2. Click any of your saved accounts.
3. The full-screen transition overlay will appear for ~1 second while the language server re-authenticates.

### Adding an Account
1. Click the **Account** button, then click **Add Account**.
2. Enter an optional friendly name (e.g., "Secondary", "Work").
3. Click **Sign in with Google** and complete the standard login prompt.

### Renaming an Account
1. Hover over any account in the dropdown.
2. Click the **pencil** icon next to the account name.
3. Type the new name and press `Enter` (or click **Save**).

### Removing an Account
1. Hover over any inactive account.
2. Click the **trash** icon.
3. Confirm deletion in the prompt. (Active accounts cannot be removed until you switch to another account first).

---

## 💻 CLI Tool

You can also inspect and switch accounts directly from your terminal using the bundled CLI:

```bash
# List all accounts and view active session
node bin/agy-switch.js list

# Show currently active account
node bin/agy-switch.js current

# Switch to a specific account by ID
node bin/agy-switch.js switch <accountId>
```

---

## 🩺 Diagnostics & Doctor

Run the health check utility at any time to verify system integrity:

```bash
./scripts/doctor.sh
```

Sample output:
```text
=== Antigravity Account Switcher Doctor ===
✔ Antigravity.app found (/Applications/Antigravity.app)
✔ app.asar found
✔ Clean backup exists (/Applications/Antigravity.app/Contents/Resources/app.asar.backup)
✔ Node.js installed (v26.7.0)
✔ Manifest found (3 configured accounts)
==========================================
```

---

## 🔄 Uninstallation

To restore your Antigravity installation to its clean, pristine factory state:

```bash
./scripts/uninstall.sh
```

This restores `app.asar.backup` directly over `app.asar` and applies code signing.

---

## 🔒 Security & Privacy

- **Local Storage Only**: All account tokens remain stored solely on your local machine in macOS Keychain and restricted user directories (`~/.gemini/accounts/`, mode `0600`).
- **No Third-Party Telemetry**: Zero analytics, zero data collection, zero network calls to non-Google servers.
- **Open-Source & Auditable**: Every line of patcher, IPC, and UI code is inspectable in this repository.

---

## ❓ FAQ & Troubleshooting

#### Q: Does this require disabling System Integrity Protection (SIP)?
**A:** No. SIP remains enabled. The installer signs the modified bundle with an ad-hoc local signature (`codesign --force --deep --sign -`), which macOS accepts without issue.

#### Q: What happens when Antigravity updates?
**A:** Official Antigravity updates replace `app.asar`. If an update occurs, simply navigate to this directory and re-run `./scripts/install.sh`.

#### Q: Where are my accounts stored?
**A:** Account metadata is stored in `~/.gemini/accounts/manifest.json`. The active session token resides in macOS Keychain under service `gemini`, account `antigravity`.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

Author: **[Ehsan Shahbazi](https://github.com/EhsanShahbazii)**  
GitHub: [@EhsanShahbazii](https://github.com/EhsanShahbazii)
