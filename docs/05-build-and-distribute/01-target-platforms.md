# Target Platforms

Tauri allows you to target all major desktop operating systems from a single codebase.

## Windows

Tauri uses **WebView2** (based on Edge/Chromium).
- **Installer**: Generates `.msi` and `.exe`.
- **Requirements**: Users must have the WebView2 runtime installed (which is pre-installed on Windows 10/11).

## macOS

Tauri uses **WebKit** (the engine behind Safari).
- **Installer**: Generates `.app` and `.dmg`.
- **Requirements**: Standard macOS environment. Note that for distribution, you will need an Apple Developer account to "sign" and "notarize" your app, otherwise users will see a security warning.

## Linux

Tauri uses **WebKitGTK**.
- **Installer**: Generates `.deb` and `AppImage`.
- **Requirements**: The user must have the necessary WebKitGTK libraries installed on their system.

## Cross-Compilation

Cross-compiling (e.g., building a Windows `.exe` from a Mac) is complex in Rust. The recommended approach is to use **GitHub Actions** or other CI/CD pipelines to build the app on native runners for each platform.
