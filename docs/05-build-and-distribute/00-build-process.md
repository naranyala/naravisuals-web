# The Build Process

Turning your code into a distributable application involves several steps of compilation and bundling.

## How Tauri Builds Your App

When you run `cargo tauri build`, the following happens:

1. **Frontend Compilation**: Tauri runs your frontend build script (e.g., `trunk build --release`). This compiles your Leptos Rust code into an optimized WASM binary and generates the HTML/CSS/JS.
2. **Backend Compilation**: Cargo compiles the native Rust core with the `--release` flag, applying heavy optimizations for speed and size.
3. **Asset Bundling**: The WASM and assets are embedded directly into the final native binary.
4. **Installer Generation**: Tauri uses system tools (like WiX on Windows or hdiutil on macOS) to wrap the binary in a standard installer (`.msi`, `.dmg`, `.deb`).

## Build Times

The first build is usually slow because it compiles all dependencies. Subsequent builds are much faster due to Cargo's caching. Use a fast SSD and ensure you have enough RAM to speed up the process.
