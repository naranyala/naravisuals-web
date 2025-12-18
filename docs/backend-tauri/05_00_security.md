# Tauri Security and Permissions

Security is a fundamental aspect of Tauri applications. Tauri provides a comprehensive security model that protects both the user and the application while maintaining flexibility for legitimate use cases. This article covers Tauri's security features, permission system, and best practices for building secure applications.

## Tauri Security Model

### Core Security Principles

1. **Principle of Least Privilege**: Applications only have access to what they explicitly request
2. **Capability-Based Security**: Access is granted through specific capabilities
3. **Sandboxed Frontend**: Web frontend runs in a restricted environment
4. **Secure IPC**: All communication between frontend and backend is controlled

### Security Layers

```
┌─────────────────────────────────────┐
│           Frontend (Web)            │
│  - Restricted JavaScript APIs       │
│  - No direct file system access     │
│  - Limited network capabilities     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         IPC Communication           │
│  - Command validation               │
│  - Permission checks                │
│  - Data sanitization                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│           Backend (Rust)            │
│  - Full system access               │
│  - Security validation              │
│  - Resource management              │
└─────────────────────────────────────┘
```

## Permission System

### Capability Configuration

Permissions are defined in `tauri.conf.json` through capabilities:

```json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "scope": ["$APPDATA/*", "$DOWNLOAD/*"]
      },
      "shell": {
        "all": false,
        "open": true
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      }
    },
    "capabilities": [
      {
        "name": "main",
        "permissions": [
          "core:default",
          "fs:allow-read-file",
          "fs:allow-write-file",
          "dialog:allow-open"
        ]
      }
    ]
  }
}
```

### Built-in Permissions

Tauri provides several built-in permission categories:

#### File System Permissions
```json
{
  "permissions": [
    "fs:allow-read-file",
    "fs:allow-write-file",
    "fs:allow-read-dir",
    "fs:allow-copy-file",
    "fs:allow-create-dir",
    "fs:allow-remove-dir",
    "fs:allow-remove-file",
    "fs:allow-rename-file",
    "fs:allow-exists"
  ]
}
```

#### Window Permissions
```json
{
  "permissions": [
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-close",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-set-title",
    "core:window:allow-set-size"
  ]
}
```

#### Shell Permissions
```json
{
  "permissions": [
    "shell:allow-execute",
    "shell:allow-open",
    "shell:allow-spawn"
  ]
}
```

## Custom Capabilities

### Defining Custom Capabilities

Create `capabilities/main.json`:

```json
{
  "identifier": "main",
  "description": "Main application capabilities",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:allow-set-title",
    "core:window:allow-set-size",
    "fs:allow-read-file",
    "fs:allow-write-file",
    "fs:allow-read-dir",
    "fs:allow-create-dir",
    "dialog:allow-open",
    "dialog:allow-save",
    "notification:default"
  ],
  "platforms": ["linux", "macos", "windows"]
}
```

### Scoped Permissions

Restrict file system access to specific directories:

```json
{
  "permissions": [
    {
      "identifier": "fs:allow-read-file",
      "allow": [{ "path": "$APPDATA/app-config.json" }]
    },
    {
      "identifier": "fs:allow-write-file", 
      "allow": [{ "path": "$APPDATA/logs/*.log" }]
    },
    {
      "identifier": "fs:allow-read-dir",
      "allow": [{ "path": "$DOWNLOAD" }]
    }
  ]
}
```

## Command Security

### Input Validation

Always validate command inputs:

```rust
use regex::Regex;
use std::path::Path;

#[tauri::command]
fn secure_file_operation(path: String) -> Result<String, String> {
    // Validate path format
    let path_regex = Regex::new(r"^[a-zA-Z0-9_\-./]+$")
        .map_err(|_| "Invalid regex".to_string())?;
    
    if !path_regex.is_match(&path) {
        return Err("Invalid path format".to_string());
    }
    
    // Check for directory traversal
    if path.contains("..") {
        return Err("Path traversal not allowed".to_string());
    }
    
    // Validate path exists and is within allowed scope
    let full_path = Path::new(&path);
    if !full_path.exists() {
        return Err("Path does not exist".to_string());
    }
    
    // Additional security checks
    if !is_path_allowed(&full_path) {
        return Err("Path not in allowed scope".to_string());
    }
    
    // Perform operation
    std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

fn is_path_allowed(path: &Path) -> bool {
    // Check if path is within allowed directories
    let allowed_dirs = vec![
        dirs::config_dir().unwrap_or_default(),
        dirs::data_dir().unwrap_or_default(),
        dirs::download_dir().unwrap_or_default(),
    ];
    
    for allowed_dir in allowed_dirs {
        if let Ok(canonical_path) = path.canonicalize() {
            if let Ok(canonical_allowed) = allowed_dir.canonicalize() {
                if canonical_path.starts_with(canonical_allowed) {
                    return true;
                }
            }
        }
    }
    
    false
}
```

### Output Sanitization

Sanitize command outputs before sending to frontend:

```rust
use serde_json;
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct SafeResponse {
    data: serde_json::Value,
    metadata: HashMap<String, String>,
}

#[tauri::command]
fn get_system_info() -> Result<SafeResponse, String> {
    let mut system_info = HashMap::new();
    
    // Only include safe information
    system_info.insert("os".to_string(), std::env::consts::OS.to_string());
    system_info.insert("arch".to_string(), std::env::consts::ARCH.to_string());
    system_info.insert("version".to_string(), "1.0.0".to_string());
    
    // Exclude sensitive information like:
    // - User home directory
    // - Environment variables
    // - System paths
    // - Network interfaces
    
    Ok(SafeResponse {
        data: serde_json::to_value(system_info)
            .map_err(|e| format!("Serialization error: {}", e))?,
        metadata: HashMap::new(),
    })
}
```

## Runtime Security

### Secure IPC Communication

```rust
use tauri::{State, Manager};

struct SecurityState {
    allowed_origins: Vec<String>,
    rate_limiter: std::sync::Mutex<std::collections::HashMap<String, std::time::Instant>>,
}

#[tauri::command]
async fn secure_api_call(
    endpoint: String,
    data: serde_json::Value,
    window: tauri::Window,
    state: State<'_, SecurityState>
) -> Result<serde_json::Value, String> {
    // Rate limiting
    {
        let mut rate_limiter = state.rate_limiter.lock().unwrap();
        let now = std::time::Instant::now();
        
        if let Some(last_call) = rate_limiter.get(&endpoint) {
            if now.duration_since(*last_call) < std::time::Duration::from_secs(1) {
                return Err("Rate limit exceeded".to_string());
            }
        }
        
        rate_limiter.insert(endpoint, now);
    }
    
    // Origin validation
    let origin = window.label();
    if !state.allowed_origins.contains(&origin.to_string()) {
        return Err("Unauthorized origin".to_string());
    }
    
    // Input validation
    if !is_valid_endpoint(&endpoint) {
        return Err("Invalid endpoint".to_string());
    }
    
    // Process request
    process_secure_request(endpoint, data).await
}

fn is_valid_endpoint(endpoint: &str) -> bool {
    let allowed_endpoints = vec![
        "/api/user/profile",
        "/api/user/settings",
        "/api/data/export",
    ];
    
    allowed_endpoints.contains(&endpoint)
}
```

### Content Security Policy (CSP)

Configure CSP in `tauri.conf.json`:

```json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.example.com"
    }
  }
}
```

Or configure per-window:

```rust
tauri::Builder::default()
    .setup(|app| {
        let window = app.get_window("main").unwrap();
        window.eval("document.head.innerHTML += '<meta http-equiv=\"Content-Security-Policy\" content=\"default-src \\'self\\'; script-src \\'self\\' \\'unsafe-inline\\';\">')?;
        Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

## Data Protection

### Encryption at Rest

```rust
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};

struct EncryptionState {
    cipher: std::sync::Mutex<Option<Aes256Gcm>>,
}

impl EncryptionState {
    fn new() -> Self {
        EncryptionState {
            cipher: std::sync::Mutex::new(None),
        }
    }
    
    fn initialize(&self, key: &[u8; 32]) -> Result<(), String> {
        let key = Key::from_slice(key);
        let cipher = Aes256Gcm::new(key);
        
        *self.cipher.lock().unwrap() = Some(cipher);
        Ok(())
    }
    
    fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>, String> {
        let cipher = self.cipher.lock().unwrap();
        match cipher.as_ref() {
            Some(c) => {
                let nonce = Nonce::from_slice(b"unique nonce");
                c.encrypt(nonce, plaintext)
                    .map_err(|e| format!("Encryption failed: {}", e))
            }
            None => Err("Encryption not initialized".to_string()),
        }
    }
    
    fn decrypt(&self, ciphertext: &[u8]) -> Result<Vec<u8>, String> {
        let cipher = self.cipher.lock().unwrap();
        match cipher.as_ref() {
            Some(c) => {
                let nonce = Nonce::from_slice(b"unique nonce");
                c.decrypt(nonce, ciphertext)
                    .map_err(|e| format!("Decryption failed: {}", e))
            }
            None => Err("Encryption not initialized".to_string()),
        }
    }
}

#[tauri::command]
fn secure_write_file(
    path: String,
    content: String,
    encryption_state: tauri::State<'_, EncryptionState>
) -> Result<(), String> {
    // Encrypt content
    let encrypted_content = encryption_state.encrypt(content.as_bytes())?;
    
    // Write encrypted data
    std::fs::write(&path, encrypted_content)
        .map_err(|e| format!("Failed to write encrypted file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
fn secure_read_file(
    path: String,
    encryption_state: tauri::State<'_, EncryptionState>
) -> Result<String, String> {
    // Read encrypted data
    let encrypted_content = std::fs::read(&path)
        .map_err(|e| format!("Failed to read encrypted file: {}", e))?;
    
    // Decrypt content
    let decrypted_content = encryption_state.decrypt(&encrypted_content)?;
    
    Ok(String::from_utf8(decrypted_content)
        .map_err(|e| format!("Failed to decode content: {}", e))?)
}
```

### Secure Configuration Storage

```rust
use keyring::Entry;

#[tauri::command]
async fn store_secure_config(key: String, value: String) -> Result<(), String> {
    let entry = Entry::new("your-app", &key)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;
    
    entry.set_password(&value)
        .map_err(|e| format!("Failed to store secure config: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn get_secure_config(key: String) -> Result<String, String> {
    let entry = Entry::new("your-app", &key)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;
    
    let password = entry.get_password()
        .map_err(|e| format!("Failed to retrieve secure config: {}", e))?;
    
    Ok(password)
}

#[tauri::command]
async fn delete_secure_config(key: String) -> Result<(), String> {
    let entry = Entry::new("your-app", &key)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;
    
    entry.delete_password()
        .map_err(|e| format!("Failed to delete secure config: {}", e))?;
    
    Ok(())
}
```

## Network Security

### HTTPS Enforcement

```rust
#[tauri::command]
async fn secure_http_request(url: String) -> Result<String, String> {
    // Enforce HTTPS
    if !url.starts_with("https://") {
        return Err("Only HTTPS URLs are allowed".to_string());
    }
    
    // Validate URL format
    let parsed_url = url::Url::parse(&url)
        .map_err(|_| "Invalid URL format".to_string())?;
    
    // Check against allowed domains
    let allowed_domains = vec![
        "api.example.com",
        "cdn.example.com",
    ];
    
    if !allowed_domains.contains(&parsed_url.host_str().unwrap_or("")) {
        return Err("Domain not allowed".to_string());
    }
    
    // Make secure request
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .user_agent("YourApp/1.0")
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;
    
    let response = client.get(&url).send().await
        .map_err(|e| format!("HTTP request failed: {}", e))?;
    
    let content = response.text().await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    Ok(content)
}
```

### Certificate Validation

```rust
#[tauri::command]
async fn secure_request_with_cert_validation(
    url: String,
    cert_pem: String
) -> Result<String, String> {
    // Load certificate
    let cert = reqwest::Certificate::from_pem(cert_pem.as_bytes())
        .map_err(|e| format!("Failed to load certificate: {}", e))?;
    
    // Create client with certificate validation
    let client = reqwest::Client::builder()
        .add_root_certificate(cert)
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create client: {}", e))?;
    
    let response = client.get(&url).send().await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    let content = response.text().await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    Ok(content)
}
```

## Security Auditing and Monitoring

### Security Event Logging

```rust
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SecurityEvent {
    timestamp: DateTime<Utc>,
    event_type: SecurityEventType,
    source: String,
    details: String,
    severity: SecuritySeverity,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum SecurityEventType {
    UnauthorizedAccess,
    SuspiciousActivity,
    SecurityViolation,
    PermissionDenied,
    RateLimitExceeded,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum SecuritySeverity {
    Low,
    Medium,
    High,
    Critical,
}

struct SecurityLogger {
    events: std::sync::Mutex<Vec<SecurityEvent>>,
}

impl SecurityLogger {
    fn log_event(&self, event: SecurityEvent) {
        let mut events = self.events.lock().unwrap();
        events.push(event);
        
        // Log to file if critical
        if matches!(event.severity, SecuritySeverity::High | SecuritySeverity::Critical) {
            self.log_to_file(&event);
        }
    }
    
    fn log_to_file(&self, event: &SecurityEvent) {
        // Implementation for logging to secure file
    }
}

#[tauri::command]
fn secure_operation(
    param: String,
    security_logger: tauri::State<'_, SecurityLogger>
) -> Result<String, String> {
    // Log access attempt
    security_logger.log_event(SecurityEvent {
        timestamp: Utc::now(),
        event_type: SecurityEventType::UnauthorizedAccess,
        source: "secure_operation".to_string(),
        details: format!("Access attempt with param: {}", param),
        severity: SecuritySeverity::Medium,
    });
    
    // Validate and process
    if param.len() > 1000 {
        security_logger.log_event(SecurityEvent {
            timestamp: Utc::now(),
            event_type: SecurityEventType::SuspiciousActivity,
            source: "secure_operation".to_string(),
            details: "Parameter too long".to_string(),
            severity: SecuritySeverity::High,
        });
        
        return Err("Parameter validation failed".to_string());
    }
    
    Ok("Operation completed successfully".to_string())
}
```

## Security Testing

### Security Test Suite

```rust
#[cfg(test)]
mod security_tests {
    use super::*;
    
    #[tokio::test]
    async fn test_path_traversal_prevention() {
        let malicious_paths = vec![
            "../../../etc/passwd",
            "..\\..\\windows\\system32\\config\\sam",
            "/etc/shadow",
            "C:\\Windows\\System32\\drivers\\etc\\hosts",
        ];
        
        for path in malicious_paths {
            let result = secure_file_operation(path.to_string()).await;
            assert!(result.is_err(), "Should reject path: {}", path);
        }
    }
    
    #[tokio::test]
    async fn test_rate_limiting() {
        // Test rate limiting functionality
        // Implementation depends on your rate limiting strategy
    }
    
    #[tokio::test]
    async fn test_input_validation() {
        let invalid_inputs = vec![
            "<script>alert('xss')</script>",
            "'; DROP TABLE users; --",
            "\x00\x01\x02\x03",
        ];
        
        for input in invalid_inputs {
            let result = validate_input(input).await;
            assert!(result.is_err(), "Should reject invalid input");
        }
    }
}
```

## Security Best Practices

### 1. Principle of Least Privilege
- Only request permissions you absolutely need
- Use scoped permissions whenever possible
- Regularly audit and remove unused permissions

### 2. Input Validation
- Validate all inputs from frontend
- Use allowlists rather than blocklists
- Sanitize data before processing

### 3. Secure Data Handling
- Encrypt sensitive data at rest
- Use secure communication channels
- Implement proper key management

### 4. Error Handling
- Don't expose sensitive information in error messages
- Log security events appropriately
- Implement graceful failure modes

### 5. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Apply security patches promptly

### 6. Code Review
- Review security-related code carefully
- Use static analysis tools
- Conduct security testing

### 7. Configuration Management
- Use secure defaults
- Validate configuration files
- Implement configuration integrity checks

### 8. Monitoring and Auditing
- Log security events
- Monitor for suspicious activity
- Implement alerting for critical events

## Security Checklist

### Development Phase
- [ ] Define minimal required permissions
- [ ] Implement input validation
- [ ] Use secure coding practices
- [ ] Add security tests
- [ ] Review dependencies for vulnerabilities

### Deployment Phase
- [ ] Sign application binaries
- [ ] Configure proper permissions
- [ ] Set up security monitoring
- [ ] Test security configurations
- [ ] Document security procedures

### Maintenance Phase
- [ ] Regular security updates
- [ ] Monitor security advisories
- [ ] Audit security logs
- [ ] Review and update permissions
- [ ] Conduct security assessments

Security is an ongoing process, not a one-time implementation. By following these guidelines and staying vigilant about security best practices, you can build Tauri applications that are both powerful and secure, protecting your users and their data while maintaining the flexibility needed for legitimate use cases.