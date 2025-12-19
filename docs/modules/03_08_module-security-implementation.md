# Security Implementation

Implementing robust security measures is critical when building modular Tauri-Vue applications. This article explores security patterns for protecting module boundaries, validating inter-module communication, and preventing unauthorized access to sensitive functionality.

## Prerequisites

- Understanding of module architecture and communication patterns
- Knowledge of Tauri's security model
- Familiarity with authentication and authorization concepts

## Core Concepts

Module security in Tauri-Vue applications involves multiple layers: module isolation, communication validation, permission management, and access control. The goal is to prevent malicious or buggy modules from compromising the entire application while maintaining functional interoperability.

## Implementation

### Security Context Manager

Create a centralized security context manager:

```rust
// src/modules/security/backend.rs
use tauri::{State, command, generate_handler, Invoke, Runtime};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityContext {
    pub module_id: String,
    pub permissions: Vec<String>,
    pub trusted: bool,
    pub allowed_origins: Vec<String>,
    pub resource_limits: ResourceLimits,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLimits {
    pub memory_mb: u32,
    pub network_requests_per_minute: u32,
    pub file_operations_per_minute: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionCheckRequest {
    pub module_id: String,
    pub resource_type: String,
    pub operation: String,
    pub target: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityAuditLog {
    pub timestamp: u64,
    pub module_id: String,
    pub action: String,
    pub result: String,
    pub details: serde_json::Value,
}

#[derive(Clone)]
pub struct SecurityManager {
    contexts: Arc<RwLock<HashMap<String, SecurityContext>>>,
    audit_logs: Arc<RwLock<Vec<SecurityAuditLog>>>,
}

impl SecurityManager {
    pub fn new() -> Self {
        Self {
            contexts: Arc::new(RwLock::new(HashMap::new())),
            audit_logs: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn register_module(&self, context: SecurityContext) -> Result<(), String> {
        let mut contexts = self.contexts.write().await;
        contexts.insert(context.module_id.clone(), context);
        Ok(())
    }

    pub async fn check_permission(&self, request: &PermissionCheckRequest) -> Result<bool, String> {
        let contexts = self.contexts.read()..await;
        let context = contexts.get(&request.module_id)
            .ok_or("Module context not found")?;

        // Check if module is trusted (has all permissions)
        if context.trusted {
            self.log_audit(request.module_id.clone(), "PERMISSION_GRANTED", "TRUSTED_MODULE", true).await;
            return Ok(true);
        }

        // Check specific permission
        let permission = format!("{}.{}", request.resource_type, request.operation);
        let has_permission = context.permissions.contains(&permission);

        self.log_audit(
            request.module_id.clone(),
            "PERMISSION_CHECK",
            &format!("permission:{}", permission),
            has_permission
        ).await;

        Ok(has_permission)
    }

    async fn log_audit(&self, module_id: String, action: &str, details: &str, success: bool) {
        let mut logs = self.audit_logs.write().await;
        logs.push(SecurityAuditLog {
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            module_id,
            action: action.to_string(),
            result: if success { "SUCCESS".to_string() } else { "FAILURE".to_string() },
            details: serde_json::json!({ "details": details }),
        });
    }

    pub async fn get_recent_audits(&self, limit: usize) -> Vec<SecurityAuditLog> {
        let logs = self.audit_logs.read().await;
        logs.iter()
            .rev()
            .take(limit)
            .cloned()
            .collect()
    }
}

#[command]
pub async fn check_module_permission(
    state: State<'_, SecurityManager>,
    request: PermissionCheckRequest,
) -> Result<bool, String> {
    state.check_permission(&request).await
}

#[command]
pub async fn register_security_context(
    state: State<'_, SecurityManager>,
    context: SecurityContext,
) -> Result<(), String> {
    state.register_module(context).await
}
```

### Permission Validation System

Create a comprehensive permission validation system:

```rust
// src/modules/security/permission_system.rs
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Permission {
    NetworkAccess,
    FileRead,
    FileWrite,
    SystemCommand,
    ClipboardRead,
    ClipboardWrite,
    Notification,
    Camera,
    Microphone,
    Location,
    DatabaseRead,
    DatabaseWrite,
    ModuleCommunication(String), // Parameterized permission
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionGrant {
    pub permission: Permission,
    pub granted: bool,
    pub reason: String,
    pub granted_at: u64,
    pub expires_at: Option<u64>,
    pub conditions: Vec<PermissionCondition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PermissionCondition {
    TimeBased { start: u64, end: u64 },
    ContextBased { allowed_modules: Vec<String> },
    ResourceBased { max_size_kb: u32, rate_limit: u32 },
}

pub struct PermissionValidator {
    grants: Arc<RwLock<HashMap<String, Vec<PermissionGrant>>>>,
}

impl PermissionValidator {
    pub fn new() -> Self {
        Self {
            grants: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn grant_permission(
        &self,
        module_id: &str,
        permission: Permission,
        reason: &str,
    ) -> Result<(), String> {
        let mut grants_map = self.grants.write().await;
        let grants = grants_map.entry(module_id.to_string()).or_insert_with(Vec::new);

        let grant = PermissionGrant {
            permission,
            granted: true,
            reason: reason.to_string(),
            granted_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            expires_at: None,
            conditions: vec![],
        };

        grants.push(grant);
        Ok(())
    }

    pub async fn check_permission(
        &self,
        module_id: &str,
        permission: &Permission,
    ) -> Result<bool, String> {
        let grants_map = self.grants.read().await;
        let grants = grants_map.get(module_id).ok_or("Module not found")?;

        for grant in grants.iter().rev() {
            if &grant.permission == permission && grant.granted {
                // Check if grant has expired
                if let Some(expires_at) = grant.expires_at {
                    let now = std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap()
                        .as_secs();
                    
                    if now > expires_at {
                        continue; // Grant expired
                    }
                }

                // Check conditions
                if self.check_conditions(module_id, permission, &grant.conditions).await {
                    return Ok(true);
                }
            }
        }

        Ok(false)
    }

    async fn check_conditions(
        &self,
        module_id: &str,
        permission: &Permission,
        conditions: &[PermissionCondition],
    ) -> bool {
        for condition in conditions {
            match condition {
                PermissionCondition::TimeBased { start, end } => {
                    let now = std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap()
                        .as_secs();
                    
                    if now < *start || now > *end {
                        return false;
                    }
                },
                PermissionCondition::ContextBased { allowed_modules } => {
                    // Check if the operation is within allowed modules context
                },
                PermissionCondition::ResourceBased { max_size_kb: _, rate_limit: _ } => {
                    // Check resource usage limits
                }
            }
        }
        true
    }

    pub async fn revoke_permission(
        &self,
        module_id: &str,
        permission: &Permission,
    ) -> Result<(), String> {
        let mut grants_map = self.grants.write().await;
        let grants = grants_map.get_mut(module_id).ok_or("Module not found")?;

        for grant in grants.iter_mut() {
            if &grant.permission == permission {
                grant.granted = false;
            }
        }

        Ok(())
    }
}

// Usage example
pub async fn validate_module_operation(
    validator: &PermissionValidator,
    module_id: &str,
    operation: &str,
) -> Result<bool, String> {
    let permission = match operation {
        "network_request" => Permission::NetworkAccess,
        "read_file" => Permission::FileRead,
        "write_file" => Permission::FileWrite,
        "execute_command" => Permission::SystemCommand,
        "read_clipboard" => Permission::ClipboardRead,
        "write_clipboard" => Permission::ClipboardWrite,
        "show_notification" => Permission::Notification,
        "access_camera" => Permission::Camera,
        "access_microphone" => Permission::Microphone,
        "access_location" => Permission::Location,
        "db_read" => Permission::DatabaseRead,
        "db_write" => Permission::DatabaseWrite,
        other => Permission::ModuleCommunication(other.to_string()),
    };

    validator.check_permission(module_id, &permission).await
}
```

### Content Security Policy Enforcement

Implement content security policy enforcement for frontend modules:

```typescript
// src/modules/security/frontend.ts
import { SecurityManager } from './backend';

export interface CSPRule {
  type: 'script-src' | 'style-src' | 'img-src' | 'font-src' | 'connect-src' | 'frame-src';
  sources: string[];
  strict?: boolean;
}

export interface SecurityPolicy {
  csp: CSPRule[];
  allowedDomains: string[];
  allowedProtocols: string[];
  inputValidation: boolean;
  outputSanitization: boolean;
}

export class FrontendSecurityManager {
  private policies = new Map<string, SecurityPolicy>();
  private activeModule: string | null = null;

  /**
   * Register a security policy for a module
   */
  registerPolicy(moduleId: string, policy: SecurityPolicy): void {
    this.policies.set(moduleId, policy);
    
    // Apply CSP if in browser context
    if (typeof document !== 'undefined') {
      this.applyCSP(moduleId);
    }
  }

  /**
   * Apply Content Security Policy for a module
   */
  private applyCSP(moduleId: string): void {
    const policy = this.policies.get(moduleId);
    if (!policy) return;

    // Remove existing CSP meta tags
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) {
      existingCSP.remove();
    }

    // Build CSP string
    const cspDirectives = policy.csp.map(rule => {
      return `${rule.type} ${rule.sources.join(' ')}`;
    }).join('; ');

    // Add CSP meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = cspDirectives;
    document.head.appendChild(meta);
  }

  /**
   * Validate a URL against security policies
   */
  validateUrl(url: string, moduleId: string): boolean {
    const policy = this.policies.get(moduleId);
    if (!policy) return false;

    try {
      const parsedUrl = new URL(url);
      
      // Check protocol
      if (!policy.allowedProtocols.includes(parsedUrl.protocol)) {
        console.warn(`Blocked ${parsedUrl.protocol} protocol for ${moduleId}`);
        return false;
      }

      // Check domain
      if (parsedUrl.protocol !== 'data:' && parsedUrl.protocol !== 'blob:') {
        const allowed = policy.allowedDomains.some(domain => 
          parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
        );

        if (!allowed) {
          console.warn(`Blocked domain ${parsedUrl.hostname} for ${moduleId}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Invalid URL:', error);
      return false;
    }
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHTML(content: string, moduleId: string): string {
    // Only sanitize if input validation is enabled
    const policy = this.policies.get(moduleId);
    if (!policy?.inputValidation) return content;

    // Basic HTML sanitization
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object\b[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/javascript:/gi, 'javascript-stripped:')
      .replace(/data:/gi, 'data-stripped:');
  }

  /**
   * Validate and sanitize input data
   */
  validateInput(data: any, moduleId: string): any {
    const policy = this.policies.get(moduleId);
    if (!policy?.inputValidation) return data;

    // Deep clone to prevent mutation
    const sanitized = this.deepClone(data);
    
    if (typeof sanitized === 'string') {
      return this.sanitizeHTML(sanitized, moduleId);
    } else if (typeof sanitized === 'object' && sanitized !== null) {
      return this.sanitizeObject(sanitized, moduleId);
    }

    return sanitized;
  }

  private sanitizeObject(obj: any, moduleId: string): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.validateInput(item, moduleId));
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip dangerous properties
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      result[key] = this.validateInput(value, moduleId);
    }

    return result;
  }

  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item));
    }

    if (typeof obj === 'object') {
      const cloned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  }

  /**
   * Set the active module context for security checks
   */
  setActiveModule(moduleId: string): void {
    this.activeModule = moduleId;
  }

  /**
   * Get the current active module
   */
  getActiveModule(): string | null {
    return this.activeModule;
  }
}

// Create and export singleton instance
export const frontendSecurityManager = new FrontendSecurityManager();
```

### Module Isolation System

Create a system to isolate modules from each other:

```typescript
// src/modules/security/isolation.ts
export interface IsolationConfig {
  enableSandbox: boolean;
  allowedGlobals: string[];
  blockedMethods: string[];
  timeoutMs: number;
}

export class ModuleIsolation {
  private config: IsolationConfig;

  constructor(config: Partial<IsolationConfig> = {}) {
    this.config = {
      enableSandbox: true,
      allowedGlobals: ['console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'Date'],
      blockedMethods: ['eval', 'Function', 'setTimeout', 'setInterval', 'setImmediate'],
      timeoutMs: 5000,
      ...config
    };
  }

  /**
   * Execute code in a restricted environment
   */
  async executeRestricted(code: string, context: any = {}): Promise<any> {
    if (!this.config.enableSandbox) {
      // In production, always enable sandbox
      return eval(code); // NOSONAR - This is a simplified example; never use eval in production
    }

    // Validate code for dangerous patterns
    if (this.containsDangerousCode(code)) {
      throw new Error('Code contains dangerous patterns');
    }

    // Create a restricted execution environment
    const restrictedContext = this.createRestrictedContext(context);

    // In a real implementation, you'd use proper sandboxing like:
    // - Web Workers
    // - iframe sandboxing  
    // - VM2 library for Node.js
    // - Custom JavaScript evaluation engine

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        reject(new Error('Module execution timeout'));
      }, this.config.timeoutMs);

      try {
        // This is a simplified example - in production use proper sandboxing
        const result = this.safeEval(code, restrictedContext);
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  private containsDangerousCode(code: string): boolean {
    for (const method of this.config.blockedMethods) {
      if (new RegExp(`\\b${method}\\b`).test(code)) {
        return true;
      }
    }
    return false;
  }

  private createRestrictedContext(baseContext: any): any {
    // Start with allowed globals
    const restrictedContext: any = {};
    
    for (const globalName of this.config.allowedGlobals) {
      if (typeof (window as any)[globalName] !== 'undefined') {
        restrictedContext[globalName] = (window as any)[globalName];
      }
    }

    // Add provided context
    Object.assign(restrictedContext, baseContext);

    // Block dangerous properties
    Object.defineProperty(restrictedContext, 'eval', {
      value: undefined,
      writable: false,
      configurable: false,
    });

    return restrictedContext;
  }

  private safeEval(code: string, context: any): any {
    // This is a simplified example - for production, use proper sandboxing
    // such as VM2 in Node.js or iframe sandboxing in browsers
    
    // Create a function with the restricted context
    const func = new Function(
      ...Object.keys(context),
      `"use strict"; ${code}; return module.exports || exports;`
    );

    return func(...Object.values(context));
  }

  /**
   * Validate module dependencies
   */
  validateDependencies(dependencies: string[]): boolean {
    // In a real implementation, validate that dependencies are from trusted sources
    for (const dep of dependencies) {
      if (this.isDangerousDependency(dep)) {
        return false;
      }
    }
    return true;
  }

  private isDangerousDependency(dep: string): boolean {
    // Check for known dangerous packages or patterns
    const dangerousPatterns = [
      /exec/, /spawn/, /child_process/, /fs/, /require/, /import/
    ];

    return dangerousPatterns.some(pattern => pattern.test(dep));
  }
}

// Create and export singleton instance
export const moduleIsolation = new ModuleIsolation();
```

## Advanced Patterns

### Security Policy Inheritance

Implement security policy inheritance for module hierarchies:

```typescript
// src/modules/security/policyInheritance.ts
import { SecurityPolicy } from './frontend';

export interface HierarchicalSecurityPolicy extends SecurityPolicy {
  parent?: string;
  children?: string[];
  inheritanceMode: 'strict' | 'permissive' | 'custom';
}

export class SecurityPolicyInheritance {
  private policies = new Map<string, HierarchicalSecurityPolicy>();

  registerPolicy(moduleId: string, policy: HierarchicalSecurityPolicy): void {
    this.policies.set(moduleId, policy);
  }

  getEffectivePolicy(moduleId: string): SecurityPolicy {
    const policy = this.policies.get(moduleId);
    if (!policy) {
      // Return default policy
      return this.getDefaultPolicy();
    }

    if (!policy.parent) {
      // No parent, return as-is
      return policy;
    }

    const parentPolicy = this.getEffectivePolicy(policy.parent);
    
    switch (policy.inheritanceMode) {
      case 'strict':
        // Child policy is intersection of parent and child
        return this.intersectPolicies(parentPolicy, policy);
      case 'permissive':
        // Child policy is union of parent and child
        return this.unionPolicies(parentPolicy, policy);
      case 'custom':
        // Apply custom inheritance logic
        return this.customInheritance(parentPolicy, policy);
      default:
        return policy;
    }
  }

  private intersectPolicies(parent: SecurityPolicy, child: HierarchicalSecurityPolicy): SecurityPolicy {
    return {
      ...child,
      allowedDomains: parent.allowedDomains.filter(domain => child.allowedDomains.includes(domain)),
      allowedProtocols: parent.allowedProtocols.filter(proto => child.allowedProtocols.includes(proto)),
      csp: this.intersectCSP(parent.csp, child.csp),
      inputValidation: parent.inputValidation && child.inputValidation,
      outputSanitization: parent.outputSanitization && child.outputSanitization
    };
  }

  private unionPolicies(parent: SecurityPolicy, child: HierarchicalSecurityPolicy): SecurityPolicy {
    return {
      ...child,
      allowedDomains: [...new Set([...parent.allowedDomains, ...child.allowedDomains])],
      allowedProtocols: [...new Set([...parent.allowedProtocols, ...child.allowedProtocols])],
      csp: this.unionCSP(parent.csp, child.csp),
      inputValidation: parent.inputValidation || child.inputValidation,
      outputSanitization: parent.outputSanitization || child.outputSanitization
    };
  }

  private customInheritance(parent: SecurityPolicy, child: HierarchicalSecurityPolicy): SecurityPolicy {
    // Custom inheritance logic can be implemented here
    return {
      ...child,
      allowedDomains: child.allowedDomains,
      allowedProtocols: child.allowedProtocols,
      csp: child.csp,
      inputValidation: child.inputValidation,
      outputSanitization: child.outputSanitization
    };
  }

  private intersectCSP(parent: any[], child: any[]): any[] {
    // Implement CSP intersection logic
    return child; // Simplified for example
  }

  private unionCSP(parent: any[], child: any[]): any[] {
    // Implement CSP union logic
    return [...parent, ...child]; // Simplified for example
  }

  private getDefaultPolicy(): SecurityPolicy {
    return {
      csp: [
        { type: 'default-src', sources: ["'self'"] },
        { type: 'script-src', sources: ["'self'"] },
        { type: 'style-src', sources: ["'self'", "'unsafe-inline'"] },
        { type: 'img-src', sources: ["'self'", 'data:', 'https:'] },
        { type: 'font-src', sources: ["'self'", 'data:', 'https:'] },
        { type: 'connect-src', sources: ["'self'", 'https:'] }
      ],
      allowedDomains: [window.location.hostname],
      allowedProtocols: ['https:', 'http:', 'data:', 'blob:'],
      inputValidation: true,
      outputSanitization: true
    };
  }
}

export const securityPolicyInheritance = new SecurityPolicyInheritance();
```

### Audit and Monitoring System

Create a system for security auditing and monitoring:

```typescript
// src/modules/security/audit.ts
export interface SecurityEvent {
  id: string;
  timestamp: number;
  module: string;
  action: string;
  result: 'success' | 'failure' | 'blocked';
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditConfig {
  enabled: boolean;
  logLevel: 'all' | 'warning' | 'error' | 'critical';
  retentionDays: number;
  maxEvents: number;
}

export class SecurityAuditManager {
  private events: SecurityEvent[] = [];
  private config: AuditConfig;
  private eventCallbacks: Array<(event: SecurityEvent) => void> = [];

  constructor(config?: Partial<AuditConfig>) {
    this.config = {
      enabled: true,
      logLevel: 'warning',
      retentionDays: 30,
      maxEvents: 1000,
      ...config
    };
  }

  /**
   * Log a security event
   */
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    if (!this.config.enabled) return;

    // Check log level
    if (this.shouldLog(event.severity)) {
      const securityEvent: SecurityEvent = {
        ...event,
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      };

      this.events.push(securityEvent);

      // Notify callbacks
      this.eventCallbacks.forEach(callback => callback(securityEvent));

      // Cleanup old events
      this.cleanupOldEvents();

      // Truncate if too many events
      if (this.events.length > this.config.maxEvents) {
        this.events = this.events.slice(-this.config.maxEvents);
      }
    }
  }

  /**
   * Subscribe to security events
   */
  subscribe(callback: (event: SecurityEvent) => void): () => void {
    this.eventCallbacks.push(callback);

    return () => {
      const index = this.eventCallbacks.indexOf(callback);
      if (index > -1) {
        this.eventCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get security events with optional filtering
   */
  getEvents(filter: {
    module?: string;
    action?: string;
    severity?: string;
    from?: number;
    to?: number;
  } = {}): SecurityEvent[] {
    return this.events.filter(event => {
      if (filter.module && event.module !== filter.module) return false;
      if (filter.action && event.action !== filter.action) return false;
      if (filter.severity && event.severity !== filter.severity) return false;
      if (filter.from && event.timestamp < filter.from) return false;
      if (filter.to && event.timestamp > filter.to) return false;
      return true;
    });
  }

  /**
   * Get security statistics
   */
  getStats(): {
    totalEvents: number;
    bySeverity: Record<string, number>;
    byModule: Record<string, number>;
    recentEvents: SecurityEvent[];
  } {
    const stats = {
      totalEvents: this.events.length,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 } as Record<string, number>,
      byModule: {} as Record<string, number>,
      recentEvents: this.events.slice(-10)
    };

    for (const event of this.events) {
      stats.bySeverity[event.severity]++;
      stats.byModule[event.module] = (stats.byModule[event.module] || 0) + 1;
    }

    return stats;
  }

  private shouldLog(severity: string): boolean {
    switch (this.config.logLevel) {
      case 'all': return true;
      case 'warning': return ['medium', 'high', 'critical'].includes(severity);
      case 'error': return ['high', 'critical'].includes(severity);
      case 'critical': return severity === 'critical';
      default: return false;
    }
  }

  private cleanupOldEvents(): void {
    const cutoff = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp >= cutoff);
  }
}

export const securityAuditManager = new SecurityAuditManager();
```

## Testing

Test the security implementations:

```typescript
// src/__tests__/security.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  FrontendSecurityManager, 
  frontendSecurityManager 
} from '../modules/security/frontend';
import { ModuleIsolation, moduleIsolation } from '../modules/security/isolation';
import { securityAuditManager } from '../modules/security/audit';

describe('Frontend Security Manager', () => {
  let securityManager: FrontendSecurityManager;

  beforeEach(() => {
    securityManager = new FrontendSecurityManager();
  });

  it('should validate URLs correctly', () => {
    const policy = {
      csp: [],
      allowedDomains: ['example.com', 'api.example.com'],
      allowedProtocols: ['https:', 'http:'],
      inputValidation: true,
      outputSanitization: true
    };

    securityManager.registerPolicy('test-module', policy);

    expect(securityManager.validateUrl('https://example.com/data', 'test-module')).toBe(true);
    expect(securityManager.validateUrl('https://malicious.com/data', 'test-module')).toBe(false);
    expect(securityManager.validateUrl('ftp://example.com/data', 'test-module')).toBe(false);
  });

  it('should sanitize HTML content', () => {
    const input = '<script>alert("xss")</script><p>Safe content</p>';
    const sanitized = securityManager.sanitizeHTML(input, 'test-module');
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<p>Safe content</p>');
  });

  it('should validate input data', () => {
    const input = {
      name: 'Test User',
      script: '<script>malicious</script>',
      nested: {
        value: '<img src=x onerror=alert(1)>'
      }
    };

    const validated = securityManager.validateInput(input, 'test-module');
    
    expect((validated as any).script).not.toContain('<script>');
    expect((validated as any).nested.value).not.toContain('onerror');
  });
});

describe('Module Isolation', () => {
  it('should detect dangerous code', () => {
    const isolation = new ModuleIsolation();
    
    expect(isolation.containsDangerousCode('eval("code")')).toBe(true);
    expect(isolation.containsDangerousCode('const x = 5;')).toBe(false);
  });

  it('should validate dependencies', () => {
    const isolation = new ModuleIsolation();
    
    expect(isolation.validateDependencies(['safe-package'])).toBe(true);
    expect(isolation.validateDependencies(['child_process'])).toBe(false);
  });
});

describe('Security Audit Manager', () => {
  it('should log and retrieve events', () => {
    const auditManager = new SecurityAuditManager();
    
    auditManager.logEvent({
      module: 'auth-module',
      action: 'login-attempt',
      result: 'failure',
      details: { user: 'test', reason: 'invalid-credentials' },
      severity: 'medium'
    });

    const events = auditManager.getEvents({ module: 'auth-module' });
    expect(events).toHaveLength(1);
    expect(events[0].module).toBe('auth-module');
    expect(events[0].action).toBe('login-attempt');
  });

  it('should filter events by severity', () => {
    const auditManager = new SecurityAuditManager({ logLevel: 'error' });
    
    auditManager.logEvent({
      module: 'test',
      action: 'test',
      result: 'failure',
      details: {},
      severity: 'high'
    });

    const stats = auditManager.getStats();
    expect(stats.bySeverity.high).toBe(1);
  });
});

// Rust tests would be in the .rs files with #[cfg(test)] blocks
// These would test the backend security manager functionality
```

## Troubleshooting

Common security challenges and solutions:

- **False Positives**: Fine-tune security policies to avoid blocking legitimate operations
- **Performance Impact**: Optimize security checks to minimize performance overhead
- **Maintainability**: Keep security policies manageable and well-documented
- **Evasion Techniques**: Regularly update security measures to address new attack vectors
- **Audit Trail**: Maintain comprehensive logs for security analysis and compliance

## Summary

Module security implementation is crucial for protecting Tauri-Vue applications from various security threats. By implementing proper isolation, permission management, validation, and auditing, you can create secure applications that maintain functionality while protecting sensitive operations and data. The key is balancing security with usability and performance.

Continue exploring related topics in our guide to [Performance](./03_09_module-performance.md) to learn how to optimize your modules for better performance while maintaining security.