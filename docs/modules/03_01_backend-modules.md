# Backend Modules

Creating modular backend architectures in Tauri applications enables better code organization, maintainability, and scalability. This article explores patterns for building cohesive backend modules that handle business logic, data access, and system integration in Rust.

## Prerequisites

- Understanding of Rust programming and async programming
- Knowledge of Tauri's command system and plugin architecture
- Familiarity with database access patterns in Rust

## Core Concepts

Backend modules in Tauri applications are Rust-based components that encapsulate specific functionality such as data access, business logic, system integration, and external API communication. These modules provide clear boundaries and interfaces while maintaining loose coupling between different system components.

## Implementation

### Module Structure Pattern

Create a standardized structure for backend modules:

```
src/
├── modules/
│   ├── user/
│   │   ├── mod.rs
│   │   ├── commands.rs
│   │   ├── models.rs
│   │   ├── services/
│   │   │   ├── user_service.rs
│   │   │   └── mod.rs
│   │   ├── repositories/
│   │   │   ├── user_repository.rs
│   │   │   └── mod.rs
│   │   ├── dtos/
│   │   │   ├── user_dto.rs
│   │   │   └── mod.rs
│   │   └── types/
│   │       └── mod.rs
│   └── ...
```

### Module Definition and Registration

Create a module system for organizing backend functionality:

```rust
// src/modules/mod.rs
pub mod user;
pub mod auth;
pub mod file_system;
pub mod database;

use tauri::{plugin::{Builder, TauriPlugin}, Runtime, Manager};
use std::sync::Arc;

// Module trait to standardize module initialization
pub trait TauriModule<R: Runtime> {
    fn register_commands(self) -> TauriPlugin<R>;
}

// Main module initialization
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("app-modules")
        .setup(|app, _api| {
            // Initialize all modules
            let user_module = user::init();
            let auth_module = auth::init();
            
            // Register modules with app handle
            app.manage(user_module);
            app.manage(auth_module);
            
            Ok(())
        })
        .build()
}
```

### User Module Implementation

Create the user module with its components:

```rust
// src/modules/user/mod.rs
use tauri::{plugin::{Builder, TauriPlugin}, Runtime};

pub mod commands;
pub mod models;
pub mod services;
pub mod repositories;
pub mod dtos;

use commands::*;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("user-module")
        .invoke_handler(tauri::generate_handler![
            get_users,
            get_user,
            create_user,
            update_user,
            delete_user,
            search_users,
        ])
        .build()
}
```

```rust
// src/modules/user/models.rs
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewUser {
    pub name: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateUser {
    pub name: Option<String>,
    pub email: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserFilter {
    pub search: Option<String>,
    pub is_active: Option<bool>,
    pub page: Option<i32>,
    pub limit: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PagedResponse<T> {
    pub data: Vec<T>,
    pub total: i64,
    pub page: i32,
    pub limit: i32,
    pub total_pages: i32,
}
```

```rust
// src/modules/user/dtos/mod.rs
use serde::{Deserialize, Serialize};
use crate::modules::user::models::User;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserDto {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<User> for UserDto {
    fn from(user: User) -> Self {
        UserDto {
            id: user.id,
            name: user.name,
            email: user.email,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub name: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub id: Uuid,
    pub name: Option<String>,
    pub email: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserResponse {
    pub success: bool,
    pub data: Option<UserDto>,
    pub error: Option<String>,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PagedUserResponse {
    pub success: bool,
    pub data: Option<PagedResponse<UserDto>>,
    pub error: Option<String>,
    pub message: Option<String>,
}
```

```rust
// src/modules/user/repositories/mod.rs
use sqlx::{PgPool, Row};
use crate::modules::user::models::{User, NewUser, UpdateUser, UserFilter, PagedResponse};
use crate::modules::user::dtos::UserDto;
use uuid::Uuid;

#[derive(Clone)]
pub struct UserRepository {
    pool: PgPool,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn get_by_id(&self, id: Uuid) -> Result<Option<User>, sqlx::Error> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT id, name, email, password_hash, is_active, created_at, updated_at
            FROM users 
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn get_all(&self, filter: &UserFilter) -> Result<PagedResponse<User>, sqlx::Error> {
        let offset = (filter.page.unwrap_or(1) - 1) * filter.limit.unwrap_or(20);
        let limit = filter.limit.unwrap_or(20);

        // Build dynamic query based on filters
        let mut query = String::from(
            r#"
            SELECT id, name, email, password_hash, is_active, created_at, updated_at
            FROM users
            WHERE 1=1
            "#
        );

        let mut count_query = String::from("SELECT COUNT(*) FROM users WHERE 1=1 ");
        let mut params: Vec<&(dyn sqlx::Encode<'_, sqlx::Postgres> + Send + '_)> = vec![];

        // Add search filter
        if let Some(search) = &filter.search {
            query.push_str(" AND (name ILIKE $1 OR email ILIKE $1)");
            count_query.push_str(" AND (name ILIKE $1 OR email ILIKE $1)");
            params.push(&format!("%{}%", search));
        }

        // Add active filter
        if let Some(is_active) = filter.is_active {
            let param_pos = if filter.search.is_some() { 2 } else { 1 };
            query.push_str(&format!(" AND is_active = ${}", param_pos));
            count_query.push_str(&format!(" AND is_active = ${}", param_pos));
            params.push(&is_active);
        }

        query.push_str(&format!(" ORDER BY created_at DESC LIMIT ${} OFFSET ${}", 
            if filter.search.is_some() && filter.is_active.is_some() { 3 } else if filter.search.is_some() || filter.is_active.is_some() { 2 } else { 1 },
            if filter.search.is_some() && filter.is_active.is_some() { 4 } else if filter.search.is_some() || filter.is_active.is_some() { 3 } else { 2 }
        ));

        // Add limit and offset to params
        let limit_val: i32 = limit;
        let offset_val: i32 = offset;
        params.push(&limit_val);
        params.push(&offset_val);

        // Execute count query
        let count_result = sqlx::query_scalar(&count_query)
            .bind(filter.search.as_ref().map(|s| format!("%{}%", s)))
            .bind(filter.is_active)
            .fetch_one(&self.pool)
            .await?;

        let total: i64 = count_result;
        let total_pages = ((total as f64) / (limit as f64)).ceil() as i32;

        // Execute data query
        let users = sqlx::query_as(&query)
            .bind(filter.search.as_ref().map(|s| format!("%{}%", s)))
            .bind(filter.is_active)
            .bind(&limit_val)
            .bind(&offset_val)
            .fetch_all(&self.pool)
            .await?;

        Ok(PagedResponse {
            data: users,
            total,
            page: filter.page.unwrap_or(1),
            limit,
            total_pages,
        })
    }

    pub async fn create(&self, new_user: NewUser) -> Result<User, sqlx::Error> {
        let user = sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (id, name, email, password_hash, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, email, password_hash, is_active, created_at, updated_at
            "#,
            Uuid::new_v4(),
            new_user.name,
            new_user.email,
            new_user.password, // Should be hashed in real implementation
            true,
            chrono::Utc::now(),
            chrono::Utc::now()
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    pub async fn update(&self, id: Uuid, update_user: UpdateUser) -> Result<Option<User>, sqlx::Error> {
        let mut query = String::from("UPDATE users SET updated_at = $1");
        let mut params: Vec<&(dyn sqlx::Encode<'_, sqlx::Postgres> + Send + '_)> = vec![&chrono::Utc::now()];
        let mut param_counter = 2;

        if let Some(name) = &update_user.name {
            query.push_str(&format!(", name = ${}", param_counter));
            params.push(name);
            param_counter += 1;
        }

        if let Some(email) = &update_user.email {
            query.push_str(&format!(", email = ${}", param_counter));
            params.push(email);
            param_counter += 1;
        }

        if let Some(is_active) = update_user.is_active {
            query.push_str(&format!(", is_active = ${}", param_counter));
            params.push(&is_active);
            param_counter += 1;
        }

        query.push_str(&format!(" WHERE id = ${}", param_counter));
        params.push(&id);

        query.push_str(" RETURNING id, name, email, password_hash, is_active, created_at, updated_at");

        let user = sqlx::query_as(&query)
            .bind(chrono::Utc::now())
            .bind(update_user.name.as_ref())
            .bind(update_user.email.as_ref())
            .bind(update_user.is_active)
            .bind(&id)
            .fetch_optional(&self.pool)
            .await?;

        Ok(user)
    }

    pub async fn delete(&self, id: Uuid) -> Result<bool, sqlx::Error> {
        let result = sqlx::query!("DELETE FROM users WHERE id = $1", id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn exists_by_email(&self, email: &str) -> Result<bool, sqlx::Error> {
        let exists = sqlx::query_scalar!(
            "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND is_active = true)",
            email
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(exists.unwrap_or(false))
    }
}
```

```rust
// src/modules/user/services/mod.rs
use crate::modules::user::models::{User, NewUser, UpdateUser, UserFilter, PagedResponse};
use crate::modules::user::repositories::UserRepository;
use crate::modules::user::dtos::{UserDto, CreateUserRequest, UpdateUserRequest};
use uuid::Uuid;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use rand_core::OsRng;

#[derive(Clone)]
pub struct UserService {
    user_repo: UserRepository,
}

impl UserService {
    pub fn new(user_repo: UserRepository) -> Self {
        Self { user_repo }
    }

    pub async fn get_user_by_id(&self, id: Uuid) -> Result<Option<UserDto>, String> {
        match self.user_repo.get_by_id(id).await {
            Ok(Some(user)) => Ok(Some(user.into())),
            Ok(None) => Ok(None),
            Err(e) => Err(format!("Database error: {}", e)),
        }
    }

    pub async fn get_all_users(&self, filter: UserFilter) -> Result<PagedResponse<UserDto>, String> {
        match self.user_repo.get_all(&filter).await {
            Ok(paged_response) => {
                let user_dtos: Vec<UserDto> = paged_response.data.into_iter().map(|u| u.into()).collect();
                Ok(PagedResponse {
                    data: user_dtos,
                    total: paged_response.total,
                    page: paged_response.page,
                    limit: paged_response.limit,
                    total_pages: paged_response.total_pages,
                })
            },
            Err(e) => Err(format!("Database error: {}", e)),
        }
    }

    pub async fn create_user(&self, req: CreateUserRequest) -> Result<UserDto, String> {
        // Check if user already exists
        if self.user_repo.exists_by_email(&req.email).await.map_err(|e| e.to_string())? {
            return Err("User with this email already exists".to_string());
        }

        // Hash password
        let password_hash = self.hash_password(&req.password)
            .map_err(|e| format!("Password hashing error: {}", e))?;

        let new_user = NewUser {
            name: req.name,
            email: req.email,
            password: password_hash,
        };

        match self.user_repo.create(new_user).await {
            Ok(user) => Ok(user.into()),
            Err(e) => Err(format!("Database error: {}", e)),
        }
    }

    pub async fn update_user(&self, req: UpdateUserRequest) -> Result<UserDto, String> {
        match self.user_repo.update(req.id, UpdateUser {
            name: req.name,
            email: req.email,
            is_active: req.is_active,
        }).await {
            Ok(Some(user)) => Ok(user.into()),
            Ok(None) => Err("User not found".to_string()),
            Err(e) => Err(format!("Database error: {}", e)),
        }
    }

    pub async fn delete_user(&self, id: Uuid) -> Result<bool, String> {
        match self.user_repo.delete(id).await {
            Ok(success) => Ok(success),
            Err(e) => Err(format!("Database error: {}", e)),
        }
    }

    fn hash_password(&self, password: &str) -> Result<String, argon2::password_hash::Error> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(password.as_bytes(), &salt)?;
        Ok(password_hash.to_string())
    }

    pub async fn verify_password(&self, password: &str, hash: &str) -> Result<bool, String> {
        let parsed_hash = match PasswordHash::new(hash) {
            Ok(hash) => hash,
            Err(_) => return Err("Invalid hash format".to_string()),
        };

        let argon2 = Argon2::default();
        match argon2.verify_password(password.as_bytes(), &parsed_hash) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }
}
```

```rust
// src/modules/user/commands.rs
use tauri::State;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::AppState;
use crate::modules::user::dtos::{CreateUserRequest, UpdateUserRequest, UserDto, UserResponse, PagedUserResponse};
use crate::modules::user::models::{UserFilter, PagedResponse};

#[derive(Deserialize)]
pub struct GetUsersRequest {
    pub search: Option<String>,
    pub is_active: Option<bool>,
    pub page: Option<i32>,
    pub limit: Option<i32>,
}

#[tauri::command]
pub async fn get_users(
    state: State<'_, AppState>,
    request: GetUsersRequest,
) -> Result<PagedUserResponse, String> {
    let user_service = state.user_service.as_ref().ok_or("User service not initialized")?;
    
    let filter = UserFilter {
        search: request.search,
        is_active: request.is_active,
        page: request.page,
        limit: request.limit,
    };

    match user_service.get_all_users(filter).await {
        Ok(paged_response) => {
            Ok(PagedUserResponse {
                success: true,
                data: Some(paged_response),
                error: None,
                message: Some("Users retrieved successfully".to_string()),
            })
        },
        Err(e) => {
            Ok(PagedUserResponse {
                success: false,
                data: None,
                error: Some(e),
                message: Some("Failed to retrieve users".to_string()),
            })
        }
    }
}

#[tauri::command]
pub async fn get_user(
    state: State<'_, AppState>,
    id: String,
) -> Result<UserResponse, String> {
    let user_service = state.user_service.as_ref().ok_or("User service not initialized")?;
    
    let user_id = Uuid::parse_str(&id).map_err(|_| "Invalid user ID format")?;

    match user_service.get_user_by_id(user_id).await {
        Ok(Some(user)) => {
            Ok(UserResponse {
                success: true,
                data: Some(user),
                error: None,
                message: Some("User retrieved successfully".to_string()),
            })
        },
        Ok(None) => {
            Ok(UserResponse {
                success: false,
                data: None,
                error: Some("User not found".to_string()),
                message: None,
            })
        },
        Err(e) => {
            Ok(UserResponse {
                success: false,
                data: None,
                error: Some(e),
                message: Some("Failed to retrieve user".to_string()),
            })
        }
    }
}

#[tauri::command]
pub async fn create_user(
    state: State<'_, AppState>,
    request: CreateUserRequest,
) -> Result<UserResponse, String> {
    let user_service = state.user_service.as_ref().ok_or("User service not initialized")?;

    match user_service.create_user(request).await {
        Ok(user) => {
            Ok(UserResponse {
                success: true,
                data: Some(user),
                error: None,
                message: Some("User created successfully".to_string()),
            })
        },
        Err(e) => {
            Ok(UserResponse {
                success: false,
                data: None,
                error: Some(e),
                message: Some("Failed to create user".to_string()),
            })
        }
    }
}

#[tauri::command]
pub async fn update_user(
    state: State<'_, AppState>,
    request: UpdateUserRequest,
) -> Result<UserResponse, String> {
    let user_service = state.user_service.as_ref().ok_or("User service not initialized")?;

    match user_service.update_user(request).await {
        Ok(user) => {
            Ok(UserResponse {
                success: true,
                data: Some(user),
                error: None,
                message: Some("User updated successfully".to_string()),
            })
        },
        Err(e) => {
            Ok(UserResponse {
                success: false,
                data: None,
                error: Some(e),
                message: Some("Failed to update user".to_string()),
            })
        }
    }
}

#[tauri::command]
pub async fn delete_user(
    state: State<'_, AppState>,
    id: String,
) -> Result<UserResponse, String> {
    let user_service = state.user_service.as_ref().ok_or("User service not initialized")?;
    
    let user_id = Uuid::parse_str(&id).map_err(|_| "Invalid user ID format")?;

    match user_service.delete_user(user_id).await {
        Ok(success) => {
            if success {
                Ok(UserResponse {
                    success: true,
                    data: None,
                    error: None,
                    message: Some("User deleted successfully".to_string()),
                })
            } else {
                Ok(UserResponse {
                    success: false,
                    data: None,
                    error: Some("User not found".to_string()),
                    message: None,
                })
            }
        },
        Err(e) => {
            Ok(UserResponse {
                success: false,
                data: None,
                error: Some(e),
                message: Some("Failed to delete user".to_string()),
            })
        }
    }
}

#[tauri::command]
pub async fn search_users(
    state: State<'_, AppState>,
    search_term: String,
) -> Result<PagedUserResponse, String> {
    let user_service = state.user_service.as_ref().ok_or("User service not initialized")?;
    
    let filter = UserFilter {
        search: Some(search_term),
        is_active: None,
        page: Some(1),
        limit: Some(20),
    };

    match user_service.get_all_users(filter).await {
        Ok(paged_response) => {
            Ok(PagedUserResponse {
                success: true,
                data: Some(paged_response),
                error: None,
                message: Some("Users searched successfully".to_string()),
            })
        },
        Err(e) => {
            Ok(PagedUserResponse {
                success: false,
                data: None,
                error: Some(e),
                message: Some("Failed to search users".to_string()),
            })
        }
    }
}
```

### Application State Integration

Integrate the modules with the main application state:

```rust
// src/state.rs (updated to include module services)
use std::sync::Arc;
use sqlx::{PgPool, postgres::PgPoolOptions};
use crate::modules::user::services::UserService;
use crate::modules::user::repositories::UserRepository;

#[derive(Clone)]
pub struct AppState {
    pub db_pool: Option<PgPool>,
    pub user_service: Option<UserService>,
    // Add other module services here
}

impl AppState {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let pool = PgPoolOptions::new()
            .max_connections(20)
            .connect(database_url)
            .await?;

        // Initialize repositories
        let user_repo = UserRepository::new(pool.clone());
        
        // Initialize services
        let user_service = UserService::new(user_repo);

        Ok(Self {
            db_pool: Some(pool),
            user_service: Some(user_service),
        })
    }

    pub fn with_db_only(pool: PgPool) -> Self {
        Self {
            db_pool: Some(pool),
            user_service: None,
        }
    }
}
```

### Plugin Architecture for Modules

Create a plugin system for better module management:

```rust
// src/modules/plugin.rs
use tauri::{plugin::{Builder as PluginBuilder, TauriPlugin}, Runtime, Manager, Wry};

use crate::modules::user;
use crate::state::AppState;

pub struct AppModule<R: Runtime> {
    builder: PluginBuilder<R>,
}

impl<R: Runtime> AppModule<R> {
    pub fn new(name: &str) -> Self {
        Self {
            builder: PluginBuilder::new(name),
        }
    }

    pub fn with_user_module(mut self) -> Self {
        self.builder = self.builder.invoke_handler(tauri::generate_handler![
            user::commands::get_users,
            user::commands::get_user,
            user::commands::create_user,
            user::commands::update_user,
            user::commands::delete_user,
            user::commands::search_users,
        ]);
        self
    }

    pub fn build(self) -> TauriPlugin<R> {
        self.builder.build()
    }
}

// Helper function to initialize all modules
pub fn init_all_modules() -> TauriPlugin<Wry> {
    AppModule::new("app-modules")
        .with_user_module()
        .build()
}
```

## Advanced Patterns

### Event-Driven Architecture

Implement an event system for module communication:

```rust
// src/modules/events.rs
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleEvent {
    pub id: String,
    pub source: String,
    pub event_type: String,
    pub data: serde_json::Value,
    pub timestamp: u64,
    pub correlation_id: Option<String>,
}

pub struct EventPublisher {
    senders: Arc<RwLock<HashMap<String, broadcast::Sender<ModuleEvent>>>>,
}

pub struct EventSubscriber {
    receivers: Arc<RwLock<HashMap<String, broadcast::Receiver<ModuleEvent>>>>,
}

impl EventPublisher {
    pub fn new() -> Self {
        Self {
            senders: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn subscribe(&self, event_type: &str) -> broadcast::Receiver<ModuleEvent> {
        let mut senders = self.senders.write().await;
        
        if !senders.contains_key(event_type) {
            let (sender, receiver) = broadcast::channel(100);
            senders.insert(event_type.to_string(), sender);
            receiver
        } else {
            senders.get(event_type).unwrap().subscribe()
        }
    }

    pub async fn publish(&self, event: ModuleEvent) -> Result<(), String> {
        let senders = self.senders.read().await;
        
        // Send to specific event type subscribers
        if let Some(sender) = senders.get(&event.event_type) {
            let _ = sender.send(event.clone());
        }

        // Send to wildcard subscribers
        if let Some(sender) = senders.get("*") {
            let _ = sender.send(event);
        }

        Ok(())
    }
}

// Usage example in a service
pub async fn publish_user_created_event(
    publisher: &EventPublisher,
    user_id: String,
    user_name: String,
) -> Result<(), String> {
    let event = ModuleEvent {
        id: format!("event-{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis()),
        source: "user-service".to_string(),
        event_type: "user.created".to_string(),
        data: serde_json::json!({
            "user_id": user_id,
            "user_name": user_name
        }),
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        correlation_id: None,
    };

    publisher.publish(event).await
}
```

### Configurable Module System

Create a system for configurable modules:

```rust
// src/modules/config.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ModuleConfig {
    pub enabled: bool,
    pub database_url: Option<String>,
    pub cache_enabled: bool,
    pub cache_ttl_minutes: u64,
    pub rate_limit: Option<RateLimitConfig>,
    pub permissions: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RateLimitConfig {
    pub requests: u32,
    pub window_seconds: u64,
}

impl Default for ModuleConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            database_url: None,
            cache_enabled: true,
            cache_ttl_minutes: 10,
            rate_limit: Some(RateLimitConfig {
                requests: 100,
                window_seconds: 60,
            }),
            permissions: vec!["read".to_string(), "write".to_string()],
        }
    }
}

pub struct ModuleConfigurer {
    configs: std::collections::HashMap<String, ModuleConfig>,
}

impl ModuleConfigurer {
    pub fn new() -> Self {
        Self {
            configs: std::collections::HashMap::new(),
        }
    }

    pub fn load_from_file(&mut self, config_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let config_content = std::fs::read_to_string(config_path)?;
        let configs: std::collections::HashMap<String, ModuleConfig> = 
            serde_json::from_str(&config_content)?;
        
        self.configs = configs;
        Ok(())
    }

    pub fn get_config(&self, module_name: &str) -> ModuleConfig {
        self.configs
            .get(module_name)
            .cloned()
            .unwrap_or_default()
    }

    pub fn set_config(&mut self, module_name: &str, config: ModuleConfig) {
        self.configs.insert(module_name.to_string(), config);
    }
}
```

### Database Migration System

Create a migration system for module databases:

```rust
// src/modules/migrations.rs
use sqlx::{PgPool, migrate::MigrateDatabase, postgres::PgPoolOptions};

pub struct ModuleMigrator {
    pool: PgPool,
}

impl ModuleMigrator {
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        // Create database if it doesn't exist
        if !PgPoolOptions::new()
            .max_connections(1)
            .connect(&database_url)
            .await
            .is_ok() {
                PgPool::create_database(&database_url).await?;
        }

        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await?;

        Ok(Self { pool })
    }

    pub async fn run_user_migrations(&self) -> Result<(), sqlx::Error> {
        // Define user module migrations
        let migrations = vec![
            sqlx::migrate!("./migrations/user"),
        ];

        for migration in migrations {
            migration.run(&self.pool).await?;
        }

        Ok(())
    }

    pub async fn run_all_migrations(&self) -> Result<(), sqlx::Error> {
        // Run all module migrations
        self.run_user_migrations().await?;
        
        // Add other module migrations here
        // run_auth_migrations().await?;
        // run_file_migrations().await?;
        
        Ok(())
    }
}

// Migration files would be in ./migrations/user/
// 001_create_users_table.sql
// 002_add_user_index.sql
// etc.
```

## Testing

Test the backend module system:

```rust
// src/modules/user/tests.rs
#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::{PgPool, postgres::PgPoolOptions};
    use std::env;
    use uuid::Uuid;

    async fn setup_test_db() -> PgPool {
        let database_url = env::var("TEST_DATABASE_URL")
            .expect("TEST_DATABASE_URL must be set for tests");
        
        let pool = PgPoolOptions::new()
            .max_connections(1)
            .connect(&database_url)
            .await
            .expect("Failed to connect to test database");

        // Clean up any existing test data
        sqlx::query("DELETE FROM users WHERE email LIKE '%@test.com'")
            .execute(&pool)
            .await
            .expect("Failed to clean up test data");

        pool
    }

    #[tokio::test]
    async fn test_user_crud_operations() {
        let pool = setup_test_db().await;
        let user_repo = UserRepository::new(pool);
        let user_service = UserService::new(user_repo);

        // Test create user
        let create_request = CreateUserRequest {
            name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            password: "securepassword".to_string(),
        };

        let created_user = user_service
            .create_user(create_request)
            .await
            .expect("Failed to create user");

        assert_eq!(created_user.name, "Test User");
        assert_eq!(created_user.email, "test@example.com");

        // Test get user by ID
        let retrieved_user = user_service
            .get_user_by_id(created_user.id)
            .await
            .expect("Failed to get user")
            .expect("User not found");

        assert_eq!(retrieved_user.name, "Test User");

        // Test update user
        let update_request = UpdateUserRequest {
            id: created_user.id,
            name: Some("Updated User".to_string()),
            email: None,
            is_active: Some(false),
        };

        let updated_user = user_service
            .update_user(update_request)
            .await
            .expect("Failed to update user");

        assert_eq!(updated_user.name, "Updated User");
        assert_eq!(updated_user.is_active, false);

        // Test delete user
        let deleted = user_service
            .delete_user(created_user.id)
            .await
            .expect("Failed to delete user");

        assert!(deleted);

        // Verify user no longer exists
        let deleted_user = user_service
            .get_user_by_id(created_user.id)
            .await
            .expect("Failed to get user");

        assert!(deleted_user.is_none());
    }

    #[tokio::test]
    async fn test_user_duplicate_email() {
        let pool = setup_test_db().await;
        let user_repo = UserRepository::new(pool);
        let user_service = UserService::new(user_repo);

        // Create first user
        let create_request = CreateUserRequest {
            name: "Test User 1".to_string(),
            email: "duplicate@example.com".to_string(),
            password: "password1".to_string(),
        };

        let _ = user_service
            .create_user(create_request)
            .await
            .expect("Failed to create first user");

        // Try to create user with same email
        let create_request2 = CreateUserRequest {
            name: "Test User 2".to_string(),
            email: "duplicate@example.com".to_string(),
            password: "password2".to_string(),
        };

        let result = user_service.create_user(create_request2).await;
        
        // Should fail because email already exists
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("already exists"));
    }

    #[tokio::test]
    async fn test_user_pagination() {
        let pool = setup_test_db().await;
        let user_repo = UserRepository::new(pool);
        let user_service = UserService::new(user_repo);

        // Create multiple users
        for i in 1..=25 {
            let create_request = CreateUserRequest {
                name: format!("User {}", i),
                email: format!("user{}@example.com", i),
                password: "password".to_string(),
            };
            
            user_service
                .create_user(create_request)
                .await
                .expect("Failed to create user");
        }

        // Test pagination
        let filter = UserFilter {
            search: None,
            is_active: None,
            page: Some(1),
            limit: Some(10),
        };

        let page1 = user_service
            .get_all_users(filter)
            .await
            .expect("Failed to get users");

        assert_eq!(page1.data.len(), 10);
        assert_eq!(page1.total, 25);
        assert_eq!(page1.total_pages, 3);

        // Test second page
        let filter2 = UserFilter {
            page: Some(2),
            limit: Some(10),
            ..Default::default()
        };

        let page2 = user_service
            .get_all_users(filter2)
            .await
            .expect("Failed to get users");

        assert_eq!(page2.data.len(), 10);
    }
}
```

## Troubleshooting

Common backend module challenges and solutions:

- **Database Connections**: Implement proper connection pooling and handle connection timeouts
- **Error Handling**: Use consistent error types and proper error propagation
- **Security**: Always hash passwords, validate inputs, and implement proper access controls
- **Performance**: Use database indexes, implement caching, and optimize queries
- **Testing**: Create comprehensive unit and integration tests with proper test databases

## Summary

Backend module architecture in Tauri applications provides a clean separation of concerns by encapsulating data access, business logic, and system integration into focused components. By following standardized patterns for module structure, repository pattern, service layer, and command systems, you can build maintainable and scalable backend applications.

Continue exploring related topics in our documentation to learn more about building modular Tauri-Vue applications.