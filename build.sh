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
echo "=== Step 3: Syncing Assets to Dist ==="
# Ensure the target directory exists in dist
mkdir -p dist/generated/json

# Copy everything from public/generated to dist/generated
cp -r public/generated/* dist/generated/

echo ""
echo "=== Step 4: Verifying Assets ==="
if [ -f "dist/generated/manifest.json" ]; then
    echo "✅ Success: Assets are now present in dist/generated/manifest.json"
else
    echo "❌ Error: Sync failed. Assets still missing from dist/generated/!"
    exit 1
fi

echo ""
echo "=== Build Complete ==="
echo "Generated Rust components: generated/*.rs"
echo "Frontend build: dist/"
