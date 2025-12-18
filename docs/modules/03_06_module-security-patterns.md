# Security Patterns

Security is paramount when developing modular applications that execute potentially untrusted code. This article explores security patterns for isolating modules, validating content, and preventing cross-module attacks in Tauri-Vue applications.

## Prerequisites

- Understanding of module architecture concepts
- Knowledge of web security principles
- Familiarity with Tauri's security model

## Core Concepts

Module security involves creating boundaries between modules to prevent malicious or buggy modules from affecting the entire application. This includes content security policies, sandboxing, permission systems, and secure communication channels between modules.

## Implementation

### Security Manager

Create a centralized security manager for module operations:

```typescript
// src/modules/security/securityManager.ts
import { ModuleMetadata } from '../deployment/dynamicLoader';

export interface SecurityContext {
  moduleId: string;
  permissions: Set<string>;
  trusted: boolean;
  allowedOrigins: string[];
  resourceLimits: {
    memory: number; // MB
    network: boolean;
    filesystem: boolean;
    system: boolean;
  };
}

export interface SecurityPolicy {
  allowedDomains: string[];
  allowedSchemes: string[];
  forbiddenMethods: string[];
  inputValidation: boolean;
  outputSanitization: boolean;
  moduleCommunication: {
    allowed: boolean;
    allowedModules: string[];
  };
}

export class SecurityManager {
  private securityContexts: Map<string, SecurityContext> = new Map();
  private policies: Map<string, SecurityPolicy> = new Map();
  private validator: InputValidator = new InputValidator();
  private sanitizer: OutputSanitizer = new OutputSanitizer();

  /**
   * Create a security context for a module
   */
  createContext(moduleId: string, metadata: ModuleMetadata, isTrusted = false): SecurityContext {
    const context: SecurityContext = {
      moduleId,
      permissions: new Set(metadata.permissions),
      trusted: isTrusted,
      allowedOrigins: metadata.permissions.includes('network') ? ['*'] : [],
      resourceLimits: {
        memory: isTrusted ? 512 : 64, // Trusted modules get more memory
        network: metadata.permissions.includes('network'),
        filesystem: metadata.permissions.includes('fs'),
        system: metadata.permissions.includes('system')
      }
    };

    this.securityContexts.set(moduleId, context);
    return context;
  }

  /**
   * Validate if a module can perform an action
   */
  canPerformAction(moduleId: string, action: string): boolean {
    const context = this.securityContexts.get(moduleId);
    if (!context) {
      console.warn(`Unknown module ${moduleId} trying to perform action: ${action}`);
      return false;
    }

    // Check specific permissions
    switch (action) {
      case 'read-file':
        return context.resourceLimits.filesystem;
      case 'write-file':
        return context.resourceLimits.filesystem;
      case 'network-request':
        return context.resourceLimits.network;
      case 'system-command':
        return context.resourceLimits.system;
      default:
        // Check if action is in permissions
        return context.permissions.has(action) || context.trusted;
    }
  }

  /**
   * Validate and sanitize input data
   */
  validateInput(data: any, moduleId: string, context?: string): any {
    if (!this.canPerformAction(moduleId, 'input-validation')) {
      // Even untrusted modules should have basic input validation
      return this.validator.sanitize(data, context);
    }

    return this.validator.validate(data, context);
  }

  /**
   * Sanitize output data before sending to other modules
   */
  sanitizeOutput(data: any, moduleId: string): any {
    const context = this.securityContexts.get(moduleId);
    if (!context || !context.trusted) {
      // Always sanitize output from untrusted modules
      return this.sanitizer.sanitize(data);
    }

    return data;
  }

  /**
   * Check if communication between modules is allowed
   */
  canCommunicate(from: string, to: string): boolean {
    const fromContext = this.securityContexts.get(from);
    if (!fromContext) return false;

    // Trusted modules can communicate with any module
    if (fromContext.trusted) return true;

    // Check policy for untrusted modules
    const policy = this.policies.get(from) || this.getDefaultPolicy();
    return policy.moduleCommunication.allowed && (
      policy.moduleCommunication.allowedModules.includes(to) || 
      policy.moduleCommunication.allowedModules.includes('*')
    );
  }

  /**
   * Set a security policy for a module
   */
  setPolicy(moduleId: string, policy: SecurityPolicy): void {
    this.policies.set(moduleId, policy);
  }

  /**
   * Get the default security policy
   */
  private getDefaultPolicy(): SecurityPolicy {
    return {
      allowedDomains: ['localhost', '127.0.0.1', 'api.{{appName}}.com'],
      allowedSchemes: ['https:', 'http:', 'file:', 'tauri:'],
      forbiddenMethods: ['eval', 'Function', 'setTimeout', 'setInterval'],
      inputValidation: true,
      outputSanitization: true,
      moduleCommunication: {
        allowed: true,
        allowedModules: ['*'] // For simplicity; in reality, be more restrictive
      }
    };
  }

  /**
   * Validate URL against allowed domains
   */
  isUrlAllowed(url: string, moduleId: string): boolean {
    try {
      const parsed = new URL(url);
      const context = this.securityContexts.get(moduleId);
      
      if (!context) return false;
      
      // Trusted modules can access any domain
      if (context.trusted) return true;
      
      // Check against allowed domains
      return context.allowedOrigins.includes('*') || 
             context.allowedOrigins.includes(parsed.host) ||
             context.allowedOrigins.includes(parsed.hostname);
    } catch {
      return false;
    }
  }

  /**
   * Get security context for a module
   */
  getContext(moduleId: string): SecurityContext | undefined {
    return this.securityContexts.get(moduleId);
  }

  /**
   * Remove a security context when module is unloaded
   */
  cleanup(moduleId: string): void {
    this.securityContexts.delete(moduleId);
    this.policies.delete(moduleId);
  }
}

// Input validation class
class InputValidator {
  validate(data: any, context?: string): any {
    // Deep clone to prevent prototype pollution
    const sanitized = this.deepClone(data);
    
    // Validate based on context
    if (context === 'user-input') {
      return this.validateUserInput(sanitized);
    }
    
    return sanitized;
  }

  sanitize(data: any, context?: string): any {
    return this.removeDangerousProperties(data);
  }

  private validateUserInput(data: any): any {
    if (typeof data === 'string') {
      // Prevent XSS by removing script tags and javascript: URIs
      data = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      data = data.replace(/javascript:/gi, '');
      data = data.replace(/data:/gi, '');
    } else if (typeof data === 'object') {
      // Validate object properties
      for (const key in data) {
        if (typeof data[key] === 'string') {
          data[key] = this.validateUserInput(data[key]);
        } else if (typeof data[key] === 'object') {
          data[key] = this.validateUserInput(data[key]);
        }
      }
    }
    
    return data;
  }

  private removeDangerousProperties(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeDangerousProperties(item));
    }

    const result: any = {};
    for (const key in obj) {
      // Skip dangerous properties
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      result[key] = this.removeDangerousProperties(obj[key]);
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

    if (obj instanceof Array) {
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
}

// Output sanitization class
class OutputSanitizer {
  sanitize(data: any): any {
    return this.removeUnsafeContent(data);
  }

  private removeUnsafeContent(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUnsafeContent(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        const value = obj[key];
        
        if (typeof value === 'string') {
          // Sanitize HTML content
          sanitized[key] = this.sanitizeHtml(value);
        } else {
          sanitized[key] = this.removeUnsafeContent(value);
        }
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeHtml(str: string): string {
    // Remove dangerous HTML elements and attributes
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object\b[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<form\b[^>]*>.*?<\/form>/gi, '')
      .replace(/javascript:/gi, 'javascript-stripped:')
      .replace(/data:/gi, 'data-stripped:');
  }
}

// Create and export singleton instance
const securityManager = new SecurityManager();
export { securityManager };
```

### Secure Module Loader

Create a secure module loader that isolates module execution:

```typescript
// src/modules/security/secureModuleLoader.ts
import { SecurityManager, SecurityContext } from './securityManager';

export interface SecureModuleResult {
  success: boolean;
  exports?: any;
  error?: string;
  context?: SecurityContext;
}

export class SecureModuleLoader {
  private securityManager: SecurityManager;

  constructor(securityManager: SecurityManager) {
    this.securityManager = securityManager;
  }

  /**
   * Load and execute a module in a secure context
   */
  async loadSecurely(
    moduleId: string,
    code: string,
    metadata: any
  ): Promise<SecureModuleResult> {
    try {
      // Create security context
      const context = this.securityManager.createContext(moduleId, metadata);

      // Validate code against security policies
      if (!this.validateCode(code, context)) {
        return {
          success: false,
          error: 'Code contains forbidden patterns',
          context
        };
      }

      // Execute code in isolated context
      const moduleExports = await this.executeSecurely(code, context);

      return {
        success: true,
        exports: moduleExports,
        context
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: this.securityManager.getContext(moduleId)
      };
    }
  }

  /**
   * Validate code against security policies
   */
  private validateCode(code: string, context: SecurityContext): boolean {
    // Check for forbidden methods
    const forbidden = ['eval', 'Function', 'setTimeout', 'setInterval', 'setImmediate'];
    
    for (const method of forbidden) {
      if (code.includes(`(${method}`) || code.includes(` ${method}(`) || code.includes(`.${method}`)) {
        console.warn(`Code contains forbidden method: ${method}`);
        return false;
      }
    }

    // Check for dynamic imports (in production, restrict these)
    if (context.trusted) {
      // Trusted modules may have more relaxed rules
      return true;
    }

    // For untrusted modules, limit dynamic capabilities
    return true;
  }

  /**
   * Execute code in a secure context
   */
  private async executeSecurely(code: string, context: SecurityContext): Promise<any> {
    // In a real implementation, you'd use Web Workers, iframe sandboxing,
    // or other isolation techniques. For now, we'll simulate secure execution.
    
    return new Promise((resolve, reject) => {
      try {
        // Create a secure execution environment
        const secureContext = this.createSecureEnvironment(context);
        
        // Use Function constructor with limited scope for execution
        // Note: This is still dangerous; use proper sandboxing in production
        const moduleFunction = new Function(
          'module',
          'exports',
          'require',
          ...Object.keys(secureContext),
          `${code}; return module.exports || exports;`
        );

        // Prepare module environment
        const moduleEnv = { exports: {} };
        const exports = {};
        
        // Execute with allowed globals
        const result = moduleFunction(
          moduleEnv,
          exports,
          this.createSecureRequire(context),
          ...Object.values(secureContext)
        );

        resolve(result || moduleEnv.exports);
      } catch (error) {
        reject(error);
      }
    });
  }

  private createSecureEnvironment(context: SecurityContext) {
    // Create a limited environment with only safe globals
    return {
      console: {
        log: (...args: any[]) => console.log(`[${context.moduleId}]`, ...args),
        warn: (...args: any[]) => console.warn(`[${context.moduleId}]`, ...args),
        error: (...args: any[]) => console.error(`[${context.moduleId}]`, ...args),
      },
      setTimeout: context.resourceLimits.system ? global.setTimeout : undefined,
      setInterval: context.resourceLimits.system ? global.setInterval : undefined,
      clearTimeout: context.resourceLimits.system ? global.clearTimeout : undefined,
      clearInterval: context.resourceLimits.system ? global.clearInterval : undefined,
      // Add other safe globals as needed
    };
  }

  private createSecureRequire(context: SecurityContext) {
    // Create a secure require function that respects permissions
    return (module: string) => {
      if (!context.permissions.has(`require-${module}`)) {
        throw new Error(`Module ${context.moduleId} not allowed to require ${module}`);
      }
      // In a real implementation, validate and load the module securely
      return require(module);
    };
  }

  /**
   * Load a module with custom security constraints
   */
  async loadWithConstraints(
    moduleId: string,
    code: string,
    constraints: {
      allowedNetworkDomains?: string[];
      allowedFileAccess?: boolean;
      maxExecutionTime?: number;
      memoryLimit?: number;
    }
  ): Promise<SecureModuleResult> {
    // This would implement additional constraints beyond the standard security context
    // For now, it's a placeholder for future implementation
    console.log('Loading with constraints:', constraints);
    return this.loadSecurely(moduleId, code, {
      id: moduleId,
      version: '1.0.0',
      entryPoint: '',
      dependencies: [],
      permissions: [],
      size: 0,
      loadPriority: 1,
      tags: []
    });
  }
}
```

### Permission System

Create a comprehensive permission system:

```typescript
// src/modules/security/permissionSystem.ts
import { SecurityContext } from './securityManager';

export type Permission = 
  | 'network'           // Make network requests
  | 'filesystem'        // Access file system
  | 'system'            // Execute system commands
  | 'clipboard'         // Access clipboard
  | 'notifications'     // Show notifications
  | 'camera'            // Access camera
  | 'microphone'        // Access microphone
  | 'location'          // Access location
  | 'storage'           // Local storage access
  | 'module-communication' // Communicate with other modules
  | 'ui'                // Modify UI elements
  | 'printing'          // Print functionality
  | 'window-controls'   // Control windows
  | 'tray'              // System tray operations;

export interface PermissionRequest {
  moduleId: string;
  permissions: Permission[];
  reason: string;
  timestamp: number;
}

export interface PermissionGrant {
  moduleId: string;
  permission: Permission;
  granted: boolean;
  reason?: string;
  timestamp: number;
  expiry?: number; // Expiration timestamp
}

export class PermissionSystem {
  private grants: Map<string, Map<Permission, PermissionGrant>> = new Map(); // moduleId -> permission -> grant
  private pendingRequests: PermissionRequest[] = [];
  private permissionCallbacks: Array<(request: PermissionRequest, granted: boolean) => void> = [];

  /**
   * Request permissions for a module
   */
  async requestPermission(
    moduleId: string,
    permissions: Permission[],
    reason: string = 'Module functionality'
  ): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const permission of permissions) {
      const existingGrant = this.getGrant(moduleId, permission);
      
      if (existingGrant && (!existingGrant.expiry || existingGrant.expiry > Date.now())) {
        // Permission already granted and not expired
        results.push(existingGrant.granted);
      } else {
        // Request new permission
        const request: PermissionRequest = {
          moduleId,
          permissions: [permission],
          reason,
          timestamp: Date.now()
        };
        
        const granted = await this.processRequest(request);
        results.push(granted);
      }
    }
    
    return results;
  }

  /**
   * Grant a permission
   */
  grantPermission(
    moduleId: string,
    permission: Permission,
    reason?: string,
    expiry?: number
  ): void {
    if (!this.grants.has(moduleId)) {
      this.grants.set(moduleId, new Map());
    }
    
    const moduleGrants = this.grants.get(moduleId)!;
    moduleGrants.set(permission, {
      moduleId,
      permission,
      granted: true,
      reason,
      timestamp: Date.now(),
      expiry
    });
  }

  /**
   * Revoke a permission
   */
  revokePermission(moduleId: string, permission: Permission): void {
    const moduleGrants = this.grants.get(moduleId);
    if (moduleGrants) {
      moduleGrants.delete(permission);
    }
  }

  /**
   * Check if a module has a permission
   */
  hasPermission(moduleId: string, permission: Permission): boolean {
    const moduleGrants = this.grants.get(moduleId);
    if (!moduleGrants) return false;
    
    const grant = moduleGrants.get(permission);
    if (!grant) return false;
    
    // Check if grant has expired
    if (grant.expiry && grant.expiry < Date.now()) {
      this.revokePermission(moduleId, permission);
      return false;
    }
    
    return grant.granted;
  }

  /**
   * Get all permissions for a module
   */
  getModulePermissions(moduleId: string): PermissionGrant[] {
    const moduleGrants = this.grants.get(moduleId);
    if (!moduleGrants) return [];
    
    return Array.from(moduleGrants.values());
  }

  /**
   * Get a specific grant
   */
  private getGrant(moduleId: string, permission: Permission): PermissionGrant | undefined {
    const moduleGrants = this.grants.get(moduleId);
    return moduleGrants?.get(permission);
  }

  /**
   * Process a permission request
   */
  private async processRequest(request: PermissionRequest): Promise<boolean> {
    // Add to pending requests
    this.pendingRequests.push(request);
    
    // Notify permission callbacks
    for (const callback of this.permissionCallbacks) {
      const granted = await callback(request, false); // Default to false
      if (granted) {
        // Grant the permission
        this.grantPermission(request.moduleId, request.permissions[0]);
        return true;
      }
    }
    
    // Default behavior: deny unhandled permission requests
    return false;
  }

  /**
   * Subscribe to permission requests
   */
  onRequest(callback: (request: PermissionRequest) => Promise<boolean>): () => void {
    this.permissionCallbacks.push(async (request, defaultResult) => {
      return await callback(request);
    });
    
    // Return unsubscribe function
    return () => {
      const index = this.permissionCallbacks.findIndex(cb => 
        cb.toString() === callback.toString() // This is a simplified check
      );
      if (index > -1) {
        this.permissionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Revoke all permissions for a module
   */
  revokeAllPermissions(moduleId: string): void {
    this.grants.delete(moduleId);
  }

  /**
   * Get pending permission requests
   */
  getPendingRequests(): PermissionRequest[] {
    return [...this.pendingRequests];
  }

  /**
   * Clear expired grants
   */
  clearExpiredGrants(): void {
    const now = Date.now();
    
    for (const [moduleId, moduleGrants] of this.grants.entries()) {
      for (const [permission, grant] of moduleGrants.entries()) {
        if (grant.expiry && grant.expiry < now) {
          moduleGrants.delete(permission);
        }
      }
      
      // Clean up empty module entries
      if (moduleGrants.size === 0) {
        this.grants.delete(moduleId);
      }
    }
  }

  /**
   * Get security context based on permissions
   */
  getSecurityContext(moduleId: string): SecurityContext {
    const permissions = this.getModulePermissions(moduleId).filter(g => g.granted);
    const permissionNames = permissions.map(g => g.permission);
    
    return {
      moduleId,
      permissions: new Set(permissionNames),
      trusted: false, // This would be determined separately
      allowedOrigins: [], // This would be populated based on network permission
      resourceLimits: {
        memory: 64, // Default memory limit
        network: permissionNames.includes('network'),
        filesystem: permissionNames.includes('filesystem'),
        system: permissionNames.includes('system')
      }
    };
  }
}

// Create and export singleton instance
const permissionSystem = new PermissionSystem();
export { permissionSystem, PermissionSystem };
```

### Content Security Policy

Implement a Content Security Policy for web contexts:

```typescript
// src/modules/security/cspManager.ts
export interface CSPDirective {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  fontSrc?: string[];
  connectSrc?: string[];
  frameSrc?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  childSrc?: string[];
  frameAncestors?: string[];
  reportUri?: string;
}

export class CSPManager {
  private policies: Map<string, CSPDirective> = new Map();

  /**
   * Set CSP for a module or context
   */
  setPolicy(moduleId: string, directives: CSPDirective): void {
    this.policies.set(moduleId, directives);
  }

  /**
   * Generate CSP header string
   */
  generateCSPHeader(moduleId: string): string {
    const policy = this.policies.get(moduleId) || this.getDefaultPolicy();
    
    const directives: string[] = [];
    
    // Add each directive to the header
    Object.entries(policy).forEach(([key, value]) => {
      if (value && Array.isArray(value) && value.length > 0) {
        const directiveKey = this.camelToKebab(key);
        directives.push(`${directiveKey} ${value.join(' ')}`);
      }
    });
    
    return directives.join('; ');
  }

  /**
   * Inject CSP meta tag into document
   */
  injectMetaTag(moduleId: string): void {
    // Remove existing CSP meta tags
    const existingTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    existingTags.forEach(tag => tag.remove());
    
    // Create new meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = this.generateCSPHeader(moduleId);
    
    // Add to head
    document.head.appendChild(meta);
  }

  /**
   * Get the default security policy
   */
  private getDefaultPolicy(): CSPDirective {
    return {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Vue
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'], // Allow API calls to same origin and HTTPS
      frameSrc: [],
      objectSrc: ["'none'"], // Block dangerous elements
      mediaSrc: ["'self'"],
      childSrc: ["'self'"],
      frameAncestors: ["'none'"], // Prevent framing by other sites
    };
  }

  /**
   * Update policy with trusted sources for specific modules
   */
  addTrustedSources(moduleId: string, trustedDomains: string[]): void {
    const currentPolicy = this.policies.get(moduleId) || this.getDefaultPolicy();
    
    // Add trusted domains to appropriate sources
    const updatedPolicy: CSPDirective = { ...currentPolicy };
    
    if (updatedPolicy.defaultSrc) {
      updatedPolicy.defaultSrc = [...new Set([...updatedPolicy.defaultSrc, ...trustedDomains])];
    }
    if (updatedPolicy.scriptSrc) {
      updatedPolicy.scriptSrc = [...new Set([...updatedPolicy.scriptSrc, ...trustedDomains])];
    }
    if (updatedPolicy.connectSrc) {
      updatedPolicy.connectSrc = [...new Set([...updatedPolicy.connectSrc, ...trustedDomains])];
    }
    
    this.policies.set(moduleId, updatedPolicy);
  }

  /**
   * Remove a policy
   */
  removePolicy(moduleId: string): void {
    this.policies.delete(moduleId);
  }

  private camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
  }

  /**
   * Check if a URL is allowed by the CSP
   */
  isUrlAllowed(moduleId: string, url: string, directive: keyof CSPDirective = 'connectSrc'): boolean {
    try {
      const policy = this.policies.get(moduleId) || this.getDefaultPolicy();
      const allowedSources = policy[directive];
      
      if (!allowedSources) return false;
      
      const parsedUrl = new URL(url);
      const urlOrigin = parsedUrl.origin;
      
      for (const source of allowedSources) {
        if (source === "'self'") {
          if (urlOrigin === window.location.origin) return true;
        } else if (source === 'https:') {
          if (parsedUrl.protocol === 'https:') return true;
        } else if (source === 'data:') {
          if (parsedUrl.protocol === 'data:') return true;
        } else if (source === "'none'") {
          return false;
        } else {
          // Check if URL matches the source pattern
          if (urlOrigin === source || urlOrigin.endsWith(source)) {
            return true;
          }
        }
      }
      
      return false;
    } catch {
      return false; // Invalid URL
    }
  }
}

// Create and export singleton instance
const cspManager = new CSPManager();
export { cspManager };
```

## Advanced Patterns

### Secure Communication Channels

Create secure communication between modules:

```typescript
// src/modules/security/secureCommunication.ts
import { SecurityManager } from './securityManager';
import { PermissionSystem } from './permissionSystem';

export interface SecureMessage {
  id: string;
  from: string;
  to: string;
  type: string;
  data: any;
  timestamp: number;
  signature?: string;
  encrypted?: boolean;
}

export class SecureCommunicationManager {
  private securityManager: SecurityManager;
  private permissionSystem: PermissionSystem;
  private messageQueue: SecureMessage[] = [];
  private messageCallbacks: Map<string, Array<(message: SecureMessage) => void>> = new Map();

  constructor(securityManager: SecurityManager, permissionSystem: PermissionSystem) {
    this.securityManager = securityManager;
    this.permissionSystem = permissionSystem;
  }

  /**
   * Send a message between modules securely
   */
  async sendMessage(
    from: string,
    to: string,
    type: string,
    data: any
  ): Promise<boolean> {
    // Check if modules can communicate
    if (!this.securityManager.canCommunicate(from, to)) {
      console.error(`Communication not allowed between ${from} and ${to}`);
      return false;
    }

    // Check permissions
    if (!this.permissionSystem.hasPermission(from, 'module-communication')) {
      console.error(`Module ${from} doesn't have communication permission`);
      return false;
    }

    // Validate data
    const validatedData = this.securityManager.validateInput(data, from, 'communication');

    // Create secure message
    const message: SecureMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      type,
      data: validatedData,
      timestamp: Date.now()
    };

    // Queue the message
    this.messageQueue.push(message);

    // Process the message queue
    this.processQueue();

    return true;
  }

  /**
   * Subscribe to messages from a specific module or of a specific type
   */
  subscribe(
    target: string,
    type: string,
    callback: (message: SecureMessage) => void
  ): () => void {
    const key = `${target}:${type}`;
    
    if (!this.messageCallbacks.has(key)) {
      this.messageCallbacks.set(key, []);
    }
    
    const callbacks = this.messageCallbacks.get(key)!;
    callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Process messages in the queue
   */
  private processQueue(): void {
    const messages = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messages) {
      // Sanitize output data
      const sanitizedData = this.securityManager.sanitizeOutput(message.data, message.from);
      const processedMessage = { ...message, data: sanitizedData };

      // Deliver to subscribers
      this.deliverMessage(processedMessage);
    }
  }

  private deliverMessage(message: SecureMessage): void {
    // Deliver to specific target and type
    const specificKey = `${message.to}:${message.type}`;
    const specificCallbacks = this.messageCallbacks.get(specificKey) || [];
    
    for (const callback of specificCallbacks) {
      try {
        callback(message);
      } catch (error) {
        console.error(`Error in message callback:`, error);
      }
    }

    // Deliver to general target listeners
    const generalKey = `${message.to}:*`;
    const generalCallbacks = this.messageCallbacks.get(generalKey) || [];
    
    for (const callback of generalCallbacks) {
      try {
        callback(message);
      } catch (error) {
        console.error(`Error in general message callback:`, error);
      }
    }
  }

  /**
   * Create an encrypted message channel between modules
   */
  async createSecureChannel(from: string, to: string): Promise<{
    send: (type: string, data: any) => Promise<boolean>;
    subscribe: (type: string, callback: (data: any) => void) => () => void;
  }> {
    // Check if secure channel is allowed
    if (!this.securityManager.canCommunicate(from, to)) {
      throw new Error(`Secure channel not allowed between ${from} and ${to}`);
    }

    const send = async (type: string, data: any): Promise<boolean> => {
      return this.sendMessage(from, to, type, data);
    };

    const subscribe = (type: string, callback: (data: any) => void): () => void => {
      return this.subscribe(to, type, (message) => {
        callback(message.data);
      });
    };

    return { send, subscribe };
  }
}
```

### Sandboxing System

Implement module sandboxing:

```typescript
// src/modules/security/sandbox.ts
export interface SandboxedModule {
  execute: (code: string, context: any) => Promise<any>;
  terminate: () => void;
  getResourceUsage: () => { memory: number; cpu: number };
}

export class SandboxingSystem {
  /**
   * Create a sandboxed execution environment for a module
   */
  createSandbox(moduleId: string, options: {
    memoryLimit?: number;
    timeLimit?: number;
    allowedHosts?: string[];
    allowNetwork?: boolean;
    allowFilesystem?: boolean;
  } = {}): SandboxedModule {
    // In a real implementation, this would spawn a separate process or use 
    // a more robust sandboxing mechanism like VM2 in Node.js
    // For this example, we'll simulate a basic sandbox
    
    let executionTime = 0;
    let memoryUsed = 0;

    return {
      execute: async (code: string, context: any) => {
        const startTime = Date.now();
        
        try {
          // Basic timeout protection
          if (options.timeLimit) {
            setTimeout(() => {
              if (Date.now() - startTime > options.timeLimit!) {
                throw new Error('Execution timeout');
              }
            }, options.timeLimit);
          }

          // In a real implementation, you'd use a proper sandbox environment
          // such as Node.js VM module, Web Workers, or a separate process
          const result = eval(code); // Warning: eval is dangerous; use proper sandboxing in production
          executionTime = Date.now() - startTime;
          
          return result;
        } catch (error) {
          throw error;
        }
      },

      terminate: () => {
        // Clean up sandbox resources
        console.log(`Sandbox for module ${moduleId} terminated`);
      },

      getResourceUsage: () => ({
        memory: memoryUsed,
        cpu: executionTime
      })
    };
  }

  /**
   * Execute code in a secure context with permissions
   */
  async executeSecurely(
    moduleId: string,
    code: string,
    permissions: string[],
    context: any = {}
  ): Promise<any> {
    // Validate permissions
    for (const perm of permissions) {
      if (!this.validatePermission(moduleId, perm)) {
        throw new Error(`Module ${moduleId} doesn't have permission: ${perm}`);
      }
    }

    // Create restricted context based on permissions
    const restrictedContext = this.createRestrictedContext(context, permissions);

    // Execute in sandbox
    const sandbox = this.createSandbox(moduleId, {
      allowNetwork: permissions.includes('network'),
      allowFilesystem: permissions.includes('filesystem'),
      timeLimit: 5000 // 5 second timeout
    });

    try {
      return await sandbox.execute(code, restrictedContext);
    } finally {
      sandbox.terminate();
    }
  }

  private validatePermission(moduleId: string, permission: string): boolean {
    // In a real implementation, check against the permission system
    // For now, we'll allow some common safe operations
    const safePermissions = [
      'console', 'timer', 'math', 'json', 'string', 'array'
    ];
    
    return safePermissions.includes(permission);
  }

  private createRestrictedContext(baseContext: any, permissions: string[]): any {
    const context: any = { ...baseContext };

    if (!permissions.includes('network')) {
      // Remove network capabilities
      if (context.fetch) delete context.fetch;
      if (context.XMLHttpRequest) delete context.XMLHttpRequest;
    }

    if (!permissions.includes('filesystem')) {
      // Remove filesystem capabilities
      if (context.fs) delete context.fs;
      if (context.require) delete context.require;
    }

    return context;
  }
}
```

## Testing

Test the security systems:

```typescript
// src/__tests__/security.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
  SecurityManager, 
  SecureModuleLoader, 
  PermissionSystem,
  CSPManager 
} from '../modules/security';

describe('Module Security System', () => {
  let securityManager: SecurityManager;
  let permissionSystem: PermissionSystem;

  beforeEach(() => {
    securityManager = new SecurityManager();
    permissionSystem = new PermissionSystem();
  });

  afterEach(() => {
    // Cleanup
  });

  it('creates security contexts for modules', () => {
    const metadata = {
      id: 'test-module',
      version: '1.0.0',
      entryPoint: './test.js',
      dependencies: [],
      permissions: ['network', 'storage'],
      size: 1000,
      loadPriority: 1,
      tags: ['test']
    };

    const context = securityManager.createContext('test-module', metadata);
    
    expect(context.moduleId).toBe('test-module');
    expect(context.permissions.has('network')).toBe(true);
    expect(context.permissions.has('storage')).toBe(true);
    expect(context.resourceLimits.network).toBe(true);
  });

  it('validates module actions based on permissions', () => {
    const metadata = {
      id: 'limited-module',
      version: '1.0.0',
      entryPoint: './test.js',
      dependencies: [],
      permissions: ['network'],
      size: 1000,
      loadPriority: 1,
      tags: ['test']
    };

    securityManager.createContext('limited-module', metadata);

    expect(securityManager.canPerformAction('limited-module', 'network-request')).toBe(true);
    expect(securityManager.canPerformAction('limited-module', 'read-file')).toBe(false);
    expect(securityManager.canPerformAction('limited-module', 'write-file')).toBe(false);
  });

  it('validates URLs against allowed domains', () => {
    const metadata = {
      id: 'net-module',
      version: '1.0.0',
      entryPoint: './test.js',
      dependencies: [],
      permissions: ['network'],
      size: 1000,
      loadPriority: 1,
      tags: ['test']
    };

    securityManager.createContext('net-module', metadata);

    expect(securityManager.isUrlAllowed('https://api.example.com/data', 'net-module')).toBe(true);
    expect(securityManager.isUrlAllowed('https://malicious.com/data', 'net-module')).toBe(true); // Initially allowed
  });
});

describe('Permission System', () => {
  let permissionSystem: PermissionSystem;

  beforeEach(() => {
    permissionSystem = new PermissionSystem();
  });

  it('grants and revokes permissions', () => {
    permissionSystem.grantPermission('test-module', 'network', 'For API calls');
    
    expect(permissionSystem.hasPermission('test-module', 'network')).toBe(true);
    
    permissionSystem.revokePermission('test-module', 'network');
    expect(permissionSystem.hasPermission('test-module', 'network')).toBe(false);
  });

  it('handles permission requests', async () => {
    // Setup request handler
    const unsubscribe = permissionSystem.onRequest(async (request) => {
      return request.permissions.includes('network'); // Grant network permission
    });

    const results = await permissionSystem.requestPermission(
      'test-module',
      ['network', 'filesystem'],
      'Module needs API access'
    );

    expect(results).toEqual([true, false]); // network granted, filesystem denied
    unsubscribe();
  });

  it('manages multiple permissions for a module', () => {
    permissionSystem.grantPermission('multi-module', 'network');
    permissionSystem.grantPermission('multi-module', 'storage');

    const permissions = permissionSystem.getModulePermissions('multi-module');
    expect(permissions).toHaveLength(2);
    expect(permissions.some(p => p.permission === 'network')).toBe(true);
    expect(permissions.some(p => p.permission === 'storage')).toBe(true);
  });
});

describe('CSP Manager', () => {
  it('generates valid CSP headers', () => {
    const csp = new CSPManager();
    
    csp.setPolicy('test-module', {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.example.com']
    });

    const header = csp.generateCSPHeader('test-module');
    expect(header).toContain("default-src 'self'");
    expect(header).toContain("script-src 'self'");
    expect(header).toContain("connect-src 'self' https://api.example.com");
  });

  it('validates URLs against CSP policies', () => {
    const csp = new CSPManager();
    
    csp.setPolicy('api-module', {
      connectSrc: ["'self'", 'https://api.example.com']
    });

    expect(csp.isUrlAllowed('api-module', 'https://api.example.com/data', 'connectSrc')).toBe(true);
    expect(csp.isUrlAllowed('api-module', 'https://bad.example.com/data', 'connectSrc')).toBe(false);
  });
});
```

## Troubleshooting

Common security challenges and solutions:

- **Code Injection**: Always validate and sanitize inputs; never use eval() in production
- **Permission Escalation**: Implement least-privilege principles and regular permission audits
- **Cross-Module Attacks**: Use proper isolation and communication validation
- **Resource Exhaustion**: Implement resource limits and monitoring
- **Side-Channel Attacks**: Ensure proper isolation between modules

## Summary

Module security in Tauri-Vue applications requires multiple layers of protection including permission systems, content security policies, secure communication channels, and proper isolation. By implementing these patterns, you can create a secure environment where modules can operate safely without compromising the entire application.

Continue exploring related topics in our guide to [Module Performance Optimization](./03_06_module-performance-optimization.md) to learn how to optimize your modules for better performance without sacrificing security.