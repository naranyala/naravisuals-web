# Dependency Management

Managing dependencies between modules is crucial for maintaining clean, maintainable, and scalable applications. This article explores patterns for handling module dependencies in both frontend and backend layers of Tauri-Vue applications.

## Prerequisites

- Understanding of module architecture concepts
- Knowledge of dependency injection principles
- Familiarity with Tauri's plugin system

## Core Concepts

Module dependency management involves establishing clear relationships between modules, ensuring proper initialization order, and providing mechanisms for modules to access services provided by other modules. The goal is to maintain loose coupling while enabling modules to collaborate effectively.

## Implementation

### Dependency Graph Management

Create a system to represent and manage module dependencies:

```typescript
// src/modules/dependency/dependencyGraph.ts
import { topologicalSort } from './topologicalSort';

export interface ModuleNode {
  id: string;
  dependencies: string[];
  provides: string[]; // Services/functionalities this module provides
  requires: string[]; // Services/functionalities this module requires
  initialized: boolean;
  instance?: any;
}

export class DependencyGraph {
  private nodes: Map<string, ModuleNode> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map(); // dependency -> dependents

  /**
   * Add a module to the graph
   */
  addModule(node: ModuleNode): void {
    this.nodes.set(node.id, node);
    
    // Initialize adjacency list for dependencies
    for (const dep of node.dependencies) {
      if (!this.adjacencyList.has(dep)) {
        this.adjacencyList.set(dep, new Set());
      }
      this.adjacencyList.get(dep)!.add(node.id);
    }
  }

  /**
   * Get modules in initialization order (topological sort)
   */
  getInitializationOrder(): string[] {
    const nodes = Array.from(this.nodes.values());
    return topologicalSort(
      nodes.map(n => n.id),
      (id) => this.nodes.get(id)?.dependencies || []
    );
  }

  /**
   * Check if a module can be safely removed
   */
  canRemoveModule(moduleId: string): boolean {
    // Check if any other module depends on this module
    for (const [id, node] of this.nodes.entries()) {
      if (id !== moduleId && node.dependencies.includes(moduleId)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all modules that depend on the specified module
   */
  getDependents(moduleId: string): string[] {
    const dependents = this.adjacencyList.get(moduleId);
    return dependents ? Array.from(dependents) : [];
  }

  /**
   * Check if adding a dependency would create a cycle
   */
  wouldCreateCycle(from: string, to: string): boolean {
    // Perform cycle detection by temporarily adding the edge and checking for path back
    const originalDeps = [...(this.nodes.get(from)?.dependencies || [])];
    
    // Temporarily add dependency
    const node = this.nodes.get(from);
    if (node) {
      node.dependencies.push(to);
    } else {
      this.addModule({
        id: from,
        dependencies: [to],
        provides: [],
        requires: [],
        initialized: false
      });
    }

    // Check for cycle by trying to get initialization order
    try {
      this.getInitializationOrder();
      // Restore original dependencies
      const node = this.nodes.get(from);
      if (node) {
        node.dependencies = originalDeps;
      }
      return false;
    } catch (error) {
      // Restore original dependencies
      const node = this.nodes.get(from);
      if (node) {
        node.dependencies = originalDeps;
      }
      return true;
    }
  }

  /**
   * Get dependency information for a module
   */
  getModuleInfo(moduleId: string): ModuleNode | undefined {
    return this.nodes.get(moduleId);
  }

  /**
   * Get all registered modules
   */
  getAllModules(): ModuleNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Remove a module from the graph
   */
  removeModule(moduleId: string): void {
    this.nodes.delete(moduleId);
    this.adjacencyList.delete(moduleId);
    
    // Remove references from other modules
    for (const node of this.nodes.values()) {
      node.dependencies = node.dependencies.filter(dep => dep !== moduleId);
    }
  }
}
```

### Topological Sort Implementation

Implement the topological sort algorithm needed for dependency resolution:

```typescript
// src/modules/dependency/topologicalSort.ts
export function topologicalSort(
  nodes: string[],
  getDependencies: (nodeId: string) => string[]
): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>(); // For cycle detection

  function visit(nodeId: string): void {
    if (visited.has(nodeId)) {
      return;
    }

    if (visiting.has(nodeId)) {
      throw new Error(`Cycle detected: ${nodeId} depends on itself`);
    }

    visiting.add(nodeId);

    const dependencies = getDependencies(nodeId);
    for (const dep of dependencies) {
      visit(dep);
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    sorted.unshift(nodeId); // Add to beginning to reverse post-order
  }

  for (const node of nodes) {
    if (!visited.has(node)) {
      visit(node);
    }
  }

  return sorted;
}

// Enhanced dependency resolver with cycle detection and validation
export class DependencyResolver {
  private graph: DependencyGraph = new DependencyGraph();

  registerModule(
    id: string,
    dependencies: string[],
    provides: string[] = [],
    requires: string[] = []
  ): void {
    // Validate dependencies don't create cycles
    for (const dep of dependencies) {
      if (this.graph.wouldCreateCycle(id, dep)) {
        throw new Error(`Adding dependency ${dep} to ${id} would create a cycle`);
      }
    }

    this.graph.addModule({
      id,
      dependencies,
      provides,
      requires,
      initialized: false
    });
  }

  /**
   * Get modules in the order they should be initialized
   */
  getInitializationOrder(): string[] {
    return this.graph.getInitializationOrder();
  }

  /**
   * Validate that all required services are provided
   */
  validateDependencies(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const node of this.graph.getAllModules()) {
      for (const required of node.requires) {
        // Check if any other module provides this service
        let provided = false;
        for (const otherNode of this.graph.getAllModules()) {
          if (otherNode.id !== node.id && otherNode.provides.includes(required)) {
            provided = true;
            break;
          }
        }
        
        if (!provided) {
          errors.push(`Module ${node.id} requires service '${required}' but no module provides it`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get modules that can be safely loaded in parallel
   */
  getParallelLoadableGroups(): string[][] {
    const order = this.getInitializationOrder();
    const groups: string[][] = [];
    const processed = new Set<string>();

    for (const moduleId of order) {
      const node = this.graph.getModuleInfo(moduleId);
      if (!node) continue;

      // Find a group where all dependencies are already processed
      let assigned = false;
      for (const group of groups) {
        // Check if all dependencies of this module are in previous groups
        const allDepsProcessed = node.dependencies.every(dep => processed.has(dep));
        
        if (allDepsProcessed) {
          group.push(moduleId);
          processed.add(moduleId);
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        // Create new group
        groups.push([moduleId]);
        processed.add(moduleId);
      }
    }

    return groups;
  }
}
```

### Module Provider System

Create a system for modules to provide services to other modules:

```typescript
// src/modules/dependency/moduleProvider.ts
import { DependencyResolver } from './dependencyGraph';

export interface ServiceDefinition {
  id: string;
  factory: () => any;
  scope: 'singleton' | 'transient' | 'request';
  dependencies?: string[];
}

export interface ModuleDefinition {
  id: string;
  services: ServiceDefinition[];
  dependencies: string[];
  init?: () => Promise<void> | void;
  destroy?: () => Promise<void> | void;
}

export class ModuleProvider {
  private modules: Map<string, ModuleDefinition> = new Map();
  private services: Map<string, any> = new Map(); // Cached singleton services
  private dependencyResolver: DependencyResolver = new DependencyResolver();
  private initializedModules: Set<string> = new Set();

  /**
   * Register a module with its services and dependencies
   */
  registerModule(moduleDef: ModuleDefinition): void {
    if (this.modules.has(moduleDef.id)) {
      throw new Error(`Module ${moduleDef.id} already registered`);
    }

    // Register in dependency resolver
    const provides = moduleDef.services.map(s => s.id);
    const requires = moduleDef.dependencies; // Assuming dependencies represent required services
    
    this.dependencyResolver.registerModule(
      moduleDef.id,
      moduleDef.dependencies,
      provides,
      requires
    );

    this.modules.set(moduleDef.id, moduleDef);
  }

  /**
   * Initialize all modules in dependency order
   */
  async initializeAll(): Promise<void> {
    // Validate dependencies first
    const validation = this.dependencyResolver.validateDependencies();
    if (!validation.valid) {
      throw new Error(`Dependency validation failed: ${validation.errors.join(', ')}`);
    }

    const initOrder = this.dependencyResolver.getInitializationOrder();

    for (const moduleId of initOrder) {
      if (!this.initializedModules.has(moduleId)) {
        await this.initializeModule(moduleId);
      }
    }
  }

  /**
   * Initialize a single module
   */
  private async initializeModule(moduleId: string): Promise<void> {
    const moduleDef = this.modules.get(moduleId);
    if (!moduleDef) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Initialize dependencies first
    for (const depId of moduleDef.dependencies) {
      if (!this.initializedModules.has(depId)) {
        await this.initializeModule(depId);
      }
    }

    // Initialize the module itself
    if (moduleDef.init) {
      await moduleDef.init();
    }

    // Register module services
    for (const serviceDef of moduleDef.services) {
      if (serviceDef.scope === 'singleton') {
        // Create and cache singleton service
        const service = this.createService(serviceDef);
        this.services.set(serviceDef.id, service);
      }
    }

    this.initializedModules.add(moduleId);
    console.log(`Module ${moduleId} initialized successfully`);
  }

  /**
   * Get a service instance
   */
  getService<T>(serviceId: string): T {
    const service = this.services.get(serviceId);
    if (service) {
      return service;
    }

    // Look for transient or request-scoped services
    for (const moduleDef of this.modules.values()) {
      const serviceDef = moduleDef.services.find(s => s.id === serviceId);
      if (serviceDef && serviceDef.scope !== 'singleton') {
        return this.createService(serviceDef);
      }
    }

    throw new Error(`Service ${serviceId} not found`);
  }

  /**
   * Check if a service exists
   */
  hasService(serviceId: string): boolean {
    return this.services.has(serviceId) || this.findServiceDefinition(serviceId) !== undefined;
  }

  /**
   * Create a service instance (handles dependencies)
   */
  private createService(serviceDef: ServiceDefinition): any {
    if (!serviceDef.dependencies || serviceDef.dependencies.length === 0) {
      return serviceDef.factory();
    }

    // Resolve dependencies
    const dependencies = serviceDef.dependencies.map(dep => this.getService(dep));
    return serviceDef.factory(...dependencies);
  }

  /**
   * Find a service definition across all modules
   */
  private findServiceDefinition(serviceId: string): ServiceDefinition | undefined {
    for (const moduleDef of this.modules.values()) {
      const serviceDef = moduleDef.services.find(s => s.id === serviceId);
      if (serviceDef) {
        return serviceDef;
      }
    }
    return undefined;
  }

  /**
   * Get parallel loadable module groups
   */
  getParallelLoadableGroups(): string[][] {
    return this.dependencyResolver.getParallelLoadableGroups();
  }

  /**
   * Destroy and clean up all modules
   */
  async destroyAll(): Promise<void> {
    // Destroy in reverse initialization order
    const initOrder = Array.from(this.initializedModules).reverse();
    
    for (const moduleId of initOrder) {
      const moduleDef = this.modules.get(moduleId);
      if (moduleDef?.destroy) {
        try {
          await moduleDef.destroy();
        } catch (error) {
          console.error(`Error destroying module ${moduleId}:`, error);
        }
      }
    }

    // Clear caches
    this.services.clear();
    this.initializedModules.clear();
  }
}
```

### Module Lifecycle Management

Create a system for managing module lifecycles:

```typescript
// src/modules/dependency/moduleLifecycle.ts
export enum ModuleStatus {
  REGISTERED = 'registered',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

export interface ModuleLifecycleEvent {
  moduleId: string;
  status: ModuleStatus;
  timestamp: number;
  error?: string;
}

export class ModuleLifecycleManager {
  private modules: Map<string, ModuleStatus> = new Map();
  private eventCallbacks: Array<(event: ModuleLifecycleEvent) => void> = [];
  private dependencies = new Map<string, string[]>(); // module -> dependencies

  /**
   * Register a module
   */
  register(moduleId: string, dependencies: string[] = []): void {
    this.modules.set(moduleId, ModuleStatus.REGISTERED);
    this.dependencies.set(moduleId, [...dependencies]);
  }

  /**
   * Initialize a module
   */
  async initialize(moduleId: string): Promise<void> {
    const status = this.modules.get(moduleId);
    if (!status) {
      throw new Error(`Module ${moduleId} not registered`);
    }

    if (status !== ModuleStatus.REGISTERED) {
      throw new Error(`Module ${moduleId} not in REGISTERED state, current: ${status}`);
    }

    // Check dependencies are initialized
    const deps = this.dependencies.get(moduleId) || [];
    for (const dep of deps) {
      const depStatus = this.modules.get(dep);
      if (depStatus !== ModuleStatus.INITIALIZED && depStatus !== ModuleStatus.RUNNING) {
        throw new Error(`Dependency ${dep} of module ${moduleId} is not initialized`);
      }
    }

    this.setStatus(moduleId, ModuleStatus.INITIALIZING);

    try {
      // Module initialization would happen here
      await this.doInitialize(moduleId);
      this.setStatus(moduleId, ModuleStatus.INITIALIZED);
    } catch (error) {
      this.setStatus(moduleId, ModuleStatus.ERROR);
      throw error;
    }
  }

  /**
   * Start a module
   */
  async start(moduleId: string): Promise<void> {
    const status = this.modules.get(moduleId);
    if (!status) {
      throw new Error(`Module ${moduleId} not registered`);
    }

    if (status !== ModuleStatus.INITIALIZED) {
      throw new Error(`Module ${moduleId} not in INITIALIZED state, current: ${status}`);
    }

    this.setStatus(moduleId, ModuleStatus.STARTING);

    try {
      // Module startup would happen here
      await this.doStart(moduleId);
      this.setStatus(moduleId, ModuleStatus.RUNNING);
    } catch (error) {
      this.setStatus(moduleId, ModuleStatus.ERROR);
      throw error;
    }
  }

  /**
   * Stop a module
   */
  async stop(moduleId: string): Promise<void> {
    const status = this.modules.get(moduleId);
    if (!status) {
      throw new Error(`Module ${moduleId} not registered`);
    }

    if (status !== ModuleStatus.RUNNING) {
      throw new Error(`Module ${moduleId} not in RUNNING state, current: ${status}`);
    }

    this.setStatus(moduleId, ModuleStatus.STOPPING);

    try {
      // Module shutdown would happen here
      await this.doStop(moduleId);
      this.setStatus(moduleId, ModuleStatus.STOPPED);
    } catch (error) {
      this.setStatus(moduleId, ModuleStatus.ERROR);
      throw error;
    }
  }

  /**
   * Check if a module can be started (dependencies running)
   */
  canStart(moduleId: string): boolean {
    const deps = this.dependencies.get(moduleId) || [];
    
    for (const dep of deps) {
      const depStatus = this.modules.get(dep);
      if (depStatus !== ModuleStatus.RUNNING) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get a module's current status
   */
  getStatus(moduleId: string): ModuleStatus | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Subscribe to lifecycle events
   */
  onLifecycleEvent(callback: (event: ModuleLifecycleEvent) => void): () => void {
    this.eventCallbacks.push(callback);
    
    return () => {
      const index = this.eventCallbacks.indexOf(callback);
      if (index > -1) {
        this.eventCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get all modules with their statuses
   */
  getAllModuleStatuses(): Map<string, ModuleStatus> {
    return new Map(this.modules);
  }

  /**
   * Get modules by status
   */
  getModulesByStatus(status: ModuleStatus): string[] {
    const result: string[] = [];
    
    for (const [moduleId, moduleStatus] of this.modules) {
      if (moduleStatus === status) {
        result.push(moduleId);
      }
    }
    
    return result;
  }

  private setStatus(moduleId: string, status: ModuleStatus): void {
    this.modules.set(moduleId, status);
    
    const event: ModuleLifecycleEvent = {
      moduleId,
      status,
      timestamp: Date.now()
    };
    
    // Notify all listeners
    for (const callback of this.eventCallbacks) {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in lifecycle event callback:', error);
      }
    }
  }

  // Placeholder methods for actual module operations
  private async doInitialize(moduleId: string): Promise<void> {
    // Simulate async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`Module ${moduleId} initialized`);
  }

  private async doStart(moduleId: string): Promise<void> {
    // Simulate async startup
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(`Module ${moduleId} started`);
  }

  private async doStop(moduleId: string): Promise<void> {
    // Simulate async shutdown
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(`Module ${moduleId} stopped`);
  }
}
```

## Advanced Patterns

### Service Locator Pattern

Implement a service locator for flexible service access:

```typescript
// src/modules/dependency/serviceLocator.ts
export interface ServiceLocator {
  get<T>(id: string): T;
  has(id: string): boolean;
  register(id: string, factory: () => any, scope?: 'singleton' | 'transient'): void;
  resolveDependencies(deps: string[]): any[];
}

export class DefaultServiceLocator implements ServiceLocator {
  private singletonServices = new Map<string, any>();
  private serviceFactories = new Map<string, () => any>();
  private scopes: Map<string, 'singleton' | 'transient'> = new Map();

  get<T>(id: string): T {
    if (this.scopes.get(id) === 'singleton' && this.singletonServices.has(id)) {
      return this.singletonServices.get(id) as T;
    }

    const factory = this.serviceFactories.get(id);
    if (!factory) {
      throw new Error(`Service ${id} not registered`);
    }

    const service = factory();
    
    // Cache singleton services
    if (this.scopes.get(id) === 'singleton') {
      this.singletonServices.set(id, service);
    }

    return service as T;
  }

  has(id: string): boolean {
    return this.serviceFactories.has(id);
  }

  register(id: string, factory: () => any, scope: 'singleton' | 'transient' = 'singleton'): void {
    this.serviceFactories.set(id, factory);
    this.scopes.set(id, scope);
  }

  resolveDependencies(deps: string[]): any[] {
    return deps.map(dep => this.get(dep));
  }
}

// Enhanced service locator with contextual resolution
export class ContextualServiceLocator extends DefaultServiceLocator {
  private contextRegistry = new Map<string, Map<string, any>>(); // context -> serviceId -> instance

  getContextual<T>(context: string, id: string): T {
    // Check if service is registered in context
    const contextMap = this.contextRegistry.get(context);
    if (contextMap && contextMap.has(id)) {
      return contextMap.get(id) as T;
    }

    // Fall back to default service
    return this.get(id);
  }

  registerContextual(context: string, id: string, factory: () => any): void {
    if (!this.contextRegistry.has(context)) {
      this.contextRegistry.set(context, new Map());
    }

    const contextMap = this.contextRegistry.get(context)!;
    contextMap.set(id, factory());
  }

  clearContext(context: string): void {
    this.contextRegistry.delete(context);
  }
}
```

### Module Configuration System

Create a configuration system for modules:

```typescript
// src/modules/dependency/moduleConfig.ts
import { reactive } from 'vue';

export interface ModuleConfiguration {
  moduleId: string;
  enabled: boolean;
  dependencies: string[];
  options: Record<string, any>;
  loadPriority?: number; // Higher numbers load first
}

export class ModuleConfigManager {
  private configs = reactive<Map<string, ModuleConfiguration>>(new Map());

  /**
   * Set configuration for a module
   */
  setConfig(config: ModuleConfiguration): void {
    // Validate dependencies exist
    for (const dep of config.dependencies) {
      if (!this.configs.has(dep) && dep !== 'core') {
        console.warn(`Configuration references non-existent dependency: ${dep}`);
      }
    }

    this.configs.set(config.moduleId, config);
  }

  /**
   * Get configuration for a module
   */
  getConfig(moduleId: string): ModuleConfiguration | undefined {
    return this.configs.get(moduleId);
  }

  /**
   * Get all available configurations
   */
  getAllConfigs(): ModuleConfiguration[] {
    return Array.from(this.configs.values());
  }

  /**
   * Enable/disable a module
   */
  setEnabled(moduleId: string, enabled: boolean): void {
    const config = this.configs.get(moduleId);
    if (config) {
      config.enabled = enabled;
    }
  }

  /**
   * Check if a module is enabled
   */
  isEnabled(moduleId: string): boolean {
    const config = this.configs.get(moduleId);
    return config ? config.enabled : false;
  }

  /**
   * Get enabled modules only
   */
  getEnabledModules(): string[] {
    const enabled: string[] = [];
    for (const [id, config] of this.configs) {
      if (config.enabled) {
        enabled.push(id);
      }
    }
    return enabled;
  }

  /**
   * Get modules in load order based on priority
   */
  getLoadOrder(): string[] {
    return Array.from(this.configs.values())
      .sort((a, b) => (b.loadPriority || 0) - (a.loadPriority || 0))
      .map(config => config.moduleId);
  }

  /**
   * Update module options
   */
  updateOptions(moduleId: string, options: Record<string, any>): void {
    const config = this.configs.get(moduleId);
    if (config) {
      Object.assign(config.options, options);
    }
  }

  /**
   * Get module options
   */
  getOptions(moduleId: string): Record<string, any> {
    const config = this.configs.get(moduleId);
    return config ? config.options : {};
  }

  /**
   * Reset all configurations
   */
  reset(): void {
    this.configs.clear();
  }
}

// Create and export singleton instance
export const moduleConfigManager = new ModuleConfigManager();
```

### Circular Dependency Resolution

Implement a system to detect and resolve circular dependencies:

```typescript
// src/modules/dependency/circularDependencyResolver.ts
import { DependencyGraph, ModuleNode } from './dependencyGraph';

export class CircularDependencyResolver {
  /**
   * Detect circular dependencies in the graph
   */
  static detectCycles(graph: DependencyGraph): string[][] {
    const allNodes = graph.getAllModules();
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    function dfs(nodeId: string, path: string[]): void {
      if (recursionStack.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart).concat([nodeId]));
        }
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const node = graph.getModuleInfo(nodeId);
      if (node) {
        for (const dep of node.dependencies) {
          dfs(dep, [...path]);
        }
      }

      recursionStack.delete(nodeId);
    }

    for (const node of allNodes) {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    }

    return cycles;
  }

  /**
   * Suggest solutions for circular dependencies
   */
  static suggestSolutions(graph: DependencyGraph): Array<{
    cycle: string[];
    solutions: string[];
  }> {
    const cycles = this.detectCycles(graph);
    const suggestions = [];

    for (const cycle of cycles) {
      const cycleSet = new Set(cycle);
      const suggestionsForCycle = [];

      // Look for services that could be extracted to break the cycle
      for (const moduleId of cycle) {
        const node = graph.getModuleInfo(moduleId);
        if (node) {
          // Suggest creating a shared module for common services
          suggestionsForCycle.push(
            `Create a shared module containing services used by: ${cycle.join(', ')}`
          );
          
          // Suggest refactoring dependencies
          suggestionsForCycle.push(
            `Move dependency ${node.dependencies.find(d => cycleSet.has(d))} to a shared module`
          );
        }
      }

      suggestions.push({
        cycle,
        solutions: suggestionsForCycle
      });
    }

    return suggestions;
  }

  /**
   * Automatically resolve simple circular dependencies by creating a shared module
   */
  static async autoResolve(graph: DependencyGraph, strategy: 'sharedModule' | 'removeDependency' = 'sharedModule'): Promise<boolean> {
    const cycles = this.detectCycles(graph);
    
    if (cycles.length === 0) {
      return true; // No cycles to resolve
    }

    if (strategy === 'sharedModule') {
      // This would create a shared module that both cyclic dependencies depend on
      console.log('Auto-resolving cycles by creating shared modules:', cycles);
      // Implementation would involve creating new modules to break cycles
      return false; // Not implemented yet
    } else if (strategy === 'removeDependency') {
      // This would remove the dependency causing the cycle (dangerous!)
      console.log('Auto-resolving cycles by removing dependencies:', cycles);
      return false; // Not implemented yet
    }

    return false;
  }
}
```

## Testing

Test the module dependency management system:

```typescript
// src/__tests__/dependency.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  DependencyGraph, 
  DependencyResolver, 
  ModuleProvider, 
  ModuleLifecycleManager,
  ModuleStatus 
} from '../modules/dependency/moduleProvider';

describe('Module Dependency Management', () => {
  let graph: DependencyGraph;
  let resolver: DependencyResolver;

  beforeEach(() => {
    graph = new DependencyGraph();
    resolver = new DependencyResolver();
  });

  it('resolves dependencies in correct order', () => {
    // A -> B -> C (A depends on B, B depends on C)
    resolver.registerModule('C', [], ['serviceC'], []);
    resolver.registerModule('B', ['C'], ['serviceB'], ['serviceC']);
    resolver.registerModule('A', ['B'], ['serviceA'], ['serviceB']);

    const order = resolver.getInitializationOrder();
    expect(order).toEqual(['C', 'B', 'A']);
  });

  it('detects circular dependencies', () => {
    resolver.registerModule('A', ['B'], [], []);
    resolver.registerModule('B', ['C'], [], []);
    resolver.registerModule('C', ['A'], [], []); // Creates A -> B -> C -> A

    expect(() => resolver.getInitializationOrder()).toThrow();
  });

  it('validates service dependencies', () => {
    resolver.registerModule('A', [], [], ['serviceB']); // A requires serviceB
    resolver.registerModule('B', [], ['serviceB'], []); // B provides serviceB

    const validation = resolver.validateDependencies();
    expect(validation.valid).toBe(true);
  });

  it('handles missing service dependencies', () => {
    resolver.registerModule('A', [], [], ['serviceB']); // A requires serviceB
    // B doesn't provide serviceB

    const validation = resolver.validateDependencies();
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContainEqual(
      expect.stringContaining("requires service 'serviceB' but no module provides it")
    );
  });

  it('groups modules for parallel loading', () => {
    // A and B depend on C, so C should load first, then A and B in parallel
    resolver.registerModule('C', [], ['serviceC'], []);
    resolver.registerModule('A', ['C'], ['serviceA'], ['serviceC']);
    resolver.registerModule('B', ['C'], ['serviceB'], ['serviceC']);

    const groups = resolver.getParallelLoadableGroups();
    expect(groups).toEqual([
      ['C'],        // C first
      ['A', 'B']    // A and B can load in parallel after C
    ]);
  });
});

describe('Module Lifecycle Management', () => {
  let lifecycle: ModuleLifecycleManager;

  beforeEach(() => {
    lifecycle = new ModuleLifecycleManager();
  });

  it('manages module states correctly', async () => {
    lifecycle.register('moduleA', []);
    lifecycle.register('moduleB', ['moduleA']);

    // Initial state should be REGISTERED
    expect(lifecycle.getStatus('moduleA')).toBe(ModuleStatus.REGISTERED);
    expect(lifecycle.getStatus('moduleB')).toBe(ModuleStatus.REGISTERED);

    // Initialize modules
    await lifecycle.initialize('moduleA');
    await lifecycle.initialize('moduleB');

    expect(lifecycle.getStatus('moduleA')).toBe(ModuleStatus.INITIALIZED);
    expect(lifecycle.getStatus('moduleB')).toBe(ModuleStatus.INITIALIZED);

    // Start modules
    await lifecycle.start('moduleA');
    await lifecycle.start('moduleB');

    expect(lifecycle.getStatus('moduleA')).toBe(ModuleStatus.RUNNING);
    expect(lifecycle.getStatus('moduleB')).toBe(ModuleStatus.RUNNING);

    // Stop modules
    await lifecycle.stop('moduleB');
    await lifecycle.stop('moduleA');

    expect(lifecycle.getStatus('moduleA')).toBe(ModuleStatus.STOPPED);
    expect(lifecycle.getStatus('moduleB')).toBe(ModuleStatus.STOPPED);
  });

  it('respects dependency order when starting modules', () => {
    lifecycle.register('moduleA', []);
    lifecycle.register('moduleB', ['moduleA']);

    expect(lifecycle.canStart('moduleB')).toBe(false); // moduleA not running
    expect(lifecycle.canStart('moduleA')).toBe(true);
  });
});

describe('Module Provider System', () => {
  it('registers and provides services correctly', async () => {
    const provider = new ModuleProvider();

    // Register a simple service module
    provider.registerModule({
      id: 'serviceModule',
      services: [
        {
          id: 'logger',
          factory: () => ({ log: (msg: string) => console.log(msg) }),
          scope: 'singleton'
        }
      ],
      dependencies: []
    });

    // Register a dependent module
    provider.registerModule({
      id: 'consumerModule',
      services: [
        {
          id: 'serviceConsumer',
          factory: (logger: any) => ({ logger, use: () => logger.log('using service') }),
          scope: 'singleton',
          dependencies: ['logger']
        }
      ],
      dependencies: ['serviceModule']
    });

    await provider.initializeAll();

    const consumer = provider.getService('serviceConsumer');
    expect(consumer).toBeDefined();
    expect(consumer.logger).toBeDefined();
  });
});
```

## Troubleshooting

Common dependency management challenges and solutions:

- **Circular Dependencies**: Use the detection system to identify and break cycles by creating shared modules
- **Initialization Order**: Always validate dependency order before initialization
- **Memory Leaks**: Properly destroy services when modules are unloaded
- **Service Availability**: Check service availability before using them
- **Race Conditions**: Use proper synchronization when accessing shared resources

## Summary

Module dependency management is fundamental to building scalable and maintainable applications. By implementing proper dependency resolution, lifecycle management, and service provisioning, you can create robust applications where modules can safely depend on each other without creating tight coupling or circular dependencies.

Continue exploring related topics in our guide to [Module Deployment Strategies](./03_04_module-deployment-strategies.md) to learn how to package and deploy your modules effectively.