#!/bin/bash
set -e

echo "🚀 Starting Rigorstarter Dev Environment..."

# 1. Run the full build pipeline
# This ensures markdown is compiled and assets are synced to dist/
echo "📦 Running initial build pipeline..."
./build.sh

echo ""
echo "🌐 Launching development server..."
echo "Your site will be available at http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------------------------------"

# 2. Start trunk serve
# Note: trunk serve will watch for .rs and .html changes.
# To update markdown content, you will need to run ./build.sh in another terminal
# or restart this script.
trunk serve
