# The Event System

Events are used for asynchronous, one-way communication. They are perfect for long-running tasks or system notifications.

## Emitting Events from Rust

The backend can emit an event to all windows or a specific window.

```rust
use tauri::Emitter;

#[tauri::command]
fn start_process(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        for i in 1..=100 {
            app.emit("progress", i).unwrap();
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
    });
}
```

## Listening for Events in Leptos

To react to these events in the UI, you set up a listener. In Leptos, you typically do this inside a `create_effect`.

```rust
create_effect(move |_| {
    // Use JS bridge to listen for "progress"
    // When received, update a Leptos signal:
    // set_progress.set(new_value);
});
```

## Use Cases for Events

- **Progress Bars**: Updating a percentage during a large file upload.
- **Hardware Status**: Notifying the UI when a USB device is plugged in.
- **Global State Sync**: Updating multiple windows simultaneously when a setting changes.
