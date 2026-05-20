#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function status() {
    echo -e "${BLUE}==>${NC} ${GREEN}$1${NC}"
}

function error() {
    echo -e "${RED}Error:${NC} $1"
    exit 1
}

# 1. Formatting check
status "Checking format..."
cargo fmt --all -- --check || error "Code is not formatted. Run 'cargo fmt' to fix."

# 2. Linting
status "Linting with Clippy..."
cargo clippy --all-targets --all-features -- -D warnings || error "Clippy found issues."

# 3. Markdown Compilation
status "Compiling Markdown..."
cd scripts
cargo run --quiet || error "Markdown compilation failed."
cd ..

# 4. Frontend Build
status "Building Frontend with Trunk..."
trunk build --quiet || error "Trunk build failed."

echo -e "\n${GREEN}✨ Build Successful!${NC}"
echo -e "📦 Generated: ${BLUE}dist/${NC}"
