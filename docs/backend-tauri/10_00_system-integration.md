---
order: 10
---

# System Integration

Tauri enables deep integration with the host operating system, allowing desktop applications to access system resources, notifications, menus, and native APIs. This comprehensive guide covers system integration patterns for professional applications.

## System Information and Monitoring

### Hardware and OS Detection

```rust
use std::process::Command;

#[derive(serde::Serialize)]
struct SystemInfo {
    os_name: String,
    os_version: String,
    architecture: String,
    hostname: String,
    cpu_cores: usize,
    total_memory_mb: u64,
    available_memory_mb: u64,
    disk_space: Vec<DiskInfo>,
}

#[derive(serde::Serialize)]
struct DiskInfo {
    mount_point: String,
    total_bytes: u64,
    available_bytes: u64,
    is_removable: bool,
}

#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    // OS Information
    let os_name = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();
    let hostname = gethostname::gethostname()
        .to_string_lossy()
        .to_string();
    
    // CPU Information
    let cpu_cores = num_cpus::get();
    
    // Memory Information
    let memory_info = get_memory_info()?;
    
    // Disk Information
    let disk_info = get_disk_info()?;
    
    Ok(SystemInfo {
        os_name,
        os_version: get_os_version()?,
        architecture: arch,
        hostname,
        cpu_cores,
        total_memory_mb: memory_info.total,
        available_memory_mb: memory_info.available,
        disk_space: disk_info,
    })
}

#[derive(serde::Serialize)]
struct MemoryInfo {
    total: u64,
    available: u64,
    used: u64,
}

fn get_memory_info() -> Result<MemoryInfo, String> {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::System::SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX};
        
        let mut mem_status = MEMORYSTATUSEX {
            dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32,
            ..Default::default()
        };
        
        unsafe {
            GlobalMemoryStatusEx(&mut mem_status);
        }
        
        Ok(MemoryInfo {
            total: mem_status.ullTotalPhys / (1024 * 1024),
            available: mem_status.ullAvailPhys / (1024 * 1024),
            used: (mem_status.ullTotalPhys - mem_status.ullAvailPhys) / (1024 * 1024),
        })
    }
    
    #[cfg(target_os = "linux")]
    {
        let content = std::fs::read_to_string("/proc/meminfo")
            .map_err(|e| format!("Failed to read /proc/meminfo: {}", e))?;
        
        let mut total = 0u64;
        let mut available = 0u64;
        
        for line in content.lines() {
            if line.starts_with("MemTotal:") {
                total = line.split_whitespace()
                    .nth(1)
                    .unwrap_or("0")
                    .parse::<u64>()
                    .unwrap_or(0) / 1024;
            } else if line.starts_with("MemAvailable:") {
                available = line.split_whitespace()
                    .nth(1)
                    .unwrap_or("0")
                    .parse::<u64>()
                    .unwrap_or(0) / 1024;
            }
        }
        
        Ok(MemoryInfo {
            total,
            available,
            used: total - available,
        })
    }
    
    #[cfg(target_os = "macos")]
    {
        use std::ffi::CStr;
        
        let output = Command::new("sysctl")
            .args(&["-n", "hw.memsize"])
            .output()
            .map_err(|e| format!("Failed to execute sysctl: {}", e))?;
        
        let output_str = String::from_utf8_lossy(&output.stdout);
        let total_bytes: u64 = output_str.trim()
            .parse()
            .map_err(|e| format!("Failed to parse memory size: {}", e))?;
        
        Ok(MemoryInfo {
            total: total_bytes / (1024 * 1024),
            available: total_bytes / (1024 * 1024), // Simplified
            used: 0, // Would need additional sysctl calls
        })
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    {
        Err("Unsupported platform".to_string())
    }
}

fn get_disk_info() -> Result<Vec<DiskInfo>, String> {
    let mut disks = Vec::new();
    
    #[cfg(target_os = "windows")]
    {
        for drive_letter in b'A'..=b'Z' {
            let drive = format!("{}:\\", drive_letter as char);
            if std::path::Path::new(&drive).exists() {
                if let Ok(metadata) = std::fs::metadata(&drive) {
                    if let Ok(total) = metadata.total_space() {
                        if let Ok(available) = metadata.available_space() {
                            disks.push(DiskInfo {
                                mount_point: drive,
                                total_bytes: total,
                                available_bytes: available,
                                is_removable: false, // Would need additional checks
                            });
                        }
                    }
                }
            }
        }
    }
    
    #[cfg(any(target_os = "linux", target_os = "macos"))]
    {
        let output = Command::new("df")
            .args(&["-k", "--output=source,target,size,avail"])
            .output()
            .map_err(|e| format!("Failed to execute df: {}", e))?;
        
        let output_str = String::from_utf8_lossy(&output.stdout);
        
        for line in output_str.lines().skip(1) {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 4 {
                if let (Ok(size_kb), Ok(available_kb)) = 
                    (parts[2].parse::<u64>(), parts[3].parse::<u64>()) {
                    disks.push(DiskInfo {
                        mount_point: parts[1].to_string(),
                        total_bytes: size_kb * 1024,
                        available_bytes: available_kb * 1024,
                        is_removable: false,
                    });
                }
            }
        }
    }
    
    Ok(disks)
}

fn get_os_version() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::ffi::CStr;
        use windows_sys::Win32::System::SystemInformation::GetVersionExA;
        use windows_sys::Win32::System::SystemInformation::OSVERSIONINFOEXA;
        
        let mut os_info = OSVERSIONINFOEXA {
            dwOSVersionInfoSize: std::mem::size_of::<OSVERSIONINFOEXA>() as u32,
            ..Default::default()
        };
        
        unsafe {
            if GetVersionExA(&mut os_info) != 0 {
                Ok(format!("{}.{}.{}", 
                    os_info.dwMajorVersion,
                    os_info.dwMinorVersion,
                    os_info.dwBuildNumber
                ))
            } else {
                Err("Failed to get Windows version".to_string())
            }
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        let content = std::fs::read_to_string("/etc/os-release")
            .or_else(|_| std::fs::read_to_string("/etc/issue"))
            .unwrap_or_default();
        
        Ok(content.lines()
            .find(|line| line.starts_with("PRETTY_NAME=") || line.starts_with("Ubuntu"))
            .unwrap_or("Unknown Linux")
            .to_string())
    }
    
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("sw_vers")
            .args(&["-productVersion"])
            .output()
            .map_err(|e| format!("Failed to execute sw_vers: {}", e))?;
        
        let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(format!("macOS {}", version))
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    {
        Ok("Unknown OS".to_string())
    }
}
```

## System Notifications

### Native Notifications

```rust
use notify_rust::Notification;

#[derive(serde::Serialize)]
struct NotificationOptions {
    title: String,
    body: String,
    icon: Option<String>,
    timeout: Option<i32>,
    urgency: Option<String>, // "low", "normal", "critical"
}

#[tauri::command]
async fn show_notification(options: NotificationOptions) -> Result<(), String> {
    let mut notification = Notification::new();
    
    notification
        .summary(&options.title)
        .body(&options.body);
    
    if let Some(icon) = options.icon {
        notification.icon(&icon);
    }
    
    if let Some(timeout) = options.timeout {
        notification.timeout(timeout);
    }
    
    if let Some(urgency) = options.urgency {
        match urgency.as_str() {
            "low" => notification.urgency(notify_rust::Urgency::Low),
            "critical" => notification.urgency(notify_rust::Urgency::Critical),
            _ => notification.urgency(notify_rust::Urgency::Normal),
        };
    }
    
    notification.show()
        .map_err(|e| format!("Failed to show notification: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn show_progress_notification(
    title: String,
    message: String,
    progress: u32,
    total: u32
) -> Result<(), String> {
    let notification = Notification::new()
        .summary(&title)
        .body(&format!("{} ({}/{})", message, progress, total))
        .hint(notify_rust::Hint::ProgressValue(progress * 100 / total))
        .timeout(0); // Persistent notification
    
    notification.show()
        .map_err(|e| format!("Failed to show progress notification: {}", e))?;
    
    Ok(())
}
```

## System Tray Integration

### Tray Menu and Icon

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, SystemTraySubmenu};

fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide_window = CustomMenuItem::new("hide".to_string(), "Hide Window");
    let show_window = CustomMenuItem::new("show".to_string(), "Show Window");
    
    let submenu = SystemTraySubmenu::new(
        "Advanced",
        SystemTrayMenu::new()
            .add_item(CustomMenuItem::new("settings".to_string(), "Settings"))
            .add_item(CustomMenuItem::new("about".to_string(), "About"))
            .add_native_item(SystemTrayMenuItem::Separator)
            .add_item(quit),
    );
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show_window)
        .add_item(hide_window)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_submenu(submenu);
    
    SystemTray::new().with_menu(tray_menu)
}

#[tauri::command]
fn update_tray_icon(app: tauri::AppHandle, icon_path: String) -> Result<(), String> {
    let tray_handle = app.tray_handle();
    
    tray_handle.set_icon(tauri::Icon::File(
        std::path::PathBuf::from(icon_path)
    ))
    .map_err(|e| format!("Failed to set tray icon: {}", e))?;
    
    Ok(())
}

#[tauri::command]
fn update_tray_tooltip(app: tauri::AppHandle, tooltip: String) -> Result<(), String> {
    let tray_handle = app.tray_handle();
    
    tray_handle.set_tooltip(&tooltip)
        .map_err(|e| format!("Failed to set tray tooltip: {}", e))?;
    
    Ok(())
}

#[tauri::command]
fn show_tray_notification(
    app: tauri::AppHandle,
    title: String,
    body: String
) -> Result<(), String> {
    let tray_handle = app.tray_handle();
    
    tray_handle.notify(&title, Some(&body))
        .map_err(|e| format!("Failed to show tray notification: {}", e))?;
    
    Ok(())
}

// Event handler for system tray
fn handle_system_tray_event(app: tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            let window = app.get_window("main").unwrap();
            if window.is_visible().unwrap_or(false) {
                let _ = window.hide();
            } else {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    let _ = window.hide();
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
                "settings" => {
                    let window = app.get_window("main").unwrap();
                    let _ = window.emit("open-settings", ());
                }
                "about" => {
                    let window = app.get_window("main").unwrap();
                    let _ = window.emit("open-about", ());
                }
                _ => {}
            }
        }
        _ => {}
    }
}
```

## System Menu Integration

### Native Menu Bar

```rust
use tauri::{Menu, MenuItem, Submenu};

fn create_app_menu() -> Menu {
    Menu::new()
        .add_submenu(Submenu::new(
            "File",
            Menu::new()
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Quit),
        ))
        .add_submenu(Submenu::new(
            "Edit",
            Menu::new()
                .add_native_item(MenuItem::Undo)
                .add_native_item(MenuItem::Redo)
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Cut)
                .add_native_item(MenuItem::Copy)
                .add_native_item(MenuItem::Paste),
        ))
        .add_submenu(Submenu::new(
            "View",
            Menu::new()
                .add_item(CustomMenuItem::new("fullscreen".to_string(), "Toggle Fullscreen"))
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::EnterFullScreen),
        ))
        .add_submenu(Submenu::new(
            "Window",
            Menu::new()
                .add_native_item(MenuItem::Minimize)
                .add_native_item(MenuItem::Zoom),
        ))
        .add_submenu(Submenu::new(
            "Help",
            Menu::new()
                .add_item(CustomMenuItem::new("documentation".to_string(), "Documentation"))
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::About("Your App".to_string(), "1.0.0".to_string())),
        ))
}

#[tauri::command]
fn update_menu_item(app: tauri::AppHandle, id: String, title: String) -> Result<(), String> {
    let menu_handle = app.menu_handle();
    
    menu_handle.get_item(&id)
        .set_title(&title)
        .map_err(|e| format!("Failed to update menu item: {}", e))?;
    
    Ok(())
}

#[tauri::command]
fn enable_menu_item(app: tauri::AppHandle, id: String, enabled: bool) -> Result<(), String> {
    let menu_handle = app.menu_handle();
    
    menu_handle.get_item(&id)
        .set_enabled(enabled)
        .map_err(|e| format!("Failed to enable/disable menu item: {}", e))?;
    
    Ok(())
}
```

## File Association

### Register File Types

```rust
#[tauri::command]
fn register_file_associations(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        
        // Register file association for Windows
        let output = Command::new("cmd")
            .args(&["/C", "assoc", ".myext=MyApp.File"])
            .output()
            .map_err(|e| format!("Failed to create file association: {}", e))?;
        
        if !output.status.success() {
            return Err("Failed to create file association".to_string());
        }
        
        // Set the application handler
        let output = Command::new("cmd")
            .args(&["/C", "ftype", "MyApp.File", "\"C:\\path\\to\\your-app.exe\" \"%1\""])
            .output()
            .map_err(|e| format!("Failed to set file handler: {}", e))?;
        
        if !output.status.success() {
            return Err("Failed to set file handler".to_string());
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        // macOS file associations are typically set up via Info.plist
        // This would require additional build-time configuration
    }
    
    #[cfg(target_os = "linux")]
    {
        // Create .desktop file for Linux file associations
        let desktop_entry = format!(
            "[Desktop Entry]\n\
            Name=MyApp\n\
            Exec={} %F\n\
            Icon=myapp\n\
            Type=Application\n\
            Categories=Utility;\n\
            MimeType=application/x-myext;\n",
            std::env::current_exe()
                .map_err(|e| format!("Failed to get executable path: {}", e))?
                .to_string_lossy()
        );
        
        let desktop_dir = dirs::data_dir()
            .ok_or("Failed to get data directory")?
            .join("applications");
        
        std::fs::create_dir_all(&desktop_dir)
            .map_err(|e| format!("Failed to create applications directory: {}", e))?;
        
        std::fs::write(desktop_dir.join("myapp.desktop"), desktop_entry)
            .map_err(|e| format!("Failed to write desktop entry: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
fn handle_file_drop(window: tauri::Window, file_paths: Vec<String>) -> Result<(), String> {
    window.emit("files-opened", FileDropEvent {
        files: file_paths,
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    })
    .map_err(|e| format!("Failed to emit file drop event: {}", e))?;
    
    Ok(())
}

#[derive(serde::Serialize)]
struct FileDropEvent {
    files: Vec<String>,
    timestamp: u64,
}
```

## Process Management

### Running External Processes

```rust
use std::process::{Command, Stdio};

#[tauri::command]
async fn execute_command(
    program: String,
    args: Vec<String>,
    working_directory: Option<String>
) -> Result<ProcessResult, String> {
    let mut cmd = Command::new(&program);
    
    cmd.args(&args);
    
    if let Some(dir) = working_directory {
        cmd.current_dir(dir);
    }
    
    // Capture output
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());
    
    let output = cmd.output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;
    
    Ok(ProcessResult {
        exit_code: output.status.code().unwrap_or(-1),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        success: output.status.success(),
    })
}

#[derive(serde::Serialize)]
struct ProcessResult {
    exit_code: i32,
    stdout: String,
    stderr: String,
    success: bool,
}

#[tauri::command]
async fn open_file_with_default_app(file_path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(&["/C", "start", "", &file_path])
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&file_path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&file_path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
async fn open_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(&["/C", "start", &url])
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }
    
    Ok(())
}
```

## Configuration Management

### Application Settings Storage

```rust
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
struct AppConfig {
    theme: String,
    language: String,
    auto_save: bool,
    auto_save_interval: u64,
    recent_files: Vec<String>,
    window_bounds: WindowBounds,
}

#[derive(Debug, Serialize, Deserialize)]
struct WindowBounds {
    x: i32,
    y: i32,
    width: f64,
    height: f64,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: "light".to_string(),
            language: "en".to_string(),
            auto_save: true,
            auto_save_interval: 300, // 5 minutes
            recent_files: Vec::new(),
            window_bounds: WindowBounds {
                x: 100,
                y: 100,
                width: 1200.0,
                height: 800.0,
            },
        }
    }
}

struct AppState {
    config: Mutex<AppConfig>,
    config_path: PathBuf,
}

impl AppState {
    fn new() -> Result<Self, String> {
        let config_dir = dirs::config_dir()
            .ok_or("Failed to get config directory")?
            .join("your-app");
        
        std::fs::create_dir_all(&config_dir)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
        
        let config_path = config_dir.join("config.json");
        
        let config = if config_path.exists() {
            let content = std::fs::read_to_string(&config_path)
                .map_err(|e| format!("Failed to read config file: {}", e))?;
            
            serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse config: {}", e))?
        } else {
            AppConfig::default()
        };
        
        Ok(Self {
            config: Mutex::new(config),
            config_path,
        })
    }
    
    fn save_config(&self) -> Result<(), String> {
        let config = self.config.lock().unwrap();
        let content = serde_json::to_string_pretty(&*config)
            .map_err(|e| format!("Failed to serialize config: {}", e))?;
        
        std::fs::write(&self.config_path, content)
            .map_err(|e| format!("Failed to save config: {}", e))?;
        
        Ok(())
    }
}

#[tauri::command]
fn get_config(state: tauri::State<'_, AppState>) -> Result<AppConfig, String> {
    let config = state.config.lock().unwrap();
    Ok(config.clone())
}

#[tauri::command]
fn update_config(
    new_config: AppConfig,
    state: tauri::State<'_, AppState>
) -> Result<(), String> {
    {
        let mut config = state.config.lock().unwrap();
        *config = new_config;
    }
    
    state.save_config()
}

#[tauri::command]
fn add_recent_file(
    file_path: String,
    state: tauri::State<'_, AppState>
) -> Result<(), String> {
    {
        let mut config = state.config.lock().unwrap();
        
        // Remove if already exists
        config.recent_files.retain(|path| path != &file_path);
        
        // Add to beginning
        config.recent_files.insert(0, file_path);
        
        // Keep only last 10 files
        config.recent_files.truncate(10);
    }
    
    state.save_config()
}
```

## Best Practices

### 1. Security Considerations

```rust
// Validate file paths to prevent directory traversal
fn validate_file_path(path: &str) -> Result<String, String> {
    let path = std::path::Path::new(path);
    
    // Check for parent directory traversal attempts
    if path.components().any(|comp| matches!(comp, std::path::Component::ParentDir)) {
        return Err("Invalid path: parent directory components not allowed".to_string());
    }
    
    // Canonicalize the path
    let canonical = path.canonicalize()
        .map_err(|e| format!("Invalid path: {}", e))?;
    
    // Get user's home directory for comparison
    let home_dir = dirs::home_dir()
        .ok_or("Failed to get home directory")?;
    
    // Ensure the path is within user's home directory (or other allowed directories)
    if !canonical.starts_with(&home_dir) {
        return Err("Access denied: path outside allowed directories".to_string());
    }
    
    Ok(canonical.to_string_lossy().to_string())
}
```

### 2. Error Handling

```rust
#[derive(Debug, thiserror::Error)]
enum SystemError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Command execution failed: {0}")]
    Command(String),
    
    #[error("Permission denied")]
    Permission,
    
    #[error("Feature not supported on this platform")]
    UnsupportedPlatform,
}

impl From<SystemError> for String {
    fn from(err: SystemError) -> Self {
        err.to_string()
    }
}
```

System integration transforms web applications into native desktop experiences. These patterns provide comprehensive OS integration while maintaining Tauri's security principles.