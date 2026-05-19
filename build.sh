#!/bin/bash
set -e

echo "=== Step 1: Markdown → Rust Compiler ==="
cd scripts
cargo run
cd ..

echo ""
echo "=== Step 2: Building Frontend ==="
trunk build

echo ""
echo "=== Build Complete ==="
echo "Generated Rust components: generated/*.rs"
echo "Frontend build: dist/"
