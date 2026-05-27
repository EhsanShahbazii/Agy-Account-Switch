#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}Restoring original Antigravity application...${NC}"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

node "$PROJECT_ROOT/src/injector/unpatcher.js"

echo -e "${GREEN}[SUCCESS] Antigravity successfully restored to original state.${NC}"
