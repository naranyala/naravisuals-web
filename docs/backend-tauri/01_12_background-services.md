# Background Services and Workers in Tauri

Managing long-running tasks and background services is crucial for creating responsive desktop applications. This article explores patterns for implementing robust background services in Tauri applications.

## Prerequisites

- Understanding of Rust async programming
- Knowledge of Tauri commands and event systems
- Familiarity with thread management concepts

## Core Concepts

Background services in Tauri typically involve running operations separately from the main UI thread to prevent blocking the interface. This is achieved through Rust's threading capabilities and Tauri's event system for communication with the frontend.

## Implementation

### Simple Background Task with Progress Reporting

Start with a basic background task that reports progress to the frontend:

```rust
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::time;

#[derive(Clone)]
struct TaskProgress {
  current: Arc<Mutex<u32>>,
  total: u32,
}

impl TaskProgress {
  fn new(total: u32) -> Self {
    TaskProgress {
      current: Arc::new(Mutex::new(0)),
      total,
    }
  }
  
  fn increment(&self) {
    let mut current = self.current.lock().unwrap();
    *current += 1;
  }
  
  fn get_percentage(&self) -> f64 {
    let current = self.current.lock().unwrap();
    (*current as f64 / self.total as f64) * 100.0
  }
}

#[tauri::command]
async fn start_long_process(window: tauri::Window, duration_seconds: u32) -> Result<String, String> {
  let task_progress = TaskProgress::new(duration_seconds);
  let progress_clone = task_progress.clone();
  
  // Spawn the background task
  tokio::spawn(async move {
    for i in 0..duration_seconds {
      tokio::time::sleep(Duration::from_millis(1000)).await;
      progress_clone.increment();
      
      // Emit progress update to the frontend
      let percentage = progress_clone.get_percentage();
      let _ = window.emit("background-task-progress", serde_json::json!({
        "current": i + 1,
        "total": duration_seconds,
        "percentage": percentage
      }));
    }
    
    // Emit completion event
    let _ = window.emit("background-task-complete", serde_json::json!({
      "message": "Long process completed successfully!"
    }));
  });
  
  Ok(format!("Started background task for {} seconds", duration_seconds))
}
```

### Background Service Manager

Implement a service manager to control multiple background tasks:

```rust
use std::collections::HashMap;
use std::sync::Mutex;
use tokio::task;

// Global registry for background services
lazy_static::lazy_static! {
  static ref BACKGROUND_SERVICES: Mutex<HashMap<String, task::AbortHandle>> = 
    Mutex::new(HashMap::new());
}

#[tauri::command]
async fn start_service(service_id: String, window: tauri::Window) -> Result<String, String> {
  // Check if service is already running
  {
    let services = BACKGROUND_SERVICES.lock().unwrap();
    if services.contains_key(&service_id) {
      return Err(format!("Service {} is already running", service_id));
    }
  }
  
  // Create the background task
  let handle = tokio::spawn({
    let window_clone = window.clone();
    let service_id_clone = service_id.clone();
    
    async move {
      loop {
        // Perform service work here
        tokio::time::sleep(Duration::from_secs(5)).await;
        
        let _ = window_clone.emit("service-update", serde_json::json!({
          "service_id": &service_id_clone,
          "message": "Service heartbeat"
        }));
        
        // Check for cancellation (in a real app, you might use channels)
        // For this example, we'll run indefinitely
      }
    }
  });
  
  // Store the abort handle
  BACKGROUND_SERVICES.lock().unwrap().insert(service_id.clone(), handle.abort_handle());
  
  Ok(format!("Service {} started successfully", service_id))
}

#[tauri::command]
async fn stop_service(service_id: String) -> Result<String, String> {
  let handle_option = {
    let mut services = BACKGROUND_SERVICES.lock().unwrap();
    services.remove(&service_id)
  };
  
  match handle_option {
    Some(handle) => {
      handle.abort();
      Ok(format!("Service {} stopped", service_id))
    }
    None => {
      Err(format!("Service {} is not running", service_id))
    }
  }
}
```

### File Processing Worker

Create a dedicated worker for file processing tasks:

```rust
use tokio::fs;

#[derive(Deserialize)]
struct FileProcessRequest {
  source_path: String,
  destination_path: String,
  operation: FileOperation,
}

#[derive(Deserialize)]
enum FileOperation {
  Copy,
  Move,
  Encrypt,
  Decrypt,
}

#[tauri::command]
async fn process_file(
  request: FileProcessRequest,
  window: tauri::Window
) -> Result<String, String> {
  let source_path = request.source_path;
  let destination_path = request.destination_path;
  
  // Emit start event
  let _ = window.emit("file-process-start", serde_json::json!({
    "source": &source_path,
    "destination": &destination_path
  }));
  
  let result = match request.operation {
    FileOperation::Copy => {
      fs::copy(&source_path, &destination_path).await
        .map(|_| "File copied successfully")
        .map_err(|e| e.to_string())
    },
    FileOperation::Move => {
      fs::rename(&source_path, &destination_path).await
        .map(|_| "File moved successfully")
        .map_err(|e| e.to_string())
    },
    FileOperation::Encrypt => {
      encrypt_file(&source_path, &destination_path).await
    },
    FileOperation::Decrypt => {
      decrypt_file(&source_path, &destination_path).await
    },
  };
  
  match result {
    Ok(msg) => {
      let _ = window.emit("file-process-success", serde_json::json!({
        "message": msg,
        "source": source_path,
        "destination": destination_path
      }));
      Ok(msg.to_string())
    },
    Err(error) => {
      let _ = window.emit("file-process-error", serde_json::json!({
        "error": error,
        "source": source_path,
        "destination": destination_path
      }));
      Err(error)
    }
  }
}

async fn encrypt_file(source: &str, dest: &str) -> Result<&'static str, String> {
  // In a real implementation, you'd use a crypto library
  // For demo purposes, we'll just copy the file
  fs::copy(source, dest).await
    .map(|_| "File encrypted successfully")
    .map_err(|e| e.to_string())
}

async fn decrypt_file(source: &str, dest: &str) -> Result<&'static str, String> {
  // In a real implementation, you'd use a crypto library
  // For demo purposes, we'll just copy the file
  fs::copy(source, dest).await
    .map(|_| "File decrypted successfully")
    .map_err(|e| e.to_string())
}
```

## Advanced Patterns

### Periodic Background Tasks

Schedule recurring background tasks using intervals:

```rust
use tokio::time::{interval_at, Instant};

#[tauri::command]
async fn schedule_periodic_task(
  window: tauri::Window,
  interval_seconds: u64,
  task_id: String
) -> Result<String, String> {
  let interval_duration = Duration::from_secs(interval_seconds);
  let mut interval = interval_at(Instant::now() + interval_duration, interval_duration);
  
  tokio::spawn(async move {
    loop {
      interval.tick().await;
      
      // Perform periodic work
      let timestamp = chrono::Utc::now().to_rfc3339();
      
      let _ = window.emit("periodic-task-executed", serde_json::json!({
        "task_id": &task_id,
        "timestamp": timestamp,
        "message": "Periodic task executed"
      }));
    }
  });
  
  Ok(format!("Scheduled periodic task {} every {} seconds", task_id, interval_seconds))
}

#[tauri::command]
async fn cleanup_old_files(window: tauri::Window, retention_days: u32) -> Result<String, String> {
  // Schedule a cleanup task
  let retention_duration = Duration::from_secs(retention_days as u64 * 24 * 60 * 60);
  
  tokio::spawn(async move {
    loop {
      tokio::time::sleep(Duration::from_secs(3600)).await; // Check every hour
      
      match cleanup_files_older_than(retention_duration).await {
        Ok(count) => {
          let _ = window.emit("cleanup-completed", serde_json::json!({
            "files_deleted": count,
            "timestamp": chrono::Utc::now().to_rfc3339()
          }));
        }
        Err(e) => {
          let _ = window.emit("cleanup-error", serde_json::json!({
            "error": e,
            "timestamp": chrono::Utc::now().to_rfc3339()
          }));
        }
      }
    }
  });
  
  Ok(format!("Started cleanup task with {} day retention", retention_days))
}

async fn cleanup_files_older_than(max_age: Duration) -> Result<u32, String> {
  // Implementation would scan directories and remove old files
  // For demonstration, return a dummy value
  Ok(0) // Placeholder - actual implementation would vary
}
```

### Resource Monitoring Service

Build a service to monitor system resources:

```rust
#[tauri::command]
async fn start_monitoring(window: tauri::Window) -> Result<String, String> {
  tokio::spawn(async move {
    let mut interval = time::interval(Duration::from_secs(5)); // Monitor every 5 seconds
    
    loop {
      interval.tick().await;
      
      // Get system info
      let memory_usage = get_memory_usage().await;
      let cpu_usage = get_cpu_usage().await;
      let disk_usage = get_disk_usage().await;
      
      let _ = window.emit("system-monitoring-update", serde_json::json!({
        "memory_usage": memory_usage,
        "cpu_usage": cpu_usage,
        "disk_usage": disk_usage,
        "timestamp": chrono::Utc::now().to_rfc3339()
      }));
    }
  });
  
  Ok("System monitoring started".to_string())
}

async fn get_memory_usage() -> f64 {
  // In a real app, use a system info crate like sysinfo
  50.0 // Placeholder value
}

async fn get_cpu_usage() -> f64 {
  // In a real app, use a system info crate like sysinfo
  25.0 // Placeholder value
}

async fn get_disk_usage() -> f64 {
  // In a real app, use a system info crate like sysinfo
  75.0 // Placeholder value
}
```

## Testing

Test your background services to ensure they behave correctly:

```rust
#[cfg(test)]
mod background_service_tests {
  use super::*;
  use tokio_test;

  #[tokio::test]
  async fn test_background_task_emits_progress() {
    // This would need a mock window implementation
    // For the purpose of this example, we'll outline the approach
  }
  
  #[tokio::test]
  async fn test_start_stop_service() {
    // Test service lifecycle
    let service_id = "test-service".to_string();
    
    // Start the service
    let start_result = start_service(service_id.clone(), /* mock window */).await;
    assert!(start_result.is_ok());
    
    // Stop the service
    let stop_result = stop_service(service_id).await;
    assert!(stop_result.is_ok());
  }
  
  #[tokio::test]
  async fn test_concurrent_services() {
    // Test that multiple services can run concurrently
    let service1_id = "concurrent-test-1".to_string();
    let service2_id = "concurrent-test-2".to_string();
    
    let start1 = start_service(service1_id.clone(), /* mock window */).await;
    let start2 = start_service(service2_id.clone(), /* mock window */).await;
    
    assert!(start1.is_ok());
    assert!(start2.is_ok());
    
    // Clean up
    let _ = stop_service(service1_id).await;
    let _ = stop_service(service2_id).await;
  }
}
```

## Troubleshooting

Common challenges with background services in Tauri:

- **Thread Safety**: Ensure all shared resources are properly synchronized with mutexes or channels
- **Resource Cleanup**: Always clean up background tasks when the application exits
- **Error Propagation**: Properly handle and report errors from background tasks
- **Memory Leaks**: Make sure to properly stop and remove background tasks
- **Communication**: Use Tauri's event system for safe frontend/backend communication

## Summary

Background services are essential for creating responsive desktop applications. By leveraging Rust's async capabilities and Tauri's event system, you can implement sophisticated background processing while keeping the UI responsive. Remember to properly manage task lifecycles and implement appropriate monitoring and error handling.

Continue exploring related topics in our guide to [Plugin Development](./01_13_plugin-development.md) to learn how to extend your application's capabilities.