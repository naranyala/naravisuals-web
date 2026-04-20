---
title: State Management
description: How the project uses Preact Signals and a central Event Bus for reactivity
sidebar_label: State Management
sidebar_position: 6
tags: [architecture, state, signals, events]
---

# State Management

This project uses a hybrid reactivity model combining **React Context** for global UI and document state, and a **Central Event Bus** (mitt) for transient lifecycle events.

## 1. Global Store (React Context)

We use a unified `StoreProvider` (located in `src/core/store/index.tsx`) to manage global application state using standard React hooks (`useState`, `useCallback`, `useMemo`). This provides a clean, "React-native" way to share state without external dependencies like Valtio or Redux.

### Usage in Components
You can access the UI or document state using the provided hooks:

```tsx:desc=Accessing global state via custom hooks.
import { useUIState, useDocState } from "@/core/store";

export function MyComponent() {
  const { sidebarVisible, toggleSidebar } = useUIState();
  const { currentDoc } = useDocState();
  // ...
}
```

## 2. Central Event Bus (mitt)

Transient events that don't represent a "state" (but rather an "action") are handled by the `IEventBusService`. This service is injected via DI.

### Why use an Event Bus?
- **Decoupling**: The `DocViewer` doesn't need to know about the `TopBar` to tell it when a Mermaid diagram starts loading.
- **Content Lifecycle**: Events like `mermaid:rendered` or `mathjax:rendered` allow the UI to respond to late-binding content enhancements.

### Usage Pattern
```tsx:desc=Listening for events in a component.
useEffect(() => {
  return services.events.on("mermaid:loading", (isLoading) => {
    setLoading(isLoading);
  });
}, [services.events]);
```

## 3. Implementation Comparison

| Feature | React Context | Mitt (Event Bus) |
| :--- | :--- | :--- |
| **Best for** | Persistent UI state (Visibility, Themes) | Transient actions (Navigating, Rendering) |
| **Access via** | `useUIState()` or `useDocState()` | `services.events.on(...)` |
| **React Integration** | Standard hooks, automatic re-renders | Manual state updates in `useEffect` |
| **Logic Type** | Declarative / State-driven | Imperative / Reactive |

By using both, we keep the UI logic simple and performant while maintaining a clean, decoupled architecture for document-processing side effects (Event Bus).
