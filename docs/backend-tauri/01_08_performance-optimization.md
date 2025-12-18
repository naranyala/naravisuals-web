---
order: 11
---

# Performance

Performance optimization is crucial for creating responsive and efficient desktop applications. This guide covers optimization techniques for Tauri applications, from Rust backend performance to frontend-backend communication efficiency.

## Backend Performance Optimization

### Efficient Command Design

```rust
// Avoid expensive operations in synchronous commands
// ❌ Bad: Blocking operation
#[tauri::command]
fn heavy_computation_bad(data: Vec<f64>) -> f64 {
    // This blocks the main thread
    let mut result = 0.0;
    for i in 0..1_000_000_000 {
        result += data[i % data.len()];
    }
    result
}

// ✅ Good: Async operation
#[tauri::command]
async fn heavy_computation_good(data: Vec<f64>) -> f64 {
    // This runs on a background thread
    tokio::task::spawn_blocking(move || {
        let mut result = 0.0;
        for i in 0..1_000_000_000 {
            result += data[i % data.len()];
        }
        result
    })
    .await
    .unwrap()
}
```

### Memory Management

```rust
// Use efficient data structures
use std::collections::HashMap;

#[tauri::command]
async fn process_large_dataset_efficient(data: Vec<Record>) -> Result<ProcessedData, String> {
    // Pre-allocate capacity
    let mut result_map: HashMap<String, Vec<f64>> = HashMap::with_capacity(data.len());
    
    // Process in chunks to reduce memory pressure
    const CHUNK_SIZE: usize = 1000;
    
    for chunk in data.chunks(CHUNK_SIZE) {
        // Process chunk
        for record in chunk {
            result_map
                .entry(record.category.clone())
                .or_insert_with(Vec::new)
                .push(record.value);
        }
        
        // Yield control periodically
        tokio::task::yield_now().await;
    }
    
    Ok(ProcessedData::from_map(result_map))
}

#[derive(serde::Serialize)]
struct ProcessedData {
    categories: Vec<CategorySummary>,
}

impl ProcessedData {
    fn from_map(map: HashMap<String, Vec<f64>>) -> Self {
        Self {
            categories: map.into_iter()
                .map(|(category, values)| CategorySummary {
                    category,
                    count: values.len(),
                    average: values.iter().sum::<f64>() / values.len() as f64,
                    min: values.iter().fold(f64::INFINITY, |a, &b| a.min(b)),
                    max: values.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b)),
                })
                .collect(),
        }
    }
}

#[derive(serde::Serialize)]
struct CategorySummary {
    category: String,
    count: usize,
    average: f64,
    min: f64,
    max: f64,
}
```

### Connection Pooling and Caching

```rust
use std::sync::Arc;
use tokio::sync::RwLock;
use sqlx::SqlitePool;

struct AppState {
    db_pool: Arc<SqlitePool>,
    cache: Arc<RwLock<HashMap<String, CachedResponse>>>,
}

#[derive(Clone)]
struct CachedResponse {
    data: serde_json::Value,
    timestamp: std::time::SystemTime,
    ttl: std::time::Duration,
}

impl CachedResponse {
    fn is_expired(&self) -> bool {
        self.timestamp.elapsed().unwrap_or_default() > self.ttl
    }
}

#[tauri::command]
async fn get_user_data_cached(
    user_id: String,
    state: tauri::State<'_, AppState>
) -> Result<serde_json::Value, String> {
    // Check cache first
    {
        let cache = state.cache.read().await;
        if let Some(cached) = cache.get(&user_id) {
            if !cached.is_expired() {
                return Ok(cached.data.clone());
            }
        }
    }
    
    // Fetch from database
    let user_data = sqlx::query_as!(
        UserData,
        "SELECT id, name, email, created_at FROM users WHERE id = ?",
        user_id
    )
    .fetch_one(&*state.db_pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?;
    
    let response = serde_json::json!({
        "id": user_data.id,
        "name": user_data.name,
        "email": user_data.email,
        "created_at": user_data.created_at
    });
    
    // Update cache
    {
        let mut cache = state.cache.write().await;
        cache.insert(user_id, CachedResponse {
            data: response.clone(),
            timestamp: std::time::SystemTime::now(),
            ttl: std::time::Duration::from_secs(300), // 5 minutes
        });
    }
    
    Ok(response)
}

struct UserData {
    id: String,
    name: String,
    email: String,
    created_at: chrono::DateTime<chrono::Utc>,
}
```

## Frontend-Backend Communication Optimization

### Batch Operations

```rust
#[tauri::command]
async fn batch_update_records(
    updates: Vec<RecordUpdate>
) -> Result<Vec<UpdateResult>, String> {
    // Use transaction for atomicity
    let pool = get_database_pool().await?;
    
    let mut results = Vec::with_capacity(updates.len());
    
    let mut tx = pool.begin().await
        .map_err(|e| format!("Failed to begin transaction: {}", e))?;
    
    for update in updates {
        let result = sqlx::query!(
            "UPDATE records SET name = ?, value = ? WHERE id = ?",
            update.name,
            update.value,
            update.id
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Failed to update record: {}", e))?;
        
        results.push(UpdateResult {
            id: update.id,
            success: result.rows_affected() > 0,
            error: None,
        });
    }
    
    tx.commit().await
        .map_err(|e| format!("Failed to commit transaction: {}", e))?;
    
    Ok(results)
}

#[derive(serde::Deserialize)]
struct RecordUpdate {
    id: String,
    name: String,
    value: f64,
}

#[derive(serde::Serialize)]
struct UpdateResult {
    id: String,
    success: bool,
    error: Option<String>,
}
```

### Streaming Large Data

```rust
#[tauri::command]
async fn stream_large_file(
    file_path: String,
    window: tauri::Window
) -> Result<(), String> {
    const CHUNK_SIZE: usize = 8192; // 8KB chunks
    
    let mut file = tokio::fs::File::open(&file_path).await
        .map_err(|e| format!("Failed to open file: {}", e))?;
    
    let mut buffer = vec![0u8; CHUNK_SIZE];
    let mut bytes_read: u64 = 0;
    
    loop {
        let n = file.read(&mut buffer).await
            .map_err(|e| format!("Failed to read file: {}", e))?;
        
        if n == 0 {
            break; // EOF
        }
        
        let chunk = buffer[..n].to_vec();
        bytes_read += n as u64;
        
        window.emit("file-chunk", FileChunk {
            data: chunk,
            bytes_total: bytes_read,
            is_complete: false,
        }).map_err(|e| format!("Failed to emit chunk: {}", e))?;
        
        // Small delay to prevent overwhelming frontend
        tokio::time::sleep(std::time::Duration::from_millis(1)).await;
    }
    
    // Signal completion
    window.emit("file-chunk", FileChunk {
        data: Vec::new(),
        bytes_total: bytes_read,
        is_complete: true,
    }).map_err(|e| format!("Failed to emit completion: {}", e))?;
    
    Ok(())
}

#[derive(serde::Serialize)]
struct FileChunk {
    data: Vec<u8>,
    bytes_total: u64,
    is_complete: bool,
}
```

## Database Performance Optimization

### Efficient Database Operations

```rust
// Use prepared statements and proper indexing
#[tauri::command]
async fn search_records_optimized(
    search_term: String,
    limit: u32,
    offset: u32,
    pool: tauri::State<'_, Arc<SqlitePool>>
) -> Result<Vec<Record>, String> {
    // Use parameterized queries and LIMIT/OFFSET
    let records = sqlx::query_as!(
        Record,
        r#"
        SELECT id, name, description, created_at
        FROM records 
        WHERE name LIKE ? OR description LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        "#,
        format!("%{}%", search_term),
        format!("%{}%", search_term),
        limit,
        offset
    )
    .fetch_all(&**pool)
    .await
    .map_err(|e| format!("Search failed: {}", e))?;
    
    Ok(records)
}

// Batch inserts for better performance
#[tauri::command]
async fn insert_records_batch(
    records: Vec<NewRecord>,
    pool: tauri::State<'_, Arc<SqlitePool>>
) -> Result<Vec<String>, String> {
    let mut tx = pool.begin().await
        .map_err(|e| format!("Failed to begin transaction: {}", e))?;
    
    let mut ids = Vec::with_capacity(records.len());
    
    for record in records {
        let id = sqlx::query_scalar!(
            "INSERT INTO records (name, description, value) VALUES (?, ?, ?) RETURNING id",
            record.name,
            record.description,
            record.value
        )
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| format!("Failed to insert record: {}", e))?;
        
        ids.push(id.unwrap_or_default().to_string());
    }
    
    tx.commit().await
        .map_err(|e| format!("Failed to commit transaction: {}", e))?;
    
    Ok(ids)
}
```

### Connection Pool Configuration

```rust
// Optimize database connection pool
async fn create_optimized_pool(database_url: &str) -> Result<sqlx::SqlitePool, sqlx::Error> {
    sqlx::SqlitePool::connect_with(
        sqlx::sqlite::SqliteConnectOptions::from_str(database_url)?
            .create_if_missing(true)
            .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
            .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
            .busy_timeout(std::time::Duration::from_secs(30))
    )
    .await
}

// Set up pool with proper configuration
async fn setup_database() -> Result<Arc<SqlitePool>, String> {
    let pool = create_optimized_pool("sqlite:app.db")
        .await
        .map_err(|e| format!("Failed to create pool: {}", e))?;
    
    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|e| format!("Migration failed: {}", e))?;
    
    // Configure pool size
    // SQLite works best with a single connection, but we can use more for read operations
    pool.set_max_connections(10);
    
    Ok(Arc::new(pool))
}
```

## File I/O Optimization

### Asynchronous File Operations

```rust
use tokio::fs;
use tokio::io::AsyncReadExt;

#[tauri::command]
async fn read_large_file_async(file_path: String) -> Result<String, String> {
    // Use async file operations
    let content = fs::read_to_string(&file_path).await
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    Ok(content)
}

#[tauri::command]
async fn process_files_parallel(
    file_paths: Vec<String>
) -> Result<Vec<FileResult>, String> {
    const CONCURRENT_LIMIT: usize = 4;
    
    let results = stream::iter(file_paths)
        .map(|path| async move {
            let start = std::time::Instant::now();
            
            // Read file asynchronously
            let content = fs::read_to_string(&path).await?;
            
            let processing_time = start.elapsed();
            
            Ok(FileResult {
                path,
                size: content.len(),
                processing_time_ms: processing_time.as_millis(),
                success: true,
                error: None,
            }) as Result<FileResult, Box<dyn std::error::Error + Send + Sync>>
        })
        .buffer_unordered(CONCURRENT_LIMIT)
        .collect::<Vec<_>>()
        .await;
    
    let results = results.into_iter()
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Processing failed: {}", e))?;
    
    Ok(results)
}

#[derive(serde::Serialize)]
struct FileResult {
    path: String,
    size: usize,
    processing_time_ms: u128,
    success: bool,
    error: Option<String>,
}

use futures::{stream, StreamExt};
```

## Memory Optimization

### Memory-Efficient Data Processing

```rust
// Use iterators to avoid allocating large collections
#[tauri::command]
async fn process_large_dataset_streaming(
    data_source: String
) -> Result<ProcessingStats, String> {
    let mut total = 0.0;
    let mut count = 0;
    let mut max_value = f64::NEG_INFINITY;
    let mut min_value = f64::INFINITY;
    
    // Process data as stream to avoid loading everything into memory
    let mut reader = csv::Reader::from_path(&data_source)
        .map_err(|e| format!("Failed to open CSV: {}", e))?;
    
    for result in reader.records() {
        let record = result
            .map_err(|e| format!("CSV parsing error: {}", e))?;
        
        if let Some(value_str) = record.get(1) {
            if let Ok(value) = value_str.parse::<f64>() {
                total += value;
                count += 1;
                max_value = max_value.max(value);
                min_value = min_value.min(value);
            }
        }
        
        // Periodically yield control
        if count % 1000 == 0 {
            tokio::task::yield_now().await;
        }
    }
    
    Ok(ProcessingStats {
        total_records: count,
        sum: total,
        average: if count > 0 { total / count as f64 } else { 0.0 },
        min_value,
        max_value,
    })
}

#[derive(serde::Serialize)]
struct ProcessingStats {
    total_records: usize,
    sum: f64,
    average: f64,
    min_value: f64,
    max_value: f64,
}
```

### Memory Pool for Reusable Objects

```rust
use std::sync::Arc;

struct MemoryPool<T> {
    items: Arc<RwLock<Vec<T>>>,
    create_fn: Arc<dyn Fn() -> T + Send + Sync>,
}

impl<T> MemoryPool<T> 
where 
    T: Clone,
{
    fn new<F>(size: usize, create_fn: F) -> Self 
    where 
        F: Fn() -> T + Send + Sync + 'static 
    {
        let items = (0..size)
            .map(|_| create_fn())
            .collect();
        
        Self {
            items: Arc::new(RwLock::new(items)),
            create_fn: Arc::new(create_fn),
        }
    }
    
    async fn get(&self) -> T {
        let mut items = self.items.write().await;
        if let Some(item) = items.pop() {
            item
        } else {
            (self.create_fn)()
        }
    }
    
    async fn return_item(&self, item: T) {
        let mut items = self.items.write().await;
        items.push(item);
    }
}

// Usage example
#[tauri::command]
async fn process_with_pool() -> Result<(), String> {
    let pool = MemoryPool::new(100, || Vec::<u8>::with_capacity(8192));
    
    // Get buffer from pool
    let mut buffer = pool.get().await;
    
    // Use buffer for processing
    buffer.extend_from_slice(b"some data");
    // ... process data ...
    
    // Return buffer to pool
    pool.return_item(buffer).await;
    
    Ok(())
}
```

## Performance Monitoring

### Performance Metrics Collection

```rust
use std::time::Instant;
use std::collections::HashMap;

struct PerformanceTracker {
    timings: RwLock<HashMap<String, Vec<std::time::Duration>>>,
}

impl PerformanceTracker {
    fn new() -> Self {
        Self {
            timings: RwLock::new(HashMap::new()),
        }
    }
    
    async fn record_timing(&self, operation: &str, duration: std::time::Duration) {
        let mut timings = self.timings.write().await;
        timings.entry(operation.to_string())
            .or_insert_with(Vec::new)
            .push(duration);
    }
    
    async fn get_stats(&self, operation: &str) -> Option<OperationStats> {
        let timings = self.timings.read().await;
        let durations = timings.get(operation)?;
        
        if durations.is_empty() {
            return None;
        }
        
        let sorted: Vec<_> = durations.iter().copied().collect();
        let total: std::time::Duration = sorted.iter().sum();
        let avg = total / sorted.len() as u32;
        let median = sorted[sorted.len() / 2];
        let p95 = sorted[(sorted.len() as f64 * 0.95) as usize];
        
        Some(OperationStats {
            operation: operation.to_string(),
            count: sorted.len(),
            average_ms: avg.as_millis(),
            median_ms: median.as_millis(),
            p95_ms: p95.as_millis(),
            total_ms: total.as_millis(),
        })
    }
}

#[derive(serde::Serialize)]
struct OperationStats {
    operation: String,
    count: usize,
    average_ms: u128,
    median_ms: u128,
    p95_ms: u128,
    total_ms: u128,
}

// Performance wrapper for commands
macro_rules! timed_command {
    ($func:ident, $tracker:expr) => {
        move |args| async move {
            let start = Instant::now();
            let result = $func(args).await;
            let duration = start.elapsed();
            $tracker.record_timing(stringify!($func), duration).await;
            result
        }
    };
}
```

## Best Practices

### 1. Profile Before Optimizing

```rust
#[tauri::command]
async fn profiled_operation(data: Vec<DataPoint>) -> Result<Vec<ProcessedPoint>, String> {
    let _guard = flame::start_guard("process_data");
    
    // Processing logic
    let results = process_data_points(data).await?;
    
    Ok(results)
}
```

### 2. Use Appropriate Data Structures

```rust
// Choose the right data structure for your use case
use std::collections::{BTreeMap, HashMap, VecDeque};

// For fast lookups
#[derive(Default)]
struct FastLookupCache {
    data: HashMap<String, CachedValue>,
}

// For ordered data
struct SortedCache {
    data: BTreeMap<i64, Vec<Record>>,
}

// For FIFO operations
struct QueueCache {
    data: VecDeque<CacheEntry>,
}
```

### 3. Lazy Loading

```rust
#[tauri::command]
async fn load_data_lazy(
    required: Vec<String>,
    state: tauri::State<'_, Arc<DataLoader>>
) -> Result<HashMap<String, serde_json::Value>, String> {
    let mut results = HashMap::new();
    
    // Load only what's requested
    for key in required {
        if let Some(value) = state.get_cached(&key).await {
            results.insert(key, value);
        } else {
            let value = state.load_data(&key).await?;
            state.cache_data(&key, &value).await;
            results.insert(key, value);
        }
    }
    
    Ok(results)
}
```

Performance optimization is an ongoing process. These techniques provide a foundation for building responsive, efficient Tauri applications that scale well with increasing complexity and data volume.