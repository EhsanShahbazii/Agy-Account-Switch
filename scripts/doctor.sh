#!/usr/bin/env bash

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}=== Antigravity Account Switcher Doctor ===${NC}"

# Check App
APP_PATH="/Applications/Antigravity.app"
if [ -d "$APP_PATH" ]; then
    echo -e "${GREEN}✔ Antigravity.app found${NC} ($APP_PATH)"
else
    echo -e "${RED}✘ Antigravity.app NOT found${NC}"
fi

# Check ASAR
ASAR_PATH="$APP_PATH/Contents/Resources/app.asar"
if [ -f "$ASAR_PATH" ]; then
    echo -e "${GREEN}✔ app.asar found${NC}"
fi

# Check Backup
BACKUP_PATH="$APP_PATH/Contents/Resources/app.asar.backup"
if [ -f "$BACKUP_PATH" ]; then
    echo -e "${GREEN}✔ Clean backup exists${NC} ($BACKUP_PATH)"
else
    echo -e "${YELLOW}⚠ No backup created yet (will be created automatically on install)${NC}"
fi

# Check Node
if command -v node >/dev/null 2>&1; then
    NODE_V=$(node -v)
    echo -e "${GREEN}✔ Node.js installed${NC} ($NODE_V)"
else
    echo -e "${RED}✘ Node.js not installed${NC}"
fi

# Check Manifest
MANIFEST="$HOME/.gemini/accounts/manifest.json"
if [ -f "$MANIFEST" ]; then
    COUNT=$(grep -o '"id"' "$MANIFEST" | wc -l | tr -d ' ')
    echo -e "${GREEN}✔ Manifest found${NC} ($COUNT configured accounts)"
else
    echo -e "${YELLOW}ℹ No accounts manifest yet (will initialize on first launch)${NC}"
fi
echo -e "${CYAN}==========================================${NC}"
