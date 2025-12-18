# Database

Database integration is crucial for most desktop applications that need to persist data. Tauri provides excellent support for various database systems through Rust's rich ecosystem. This article covers comprehensive database integration patterns and best practices.

## Database Options for Tauri

### 1. SQLite (Recommended for Most Apps)

SQLite is perfect for desktop applications due to:
- Serverless, file-based database
- No external dependencies
- ACID compliance
- Cross-platform compatibility

### 2. PostgreSQL/MySQL

For applications requiring:
- Client-server architecture
- Multiple concurrent users
- Advanced features

### 3. Embedded Databases

- **RocksDB**: Key-value store
- **Sled**: Modern embedded database
- **Redis**: In-memory data store

## SQLite Integration

### Setup and Dependencies

Add to `Cargo.toml`:

```toml
[dependencies]
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "sqlite", "chrono", "uuid"] }
tokio = { version = "1", features = ["full"] }
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1", features = ["v4", "serde"] }
serde = { version = "1.0", features = ["derive"] }
```

### Database Connection Management

```rust
use sqlx::{SqlitePool, Row, sqlite::SqliteConnectOptions};
use std::str::FromStr;

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let options = SqliteConnectOptions::from_str(database_url)?
            .create_if_missing(true);
        
        let pool = SqlitePool::connect_with(options).await?;
        
        // Run migrations
        sqlx::migrate!("./migrations").run(&pool).await?;
        
        Ok(Database { pool })
    }
    
    pub async fn close(self) {
        self.pool.close().await;
    }
}

// Application state
struct AppState {
    db: std::sync::Mutex<Option<Database>>,
}

#[tauri::command]
async fn initialize_database(
    db_path: String,
    state: tauri::State<'_, AppState>
) -> Result<(), String> {
    let database_url = format!("sqlite:{}", db_path);
    
    match Database::new(&database_url).await {
        Ok(db) => {
            *state.db.lock().unwrap() = Some(db);
            Ok(())
        }
        Err(e) => Err(format!("Failed to initialize database: {}", e)),
    }
}
```

### Data Models

```rust
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub user_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub username: Option<String>,
    pub email: Option<String>,
}
```

### CRUD Operations

```rust
impl Database {
    // Create user
    pub async fn create_user(&self, request: CreateUserRequest) -> Result<User, sqlx::Error> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();
        
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (id, username, email, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
            "#
        )
        .bind(&id)
        .bind(&request.username)
        .bind(&request.email)
        .bind(now)
        .bind(now)
        .fetch_one(&self.pool)
        .await?;
        
        Ok(user)
    }
    
    // Get user by ID
    pub async fn get_user(&self, id: &str) -> Result<Option<User>, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(user)
    }
    
    // Get user by username
    pub async fn get_user_by_username(&self, username: &str) -> Result<Option<User>, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE username = ?"
        )
        .bind(username)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(user)
    }
    
    // Update user
    pub async fn update_user(&self, id: &str, request: UpdateUserRequest) -> Result<Option<User>, sqlx::Error> {
        let mut query = String::from("UPDATE users SET updated_at = ?");
        let mut binds = Vec::new();
        let now = Utc::now();
        
        if let Some(username) = &request.username {
            query.push_str(", username = ?");
            binds.push(username.clone());
        }
        
        if let Some(email) = &request.email {
            query.push_str(", email = ?");
            binds.push(email.clone());
        }
        
        query.push_str(" WHERE id = ? RETURNING *");
        
        let mut sql_query = sqlx::query_as::<_, User>(&query)
            .bind(now);
        
        for bind in binds {
            sql_query = sql_query.bind(bind);
        }
        
        sql_query = sql_query.bind(id);
        
        let user = sql_query.fetch_optional(&self.pool).await?;
        Ok(user)
    }
    
    // Delete user
    pub async fn delete_user(&self, id: &str) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM users WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        
        Ok(result.rows_affected() > 0)
    }
    
    // List users with pagination
    pub async fn list_users(&self, limit: i64, offset: i64) -> Result<Vec<User>, sqlx::Error> {
        let users = sqlx::query_as::<_, User>(
            "SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(users)
    }
    
    // Search users
    pub async fn search_users(&self, query: &str) -> Result<Vec<User>, sqlx::Error> {
        let search_pattern = format!("%{}%", query);
        
        let users = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE username LIKE ? OR email LIKE ?"
        )
        .bind(&search_pattern)
        .bind(&search_pattern)
        .fetch_all(&self.pool)
        .await?;
        
        Ok(users)
    }
}
```

### Tauri Commands

```rust
#[tauri::command]
async fn create_user(
    request: CreateUserRequest,
    state: tauri::State<'_, AppState>
) -> Result<User, String> {
    let db = state.db.lock().unwrap();
    match db.as_ref() {
        Some(database) => {
            database.create_user(request).await
                .map_err(|e| format!("Failed to create user: {}", e))
        }
        None => Err("Database not initialized".to_string()),
    }
}

#[tauri::command]
async fn get_user(
    id: String,
    state: tauri::State<'_, AppState>
) -> Result<Option<User>, String> {
    let db = state.db.lock().unwrap();
    match db.as_ref() {
        Some(database) => {
            database.get_user(&id).await
                .map_err(|e| format!("Failed to get user: {}", e))
        }
        None => Err("Database not initialized".to_string()),
    }
}

#[tauri::command]
async fn update_user(
    id: String,
    request: UpdateUserRequest,
    state: tauri::State<'_, AppState>
) -> Result<Option<User>, String> {
    let db = state.db.lock().unwrap();
    match db.as_ref() {
        Some(database) => {
            database.update_user(&id, request).await
                .map_err(|e| format!("Failed to update user: {}", e))
        }
        None => Err("Database not initialized".to_string()),
    }
}

#[tauri::command]
async fn delete_user(
    id: String,
    state: tauri::State<'_, AppState>
) -> Result<bool, String> {
    let db = state.db.lock().unwrap();
    match db.as_ref() {
        Some(database) => {
            database.delete_user(&id).await
                .map_err(|e| format!("Failed to delete user: {}", e))
        }
        None => Err("Database not initialized".to_string()),
    }
}

#[tauri::command]
async fn list_users(
    limit: Option<i64>,
    offset: Option<i64>,
    state: tauri::State<'_, AppState>
) -> Result<Vec<User>, String> {
    let db = state.db.lock().unwrap();
    match db.as_ref() {
        Some(database) => {
            database.list_users(limit.unwrap_or(50), offset.unwrap_or(0)).await
                .map_err(|e| format!("Failed to list users: {}", e))
        }
        None => Err("Database not initialized".to_string()),
    }
}
```

## Database Migrations

### Migration Files

Create `migrations/001_create_users.sql`:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

Create `migrations/002_create_projects.sql`:

```sql
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
```

### Custom Migration Logic

```rust
use sqlx::{migrate::MigrateDatabase, Sqlite};

#[tauri::command]
async fn setup_database(db_path: String) -> Result<(), String> {
    let database_url = format!("sqlite:{}", db_path);
    
    // Create database if it doesn't exist
    if !Sqlite::database_exists(&database_url).await.unwrap_or(false) {
        Sqlite::create_database(&database_url).await
            .map_err(|e| format!("Failed to create database: {}", e))?;
    }
    
    // Connect and run migrations
    let pool = SqlitePool::connect(&database_url).await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;
    
    sqlx::migrate!("./migrations").run(&pool).await
        .map_err(|e| format!("Failed to run migrations: {}", e))?;
    
    pool.close().await;
    Ok(())
}
```

## Advanced Database Patterns

### Transactions

```rust
impl Database {
    pub async fn create_project_with_user(
        &self,
        user_request: CreateUserRequest,
        project_name: String,
        project_description: Option<String>
    ) -> Result<(User, Project), sqlx::Error> {
        let mut tx = self.pool.begin().await?;
        
        // Create user
        let user_id = Uuid::new_v4().to_string();
        let now = Utc::now();
        
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (id, username, email, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
            "#
        )
        .bind(&user_id)
        .bind(&user_request.username)
        .bind(&user_request.email)
        .bind(now)
        .bind(now)
        .fetch_one(&mut *tx)
        .await?;
        
        // Create project
        let project_id = Uuid::new_v4().to_string();
        
        let project = sqlx::query_as::<_, Project>(
            r#"
            INSERT INTO projects (id, name, description, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
            "#
        )
        .bind(&project_id)
        .bind(&project_name)
        .bind(&project_description)
        .bind(&user_id)
        .bind(now)
        .bind(now)
        .fetch_one(&mut *tx)
        .await?;
        
        // Commit transaction
        tx.commit().await?;
        
        Ok((user, project))
    }
}
```

### Connection Pooling

```rust
use sqlx::sqlite::SqlitePoolOptions;

impl Database {
    pub async fn new_with_pool(database_url: &str, max_connections: u32) -> Result<Self, sqlx::Error> {
        let pool = SqlitePoolOptions::new()
            .max_connections(max_connections)
            .connect_with(
                SqliteConnectOptions::from_str(database_url)?
                    .create_if_missing(true)
            )
            .await?;
        
        // Run migrations
        sqlx::migrate!("./migrations").run(&pool).await?;
        
        Ok(Database { pool })
    }
    
    pub async fn health_check(&self) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("SELECT 1")
            .fetch_one(&self.pool)
            .await?;
        
        Ok(result.get::<i32>(0) == 1)
    }
}
```

### Database Backup and Restore

```rust
#[tauri::command]
async fn backup_database(
    source_path: String,
    backup_path: String
) -> Result<(), String> {
    use std::fs;
    
    // Ensure backup directory exists
    if let Some(parent) = std::path::Path::new(&backup_path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create backup directory: {}", e))?;
    }
    
    // Copy database file
    fs::copy(&source_path, &backup_path)
        .map_err(|e| format!("Failed to backup database: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn restore_database(
    backup_path: String,
    target_path: String
) -> Result<(), String> {
    use std::fs;
    
    // Verify backup exists
    if !std::path::Path::new(&backup_path).exists() {
        return Err("Backup file does not exist".to_string());
    }
    
    // Close existing database connections before restore
    // This would need to be handled in your application state
    
    // Copy backup to target
    fs::copy(&backup_path, &target_path)
        .map_err(|e| format!("Failed to restore database: {}", e))?;
    
    Ok(())
}
```

## PostgreSQL Integration

### Setup

```toml
[dependencies]
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "postgres", "chrono", "uuid"] }
```

### Connection

```rust
use sqlx::postgres::PgConnectOptions;

pub struct PostgresDatabase {
    pool: sqlx::PgPool,
}

impl PostgresDatabase {
    pub async fn new(connection_string: &str) -> Result<Self, sqlx::Error> {
        let pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(10)
            .connect(connection_string)
            .await?;
        
        // Run migrations
        sqlx::migrate!("./migrations").run(&pool).await?;
        
        Ok(PostgresDatabase { pool })
    }
}
```

## Database Testing

### Test Database Setup

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::SqlitePool;
    
    async fn create_test_database() -> Database {
        let pool = SqlitePool::connect(":memory:").await.unwrap();
        
        // Run migrations
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();
        
        Database { pool }
    }
    
    #[tokio::test]
    async fn test_create_user() {
        let db = create_test_database().await;
        
        let request = CreateUserRequest {
            username: "testuser".to_string(),
            email: "test@example.com".to_string(),
        };
        
        let user = db.create_user(request).await.unwrap();
        
        assert_eq!(user.username, "testuser");
        assert_eq!(user.email, "test@example.com");
    }
    
    #[tokio::test]
    async fn test_get_user() {
        let db = create_test_database().await;
        
        // Create user first
        let request = CreateUserRequest {
            username: "testuser".to_string(),
            email: "test@example.com".to_string(),
        };
        
        let created_user = db.create_user(request).await.unwrap();
        
        // Get user
        let retrieved_user = db.get_user(&created_user.id).await.unwrap();
        
        assert!(retrieved_user.is_some());
        assert_eq!(retrieved_user.unwrap().username, "testuser");
    }
}
```

## Performance Optimization

### Connection Pool Configuration

```rust
impl Database {
    pub async fn new_optimized(database_url: &str) -> Result<Self, sqlx::Error> {
        let pool = SqlitePoolOptions::new()
            .max_connections(20)  // Adjust based on your app's needs
            .min_connections(5)  // Keep some connections ready
            .connect_timeout(Duration::from_secs(30))
            .idle_timeout(Duration::from_secs(600))
            .max_lifetime(Duration::from_secs(1800))
            .connect_with(
                SqliteConnectOptions::from_str(database_url)?
                    .create_if_missing(true)
                    .busy_timeout(Duration::from_secs(30))
            )
            .await?;
        
        sqlx::migrate!("./migrations").run(&pool).await?;
        
        Ok(Database { pool })
    }
}
```

### Query Optimization

```rust
impl Database {
    // Use prepared statements for frequently executed queries
    pub async fn get_user_by_username_prepared(
        &self,
        username: &str
    ) -> Result<Option<User>, sqlx::Error> {
        // This query will be prepared and cached
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE username = ?"
        )
        .bind(username)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(user)
    }
    
    // Batch operations for better performance
    pub async fn create_users_batch(
        &self,
        users: Vec<CreateUserRequest>
    ) -> Result<Vec<User>, sqlx::Error> {
        let mut tx = self.pool.begin().await?;
        let mut results = Vec::new();
        
        for request in users {
            let user = self.create_user_transaction(&mut tx, request).await?;
            results.push(user);
        }
        
        tx.commit().await?;
        Ok(results)
    }
}
```

## Best Practices

1. **Use connection pooling**: Avoid creating new connections for each query
2. **Implement proper error handling**: Use Result types consistently
3. **Use transactions**: For multi-step operations
4. **Validate inputs**: Prevent SQL injection
5. **Use prepared statements**: For frequently executed queries
6. **Implement migrations**: For schema changes
7. **Test thoroughly**: Include database tests in your test suite
8. **Monitor performance**: Use connection metrics and query timing
9. **Backup regularly**: Implement backup and restore procedures
10. **Handle connection failures**: Implement retry logic for transient errors

Database integration is a critical component of most desktop applications. Tauri's Rust backend provides excellent support for various database systems, with SQLite being the most common choice for desktop applications due to its simplicity and reliability. By following these patterns and best practices, you can build robust, performant database-backed applications with Tauri.