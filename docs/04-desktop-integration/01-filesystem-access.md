# Filesystem Access

Handling files is a core requirement for many desktop apps. Tauri provides a safe way to interact with the user's disk.

## Scoped Access

For security, Tauri uses "scopes". You can define which directories the app is allowed to access in your configuration. Common scopes include:
- `$APPCONFIG`: The application's configuration directory.
- `$APPDATA`: The application's data directory.
- `$HOME`: The user's home folder.

## Reading and Writing Files

You can perform file operations using the `fs` plugin.

**Example (Rust Backend):**
```rust
use tauri_plugin_fs::FsExt;

#[tauri::command]
fn save_settings(app: tauri::AppHandle, data: String) {
    let path = app.path().app_config_dir().unwrap().join("settings.json");
    std::fs::write(path, data).expect("Failed to write");
}
```

## Native File Dialogs

Instead of making the user type a path, use the `dialog` plugin to show a native "Open File" or "Save As" window. This is the best practice for user experience and security.
