---
title: Commands and Inter-Process Communication
description: Comprehensive guide to creating, optimizing, and securing Tauri commands for robust IPC between Vue.js frontend and Rust backend.
order: 2
difficulty: fundamental
tags: [commands, ipc, communication, security, performance]
---

# Commands and Inter-Process Communication

Commands are the fundamental communication mechanism between your Vue.js frontend and Rust backend in Tauri applications. This comprehensive guide covers creating, optimizing, and securing commands for robust IPC, ensuring your desktop applications have efficient, type-safe communication layers.

## Command Fundamentals

### What are Commands?

Commands are Rust functions decorated with `#[tauri::command]` that can be safely invoked from the frontend. They form the API surface of your backend, providing a secure, type-safe bridge between JavaScript and Rust.

### Basic Command Anatomy

```rust
#[tauri::command]
fn greet_user(name: String) -> String {
    format!("Hello, {}! Welcome from Rust backend.", name)
}

#[tauri::command]
fn calculate_sum(numbers: Vec<i32>) -> i32 {
    numbers.iter().sum()
}
```

### Command Registration

All commands must be registered in the main application setup:

```rust
// src-tauri/src/main.rs
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet_user,
            calculate_sum,
            process_file,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("Failed to start Tauri application");
}
```

## Command Types and Patterns

### 1. Simple Synchronous Commands

For quick, CPU-bound operations:

### 2. Async Commands

For I/O operations, network requests, and long-running tasks:

```rust
#[tauri::command]
async fn fetch_api_data(url: String) -> Result<ApiData, String> {
    let response = reqwest::get(&url).await
        .map_err(|e| format!("HTTP request failed: {}", e))?;
    
    let data: ApiData = response.json().await
        .map_err(|e| format!("JSON parsing failed: {}", e))?;
    
    Ok(data)
}

#[tauri::command]
async fn process_large_file(path: String) -> Result<ProcessResult, String> {
    // Read file asynchronously
    let contents = tokio::fs::read_to_string(&path).await
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    // Simulate heavy processing
    let result = heavy_computation(&contents).await
        .map_err(|e| format!("Processing failed: {}", e))?;
    
    Ok(ProcessResult {
        lines: contents.lines().count(),
        size: contents.len(),
        processing_time: result.duration,
    })
}
```

### 3. Stateful Commands

Access shared application state safely:

```rust
use std::sync::Mutex;

struct AppState {
    counter: Mutex<i32>,
    database: Mutex<Database>,
    user_sessions: Mutex<HashMap<String, UserSession>>,
}

#[tauri::command]
fn increment_counter(state: tauri::State<'_, AppState>) -> Result<i32, String> {
    let mut counter = state.counter.lock()
        .map_err(|e| format!("Counter lock failed: {}", e))?;
    *counter += 1;
    Ok(*counter)
}

#[tauri::command]
async fn query_user_data(
    user_id: String,
    state: tauri::State<'_, AppState>
) -> Result<UserData, String> {
    let db = state.database.lock()
        .map_err(|e| format!("Database lock failed: {}", e))?;
    
    db.get_user(&user_id).await
        .map_err(|e| format!("Database query failed: {}", e))
}
```

### Command Registration

Commands must be registered in the application setup:

```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            simple_command,
            another_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Command Types and Patterns

### 1. Simple Commands

Basic functions with input and output:

```rust
#[tauri::command]
fn add_numbers(a: f64, b: f64) -> f64 {
    a + b
}

#[tauri::command]
fn get_system_info() -> SystemInfo {
    SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
    }
}
```

### 4. Event-Driven Commands

Push data from backend to frontend using events:

```rust
#[tauri::command]
fn start_background_monitoring(window: tauri::Window) -> Result<(), String> {
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(5));
        
        loop {
            interval.tick().await;
            
            let system_stats = get_system_statistics().await;
            
            if let Err(e) = window.emit("system-stats", &system_stats) {
                eprintln!("Failed to emit system stats: {}", e);
                break;
            }
        }
    });
    
    Ok(())
}

#[tauri::command]
fn process_with_progress(window: tauri::Window, task_id: String) -> Result<(), String> {
    tokio::spawn(async move {
        for progress in 0..=100 {
            tokio::time::sleep(Duration::from_millis(50)).await;
            
            let update = ProgressUpdate {
                task_id: task_id.clone(),
                progress,
                message: format!("Processing step {}", progress),
            };
            
            if let Err(e) = window.emit("progress-update", update) {
                eprintln!("Failed to emit progress: {}", e);
                break;
            }
        }
    });
    
    Ok(())
}
```

## Frontend Integration

### Vue.js Command Invocation

```vue
<!-- src/components/FileProcessor.vue -->
<template>
  <div class="file-processor">
    <input 
      v-model="filePath" 
      type="file" 
      @change="handleFileSelect"
    />
    <button 
      @click="processFile" 
      :disabled="loading"
    >
      {{ loading ? 'Processing...' : 'Process File' }}
    </button>
    
    <div v-if="result" class="result">
      <p>Lines: {{ result.lines }}</p>
      <p>Size: {{ formatSize(result.size) }}</p>
      <p>Time: {{ result.processing_time }}ms</p>
    </div>
    
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'

const filePath = ref('')
const result = ref(null)
const error = ref(null)
const loading = ref(false)

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    filePath.value = file.path
  }
}

const processFile = async () => {
  if (!filePath.value) return
  
  loading.value = true
  error.value = null
  
  try {
    result.value = await invoke('process_large_file', {
      path: filePath.value
    })
  } catch (err) {
    error.value = err.toString()
  } finally {
    loading.value = false
  }
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
```

### Event Handling

```vue
<!-- src/components/SystemMonitor.vue -->
<template>
  <div class="system-monitor">
    <h3>System Statistics</h3>
    <div class="stats">
      <p>CPU: {{ stats.cpu }}%</p>
      <p>Memory: {{ stats.memory }}MB</p>
      <p>Disk: {{ stats.disk }}GB</p>
    </div>
    <button @click="toggleMonitoring">
      {{ monitoring ? 'Stop' : 'Start' }} Monitoring
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

const stats = ref({
  cpu: 0,
  memory: 0,
  disk: 0
})
const monitoring = ref(false)
let unlisten = null

const toggleMonitoring = async () => {
  if (monitoring.value) {
    // Stop monitoring (you'd implement this command)
    await invoke('stop_background_monitoring')
    if (unlisten) {
      unlisten()
      unlisten = null
    }
    monitoring.value = false
  } else {
    // Start monitoring and listen for events
    await invoke('start_background_monitoring')
    
    unlisten = await listen('system-stats', (event) => {
      stats.value = event.payload
    })
    
    monitoring.value = true
  }
}

onUnmounted(() => {
  if (unlisten) {
    unlisten()
  }
})
</script>
```
    counter: std::sync::Mutex<i32>,
    database: std::sync::Mutex<Option<Database>>,
}

#[tauri::command]
fn increment_counter(state: tauri::State<'_, AppState>) -> i32 {
    let mut counter = state.counter.lock().unwrap();
    *counter += 1;
    *counter
}

#[tauri::command]
async fn get_user_data(
    user_id: u32,
    state: tauri::State<'_, AppState>
) -> Result<UserData, String> {
    let db = state.database.lock().unwrap();
    match db.as_ref() {
        Some(database) => {
            database.get_user(user_id).await
                .map_err(|e| format!("Database error: {}", e))
        }
        None => Err("Database not initialized".to_string()),
    }
}
```

## Frontend Integration

### JavaScript/TypeScript Usage

```typescript
// Import Tauri API
import { invoke } from '@tauri-apps/api/tauri';

// Simple command call
async function greetUser() {
    try {
        const response = await invoke<string>('simple_command', {
            name: 'World'
        });
        console.log(response);
    } catch (error) {
        console.error('Command failed:', error);
    }
}

// Async command with progress
async function processFile() {
    try {
        const result = await invoke<ProcessResult>('process_large_file', {
            path: '/path/to/file.txt'
        });
        console.log(`Processed ${result.lines} lines`);
    } catch (error) {
        console.error('Processing failed:', error);
    }
}
```

### React Hook Example

```typescript
import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export function useCounter() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const increment = useCallback(async () => {
        setLoading(true);
        try {
            const newCount = await invoke<number>('increment_counter');
            setCount(newCount);
        } catch (error) {
            console.error('Failed to increment:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { count, increment, loading };
}
```

## Error Handling

### Rust Error Patterns

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum AppError {
    Io(String),
    Database(String),
    Validation(String),
    Network(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Io(msg) => write!(f, "IO Error: {}", msg),
            AppError::Database(msg) => write!(f, "Database Error: {}", msg),
            AppError::Validation(msg) => write!(f, "Validation Error: {}", msg),
            AppError::Network(msg) => write!(f, "Network Error: {}", msg),
        }
    }
}

#[tauri::command]
fn validate_user_input(input: String) -> Result<String, AppError> {
    if input.is_empty() {
        return Err(AppError::Validation("Input cannot be empty".to_string()));
    }
    
    if input.len() > 100 {
        return Err(AppError::Validation("Input too long".to_string()));
    }
    
    Ok(format!("Valid input: {}", input))
}
```

### Frontend Error Handling

```typescript
interface AppError {
    type: 'Io' | 'Database' | 'Validation' | 'Network';
    message: string;
}

async function handleValidation() {
    try {
        const result = await invoke<string>('validate_user_input', {
            input: userInput
        });
        console.log(result);
    } catch (error) {
        const appError = error as AppError;
        console.error(`${appError.type}: ${appError.message}`);
        
        // Show user-friendly error message
        switch (appError.type) {
            case 'Validation':
                showValidationError(appError.message);
                break;
            case 'Network':
                showNetworkError();
                break;
            // ... other cases
        }
    }
}
```

## Advanced Command Patterns

### 1. Streaming Data

```rust
#[tauri::command]
async fn stream_data(window: tauri::Window) -> Result<(), String> {
    for i in 0..10 {
        window.emit("data-stream", DataPoint {
            id: i,
            value: i * 2,
            timestamp: Utc::now(),
        }).map_err(|e| format!("Failed to emit: {}", e))?;
        
        tokio::time::sleep(Duration::from_millis(500)).await;
    }
    
    Ok(())
}
```

### 2. Command with Window Access

```rust
#[tauri::command]
async fn show_notification(
    message: String,
    window: tauri::Window
) -> Result<(), String> {
    window.emit("notification", Notification {
        title: "System Notification",
        message,
        level: "info",
    }).map_err(|e| format!("Failed to emit notification: {}", e))?;
    
    Ok(())
}
```

### 3. Custom Command Attributes

```rust
#[tauri::command(rename = "getUserProfile")]
#[tauri::command(return_type = "Result<UserProfile, String>")]
async fn get_user_profile(
    user_id: u32,
    include_private: bool
) -> Result<UserProfile, String> {
    // Implementation
}
```

## Performance Optimization

### 1. Batch Operations

```rust
#[tauri::command]
async fn batch_process_items(items: Vec<ProcessItem>) -> Result<Vec<ProcessResult>, String> {
    let mut results = Vec::with_capacity(items.len());
    
    // Process items in parallel
    let futures: Vec<_> = items.into_iter()
        .map(|item| async move {
            // Process individual item
            process_single_item(item).await
        })
        .collect();
    
    let batch_results = futures::future::join_all(futures).await;
    
    for result in batch_results {
        match result {
            Ok(processed) => results.push(processed),
            Err(e) => return Err(e),
        }
    }
    
    Ok(results)
}
```

### 2. Caching Strategy

```rust
use std::collections::HashMap;
use tokio::sync::RwLock;

struct CacheState {
    cache: RwLock<HashMap<String, CachedData>>,
}

#[tauri::command]
async fn get_cached_data(
    key: String,
    state: tauri::State<'_, CacheState>
) -> Result<CachedData, String> {
    // Try to get from cache first
    {
        let cache = state.cache.read().await;
        if let Some(data) = cache.get(&key) {
            return Ok(data.clone());
        }
    }
    
    // Fetch fresh data
    let fresh_data = fetch_data_from_source(&key).await?;
    
    // Update cache
    {
        let mut cache = state.cache.write().await;
        cache.insert(key, fresh_data.clone());
    }
    
    Ok(fresh_data)
}
```

## Testing Commands

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_add_numbers() {
        assert_eq!(add_numbers(2.0, 3.0), 5.0);
        assert_eq!(add_numbers(-1.0, 1.0), 0.0);
    }
    
    #[tokio::test]
    async fn test_validate_user_input() {
        assert!(validate_user_input("valid".to_string()).is_ok());
        assert!(validate_user_input("".to_string()).is_err());
    }
}
```

### Integration Tests

```rust
#[cfg(test)]
mod integration_tests {
    use super::*;
    use tauri::Manager;
    
    #[tokio::test]
    async fn test_command_invocation() {
        let app = tauri::Builder::default()
            .invoke_handler(tauri::generate_handler![add_numbers])
            .build(tauri::generate_context!("."))
            .unwrap();
        
        let result: f64 = app.state::<tauri::AppHandle>()
            .invoke_handler()
            .invoke("add_numbers", (5.0, 7.0))
            .await
            .unwrap();
        
        assert_eq!(result, 12.0);
    }
}
```

## Best Practices

1. **Keep commands focused**: Each command should do one thing well
2. **Use proper error handling**: Return Result types with meaningful errors
3. **Validate inputs**: Check and validate all incoming parameters
4. **Use async for I/O**: Don't block the main thread with file/network operations
5. **Document commands**: Add clear documentation for complex commands
6. **Test thoroughly**: Write unit and integration tests for critical commands
7. **Handle state carefully**: Use proper synchronization for shared state
8. **Optimize for performance**: Consider batching and caching for expensive operations

Commands are the backbone of Tauri applications, providing a secure and efficient bridge between the frontend and backend. Mastering command patterns and IPC communication is essential for building robust desktop applications.