# System Tray and Menus

The system tray (or menu bar on macOS) allows your app to stay active in the background and provides quick access to common actions.

## Creating a Tray Icon

The tray is configured in the `main` function of your Rust backend.

```rust
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;
            
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .build(app)?;
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Handling Tray Events

You can listen for clicks on the tray icon or specific menu items to trigger actions, such as showing the main window or performing a "Quick Action" without opening the UI.

## Global Shortcuts

Tauri also allows you to register global shortcuts (e.g., `Ctrl+Shift+P`) that trigger Rust functions even when your app window is not focused.
