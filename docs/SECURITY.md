# Security and Threat Model

## Data Storage
- Tokens are stored locally in:
  - macOS Keychain: `service: gemini`, `account: antigravity`
  - Encrypted/restricted user directory: `~/.gemini/accounts/*.token` (mode `0600`)
- Manifest files store only non-sensitive account metadata:
  - `id`, `label`, `email`, `name`, `picture` URL

## IPC Boundary
- IPC handlers validate all incoming requests.
- No arbitrary code execution or external network proxying is performed.
- Standard Google OAuth 2.0 loopback flow is used for authenticating new accounts.
