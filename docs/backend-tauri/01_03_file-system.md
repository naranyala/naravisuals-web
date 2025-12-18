# File System

File system operations are fundamental to most desktop applications. Tauri provides secure, cross-platform file system access through Rust's robust standard library while maintaining security through permissions and sandboxing.

## Security First: Permissions Configuration

Before implementing file operations, configure permissions in `tauri.conf.json`:

```json
{
  "tauri": {
    "allowlist": {
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "copyFile": true,
        "createDir": true,
        "removeDir": true,
        "removeFile": true,
        "renameFile": true,
        "scope": ["$APPCONFIG/*", "$APPDATA/*", "$DOWNLOAD/*"]
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      }
    }
  }
}
```

## Core File Operations

### Reading Files

```rust
use std::fs;
use std::path::Path;

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    // Security: Validate path exists and accessible
    let path_obj = Path::new(&path);
    if !path_obj.exists() {
        return Err("File does not exist".to_string());
    }
    
    if !path_obj.is_file() {
        return Err("Path is not a file".to_string());
    }
    
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn read_binary_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path)
        .map_err(|e| format!("Failed to read binary file: {}", e))
}

#[tauri::command]
async fn read_large_file_async(path: String) -> Result<String, String> {
    tokio::fs::read_to_string(&path).await
        .map_err(|e| format!("Async file read failed: {}", e))
}

#[tauri::command]
fn read_file_with_metadata(path: String) -> Result<FileWithMetadata, String> {
    let metadata = fs::metadata(&path)
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;
    
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    Ok(FileWithMetadata {
        content,
        size: metadata.len(),
        modified: metadata.modified()
            .map_err(|e| format!("Failed to get modified time: {}", e))?
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| format!("Time conversion error: {}", e))?
            .as_secs(),
        is_readonly: metadata.permissions().readonly(),
    })
}

#[derive(serde::Serialize)]
struct FileWithMetadata {
    content: String,
    size: u64,
    modified: u64,
    is_readonly: bool,
}
```

### Writing Files

```rust
#[tauri::command]
fn write_text_file(path: String, content: String) -> Result<(), String> {
    // Security: Ensure parent directory exists
    let path_obj = Path::new(&path);
    if let Some(parent) = path_obj.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directories: {}", e))?;
    }
    
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
fn write_binary_file(path: String, data: Vec<u8>) -> Result<(), String> {
    fs::write(&path, data)
        .map_err(|e| format!("Failed to write binary file: {}", e))
}

#[tauri::command]
async fn write_file_atomic(path: String, content: String) -> Result<(), String> {
    // Atomic write using temporary file
    let temp_path = format!("{}.tmp", path);
    
    tokio::fs::write(&temp_path, &content).await
        .map_err(|e| format!("Failed to write temporary file: {}", e))?;
    
    // Atomic rename
    tokio::fs::rename(&temp_path, &path).await
        .map_err(|e| format!("Failed to rename temporary file: {}", e))
}

#[tauri::command]
fn append_to_file(path: String, content: String) -> Result<(), String> {
    use std::fs::OpenOptions;
    
    OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .and_then(|mut file| {
            use std::io::Write;
            file.write_all(content.as_bytes())
        })
        .map_err(|e| format!("Failed to append to file: {}", e))
}
```

## Directory Operations

### Reading Directories

```rust
#[tauri::command]
fn read_directory(path: String) -> Result<Vec<DirectoryItem>, String> {
    let entries = fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory: {}", e))?
        .map(|entry| {
            let entry = entry.map_err(|e| format!("Invalid directory entry: {}", e))?;
            let metadata = entry.metadata()
                .map_err(|e| format!("Failed to get metadata: {}", e))?;
            
            Ok(DirectoryItem {
                name: entry.file_name().to_string_lossy().to_string(),
                path: entry.path().to_string_lossy().to_string(),
                is_directory: metadata.is_dir(),
                is_file: metadata.is_file(),
                size: metadata.len(),
                modified: metadata.modified()
                    .map_err(|e| format!("Failed to get modified time: {}", e))?
                    .duration_since(std::time::UNIX_EPOCH)
                    .map_err(|e| format!("Time conversion error: {}", e))?
                    .as_secs(),
            })
        })
        .collect::<Result<Vec<_>, _>>()?;
    
    Ok(entries)
}

#[derive(serde::Serialize)]
struct DirectoryItem {
    name: String,
    path: String,
    is_directory: bool,
    is_file: bool,
    size: u64,
    modified: u64,
}

#[tauri::command]
fn read_directory_recursive(path: String, max_depth: usize) -> Result<Vec<DirectoryItem>, String> {
    let mut items = Vec::new();
    read_directory_recursive_impl(&path, &mut items, max_depth, 0)?;
    Ok(items)
}

fn read_directory_recursive_impl(
    path: &str, 
    items: &mut Vec<DirectoryItem>, 
    max_depth: usize, 
    current_depth: usize
) -> Result<(), String> {
    if current_depth >= max_depth {
        return Ok(());
    }
    
    let entries = fs::read_dir(path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Invalid entry: {}", e))?;
        let metadata = entry.metadata()
            .map_err(|e| format!("Metadata error: {}", e))?;
        
        let item = DirectoryItem {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_directory: metadata.is_dir(),
            is_file: metadata.is_file(),
            size: metadata.len(),
            modified: metadata.modified()
                .map_err(|e| format!("Time error: {}", e))?
                .duration_since(std::time::UNIX_EPOCH)
                .map_err(|e| format!("Time conversion: {}", e))?
                .as_secs(),
        };
        
        items.push(item);
        
        // Recurse into subdirectories
        if metadata.is_dir() {
            let path_str = entry.path().to_string_lossy();
            read_directory_recursive_impl(&path_str, items, max_depth, current_depth + 1)?;
        }
    }
    
    Ok(())
}
```

### Directory Management

```rust
#[tauri::command]
fn create_directory(path: String, recursive: bool) -> Result<(), String> {
    if recursive {
        fs::create_dir_all(&path)
            .map_err(|e| format!("Failed to create directory recursively: {}", e))?;
    } else {
        fs::create_dir(&path)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
fn remove_directory(path: String, recursive: bool) -> Result<(), String> {
    if recursive {
        fs::remove_dir_all(&path)
            .map_err(|e| format!("Failed to remove directory recursively: {}", e))?;
    } else {
        fs::remove_dir(&path)
            .map_err(|e| format!("Failed to remove directory: {}", e))?;
    }
    
    Ok(())
}
        })
        .map_err(|e| format!("Failed to append to file: {}", e))
}
        .map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
fn write_binary_file(path: String, data: Vec<u8>) -> Result<(), String> {
    fs::write(&path, data)
        .map_err(|e| format!("Failed to write binary file: {}", e))
}

#[tauri::command]
async fn write_file_async(path: String, content: String) -> Result<(), String> {
    tokio::fs::write(&path, content).await
        .map_err(|e| format!("Async write failed: {}", e))
}
```

### File Metadata

```rust
use std::fs::Metadata;
use std::time::SystemTime;

#[derive(Serialize, Deserialize)]
pub struct FileInfo {
    path: String,
    size: u64,
    is_file: bool,
    is_dir: bool,
    created: Option<u64>,
    modified: Option<u64>,
    accessed: Option<u64>,
}

#[tauri::command]
fn get_file_info(path: String) -> Result<FileInfo, String> {
    let metadata = fs::metadata(&path)
        .map_err(|e| format!("Failed to get metadata: {}", e))?;
    
    let path_obj = Path::new(&path);
    
    fn time_to_timestamp(time: Result<SystemTime, std::io::Error>) -> Option<u64> {
        time.ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
    }
    
    Ok(FileInfo {
        path,
        size: metadata.len(),
        is_file: metadata.is_file(),
        is_dir: metadata.is_dir(),
        created: time_to_timestamp(metadata.created()),
        modified: time_to_timestamp(metadata.modified()),
        accessed: time_to_timestamp(metadata.accessed()),
    })
}
```

## Directory Operations

### Directory Listing

```rust
use std::fs;

#[derive(Serialize, Deserialize)]
pub struct DirEntry {
    name: String,
    path: String,
    is_file: bool,
    is_dir: bool,
    size: Option<u64>,
}

#[tauri::command]
fn list_directory(path: String) -> Result<Vec<DirEntry>, String> {
    let entries = fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    let mut result = Vec::new();
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let metadata = entry.metadata()
            .map_err(|e| format!("Failed to get metadata: {}", e))?;
        
        result.push(DirEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_file: metadata.is_file(),
            is_dir: metadata.is_dir(),
            size: if metadata.is_file() { Some(metadata.len()) } else { None },
        });
    }
    
    Ok(result)
}

#[tauri::command]
fn list_directory_recursive(path: String, max_depth: usize) -> Result<Vec<DirEntry>, String> {
    let mut result = Vec::new();
    list_directory_recursive_helper(&path, &mut result, 0, max_depth)?;
    Ok(result)
}

fn list_directory_recursive_helper(
    path: &str,
    result: &mut Vec<DirEntry>,
    current_depth: usize,
    max_depth: usize
) -> Result<(), String> {
    if current_depth > max_depth {
        return Ok(());
    }
    
    let entries = fs::read_dir(path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let entry_path = entry.path();
        let metadata = entry.metadata()
            .map_err(|e| format!("Failed to get metadata: {}", e))?;
        
        let dir_entry = DirEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry_path.to_string_lossy().to_string(),
            is_file: metadata.is_file(),
            is_dir: metadata.is_dir(),
            size: if metadata.is_file() { Some(metadata.len()) } else { None },
        };
        
        result.push(dir_entry);
        
        if metadata.is_dir() && current_depth < max_depth {
            list_directory_recursive_helper(
                &entry_path.to_string_lossy(),
                result,
                current_depth + 1,
                max_depth
            )?;
        }
    }
    
    Ok(())
}
```

### Directory Management

```rust
#[tauri::command]
fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create directory: {}", e))
}

#[tauri::command]
fn remove_file(path: String) -> Result<(), String> {
    fs::remove_file(&path)
        .map_err(|e| format!("Failed to remove file: {}", e))
}

#[tauri::command]
fn remove_directory(path: String, recursive: bool) -> Result<(), String> {
    if recursive {
        fs::remove_dir_all(&path)
            .map_err(|e| format!("Failed to remove directory recursively: {}", e))
    } else {
        fs::remove_dir(&path)
            .map_err(|e| format!("Failed to remove directory: {}", e))
    }
}

#[tauri::command]
fn copy_file(source: String, destination: String) -> Result<(), String> {
    fs::copy(&source, &destination)
        .map_err(|e| format!("Failed to copy file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
fn move_file(source: String, destination: String) -> Result<(), String> {
    fs::rename(&source, &destination)
        .map_err(|e| format!("Failed to move file: {}", e))
}
```

## File Watching

### Setting up File Watchers

```rust
use notify::{Watcher, RecursiveMode, RecommendedWatcher};
use std::sync::mpsc;
use std::time::Duration;

#[derive(Serialize, Deserialize, Debug)]
pub enum FileEventKind {
    Create,
    Write,
    Remove,
    Rename,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FileEvent {
    path: String,
    kind: FileEventKind,
}

struct FileWatcherState {
    watcher: Option<RecommendedWatcher>,
    event_sender: Option<mpsc::Sender<FileEvent>>,
}

#[tauri::command]
async fn start_file_watcher(
    path: String,
    window: tauri::Window,
    state: tauri::State<'_, FileWatcherState>
) -> Result<(), String> {
    let (tx, rx) = mauri::channel();
    
    let mut watcher = notify::recommended_watcher(move |res| {
        match res {
            Ok(event) => {
                let file_event = match event.kind {
                    notify::EventKind::Create(_) => FileEvent {
                        path: event.paths[0].to_string_lossy().to_string(),
                        kind: FileEventKind::Create,
                    },
                    notify::EventKind::Write(_) => FileEvent {
                        path: event.paths[0].to_string_lossy().to_string(),
                        kind: FileEventKind::Write,
                    },
                    notify::EventKind::Remove(_) => FileEvent {
                        path: event.paths[0].to_string_lossy().to_string(),
                        kind: FileEventKind::Remove,
                    },
                    notify::EventKind::Rename(_) => FileEvent {
                        path: event.paths[0].to_string_lossy().to_string(),
                        kind: FileEventKind::Rename,
                    },
                    _ => return,
                };
                
                let _ = tx.send(file_event);
            }
            Err(e) => eprintln!("watch error: {:?}", e),
        }
    }).map_err(|e| format!("Failed to create watcher: {}", e))?;
    
    watcher.watch(Path::new(&path), RecursiveMode::Recursive)
        .map_err(|e| format!("Failed to watch path: {}", e))?;
    
    // Store watcher in state
    // Note: This is a simplified example - you'd need proper state management
    
    Ok(())
}
```

## Configuration and Data Files

### App Configuration

```rust
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug)]
pub struct AppConfig {
    theme: String,
    language: String,
    auto_save: bool,
    recent_files: Vec<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            theme: "light".to_string(),
            language: "en".to_string(),
            auto_save: true,
            recent_files: Vec::new(),
        }
    }
}

#[tauri::command]
fn load_config() -> Result<AppConfig, String> {
    let config_path = get_config_path()?;
    
    if config_path.exists() {
        let content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;
        
        toml::from_str(&content)
            .map_err(|e| format!("Failed to parse config: {}", e))
    } else {
        Ok(AppConfig::default())
    }
}

#[tauri::command]
fn save_config(config: AppConfig) -> Result<(), String> {
    let config_path = get_config_path()?;
    
    // Create config directory if it doesn't exist
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    
    let content = toml::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write config: {}", e))
}

fn get_config_path() -> Result<PathBuf, String> {
    let app_dir = get_app_data_dir()?;
    Ok(app_dir.join("config.toml"))
}

fn get_app_data_dir() -> Result<PathBuf, String> {
    let app_data_dir = dirs::data_dir()
        .ok_or("Failed to get data directory")?
        .join("your-app-name");
    
    Ok(app_data_dir)
}
```

### User Data Management

```rust
#[tauri::command]
fn get_app_data_dir() -> Result<String, String> {
    let data_dir = dirs::data_dir()
        .ok_or("Failed to get data directory")?
        .join("your-app-name");
    
    fs::create_dir_all(&data_dir)
        .map_err(|e| format!("Failed to create data directory: {}", e))?;
    
    Ok(data_dir.to_string_lossy().to_string())
}

#[tauri::command]
fn get_user_documents_dir() -> Result<String, String> {
    dirs::document_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or("Failed to get documents directory".to_string())
}

#[tauri::command]
fn get_user_downloads_dir() -> Result<String, String> {
    dirs::download_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or("Failed to get downloads directory".to_string())
}
```

## File Dialog Integration

### Native File Dialogs

```rust
#[tauri::command]
async fn open_file_dialog(
    window: tauri::Window,
    filters: Option<Vec<FileFilter>>,
    multiple: bool
) -> Result<Vec<String>, String> {
    use tauri_plugin_dialog::{DialogExt, FileDialogBuilder};
    
    let mut dialog = window.file_dialog();
    
    if let Some(filters) = filters {
        for filter in filters {
            dialog = dialog.add_filter(filter.name, &filter.extensions);
        }
    }
    
    if multiple {
        dialog = dialog.multiple(true);
    }
    
    let paths = dialog.pick_files()
        .await
        .ok_or("No files selected")?;
    
    Ok(paths.into_iter().map(|p| p.to_string_lossy().to_string()).collect())
}

#[tauri::command]
async fn save_file_dialog(
    window: tauri::Window,
    default_name: String,
    filters: Option<Vec<FileFilter>>
) -> Result<String, String> {
    let mut dialog = window.file_dialog();
    
    dialog = dialog.set_file_name(&default_name);
    
    if let Some(filters) = filters {
        for filter in filters {
            dialog = dialog.add_filter(filter.name, &filter.extensions);
        }
    }
    
    let path = dialog.save_file()
        .await
        .ok_or("No file selected")?;
    
    Ok(path.to_string_lossy().to_string())
}

#[derive(Serialize, Deserialize)]
pub struct FileFilter {
    name: String,
    extensions: Vec<String>,
}
```

## Security Considerations

### Path Validation

```rust
use std::path::{Path, PathBuf};

fn validate_path(path: &str, allowed_base: &Path) -> Result<PathBuf, String> {
    let path_buf = PathBuf::from(path);
    
    // Resolve canonical path to prevent directory traversal
    let canonical_path = path_buf.canonicalize()
        .map_err(|e| format!("Invalid path: {}", e))?;
    
    let canonical_base = allowed_base.canonicalize()
        .map_err(|e| format!("Invalid base path: {}", e))?;
    
    // Check if the path is within the allowed base directory
    if !canonical_path.starts_with(&canonical_base) {
        return Err("Path is outside allowed directory".to_string());
    }
    
    Ok(canonical_path)
}

#[tauri::command]
fn safe_read_file(path: String) -> Result<String, String> {
    // Get allowed base directory (e.g., user's documents)
    let allowed_base = dirs::document_dir()
        .ok_or("Failed to get documents directory")?;
    
    let validated_path = validate_path(&path, &allowed_base)?;
    
    fs::read_to_string(validated_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}
```

### File Permissions

```rust
#[tauri::command]
fn check_file_permissions(path: String) -> Result<FilePermissions, String> {
    let metadata = fs::metadata(&path)
        .map_err(|e| format!("Failed to get metadata: {}", e))?;
    
    let readonly = metadata.permissions().readonly();
    
    #[cfg(unix)]
    let unix_permissions = {
        use std::os::unix::fs::PermissionsExt;
        Some(metadata.permissions().mode())
    };
    
    #[cfg(not(unix))]
    let unix_permissions = None;
    
    Ok(FilePermissions {
        readonly,
        unix_permissions,
    })
}

#[derive(Serialize, Deserialize)]
pub struct FilePermissions {
    readonly: bool,
    unix_permissions: Option<u32>,
}
```

## Performance Optimization

### Async File Operations

```rust
#[tauri::command]
async fn batch_file_operations(operations: Vec<FileOperation>) -> Result<Vec<OperationResult>, String> {
    let futures: Vec<_> = operations.into_iter()
        .map(|op| async move {
            match op {
                FileOperation::Read { path } => {
                    match tokio::fs::read_to_string(&path).await {
                        Ok(content) => OperationResult::Read { path, content },
                        Err(e) => OperationResult::Error { path, error: e.to_string() },
                    }
                }
                FileOperation::Write { path, content } => {
                    match tokio::fs::write(&path, content).await {
                        Ok(_) => OperationResult::Write { path },
                        Err(e) => OperationResult::Error { path, error: e.to_string() },
                    }
                }
                // ... other operations
            }
        })
        .collect();
    
    let results = futures::future::join_all(futures).await;
    Ok(results)
}

#[derive(Serialize, Deserialize)]
pub enum FileOperation {
    Read { path: String },
    Write { path: String, content: String },
    Delete { path: String },
}

#[derive(Serialize, Deserialize)]
pub enum OperationResult {
    Read { path: String, content: String },
    Write { path: String },
    Delete { path: String },
    Error { path: String, error: String },
}
```

## Best Practices

1. **Always validate paths**: Prevent directory traversal attacks
2. **Use async for I/O**: Don't block the main thread
3. **Handle errors gracefully**: Provide meaningful error messages
4. **Check file existence**: Before attempting operations
5. **Use appropriate permissions**: Follow principle of least privilege
6. **Clean up resources**: Properly close file handles
7. **Consider file locking**: For concurrent access scenarios
8. **Test edge cases**: Handle special characters and long paths

File system operations are fundamental to desktop applications. Tauri provides secure, cross-platform access to file system operations through Rust's robust standard library and ecosystem. By following these patterns and best practices, you can build reliable and secure file handling in your Tauri applications.