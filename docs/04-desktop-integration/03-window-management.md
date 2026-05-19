# Window Management

Tauri gives you granular control over how your application windows look and behave.

## Customizing the Window

You can configure the window's appearance in `tauri.conf.json` or programmatically in Rust.

- **Transparency**: Set `transparent: true` to create non-rectangular windows or glass effects.
- **Frameless**: Set `decorations: false` to remove the standard OS title bar and borders, allowing you to build a custom, branded header.
- **Always on Top**: Keep your app visible above all other windows (useful for toolbars or overlays).

## Multi-Window Applications

Tauri supports creating multiple windows. This is useful for:
- A main dashboard and a separate "Settings" window.
- Tool palettes that can be dragged to a second monitor.
- Splash screens that disappear once the app has finished loading.

```rust
let window = tauri::WindowBuilder::new(
    app, 
    "settings", 
    tauri::WindowUrl::App("settings.html".into())
).build()?;
```

## Window Communication

Windows can communicate with each other by emitting events. One window can tell another window to refresh its data or close itself.
