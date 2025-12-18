# Module Communication

Effective communication between modules is critical for building scalable applications. This article explores patterns for enabling modules to interact with each other while maintaining loose coupling and clear boundaries.

## Prerequisites

- Understanding of module architecture concepts
- Knowledge of event-driven programming
- Familiarity with Vue's component communication patterns

## Core Concepts

Inter-module communication in full-stack applications involves both frontend-to-frontend communication between Vue modules, backend-to-backend communication between Rust modules, and cross-stack communication between frontend and backend modules. The goal is to create flexible, maintainable communication channels that avoid tight coupling.

## Implementation

### Centralized Event System

Create a centralized event bus system for module communication:

```typescript
// src/modules/communication/eventBus.ts
import { reactive, watch } from 'vue';

export interface ModuleEvent<T = any> {
  id: string;
  source: string;           // Module name that emitted the event
  target?: string;          // Target module (undefined = broadcast to all)
  type: string;             // Event type
  data: T;                  // Event payload
  timestamp: number;        // When event was emitted
  correlationId?: string;   // For tracking related events
  acknowledged?: boolean;   // Whether event was processed
}

class ModuleEventBus {
  private listeners: Map<string, Set<(event: ModuleEvent) => void>> = new Map();
  private eventHistory: ModuleEvent[] = [];
  private maxHistorySize = 500;
  private eventQueue: ModuleEvent[] = [];
  private isProcessingQueue = false;

  constructor() {
    // Initialize with reactive state
    reactive(this.eventHistory);
  }

  /**
   * Subscribe to events of specific type
   * @param eventType Event type to subscribe to (use '*' for all events)
   * @param callback Function to call when event is received
   * @returns Unsubscribe function
   */
  subscribe(eventType: string, callback: (event: ModuleEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const listeners = this.listeners.get(eventType)!;
    listeners.add(callback);

    return () => {
      listeners.delete(callback);
      // Clean up empty sets
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Emit an event to be processed by subscribers
   */
  emit<T = any>(source: string, type: string, data: T, target?: string, correlationId?: string): string {
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const event: ModuleEvent<T> = {
      id: eventId,
      source,
      target,
      type,
      data,
      timestamp: Date.now(),
      correlationId
    };

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Add to queue for async processing
    this.eventQueue.push(event);
    
    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processQueue();
    }

    return eventId;
  }

  /**
   * Emit an event synchronously (for immediate processing)
   */
  emitSync<T = any>(source: string, type: string, data: T, target?: string): string {
    const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const event: ModuleEvent<T> = {
      id: eventId,
      source,
      target,
      type,
      data,
      timestamp: Date.now()
    };

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Deliver immediately
    this.deliverEvent(event);

    return eventId;
  }

  private async processQueue(): Promise<void> {
    this.isProcessingQueue = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.deliverEvent(event);
      
      // Small delay to prevent blocking the main thread
      if (this.eventQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    this.isProcessingQueue = false;
  }

  private deliverEvent<T>(event: ModuleEvent<T>): void {
    // Notify listeners for the specific event type
    const specificListeners = this.listeners.get(event.type);
    if (specificListeners) {
      specificListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event callback for ${event.type}:`, error);
        }
      });
    }

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in wildcard event callback:`, error);
        }
      });
    }
  }

  /**
   * Get recent events with optional filtering
   */
  getRecentEvents(filter: {
    source?: string;
    type?: string;
    target?: string;
    since?: number;
  } = {}): ModuleEvent[] {
    return this.eventHistory.filter(event => {
      if (filter.source && event.source !== filter.source) return false;
      if (filter.type && event.type !== filter.type) return false;
      if (filter.target && event.target !== filter.target) return false;
      if (filter.since && event.timestamp < filter.since) return false;
      return true;
    });
  }

  /**
   * Wait for a specific event to occur
   */
  async waitForEvent(
    eventType: string,
    timeout: number = 10000,
    filter?: (event: ModuleEvent) => boolean
  ): Promise<ModuleEvent | null> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for event: ${eventType}`));
      }, timeout);

      const unsubscribe = this.subscribe(eventType, (event) => {
        if (!filter || filter(event)) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(event);
        }
      });
    });
  }

  /**
   * Get statistics about event bus usage
   */
  getStats(): {
    totalEvents: number;
    activeListeners: number;
    queuedEvents: number;
  } {
    return {
      totalEvents: this.eventHistory.length,
      activeListeners: Array.from(this.listeners.values())
        .reduce((sum, listeners) => sum + listeners.size, 0),
      queuedEvents: this.eventQueue.length
    };
  }

  /**
   * Clear all event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }
}

// Create and export singleton instance
const moduleEventBus = new ModuleEventBus();
export { moduleEventBus };
```

### Backend Event System (Rust)

Create a corresponding Rust backend event system:

```rust
// src/modules/communication/backend/mod.rs
use std::sync::Arc;
use std::collections::HashMap;
use tokio::sync::{broadcast, RwLock};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

pub mod event_service;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackendEvent {
    pub id: String,
    pub source: String,
    pub target: Option<String>,
    pub event_type: String,
    pub data: serde_json::Value,
    pub timestamp: u64,
    pub correlation_id: Option<String>,
}

#[derive(Clone)]
pub struct EventSystem {
    app_handle: AppHandle,
    subscribers: Arc<RwLock<HashMap<String, broadcast::Sender<BackendEvent>>>>,
}

impl EventSystem {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            app_handle,
            subscribers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn subscribe(&self, module_name: &str) -> broadcast::Receiver<BackendEvent> {
        let mut subscribers = self.subscribers.write().await;
        
        if !subscribers.contains_key(module_name) {
            let (sender, receiver) = broadcast::channel(100);
            subscribers.insert(module_name.to_string(), sender);
            receiver
        } else {
            subscribers.get(module_name).unwrap().subscribe()
        }
    }

    pub async fn emit(&self, event: BackendEvent) -> Result<(), Box<dyn std::error::Error>> {
        // Emit to all subscribers
        let subscribers = self.subscribers.read().await;
        for (_, sender) in subscribers.iter() {
            let _ = sender.send(event.clone());
        }

        // Also emit to the frontend event bus
        self.app_handle.emit("module-event", &event).unwrap_or(());
        
        Ok(())
    }

    pub async fn emit_to_module(&self, target_module: &str, event: BackendEvent) -> Result<(), Box<dyn std::error::Error>> {
        // Emit only to specific module
        let subscribers = self.subscribers.read().await;
        if let Some(sender) = subscribers.get(target_module) {
            let _ = sender.send(event);
        }
        
        // Also emit to the frontend if target is frontend
        if target_module.starts_with("frontend-") {
            self.app_handle.emit("module-event", &event).unwrap_or(());
        }
        
        Ok(())
    }
}
```

```rust
// src/modules/communication/backend/event_service.rs
use crate::modules::communication::backend::{EventSystem, BackendEvent};
use tauri::State;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct EmitEventRequest {
    pub source: String,
    pub event_type: String,
    pub data: serde_json::Value,
    pub target: Option<String>,
    pub correlation_id: Option<String>,
}

#[tauri::command]
pub async fn emit_module_event(
    event_system: State<'_, EventSystem>,
    request: EmitEventRequest,
) -> Result<(), String> {
    let event = BackendEvent {
        id: format!("event-{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis()),
        source: request.source,
        target: request.target,
        event_type: request.event_type,
        data: request.data,
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        correlation_id: request.correlation_id,
    };

    match event_system.emit(event).await {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn subscribe_to_module_events(
    event_system: State<'_, EventSystem>,
    module_name: String,
) -> Result<(), String> {
    let _receiver = event_system.subscribe(&module_name).await;
    Ok(())
}
```

### Module Communication Interface

Create a standardized interface for module communication:

```typescript
// src/modules/communication/moduleInterface.ts
import { moduleEventBus } from './eventBus';

export interface ModuleMessage<T = any> {
  from: string;
  to?: string;
  type: string;
  data: T;
  timestamp: number;
  replyTo?: string;
  correlationId?: string;
}

export interface ModuleResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  correlationId?: string;
}

export interface ModuleInterface {
  name: string;
  initialize(): Promise<void>;
  sendMessage<T>(message: Omit<ModuleMessage<T>, 'from' | 'timestamp' | 'correlationId'>): Promise<ModuleResponse>;
  subscribeToMessages<T>(
    messageType: string,
    handler: (message: ModuleMessage<T>) => Promise<ModuleResponse>
  ): () => void;
  broadcastMessage<T>(message: Omit<ModuleMessage<T>, 'from' | 'timestamp' | 'correlationId'>): void;
}

export abstract class BaseModule implements ModuleInterface {
  abstract name: string;
  
  async initialize(): Promise<void> {
    // Default initialization - override in subclasses
  }

  async sendMessage<T>(
    message: Omit<ModuleMessage<T>, 'from' | 'timestamp' | 'correlationId'>
  ): Promise<ModuleResponse> {
    return new Promise((resolve) => {
      const correlationId = `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fullMessage: ModuleMessage<T> = {
        ...message,
        from: this.name,
        timestamp: Date.now(),
        correlationId
      };

      // Listen for reply with this correlation ID
      const unsubscribe = moduleEventBus.subscribe(`${this.name}-reply-${correlationId}`, (event) => {
        unsubscribe();
        const response: ModuleResponse = event.data;
        resolve(response);
      });

      // Emit the message
      moduleEventBus.emit(this.name, fullMessage.type, fullMessage, fullMessage.to);

      // Set timeout for reply
      setTimeout(() => {
        unsubscribe();
        resolve({
          success: false,
          error: 'Message timeout',
          correlationId
        });
      }, 10000);
    });
  }

  subscribeToMessages<T>(
    messageType: string,
    handler: (message: ModuleMessage<T>) => Promise<ModuleResponse>
  ): () => void {
    return moduleEventBus.subscribe(messageType, async (event) => {
      const message = event.data as ModuleMessage<T>;
      
      // Only process messages intended for this module
      if (message.to && message.to !== this.name) {
        return;
      }

      try {
        const response = await handler(message);
        
        // Send reply if there's a replyTo specified
        if (message.replyTo && message.correlationId) {
          moduleEventBus.emit(
            this.name,
            `${message.replyTo}-reply-${message.correlationId}`,
            response
          );
        }
      } catch (error) {
        const errorResponse: ModuleResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        
        if (message.replyTo && message.correlationId) {
          moduleEventBus.emit(
            this.name,
            `${message.replyTo}-reply-${message.correlationId}`,
            errorResponse
          );
        }
      }
    });
  }

  broadcastMessage<T>(message: Omit<ModuleMessage<T>, 'from' | 'timestamp' | 'correlationId'>): void {
    const fullMessage: ModuleMessage<T> = {
      ...message,
      from: this.name,
      timestamp: Date.now()
    };
    
    moduleEventBus.emit(this.name, fullMessage.type, fullMessage);
  }
}
```

### Communication Utilities

Create utility functions to simplify communication:

```typescript
// src/modules/communication/utils.ts
import { moduleEventBus } from './eventBus';

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  target?: string;
}

export class CommunicationUtils {
  /**
   * Make a request to another module and wait for response
   */
  static async request<T>(
    source: string,
    target: string,
    type: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = 10000, retries = 1 } = options;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await Promise.race([
          new Promise<T>((resolve, reject) => {
            const correlationId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Subscribe to the response
            const unsubscribe = moduleEventBus.subscribe(`${target}-response-${correlationId}`, (event) => {
              unsubscribe();
              const response = event.data;
              if (response.success) {
                resolve(response.data);
              } else {
                reject(new Error(response.error || 'Request failed'));
              }
            });
            
            // Create and emit request
            const request = {
              type,
              data,
              source,
              target,
              correlationId,
              timestamp: Date.now()
            };
            
            moduleEventBus.emit(source, `${target}-request`, request, target);
            
            // Timeout
            setTimeout(() => {
              unsubscribe();
              reject(new Error(`Request timeout after ${timeout}ms`));
            }, timeout);
          }),
          // Overall timeout
          new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
          )
        ]);
      } catch (error) {
        if (attempt === retries - 1) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    
    throw new Error('Unexpected end of request retry loop');
  }

  /**
   * Publish an event that modules can subscribe to
   */
  static publish<T>(source: string, type: string, data: T, target?: string): void {
    moduleEventBus.emit(source, type, {
      type,
      data,
      source,
      target,
      timestamp: Date.now()
    }, target);
  }

  /**
   * Subscribe to events from other modules
   */
  static subscribe<T>(
    type: string,
    handler: (data: T) => void
  ): () => void {
    return moduleEventBus.subscribe(type, (event) => {
      handler(event.data);
    });
  }

  /**
   * Create a promise-based subscription for one-time events
   */
  static once<T>(type: string): Promise<T> {
    return new Promise<T>((resolve) => {
      const unsubscribe = moduleEventBus.subscribe(type, (event) => {
        unsubscribe();
        resolve(event.data);
      });
    });
  }

  /**
   * Wait for a condition to be met based on events
   */
  static async waitForCondition(
    type: string,
    condition: (data: any) => boolean,
    timeout: number = 10000
  ): Promise<any> {
    return Promise.race([
      new Promise<any>((resolve) => {
        const unsubscribe = moduleEventBus.subscribe(type, (event) => {
          if (condition(event.data)) {
            unsubscribe();
            resolve(event.data);
          }
        });
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout waiting for condition after ${timeout}ms`)), timeout)
      )
    ]);
  }
}
```

## Advanced Patterns

### Module Registry with Communication

Enhance the module registry with communication capabilities:

```typescript
// src/modules/communication/moduleRegistry.ts
import { BaseModule, ModuleInterface } from './moduleInterface';
import { moduleEventBus } from './eventBus';

interface ModuleRegistration {
  module: ModuleInterface;
  dependencies: string[];
  initialized: boolean;
}

class EnhancedModuleRegistry {
  private modules: Map<string, ModuleRegistration> = new Map();
  private communicationBus = moduleEventBus;

  /**
   * Register a module with its dependencies
   */
  registerModule(module: ModuleInterface, dependencies: string[] = []): void {
    if (this.modules.has(module.name)) {
      console.warn(`Module ${module.name} already registered`);
      return;
    }

    // Check if dependencies are registered
    for (const dep of dependencies) {
      if (!this.modules.has(dep)) {
        throw new Error(`Module ${module.name} depends on unregistered module: ${dep}`);
      }
    }

    this.modules.set(module.name, {
      module,
      dependencies,
      initialized: false
    });
  }

  /**
   * Initialize a module and its dependencies
   */
  async initializeModule(name: string): Promise<void> {
    const registration = this.modules.get(name);
    if (!registration) {
      throw new Error(`Module ${name} not found`);
    }

    if (registration.initialized) {
      return; // Already initialized
    }

    // Initialize dependencies first
    for (const dep of registration.dependencies) {
      await this.initializeModule(dep);
    }

    // Initialize the module
    await registration.module.initialize();
    registration.initialized = true;

    // Emit module initialization event
    this.communicationBus.emit('module-registry', 'module-initialized', {
      moduleName: name,
      timestamp: Date.now()
    });

    console.log(`Module ${name} initialized successfully`);
  }

  /**
   * Initialize all registered modules
   */
  async initializeAll(): Promise<void> {
    const moduleNames = Array.from(this.modules.keys());
    
    for (const name of moduleNames) {
      await this.initializeModule(name);
    }
  }

  /**
   * Get a registered module
   */
  getModule(name: string): ModuleInterface | undefined {
    const registration = this.modules.get(name);
    return registration?.module;
  }

  /**
   * Check if module is initialized
   */
  isInitialized(name: string): boolean {
    const registration = this.modules.get(name);
    return registration?.initialized ?? false;
  }

  /**
   * Send a message to a specific module
   */
  async sendMessage<T>(
    from: string,
    to: string,
    type: string,
    data: T
  ): Promise<any> {
    const module = this.getModule(to);
    if (!module) {
      throw new Error(`Target module ${to} not found`);
    }

    return module.sendMessage({ type, data, to, replyTo: from });
  }

  /**
   * Broadcast a message to multiple modules
   */
  broadcastMessage<T>(from: string, type: string, data: T, targets?: string[]): void {
    if (targets) {
      // Send to specific targets
      targets.forEach(target => {
        const module = this.getModule(target);
        if (module) {
          module.sendMessage({ type, data, to: target, replyTo: from });
        }
      });
    } else {
      // Broadcast to all modules
      this.modules.forEach((registration, name) => {
        if (name !== from) { // Don't send to self
          registration.module.sendMessage({ type, data, to: name, replyTo: from });
        }
      });
    }
  }

  /**
   * Get module statistics
   */
  getStats(): {
    registered: number;
    initialized: number;
    dependencies: number;
  } {
    let initialized = 0;
    let dependencies = 0;

    this.modules.forEach(reg => {
      if (reg.initialized) initialized++;
      dependencies += reg.dependencies.length;
    });

    return {
      registered: this.modules.size,
      initialized,
      dependencies
    };
  }
}

const moduleRegistry = new EnhancedModuleRegistry();
export { moduleRegistry, EnhancedModuleRegistry };
```

### Request-Response Pattern

Implement a request-response pattern for synchronous communication:

```typescript
// src/modules/communication/requestResponse.ts
import { moduleEventBus, ModuleEvent } from './eventBus';

export interface RequestMessage<T = any> {
  id: string;
  source: string;
  target: string;
  type: string;
  data: T;
  timestamp: number;
  timeout: number;
}

export interface ResponseMessage<T = any> {
  id: string;
  correlationId: string;
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

class RequestResponseManager {
  private pendingRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timeoutId: number;
  }> = new Map();

  constructor() {
    // Listen for responses
    moduleEventBus.subscribe('request-response', (event) => {
      const response = event.data as ResponseMessage;
      this.handleResponse(response);
    });
  }

  async sendRequest<T, R>(
    source: string,
    target: string,
    type: string,
    data: T,
    timeout: number = 10000
  ): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Store the request
      const timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request ${requestId} timed out`));
      }, timeout) as unknown as number;

      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });

      // Send the request
      const request: RequestMessage<T> = {
        id: requestId,
        source,
        target,
        type,
        data,
        timestamp: Date.now(),
        timeout
      };

      moduleEventBus.emit(source, 'request', request, target);
    });
  }

  sendResponse<T>(
    source: string,
    correlationId: string,
    data: T,
    success: boolean = true,
    error?: string
  ): void {
    const response: ResponseMessage<T> = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      correlationId,
      success,
      data: success ? data : undefined,
      error: success ? undefined : error,
      timestamp: Date.now()
    };

    // Send response back to the original requester
    moduleEventBus.emit(source, 'response', response);
  }

  private handleResponse(response: ResponseMessage): void {
    const request = this.pendingRequests.get(response.correlationId);
    if (request) {
      // Clear timeout
      clearTimeout(request.timeoutId);
      
      // Remove from pending requests
      this.pendingRequests.delete(response.correlationId);
      
      // Resolve or reject the promise
      if (response.success && response.data !== undefined) {
        request.resolve(response.data);
      } else {
        request.reject(new Error(response.error || 'Request failed'));
      }
    }
  }

  /**
   * Handle incoming requests by registering a handler
   */
  registerRequestHandler<T, R>(
    requestType: string,
    handler: (data: T) => Promise<R>
  ): () => void {
    return moduleEventBus.subscribe('request', (event) => {
      const request = event.data as RequestMessage<T>;
      
      // Only handle requests of the specified type
      if (request.type !== requestType) return;
      
      // Call the handler and send response
      handler(request.data)
        .then(result => {
          this.sendResponse(request.target, request.id, result, true);
        })
        .catch(error => {
          this.sendResponse(request.target, request.id, null, false, error.message);
        });
    });
  }
}

const requestResponseManager = new RequestResponseManager();
export { requestResponseManager, RequestResponseManager };
```

### Communication Middleware

Create middleware for processing messages:

```typescript
// src/modules/communication/middleware.ts
export interface MiddlewareContext<T = any> {
  message: T;
  next: () => Promise<void>;
  source: string;
  type: string;
  target?: string;
  data: any;
}

export type MiddlewareFunction<T = any> = (context: MiddlewareContext<T>) => Promise<void>;

export class CommunicationMiddleware {
  private middlewares: MiddlewareFunction[] = [];

  use<T = any>(middleware: MiddlewareFunction<T>): void {
    this.middlewares.push(middleware as MiddlewareFunction);
  }

  async process<T = any>(
    message: T,
    source: string,
    type: string,
    target?: string,
    data?: any
  ): Promise<void> {
    let index = -1;

    const dispatch = (i: number): Promise<void> => {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      const fn = this.middlewares[i] || (() => Promise.resolve());
      
      return Promise.resolve(
        fn({
          message,
          source,
          type,
          target,
          data,
          next: () => dispatch(i + 1)
        })
      );
    };

    return dispatch(0);
  }

  // Convenience method to process with default context
  async processMessage<T = any>(source: string, type: string, data: T, target?: string): Promise<void> {
    await this.process(data, source, type, target, data);
  }
}

// Common middleware implementations
export const loggingMiddleware: MiddlewareFunction = async (context) => {
  console.log(`[COMMUNICATION] ${context.source} -> ${context.target || 'broadcast'}: ${context.type}`, context.data);
  await context.next();
};

export const errorHandlingMiddleware: MiddlewareFunction = async (context) => {
  try {
    await context.next();
  } catch (error) {
    console.error(`[COMMUNICATION ERROR] ${context.type}:`, error);
    throw error;
  }
};

export const validationMiddleware = (validator: (data: any) => boolean): MiddlewareFunction => {
  return async (context) => {
    if (!validator(context.data)) {
      throw new Error(`Validation failed for message type: ${context.type}`);
    }
    await context.next();
  };
};
```

## Testing

Test the communication patterns:

```typescript
// src/__tests__/communication.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { moduleEventBus } from '../modules/communication/eventBus';
import { CommunicationUtils } from '../modules/communication/utils';
import { requestResponseManager } from '../modules/communication/requestResponse';
import { BaseModule } from '../modules/communication/moduleInterface';

// Mock Tauri API
vi.mock('@tauri-apps/api', () => ({}));

class TestModule extends BaseModule {
  name = 'test-module';
  
  async processTestData(data: any) {
    return { processed: true, data };
  }
}

describe('Module Communication', () => {
  let testModule: TestModule;
  
  beforeEach(() => {
    testModule = new TestModule();
  });

  afterEach(() => {
    moduleEventBus.clearHistory();
  });

  it('emits and receives events correctly', () => {
    const receivedEvents: any[] = [];
    
    const unsubscribe = moduleEventBus.subscribe('test-event', (event) => {
      receivedEvents.push(event);
    });

    moduleEventBus.emit('source', 'test-event', { test: 'data' });
    
    expect(receivedEvents).toHaveLength(1);
    expect(receivedEvents[0].data).toEqual({ test: 'data' });
    
    unsubscribe();
  });

  it('handles request-response pattern', async () => {
    // Register a handler for test requests
    const handlerUnsubscribe = requestResponseManager.registerRequestHandler<any, any>(
      'test-request', 
      async (data) => {
        return { result: 'processed', original: data };
      }
    );

    try {
      const result = await requestResponseManager.sendRequest(
        'test-source',
        'test-target', 
        'test-request',
        { input: 'test' }
      );

      expect(result).toEqual({
        result: 'processed',
        original: { input: 'test' }
      });
    } finally {
      handlerUnsubscribe();
    }
  });

  it('uses communication utilities', async () => {
    // Subscribe to responses
    const responsePromise = CommunicationUtils.once('test-utils-response');
    
    // Publish an event
    CommunicationUtils.publish('test-source', 'test-utils-response', { value: 'test' });
    
    const response = await responsePromise;
    expect(response).toEqual({ value: 'test' });
  });

  it('handles module interface communication', async () => {
    // Subscribe to messages for this module
    const unsubscribe = testModule.subscribeToMessages(
      'test-command',
      async (message) => {
        return {
          success: true,
          data: await testModule.processTestData(message.data)
        };
      }
    );

    // Send a message to the module
    const response = await testModule.sendMessage({
      type: 'test-command',
      data: { test: 'data' }
    });

    expect(response.success).toBe(true);
    expect(response.data).toEqual({ processed: true, data: { test: 'data' } });
    
    unsubscribe();
  });

  it('manages event history correctly', () => {
    // Emit multiple events
    moduleEventBus.emit('source1', 'event1', { id: 1 });
    moduleEventBus.emit('source2', 'event2', { id: 2 });
    moduleEventBus.emit('source1', 'event1', { id: 3 });

    // Get events by source
    const source1Events = moduleEventBus.getRecentEvents({ source: 'source1' });
    expect(source1Events).toHaveLength(2);
    expect(source1Events[0].data.id).toBe(1);
    expect(source1Events[1].data.id).toBe(3);

    // Get events by type
    const event1Events = moduleEventBus.getRecentEvents({ type: 'event1' });
    expect(event1Events).toHaveLength(2);
  });

  it('handles timeouts properly', async () => {
    // Test with a timeout
    await expect(
      requestResponseManager.sendRequest(
        'test-source',
        'test-target',
        'nonexistent-request',
        {},
        100 // Very short timeout
      )
    ).rejects.toThrow('timeout');
  });
});
```

## Troubleshooting

Common inter-module communication challenges and solutions:

- **Event Flooding**: Implement rate limiting and event batching to prevent overwhelming the system
- **Memory Leaks**: Always unsubscribe from events when components are destroyed
- **Circular Dependencies**: Use dependency injection and clear interfaces to avoid circular references
- **Race Conditions**: Implement proper synchronization and use correlation IDs for tracking related events
- **Performance**: Use async processing for non-critical events and sync for critical ones

## Summary

Effective inter-module communication is essential for building scalable full-stack applications. By implementing centralized event systems, request-response patterns, and proper middleware, you can create flexible and maintainable communication channels between your modules. The key is balancing flexibility with performance and reliability.

Continue exploring related topics in our guide to [Module Dependency Management](./03_03_module-dependency-management.md) to learn how to handle dependencies between modules effectively.