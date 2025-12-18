---
order: 9
---

# Windows

Window management is crucial for professional desktop applications. Tauri provides comprehensive APIs for creating, managing, and customizing application windows with full control over their appearance and behavior.

## Window Creation and Configuration

### Basic Window Setup

```rust
// src-tauri/src/main.rs
use tauri::{Manager, WindowBuilder};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Create additional windows on startup
            let _window = tauri::WindowBuilder::new(
                app,
                "secondary", // window label
                tauri::WindowUrl::App("/secondary".into())
            )
            .title("Secondary Window")
            .inner_size(800.0, 600.0)
            .min_inner_size(400.0, 300.0)
            .resizable(true)
            .build()?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_new_window,
            window_info,
            close_window,
            focus_window
        ])
        .run(tauri::generate_context!())
        .expect("Failed to start application");
}
```

### Dynamic Window Creation

```rust
#[tauri::command]
async fn create_new_window(
    app: tauri::AppHandle,
    window_type: String,
    title: String,
    width: f64,
    height: f64
) -> Result<String, String> {
    let window_label = format!("window_{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs());
    
    let window_url = match window_type.as_str() {
        "editor" => tauri::WindowUrl::App("/editor".into()),
        "viewer" => tauri::WindowUrl::App("/viewer".into()),
        "settings" => tauri::WindowUrl::App("/settings".into()),
        _ => tauri::WindowUrl::App("/".into()),
    };
    
    let window = WindowBuilder::new(&app, &window_label, window_url)
        .title(&title)
        .inner_size(width, height)
        .min_inner_size(width * 0.5, height * 0.5)
        .center()
        .resizable(true)
        .decorations(true)
        .build()
        .map_err(|e| format!("Failed to create window: {}", e))?;
    
    Ok(window_label)
}

#[tauri::command]
fn create_toolbar_window(
    app: tauri::AppHandle,
    parent_label: String
) -> Result<String, String> {
    let parent_window = app.get_window(&parent_label)
        .ok_or("Parent window not found")?;
    
    let window_label = format!("toolbar_{}", parent_label);
    
    let window = WindowBuilder::new(
        &app,
        &window_label,
        tauri::WindowUrl::App("/toolbar".into())
    )
    .title("Toolbar")
    .inner_size(200.0, 50.0)
    .resizable(false)
    .decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .position(100.0, 100.0)
    .build()
    .map_err(|e| format!("Failed to create toolbar: {}", e))?;
    
    // Position relative to parent
    let _ = window.emit("toolbar-ready", ());
    
    Ok(window_label)
}
```

## Window State Management

### Window Information Commands

```rust
#[derive(serde::Serialize)]
struct WindowInfo {
    label: String,
    title: String,
    visible: bool,
    focused: bool,
    minimized: bool,
    maximized: bool,
    resizable: bool,
    decorations: bool,
    always_on_top: bool,
    position: (i32, i32),
    size: (f64, f64),
}

#[tauri::command]
fn window_info(window: tauri::Window) -> Result<WindowInfo, String> {
    let monitor = window.current_monitor()
        .map_err(|e| format!("Failed to get monitor: {}", e))?;
    
    Ok(WindowInfo {
        label: window.label().to_string(),
        title: window.title().unwrap_or_default(),
        visible: window.is_visible().map_err(|e| format!("Failed to get visibility: {}", e))?,
        focused: window.is_focused().map_err(|e| format!("Failed to get focus: {}", e))?,
        minimized: window.is_minimized().map_err(|e| format!("Failed to get minimized state: {}", e))?,
        maximized: window.is_maximized().map_err(|e| format!("Failed to get maximized state: {}", e))?,
        resizable: window.is_resizable().map_err(|e| format!("Failed to get resizable state: {}", e))?,
        decorations: window.is_decorated().map_err(|e| format!("Failed to get decorations: {}", e))?,
        always_on_top: window.is_always_on_top().map_err(|e| format!("Failed to get always on top: {}", e))?,
        position: window.outer_position()
            .map_err(|e| format!("Failed to get position: {}", e))?,
        size: window.outer_size()
            .map_err(|e| format!("Failed to get size: {}", e))?,
    })
}

#[tauri::command]
fn list_all_windows(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let windows = app.windows()
        .into_iter()
        .map(|(label, _)| label)
        .collect();
    
    Ok(windows)
}

#[tauri::command]
fn get_window_by_label(app: tauri::AppHandle, label: String) -> Result<WindowInfo, String> {
    let window = app.get_window(&label)
        .ok_or("Window not found")?;
    
    window_info(window)
}
```

### Window Control Commands

```rust
#[tauri::command]
fn focus_window(app: tauri::AppHandle, label: String) -> Result<(), String> {
    let window = app.get_window(&label)
        .ok_or("Window not found")?;
    
    window.set_focus()
        .map_err(|e| format!("Failed to focus window: {}", e))
}

#[tauri::command]
fn close_window(app: tauri::AppHandle, label: String) -> Result<(), String> {
    let window = app.get_window(&label)
        .ok_or("Window not found")?;
    
    window.close()
        .map_err(|e| format!("Failed to close window: {}", e))
}

#[tauri::command]
fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize()
        .map_err(|e| format!("Failed to minimize window: {}", e))
}

#[tauri::command]
fn maximize_window(window: tauri::Window) -> Result<(), String> {
    window.set_maximized(true)
        .map_err(|e| format!("Failed to maximize window: {}", e))
}

#[tauri::command]
fn restore_window(window: tauri::Window) -> Result<(), String> {
    window.unmaximize()
        .map_err(|e| format!("Failed to restore window: {}", e))
}

#[tauri::command]
fn hide_window(window: tauri::Window) -> Result<(), String> {
    window.hide()
        .map_err(|e| format!("Failed to hide window: {}", e))
}

#[tauri::command]
fn show_window(window: tauri::Window) -> Result<(), String> {
    window.show()
        .map_err(|e| format!("Failed to show window: {}", e))
}
```

## Window Positioning and Sizing

### Advanced Positioning

```rust
#[tauri::command]
fn center_window(window: tauri::Window) -> Result<(), String> {
    window.center()
        .map_err(|e| format!("Failed to center window: {}", e))
}

#[tauri::command]
fn set_window_position(
    window: tauri::Window, 
    x: i32, 
    y: i32
) -> Result<(), String> {
    window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))
        .map_err(|e| format!("Failed to set window position: {}", e))
}

#[tauri::command]
fn set_window_size(
    window: tauri::Window,
    width: f64,
    height: f64
) -> Result<(), String> {
    window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
        width: width as u32,
        height: height as u32
    }))
    .map_err(|e| format!("Failed to set window size: {}", e))
}

#[tauri::command]
fn set_window_bounds(
    window: tauri::Window,
    x: i32,
    y: i32,
    width: f64,
    height: f64
) -> Result<(), String> {
    window.set_outer_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))
        .and_then(|_| {
            window.set_outer_size(tauri::Size::Physical(tauri::PhysicalSize {
                width: width as u32,
                height: height as u32
            }))
        })
        .map_err(|e| format!("Failed to set window bounds: {}", e))
}

#[tauri::command]
fn get_monitor_info(app: tauri::AppHandle, window_label: String) -> Result<MonitorInfo, String> {
    let window = app.get_window(&window_label)
        .ok_or("Window not found")?;
    
    let monitor = window.current_monitor()
        .map_err(|e| format!("Failed to get monitor: {}", e))?
        .ok_or("No monitor found")?;
    
    Ok(MonitorInfo {
        name: monitor.name().unwrap_or("Unknown".to_string()),
        size: (monitor.size().width, monitor.size().height),
        position: (monitor.position().x, monitor.position().y),
        scale_factor: monitor.scale_factor(),
        primary: monitor.is_primary(),
    })
}

#[derive(serde::Serialize)]
struct MonitorInfo {
    name: String,
    size: (u32, u32),
    position: (i32, i32),
    scale_factor: f64,
    primary: bool,
}
```

## Window Styling and Behavior

### Window Appearance

```rust
#[tauri::command]
fn set_window_title(window: tauri::Window, title: String) -> Result<(), String> {
    window.set_title(&title)
        .map_err(|e| format!("Failed to set window title: {}", e))
}

#[tauri::command]
fn toggle_decorations(window: tauri::Window) -> Result<bool, String> {
    let current = window.is_decorated()
        .map_err(|e| format!("Failed to get decorations state: {}", e))?;
    
    window.set_decorations(!current)
        .map_err(|e| format!("Failed to set decorations: {}", e))?;
    
    Ok(!current)
}

#[tauri::command]
fn toggle_always_on_top(window: tauri::Window) -> Result<bool, String> {
    let current = window.is_always_on_top()
        .map_err(|e| format!("Failed to get always on top state: {}", e))?;
    
    window.set_always_on_top(!current)
        .map_err(|e| format!("Failed to set always on top: {}", e))?;
    
    Ok(!current)
}

#[tauri::command]
fn set_transparency(window: tauri::Window, opacity: f64) -> Result<(), String> {
    // Note: Opacity range is 0.0 to 1.0
    let clamped_opacity = opacity.clamp(0.0, 1.0);
    
    // This requires window decorations to be disabled in some platforms
    window.set_decorations(false)
        .map_err(|e| format!("Failed to disable decorations for transparency: {}", e))?;
    
    // Note: Full transparency control may require additional configuration
    // in tauri.conf.json and platform-specific implementations
    
    Ok(())
}
```

### Window Events and Communication

```rust
#[tauri::command]
fn setup_window_events(window: tauri::Window) -> Result<(), String> {
    let window_clone = window.clone();
    
    // Listen for window resize events
    let _resized = window.on_window_event(move |event| {
        match event {
            tauri::WindowEvent::Resized(size) => {
                let _ = window_clone.emit("window-resized", WindowSizeEvent {
                    width: size.width,
                    height: size.height,
                });
            }
            tauri::WindowEvent::Moved(position) => {
                let _ = window_clone.emit("window-moved", WindowPositionEvent {
                    x: position.x,
                    y: position.y,
                });
            }
            tauri::WindowEvent::Focused(focused) => {
                let _ = window_clone.emit("window-focus-changed", FocusEvent { focused: *focused });
            }
            tauri::WindowEvent::FileDrop(file_drop_event) => {
                match file_drop_event {
                    tauri::FileDropEvent::Dropped(paths) => {
                        let _ = window_clone.emit("files-dropped", FileDropEvent {
                            paths: paths.clone(),
                        });
                    }
                    tauri::FileDropEvent::Hovered(paths) => {
                        let _ = window_clone.emit("files-hovered", FileDropEvent {
                            paths: paths.clone(),
                        });
                    }
                    tauri::FileDropEvent::Cancelled => {
                        let _ = window_clone.emit("files-drop-cancelled", ());
                    }
                }
            }
            _ => {}
        }
    });
    
    Ok(())
}

#[derive(serde::Serialize)]
struct WindowSizeEvent {
    width: u32,
    height: u32,
}

#[derive(serde::Serialize)]
struct WindowPositionEvent {
    x: i32,
    y: i32,
}

#[derive(serde::Serialize)]
struct FocusEvent {
    focused: bool,
}

#[derive(serde::Serialize)]
struct FileDropEvent {
    paths: Vec<String>,
}
```

## Window Configuration File

### tauri.conf.json Window Settings

```json
{
  "tauri": {
    "windows": [
      {
        "label": "main",
        "title": "My Application",
        "url": "/",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "decorations": true,
        "transparent": false,
        "alwaysOnTop": false,
        "center": true,
        "skipTaskbar": false,
        "theme": "system",
        "visible": true,
        "closable": true,
        "minimizable": true,
        "maximizable": true,
        "fileDropEnabled": true
      },
      {
        "label": "editor",
        "title": "Editor Window",
        "url": "/editor",
        "width": 1000,
        "height": 700,
        "minWidth": 600,
        "minHeight": 400,
        "resizable": true,
        "center": true,
        "visible": false,
        "parent": "main"
      }
    ]
  }
}
```

## Best Practices

### 1. Window Lifecycle Management

```rust
// Properly cleanup windows when closing
#[tauri::command]
fn cleanup_child_windows(app: tauri::AppHandle, parent_label: String) -> Result<(), String> {
    let parent_window = app.get_window(&parent_label)
        .ok_or("Parent window not found")?;
    
    // Find and close all child windows
    let windows_to_close: Vec<String> = app.windows()
        .into_iter()
        .filter(|(label, _)| label.starts_with(&format!("{}_child_", parent_label)))
        .map(|(label, _)| label)
        .collect();
    
    for window_label in windows_to_close {
        if let Some(window) = app.get_window(&window_label) {
            let _ = window.close();
        }
    }
    
    Ok(())
}
```

### 2. Memory Management

```rust
// Use weak references to avoid circular dependencies
use std::sync::{Arc, Weak, Mutex};

struct WindowManager {
    windows: Arc<Mutex<Vec<String>>>,
}

#[tauri::command]
fn register_window(
    app: tauri::AppHandle,
    manager: tauri::State<'_, Arc<Mutex<WindowManager>>>,
    window_label: String
) -> Result<(), String> {
    let mut windows = manager.lock().unwrap();
    windows.push(window_label);
    Ok(())
}
```

### 3. Error Recovery

```rust
#[tauri::command]
fn safe_window_operation<F, R>(
    app: tauri::AppHandle,
    window_label: String,
    operation: F
) -> Result<R, String>
where
    F: FnOnce(&tauri::Window) -> Result<R, Box<dyn std::error::Error + Send + Sync>>,
{
    let window = app.get_window(&window_label)
        .ok_or("Window not found")?;
    
    operation(window)
        .map_err(|e| format!("Window operation failed: {}", e))
}
```

Window management is essential for creating professional desktop applications. These patterns provide a solid foundation for building responsive, user-friendly interfaces with multiple windows and proper state management.