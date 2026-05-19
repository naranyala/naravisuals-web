# Tauri Commands

Commands are the primary way for your Leptos frontend to trigger logic in the Rust backend. They work similarly to an API endpoint in a web server.

## Defining a Command

A command is simply a Rust function annotated with `#[tauri::command]`.

```rust
#[tauri::command]
fn calculate_stats(data: Vec<f64>) -> f64 {
    let sum: f64 = data.iter().sum();
    sum / data.len() as f64
}
```

## Registering Commands

For a command to be reachable from the frontend, it must be registered in the `invoke_handler` during the app builder phase:

```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![calculate_stats])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Async Commands

If a command needs to perform I/O (like reading a file or calling an API), it should be `async`. Tauri automatically handles the async execution so that the main thread is not blocked.

```rust
#[tauri::command]
async fn fetch_remote_data(url: String) -> Result<String, String> {
    reqwest::get(url).await
        .map_err(|e| e.to_string())?
        .text().await
        .map_err(|e| e.to_string())
}
```
