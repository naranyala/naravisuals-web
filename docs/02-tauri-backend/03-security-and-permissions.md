# Security and Permissions

Tauri is designed with a "security-first" mindset. Because the backend has full OS access, Tauri implements a strict permission system to prevent the frontend from doing things it shouldn't.

## The Sandbox Model

The frontend (WebView) is sandboxed. It cannot access the filesystem or network directly using native Rust APIs; it can only do so by calling Tauri commands that you have explicitly written and exposed.

## The Capability System

In modern Tauri versions, you define **Capabilities**. These are JSON files that specify exactly which commands and plugins the frontend is allowed to use.

For example, if you use the `fs` plugin, you can restrict the frontend to only read from the `$APPCONFIG` folder, preventing it from reading the user's entire home directory.

## Avoiding "Dangerous" Commands

A common security pitfall is creating a "generic" command that takes a path as an argument and reads it:

```rust
// DANGEROUS: Frontend can pass any path on the system!
#[tauri::command]
fn read_file(path: String) -> String {
    std::fs::read_to_string(path).unwrap()
}
```

**The Secure Way**: Validate paths on the backend or use pre-defined allowed directories.
