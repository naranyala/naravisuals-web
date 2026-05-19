# Native Notifications

Notifications are the primary way to communicate with the user when the application is minimized or running in the background.

## Sending Notifications

You can send a notification from the Rust backend using the notification plugin.

```rust
use tauri_plugin_notification::NotificationExt;

#[tauri::command]
fn send_alert(app: tauri::AppHandle) {
    app.notification()
        .builder()
        .title("Update Complete")
        .body("Your files have been successfully synchronized.")
        .show()
        .unwrap();
}
```

## Customizing Notifications

Depending on the OS, you can add:
- **Icons**: A small image next to the text.
- **Actions**: Buttons within the notification (e.g., "Undo" or "Open").
- **Urgency**: Marking the notification as critical to bypass "Do Not Disturb" modes (where permitted).

## Best Practices

Avoid "notification spam". Users find frequent popups annoying. Instead, use notifications for critical events and use a "Notification Center" inside your app for less urgent updates.
