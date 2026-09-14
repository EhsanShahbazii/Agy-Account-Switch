#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_PATH="/Applications/Antigravity.app"
RESOURCES_DIR="$APP_PATH/Contents/Resources"
if [ -d "$RESOURCES_DIR" ] && ! touch "$RESOURCES_DIR/.write_test" 2>/dev/null; then
    echo -e "${YELLOW}[NOTICE] Write permission required for $APP_PATH.${NC}"
    echo -e "${YELLOW}Please enter your macOS administrator password if prompted:${NC}"
    sudo chflags -R nouchg "$APP_PATH" 2>/dev/null || true
    sudo chown -R "$(whoami)" "$APP_PATH"
    sudo chmod -R u+w "$APP_PATH"
else
    rm -f "$RESOURCES_DIR/.write_test" 2>/dev/null || true
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

node "$PROJECT_ROOT/src/injector/unpatcher.js"

echo -e "${GREEN}[SUCCESS] Antigravity successfully restored to original state.${NC}"
if pgrep -f "Antigravity" >/dev/null 2>&1; then
    echo -e "${CYAN}--------------------------------------------------${NC}"
    echo -e "${YELLOW}Please restart Antigravity (Cmd+Q and re-open) to finalize restoration.${NC}"
    echo -e "${CYAN}--------------------------------------------------${NC}"
fi
