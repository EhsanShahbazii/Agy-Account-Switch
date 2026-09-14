#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}==================================================${NC}"
echo -e "${CYAN}   Antigravity Native Multi-Account Switcher     ${NC}"
echo -e "${CYAN}==================================================${NC}"

if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}[ERROR] This switcher is designed for macOS only.${NC}"
    exit 1
fi

APP_PATH="/Applications/Antigravity.app"
if [ ! -d "$APP_PATH" ]; then
    echo -e "${RED}[ERROR] Antigravity app was not found at $APP_PATH${NC}"
    exit 1
fi

command -v node >/dev/null 2>&1 || { echo -e "${RED}[ERROR] Node.js is required but not installed.${NC}"; exit 1; }
command -v npx >/dev/null 2>&1 || { echo -e "${RED}[ERROR] npx is required but not installed.${NC}"; exit 1; }

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"


# Remove quarantine / Gatekeeper flags and ensure write permissions
echo -e "${YELLOW}Clearing macOS quarantine and attributes...${NC}"
xattr -dr com.apple.quarantine "$APP_PATH" 2>/dev/null || true
xattr -cr "$APP_PATH" 2>/dev/null || true
chmod -R u+w "$APP_PATH" 2>/dev/null || true

if pgrep -f "Antigravity" >/dev/null 2>&1; then
    echo -e "${CYAN}[INFO] Antigravity is currently open. Applying patch in-place...${NC}"
fi

echo -e "${YELLOW}Applying patch to Antigravity...${NC}"
node "$PROJECT_ROOT/src/injector/patcher.js"
xattr -dr com.apple.quarantine "$APP_PATH" 2>/dev/null || true
xattr -cr "$APP_PATH" 2>/dev/null || true

echo -e "${GREEN}[SUCCESS] Antigravity Account Switcher successfully installed!${NC}"
if pgrep -f "Antigravity" >/dev/null 2>&1; then
    echo -e "${CYAN}--------------------------------------------------${NC}"
    echo -e "${YELLOW}Please restart Antigravity (Cmd+Q and re-open) to activate the Account Switcher!${NC}"
    echo -e "${CYAN}--------------------------------------------------${NC}"
else
    if [ -t 0 ]; then
        read -p "Would you like to launch Antigravity now? [Y/n] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            open -a Antigravity
        fi
    else
        echo -e "${CYAN}Launch Antigravity to see the account switcher in the prompt toolbar.${NC}"
    fi
fi

