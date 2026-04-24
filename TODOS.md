# Reactivity Rewrite Roadmap

The application is transitioning from local component state and scattered event handling to a centralized Service-oriented reactivity model using `mitt` for events and `better-result` for functional error handling.

## Completed

### Core Infrastructure
- [x] Dependency Injection Container: Implemented `ServiceContainer` to manage service lifecycles.
- [x] Event Bus: Implemented `IEventBusService` using `mitt` for cross-cutting communication.
- [x] Storage abstraction: Implemented `IStorageService` to wrap `localStorage`.
- [x] Router abstraction: Implemented `IRouterService` to wrap History API.
- [x] DOM abstraction: Implemented `IDomService` for browser API isolation.
- [x] App Configuration: Implemented `IAppConfig` with runtime validation via TypeBox.

### Feature Reactivity
- [x] Sidebar Navigation Reactivity:
    - Implemented `ISidebarService` to manage navigation depth (path).
    - Integrated with `ServiceContainer` and `IEventBusService`.
    - Rewrote `Sidebar.tsx` to be a reactive view of the service state.
    - Used `better-result` for path resolution logic.
- [x] Theme & Appearance Reactivity:
    - Implemented `IThemeService` for dark/light mode management.
    - Centralized persistence logic using `IStorageService`.
    - Integrated with `IEventBusService` for reactive theme changes.

### Build & Tooling (SSG Pipeline)
- [x] Unified CLI: Implemented `docts` CLI for project lifecycle management.
- [x] Documentation Compiler: Implemented a custom SSG engine to generate `src/generated` from markdown.
- [x] Build Pipeline: Integrated rspack for production bundling and dev server.
- [x] Validation Suite: Implemented strict content validation and Mermaid deep validation.
- [x] Rust Engine: Implemented a high-performance compiler alternative in `scripts-rs`.
- [x] Quality Gate: Integrated Biome (linting) and tsc (type checking) into the build process.

## In Progress
- [ ] Document Lifecycle & Enhancement State:
    - [x] Moved Mermaid loading states into `IThemeService` (as a temporary home).
    - [ ] Create a dedicated `ContentService` to manage overall content rendering and loading states.
    - [ ] Implement centralized "is Rendering" state for global progress indicators.

## Planned Rewrites

### 1. Search State Management
- **Current State**: Search logic is embedded in features/search.
- **Goal**: Create a `SearchService` that manages the search query, results, and active filters.
- **Key Changes**:
    - Implement a reactive `query` state.
    - Emit `search:resultsChanged` events.
    - Use `better-result` to handle search engine failures.

### 2. Global UI State (Modals, Drawers, AST Viewer)
- **Current State**: Managed via `useState` in `MainLayout` or specific feature components.
- **Goal**: Create a `UIService` to manage the visibility of global overlays.
- **Key Changes**:
    - Implement `togglePanel(panelId)` and `closeAllPanels()`.
    - Emit events when panels open/close to adjust main content margins.

## Implementation Guidelines
- **Service-First**: Logic must live in a service, not a component.
- **Event-Driven**: Use `IEventBusService` for cross-cutting concerns.
- **Functional Errors**: Use `better-result` for any operation that can fail (lookups, API calls, parsing).
- **DI Pattern**: All services must be registered in `ServiceContainer`.
