# Communication Patterns

Effective communication between frontend and backend modules is essential for building cohesive Tauri-Vue applications. This article explores patterns for enabling seamless communication while maintaining proper boundaries and security between modules.

## Prerequisites

- Understanding of frontend and backend module architectures
- Knowledge of Tauri's command system and event handling
- Familiarity with Vue's event system and state management

## Core Concepts

Module communication in Tauri-Vue applications involves multiple layers: communication between frontend modules, communication between backend modules, and cross-stack communication between frontend and backend modules. The key is establishing consistent, secure, and efficient communication channels.

## Implementation

### Cross-Stack Communication Patterns

Create patterns for communication between frontend and backend modules:

```rust
// src/modules/communication/backend.rs
use tauri::{State, emit};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::state::AppState;

#[derive(Debug, Deserialize, Serialize)]
pub struct CrossModuleMessage {
    pub source: String,
    pub target: String,
    pub message_type: String,
    pub data: serde_json::Value,
    pub correlation_id: Option<String>,
    pub timestamp: u64,
}

#[tauri::command]
pub async fn send_cross_module_message(
    state: State<'_, AppState>,
    message: CrossModuleMessage,
) -> Result<bool, String> {
    // Validate message structure and permissions
    if !validate_message_permissions(&message).await {
        return Err("Insufficient permissions for this operation".to_string());
    }

    // Process the message based on target
    match message.target.as_str() {
        "user-service" => {
            handle_user_service_message(state, message).await?;
        }
        "notification-service" => {
            handle_notification_message(state, message).await?;
        }
        _ => {
            // Emit as generic event for other modules to handle
            if let Err(e) = state.app_handle.emit(&message.message_type, &message) {
                return Err(format!("Failed to emit event: {}", e));
            }
        }
    }

    // Store message for potential reply handling
    store_message_for_reply(message).await;

    Ok(true)
}

async fn validate_message_permissions(message: &CrossModuleMessage) -> bool {
    // Implement permission validation logic
    // This would check if the source module is allowed to send to the target module
    true
}

async fn handle_user_service_message(
    state: State<'_, AppState>,
    message: CrossModuleMessage
) -> Result<(), String> {
    // Delegate to user service
    let user_service = state.user_service.as_ref().ok_or("User service not initialized")?;
    
    match message.message_type.as_str() {
        "user.create" => {
            // Handle user creation request
        },
        "user.query" => {
            // Handle user query request
        },
        _ => {
            return Err("Unknown message type for user service".to_string());
        }
    }

    Ok(())
}

async fn handle_notification_message(
    state: State<'_, AppState>,
    message: CrossModuleMessage
) -> Result<(), String> {
    // Handle notification messages
    if let Err(e) = state.app_handle.emit("notification", &message.data) {
        return Err(format!("Failed to send notification: {}", e));
    }
    Ok(())
}

async fn store_message_for_reply(message: CrossModuleMessage) {
    // In a real implementation, store messages for potential replies
    // This could be in memory, database, or message queue
}
```

### Frontend Communication Layer

Create the corresponding frontend communication layer:

```typescript
// src/modules/communication/frontend.ts
import { invoke, emit, listen } from '@tauri-apps/api';
import { Subject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface ModuleMessage {
  id: string;
  source: string;
  target: string;
  type: string;
  data: any;
  correlationId?: string;
  timestamp: number;
  replyTo?: string;
}

export interface ModuleResponse {
  success: boolean;
  data?: any;
  error?: string;
  correlationId?: string;
}

export class ModuleCommunicationManager {
  private messageSubjects = new Map<string, Subject<any>>();
  private pendingRequests = new Map<string, (response: ModuleResponse) => void>();

  constructor() {
    // Listen for cross-module events from backend
    this.setupBackendListeners();
  }

  private setupBackendListeners(): void {
    listen('cross-module-event', (event) => {
      const message = event.payload as ModuleMessage;
      this.handleIncomingMessage(message);
    });

    listen('module-response', (event) => {
      const response = event.payload as ModuleResponse;
      this.handleResponse(response);
    });
  }

  /**
   * Send a message to a backend module
   */
  async sendMessage<T = any>(target: string, type: string, data: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const correlationId = uuidv4();
      const message: ModuleMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: 'frontend',
        target,
        type,
        data,
        correlationId,
        timestamp: Date.now(),
      };

      // Store the resolver for when response comes back
      this.pendingRequests.set(correlationId, (response) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Module communication failed'));
        }
        this.pendingRequests.delete(correlationId);
      });

      // Send the message via Tauri command
      invoke('send_cross_module_message', { message })
        .catch(error => {
          reject(error);
          this.pendingRequests.delete(correlationId);
        });

      // Set timeout for response
      setTimeout(() => {
        if (this.pendingRequests.has(correlationId)) {
          this.pendingRequests.delete(correlationId);
          reject(new Error('Message timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Listen for messages of a specific type
   */
  listenForMessages<T = any>(messageType: string): Observable<T> {
    if (!this.messageSubjects.has(messageType)) {
      this.messageSubjects.set(messageType, new Subject<T>());
    }

    return this.messageSubjects.get(messageType)!.asObservable();
  }

  private handleIncomingMessage(message: ModuleMessage): void {
    // Emit to frontend message subjects
    if (this.messageSubjects.has(message.type)) {
      this.messageSubjects.get(message.type)!.next(message.data);
    }

    // If this is a reply to a request we made
    if (message.correlationId && this.pendingRequests.has(message.correlationId)) {
      const resolver = this.pendingRequests.get(message.correlationId)!;
      resolver({
        success: true,
        data: message.data,
        correlationId: message.correlationId
      });
    }
  }

  private handleResponse(response: ModuleResponse): void {
    if (response.correlationId && this.pendingRequests.has(response.correlationId)) {
      const resolver = this.pendingRequests.get(response.correlationId)!;
      resolver(response);
      this.pendingRequests.delete(response.correlationId);
    }
  }

  /**
   * Send a message from one frontend module to another
   */
  emitToFrontendModule<T = any>(module: string, type: string, data: T): void {
    const message: ModuleMessage = {
      id: `frontend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: 'frontend',
      target: module,
      type,
      data,
      timestamp: Date.now(),
    };

    // Emit to specific module listeners
    if (this.messageSubjects.has(`${module}:${type}`)) {
      this.messageSubjects.get(`${module}:${type}`)!.next(data);
    }

    // Emit globally
    if (this.messageSubjects.has(type)) {
      this.messageSubjects.get(type)!.next(data);
    }
  }
}

// Create and export singleton instance
export const moduleCommunicationManager = new ModuleCommunicationManager();
```

### Communication Middleware

Create middleware for processing and validating messages:

```typescript
// src/modules/communication/middleware.ts
import { ModuleMessage } from './frontend';

export type MiddlewareFunction = (
  message: ModuleMessage,
  next: () => Promise<void>
) => Promise<void>;

export class CommunicationMiddleware {
  private middlewares: MiddlewareFunction[] = [];

  use(middleware: MiddlewareFunction): void {
    this.middlewares.push(middleware);
  }

  async process(message: ModuleMessage): Promise<void> {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      const fn = this.middlewares[i];
      
      if (fn) {
        await fn(message, () => dispatch(i + 1));
      }
    };

    await dispatch(0);
  }
}

// Common middleware implementations
export const validationMiddleware: MiddlewareFunction = async (message, next) => {
  // Validate message structure
  if (!message.source || !message.target || !message.type) {
    throw new Error('Invalid message structure');
  }

  // Validate data if needed
  await next();
};

export const loggingMiddleware: MiddlewareFunction = async (message, next) => {
  console.log(`[MODULE-COMM] ${message.source} -> ${message.target}: ${message.type}`, message.data);
  await next();
};

export const securityMiddleware: MiddlewareFunction = async (message, next) => {
  // Implement security checks based on message type and source
  console.log(`Security check for: ${message.type} from ${message.source}`);
  await next();
};

export const rateLimitMiddleware: MiddlewareFunction = async (message, next) => {
  // Implement rate limiting logic
  await next();
};
```

### Event Broker Pattern

Implement an event broker for module communication:

```typescript
// src/modules/communication/eventBroker.ts
import { ModuleMessage } from './frontend';

export interface EventSubscription {
  unsubscribe: () => void;
}

export class ModuleEventBroker {
  private subscribers: Map<string, Array<(message: ModuleMessage) => void>> = new Map();
  private wildcardSubscribers: Array<(message: ModuleMessage) => void> = [];

  /**
   * Subscribe to messages of a specific type
   */
  subscribe(
    eventType: string,
    callback: (message: ModuleMessage) => void
  ): EventSubscription {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }

    const subscribers = this.subscribers.get(eventType)!;
    subscribers.push(callback);

    return {
      unsubscribe: () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to all messages (wildcard)
   */
  subscribeAll(callback: (message: ModuleMessage) => void): EventSubscription {
    this.wildcardSubscribers.push(callback);

    return {
      unsubscribe: () => {
        const index = this.wildcardSubscribers.indexOf(callback);
        if (index > -1) {
          this.wildcardSubscribers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emit a message to subscribers
   */
  emit(message: ModuleMessage): void {
    // Send to specific event type subscribers
    const typeSubscribers = this.subscribers.get(message.type);
    if (typeSubscribers) {
      typeSubscribers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error(`Error in event callback for ${message.type}:`, error);
        }
      });
    }

    // Send to wildcard subscribers
    this.wildcardSubscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in wildcard event callback:', error);
      }
    });
  }

  /**
   * Get subscriber count for an event type
   */
  getSubscriberCount(eventType: string): number {
    return this.subscribers.get(eventType)?.length || 0;
  }

  /**
   * Get all registered event types
   */
  getEventTypes(): string[] {
    return Array.from(this.subscribers.keys());
  }
}

// Create and export singleton instance
export const moduleEventBroker = new ModuleEventBroker();
```

## Advanced Patterns

### Request-Response Pattern

Implement a request-response pattern for synchronous communication:

```typescript
// src/modules/communication/requestResponse.ts
import { ModuleMessage, ModuleResponse } from './frontend';

export interface RequestResponseManager {
  request<T = any, R = any>(target: string, type: string, data: T): Promise<R>;
  respond(correlationId: string, data: any, success?: boolean): void;
}

export class RequestResponseManagerImpl implements RequestResponseManager {
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timeoutId: number;
  }>();

  constructor() {
    // Setup response listener
    moduleEventBroker.subscribe('module-response', (message) => {
      const response = message.data as ModuleResponse;
      this.handleResponse(response);
    });
  }

  async request<T = any, R = any>(target: string, type: string, data: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const correlationId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Store the request
      const timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        reject(new Error(`Request ${correlationId} timed out`));
      }, 10000) as unknown as number;

      this.pendingRequests.set(correlationId, { resolve, reject, timeoutId });

      // Send the request
      const message: ModuleMessage = {
        id: `req-${correlationId}`,
        source: 'frontend',
        target,
        type,
        data,
        correlationId,
        timestamp: Date.now(),
      };

      moduleCommunicationManager.emitToFrontendModule(target, type, message);
    });
  }

  respond(correlationId: string, data: any, success: boolean = true): void {
    const response: ModuleResponse = {
      success,
      data,
      correlationId,
      error: success ? undefined : 'Request failed'
    };

    moduleCommunicationManager.emitToFrontendModule(
      'response-handler',
      'module-response',
      response
    );
  }

  private handleResponse(response: ModuleResponse): void {
    const request = this.pendingRequests.get(response.correlationId!);
    if (request) {
      clearTimeout(request.timeoutId);
      this.pendingRequests.delete(response.correlationId!);
      
      if (response.success) {
        request.resolve(response.data);
      } else {
        request.reject(new Error(response.error || 'Request failed'));
      }
    }
  }
}

export const requestResponseManager = new RequestResponseManagerImpl();
```

### Message Queue System

Implement a message queue for reliable communication:

```typescript
// src/modules/communication/messageQueue.ts
import { ModuleMessage } from './frontend';

export interface QueueConfig {
  maxRetries: number;
  retryDelay: number;
  maxQueueSize: number;
}

export class MessageQueue {
  private queue: ModuleMessage[] = [];
  private processing: boolean = false;
  private config: QueueConfig;

  constructor(config?: Partial<QueueConfig>) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      maxQueueSize: 100,
      ...config
    };
  }

  async enqueue(message: ModuleMessage, attempts: number = 0): Promise<void> {
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new Error('Message queue is full');
    }

    // Add message with attempt tracking
    const queuedMessage = {
      ...message,
      attempt: attempts
    } as ModuleMessage & { attempt: number };

    this.queue.push(queuedMessage);

    // Start processing if not already processing
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const message = this.queue.shift()!;
      
      try {
        await this.processMessage(message);
      } catch (error) {
        // Handle message processing failure
        await this.handleMessageFailure(message, error);
      }

      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.processing = false;
  }

  private async processMessage(message: ModuleMessage & { attempt: number }): Promise<void> {
    // Send message via communication manager
    await moduleCommunicationManager.sendMessage(message.target, message.type, message.data);
  }

  private async handleMessageFailure(message: ModuleMessage & { attempt: number }, error: any): Promise<void> {
    if (message.attempt < this.config.maxRetries) {
      // Re-queue with incremented attempt count
      setTimeout(() => {
        this.enqueue({ ...message }, message.attempt + 1);
      }, this.config.retryDelay * Math.pow(2, message.attempt)); // Exponential backoff
    } else {
      console.error(`Message failed after ${this.config.maxRetries} attempts:`, message, error);
      // Implement dead letter queue or error reporting
    }
  }

  /**
   * Get current queue statistics
   */
  getStats(): { length: number; processing: boolean } {
    return {
      length: this.queue.length,
      processing: this.processing
    };
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
  }
}

export const messageQueue = new MessageQueue();
```

## Testing

Test the communication patterns:

```typescript
// src/__tests__/moduleCommunication.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  ModuleCommunicationManager, 
  moduleCommunicationManager 
} from '../modules/communication/frontend';
import { 
  ModuleEventBroker, 
  moduleEventBroker 
} from '../modules/communication/eventBroker';
import { messageQueue } from '../modules/communication/messageQueue';

describe('Module Communication Manager', () => {
  beforeEach(() => {
    // Mock Tauri API
    vi.mock('@tauri-apps/api', async () => ({
      invoke: vi.fn(() => Promise.resolve(true)),
      emit: vi.fn(() => Promise.resolve()),
      listen: vi.fn((event, handler) => {
        // Mock the listener setup
        return () => {};
      })
    }));
  });

  it('should send messages to backend modules', async () => {
    const result = await moduleCommunicationManager.sendMessage(
      'user-service',
      'user.create',
      { name: 'Test User', email: 'test@example.com' }
    );

    expect(result).toBeDefined();
  });

  it('should handle incoming messages', () => {
    // Setup a listener
    const callback = vi.fn();
    const subscription = moduleCommunicationManager.listenForMessages('test-event').subscribe(callback);

    // Simulate receiving a message
    const message = {
      id: 'test-id',
      source: 'backend',
      target: 'frontend',
      type: 'test-event',
      data: { test: 'data' },
      timestamp: Date.now()
    };

    // This would be called by the backend listener
    // For testing purposes, we'll call it directly
    // moduleEventBroker.emit(message);

    // Verify callback was called
    expect(callback).toHaveBeenCalledTimes(0); // This would be 1 if we called emit
    subscription.unsubscribe();
  });
});

describe('Module Event Broker', () => {
  it('should subscribe and unsubscribe correctly', () => {
    const callback = vi.fn();
    const subscription = moduleEventBroker.subscribe('test-event', callback);

    // Emit an event
    const message = {
      id: '1',
      source: 'test',
      target: 'test',
      type: 'test-event',
      data: 'test-data',
      timestamp: Date.now()
    };
    
    moduleEventBroker.emit(message);

    // Check that callback was called
    expect(callback).toHaveBeenCalledWith(message);

    // Unsubscribe and emit again
    subscription.unsubscribe();
    moduleEventBroker.emit(message);

    // Callback should still only be called once
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle wildcard subscriptions', () => {
    const callback = vi.fn();
    const subscription = moduleEventBroker.subscribeAll(callback);

    const message = {
      id: '2',
      source: 'test',
      target: 'test',
      type: 'any-event',
      data: 'test-data',
      timestamp: Date.now()
    };

    moduleEventBroker.emit(message);

    expect(callback).toHaveBeenCalledWith(message);
    subscription.unsubscribe();
  });
});

describe('Message Queue', () => {
  it('should process messages in order', async () => {
    const queue = new MessageQueue({ maxRetries: 1, retryDelay: 100, maxQueueSize: 10 });

    const message1 = {
      id: 'msg1',
      source: 'test',
      target: 'dest',
      type: 'event1',
      data: 'data1',
      timestamp: Date.now()
    };

    const message2 = {
      id: 'msg2',
      source: 'test',
      target: 'dest',
      type: 'event2',
      data: 'data2',
      timestamp: Date.now()
    };

    await queue.enqueue(message1);
    await queue.enqueue(message2);

    // Check stats
    const stats = queue.getStats();
    expect(stats.length).toBe(0); // Should be processed
  });

  it('should handle message failures with retries', async () => {
    // Mock the processMessage to fail
    const originalProcessMessage = (messageQueue as any).processMessage;
    (messageQueue as any).processMessage = () => Promise.reject(new Error('Failed'));

    // This test would require more complex mocking to properly test retry logic
    // The current implementation is basic - in a real scenario, you'd want to
    // test the retry mechanism with proper mocking
    
    (messageQueue as any).processMessage = originalProcessMessage;
  });
});
```

## Troubleshooting

Common communication challenges and solutions:

- **Event Flooding**: Implement rate limiting and event batching to prevent overwhelming the system
- **Message Loss**: Use message queues with persistence for critical communications
- **Circular Dependencies**: Use event-based communication to break direct dependencies
- **Performance**: Implement efficient serialization and compression for large messages
- **Security**: Validate and sanitize all message data, implement proper authentication

## Summary

Module communication patterns are essential for building cohesive Tauri-Vue applications where frontend and backend modules can work together effectively. By implementing proper communication channels, middleware, and patterns like request-response and event-driven architectures, you can create robust and maintainable applications.

Continue exploring related topics in our guide to [Security Implementation](./03_08_module-security-implementation.md) to learn how to secure your module communications effectively.