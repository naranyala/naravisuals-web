# Creating Tauri Plugins

Extending Tauri applications with custom plugins enables access to system-level functionality and third-party libraries. This article explores the architecture and implementation patterns for creating robust Tauri plugins.

## Prerequisites

- Solid understanding of Rust programming
- Knowledge of Tauri architecture and command patterns
- Familiarity with Cargo workspaces and build configurations

## Core Concepts

Tauri plugins are Rust libraries that extend the core Tauri functionality, providing additional capabilities to your application. Plugins can expose commands to the frontend, manage resources, and integrate with system APIs.

## Implementation

### Basic Plugin Structure

Start by creating the basic structure for a Tauri plugin:

```
my-tauri-plugin/
├── Cargo.toml
├── src/
│   ├── lib.rs
│   ├── commands.rs
│   ├── error.rs
│   └── models.rs
└── examples/
    └── simple_usage.rs
```

### Plugin Definition

Create the core plugin structure:

```rust
// src/lib.rs
use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the file system APIs.
pub trait AppExt<R: Runtime> {
    fn plugin_my_plugin(&self) -> &MyPlugin<R>;
}

impl<R: Runtime, T: Manager<R>> crate::AppExt<R> for T {
    fn plugin_my_plugin(&self) -> &MyPlugin<R> {
        self.state::<MyPlugin<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("my-plugin")
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::calculate,
            commands::process_data
        ])
        .setup(|app, api| {
            let plugin = MyPlugin::new(api.config());
            app.manage(plugin);
            Ok(())
        })
        .build()
}
```

### Plugin State Management

Define plugin state to manage resources:

```rust
// src/models.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginConfig {
    pub enable_logging: bool,
    pub max_concurrent_tasks: u32,
    pub cache_directory: Option<String>,
}

impl Default for PluginConfig {
    fn default() -> Self {
        Self {
            enable_logging: true,
            max_concurrent_tasks: 5,
            cache_directory: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessResult {
    pub id: String,
    pub status: String,
    pub data: Option<serde_json::Value>,
    pub timestamp: u64,
}
```

```rust
// src/error.rs
use serde::{Deserialize, Serialize};
use tauri::InvokeError;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Json(#[from] serde_json::Error),
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    #[error("Plugin not initialized")]
    NotInitialized,
    #[error("Task failed: {0}")]
    TaskFailed(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

impl From<Error> for InvokeError {
    fn from(error: Error) -> Self {
        InvokeError::from(error.to_string())
    }
}
```

### Plugin Commands

Implement the plugin's command interface:

```rust
// src/commands.rs
use crate::models::ProcessResult;
use crate::Error;
use serde::{Deserialize, Serialize};
use tauri::{command, State};
use tokio::time::{sleep, Duration};

#[derive(Deserialize)]
pub struct GreetRequest {
    pub name: String,
}

#[derive(Deserialize)]
pub struct CalculationRequest {
    pub operation: String,
    pub operands: Vec<f64>,
}

#[derive(Deserialize)]
pub struct ProcessDataRequest {
    pub data: serde_json::Value,
    pub options: Option<serde_json::Value>,
}

#[command]
pub async fn greet(
    request: GreetRequest,
) -> std::result::Result<String, Error> {
    Ok(format!("Hello, {}! Welcome to Tauri plugin development.", request.name))
}

#[command]
pub async fn calculate(
    request: CalculationRequest,
) -> std::result::Result<f64, Error> {
    let result = match request.operation.as_str() {
        "add" => request.operands.iter().sum(),
        "multiply" => request.operands.iter().product(),
        "max" => request.operands.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b)),
        "min" => request.operands.iter().fold(f64::INFINITY, |a, &b| a.min(b)),
        _ => return Err(Error::InvalidInput(format!("Unknown operation: {}", request.operation))),
    };
    
    Ok(result)
}

#[command]
pub async fn process_data(
    request: ProcessDataRequest,
) -> std::result::Result<ProcessResult, Error> {
    // Simulate processing
    sleep(Duration::from_millis(100)).await;
    
    let result = ProcessResult {
        id: uuid::Uuid::new_v4().to_string(),
        status: "completed".to_string(),
        data: Some(request.data),
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    };
    
    Ok(result)
}
```

### Complete Plugin Implementation

Create the main plugin structure:

```rust
// src/lib.rs (complete)

use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};
use std::sync::Mutex;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};
pub use models::*;

pub struct MyPlugin<R: Runtime> {
    handle: tauri::AppHandle<R>,
    config: PluginConfig,
    active_tasks: Mutex<Vec<String>>,
}

impl<R: Runtime> MyPlugin<R> {
    pub fn new(config: PluginConfig) -> Self {
        Self {
            handle: std::ptr::null_mut(), // This will be set during setup
            config,
            active_tasks: Mutex::new(Vec::new()),
        }
    }
    
    pub fn add_active_task(&self, task_id: String) -> Result<()> {
        let mut tasks = self.active_tasks.lock()
            .map_err(|_| Error::NotInitialized)?;
        tasks.push(task_id);
        Ok(())
    }
    
    pub fn remove_active_task(&self, task_id: &str) -> Result<()> {
        let mut tasks = self.active_tasks.lock()
            .map_err(|_| Error::NotInitialized)?;
        tasks.retain(|id| id != task_id);
        Ok(())
    }
    
    pub fn active_task_count(&self) -> Result<usize> {
        let tasks = self.active_tasks.lock()
            .map_err(|_| Error::NotInitialized)?;
        Ok(tasks.len())
    }
}

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the plugin APIs.
pub trait AppExt<R: Runtime> {
    fn plugin_my_plugin(&self) -> &MyPlugin<R>;
}

impl<R: Runtime, T: Manager<R>> AppExt<R> for T {
    fn plugin_my_plugin(&self) -> &MyPlugin<R> {
        self.state::<MyPlugin<R>>().inner()
    }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("my-plugin")
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::calculate,
            commands::process_data
        ])
        .setup(|app, _api| {
            let plugin = MyPlugin::new(PluginConfig::default());
            app.manage(plugin);
            Ok(())
        })
        .build()
}
```

### Plugin Configuration

Create the Cargo.toml file for the plugin:

```toml
# Cargo.toml
[package]
name = "tauri-plugin-my-plugin"
version = "0.1.0"
edition = "2021"
description = "A custom Tauri plugin for extended functionality"
license = "MIT"
repository = "https://github.com/your-repo/tauri-plugin-my-plugin"

[dependencies]
tauri = { version = "1.0", default-features = false, features = ["api-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
thiserror = "1.0"
tokio = { version = "1.0", features = ["time"] }
uuid = { version = "1.0", features = ["v4"] }

[dev-dependencies]
tauri = { version = "1.0", default-features = false }
tokio-test = "0.4"