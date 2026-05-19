# Backend State Management

Often, your application needs to maintain state that persists across multiple command calls—such as a database connection pool or a user session.

## The `.manage()` Method

Tauri provides a built-in state management system. You can inject any Rust type into the Tauri context using the `.manage()` method.

```rust
struct AppConfig {
    api_key: String,
}

fn main() {
    tauri::Builder::default()
        .manage(AppConfig { api_key: "secret_123".into() })
        // ...
}
```

## Accessing State in Commands

To use the managed state inside a command, use the `tauri::State` extractor in the function arguments.

```rust
#[tauri::command]
fn get_config(state: tauri::State<'_, AppConfig>) -> String {
    state.api_key.clone()
}
```

## Mutable State

Since state is shared across multiple threads (commands), you cannot mutate it directly. You must use thread-safe wrappers like `Mutex` or `RwLock`.

```rust
struct AppCounter(Mutex<i32>);

#[tauri::command]
fn increment(state: tauri::State<'_, AppCounter>) {
    let mut count = state.0.lock().unwrap();
    *count += 1;
}
```
