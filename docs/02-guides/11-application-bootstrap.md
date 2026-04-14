---
title: Application Bootstrap
description: How the React app starts, goober setup, DI container wiring, and HMR configuration
sidebar_label: App Bootstrap
sidebar_position: 13
---

# Application Bootstrap

:::note Boot Sequence
Understanding the application bootstrap helps with debugging startup issues. The sequence is: HTML loads → MathJax config → rspack bundle executes → goober setup → theme pre-apply → React mounts.
:::

This document explains how the documentation site boots up, from the moment the browser loads `index.html` to when the interactive SPA is running.

---

## Entry Point: `src/frontend.tsx`

The file `src/frontend.tsx` is the **single entry point** for the entire application. rspack bundles this file and all its imports into the final JavaScript bundle.

### Bootstrap Sequence

```mermaid:desc=Sequence diagram showing the complete application boot sequence: index.html loads, MathJax config loads async, rspack bundle loads, frontend.tsx executes (goober setup, theme pre-application, React root creation, component tree render), and HMR configuration.
sequenceDiagram
    participant Browser as Browser
    participant HTML as index.html
    participant MathJax as MathJax Config
    participant Bundle as Rspack Bundle
    participant Frontend as frontend.tsx
    participant Goober as goober setup
    participant Theme as Theme Service
    participant React as React Root
    participant App as Component Tree

    Browser->>HTML: Load page
    HTML->>MathJax: Load MathJax config (async)
    HTML->>Bundle: Load index.[hash].js

    Bundle->>Frontend: Execute

    Frontend->>Goober: setup(createElement)
    Goober-->>Frontend: goober initialized

    Frontend->>Theme: getInitialTheme()
    Theme->>Theme: "Check localStorage\nCheck prefers-color-scheme"
    Theme-->>Frontend: isDark boolean

    Frontend->>Theme: applyTheme(isDark)
    Theme->>Theme: Set data-theme on <html>

    Frontend->>React: createRoot(#root)
    React->>App: Render component tree

    Note over App: "StrictMode >\nErrorBoundary >\nServicesProvider >\nApp"

    App-->>React: Virtual DOM created
    React-->>Browser: Paint UI

    Frontend->>Frontend: "Configure HMR\n(development only)"

    Note over Browser,App: "Application is now\nfully interactive"
```

### Step-by-Step Breakdown

```typescript:desc=Complete frontend.tsx entry point: imports, goober setup, theme pre-application, React 18 root creation, component tree rendering, and HMR configuration
import { createElement } from "react";
import { setup } from "goober";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import { ServicesProvider } from "./services";
import { defaultContainer } from "./services/container";
import "./styles/index.css";

// 1. Initialize goober with React's createElement
setup(createElement);

// 2. Apply initial theme before React mounts (prevents flash of wrong theme)
const isDark = defaultContainer.theme.getInitialTheme();
defaultContainer.theme.applyTheme(isDark);

// 3. Create React 18 root on the #root element
const root = createRoot(document.getElementById("root")!);

// 4. Render the application tree
root.render(
  <StrictMode>
    <ErrorBoundary>
      <ServicesProvider container={defaultContainer}>
        <App />
      </ServicesProvider>
    </ErrorBoundary>
  </StrictMode>
);

// 5. Hot Module Replacement (development only)
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
```

---

## Goober Setup

**Goober** is a minimal CSS-in-JS library (~1KB). It's used sparingly in this project for dynamic styles that can't be expressed as static CSS.

### Why Goober?

- **Tiny footprint**: 1KB vs 13KB for styled-components
- **Zero dependencies**: No babel plugin needed
- **React 19 compatible**: Works with the automatic JSX runtime
- **Complements CSS modules**: Most styles live in `.css` files; goober handles runtime-generated styles

### How It's Used

```typescript:desc=Goober API usage examples: setup initialization, css class generation, styled component creation, and global style injection
import { setup, css, styled, glob } from "goober";
import { createElement } from "react";

// Must be called once before using any goober features
setup(createElement);

// Generate a unique class name
const className = css`
  color: red;
  font-size: 1.5rem;
`;

// Create a styled component
const Button = styled("button")`
  background: blue;
  color: white;
  &:hover { background: darkblue; }
`;

// Global styles (runs once)
glob`
  * { margin: 0; padding: 0; box-sizing: border-box; }
`;
```

### Where Goober Is Used in the Project

Most of the project uses static CSS in `src/styles/*.css`. Goober is reserved for:
- Runtime-generated styles that depend on state
- Dynamic keyframe animations
- Global style resets or overrides

---

## DI Container Wiring

The **Dependency Injection container** is created once at the top level and shared across the entire app via React Context.

### Container Creation

```typescript:desc=Importing the pre-configured DI container that provides storage, router, DOM, theme, and config services
import { defaultContainer } from "./services/container";
```

`defaultContainer` is a pre-configured `ServiceContainer` with:
- **Storage**: Wraps `localStorage` with error handling
- **Router**: Wraps History API (`pushState`, `popstate`)
- **DOM**: Wraps DOM APIs (scroll, resize, viewport)
- **Theme**: Theme persistence and toggle logic
- **Config**: Site title, breakpoints, route prefixes

### Provider Injection

```typescript:desc=JSX showing how ServicesProvider wraps the App component to make DI container available via React Context
<ServicesProvider container={defaultContainer}>
  <App />
</ServicesProvider>
```

`ServicesProvider` creates a React Context with the container. Any component in the tree can access services via:

```typescript:desc=Hook usage patterns: useServices for the full container, useService with a key for individual services
// Get the full container
const services = useServices();

// Get a specific service
const storage = useService("storage");
const router = useService("router");
```

### Why This Pattern?

1. **Testability**: Tests can inject mock services via `ServicesProvider`
2. **SSR-ready**: Services check `typeof window` before accessing browser APIs
3. **Single source of truth**: All browser API access goes through interfaces
4. **No prop drilling**: Services are available anywhere in the component tree

---

## Theme Pre-Application

One subtle but important detail: the theme is applied **before** React mounts.

```mermaid:desc=Sequence diagram showing the theme detection and pre-application flow: frontend.tsx calls getInitialTheme(), checks localStorage, falls back to prefers-color-scheme, returns boolean, then applyTheme() sets data-theme on <html> to prevent flash of wrong theme.
sequenceDiagram
    participant TS as frontend.tsx
    participant Theme as theme.getInitialTheme()
    participant Storage as localStorage
    participant OS as "OS/Browser\nprefers-color-scheme"
    participant Apply as theme.applyTheme()
    participant HTML as <html> element

    TS->>Theme: Call getInitialTheme()

    Theme->>Storage: Check storage.getItem("theme")

    alt Theme found in storage
        Storage-->>Theme: Return "dark" or "light"
    else No stored preference
        Theme->>OS: Check matchMedia()
        OS-->>Theme: Return system preference
    else Neither available
        Theme->>Theme: Default to false (light)
    end

    Theme-->>TS: Return isDark boolean

    TS->>Apply: Call applyTheme(isDark)

    Apply->>HTML: "Set data-theme attribute\n\"dark\" or \"light\""

    Note over HTML: "CSS [data-theme=\"...\"]\nselectors now match"

    TS->>TS: Continue with React mount

    style TS fill:#e1f5ff
    style HTML fill:#e8f5e9
```

```typescript:desc=Theme pre-application: detecting and applying the theme before React mounts to prevent flash of wrong theme
const isDark = defaultContainer.theme.getInitialTheme();
defaultContainer.theme.applyTheme(isDark);
```

**Why?** If we waited until React rendered, the user would see a flash of the default (light) theme before the correct theme loaded. By setting `data-theme` on `<html>` immediately, the CSS `[data-theme="..."]` selectors match from the first paint.

### How `getInitialTheme()` Works

```typescript:desc=Theme detection logic: checks localStorage first, falls back to prefers-color-scheme media query
getInitialTheme: () => {
  const stored = storage.getItem("theme");
  if (stored !== null) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
```

1. Check localStorage for a saved preference
2. Fall back to the OS/browser `prefers-color-scheme` setting
3. Default to `false` (light) if neither is available

---

## Error Boundary

The entire app is wrapped in `<ErrorBoundary>`, a class component that catches render errors:

```typescript:desc=ErrorBoundary class component implementation using getDerivedStateFromError and componentDidCatch to handle and display render errors
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <pre>{this.state.error.message}</pre>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

This ensures that a crash in any component doesn't white-screen the entire site.

---

## HMR Configuration

In development, rspack's dev server supports **Hot Module Replacement** (HMR):

```typescript:desc=HMR acceptance handler that tells rspack to accept hot updates for this module in development mode
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
```

This tells rspack to accept hot updates for this module. When you edit any `.ts`/`.tsx`/`.css` file:
1. rspack recompiles the changed modules
2. Only the changed modules are sent to the browser
3. React state is preserved (components don't remount)
4. The UI updates instantly without a full page reload

The `ReactRefreshRspackPlugin` (configured in `rspack.config.ts`) handles React-specific HMR for component state preservation.

---

## HTML Template

The `src/index.html` file is the shell that rspack injects the bundle into:

```html:desc=HTML shell template with MathJax CDN configuration and the root div element where React mounts
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Docs</title>
    <!-- MathJax configuration -->
    <script>
      window.MathJax = {
        tex: {
          inlineMath: [["$", "$"], ["\\(", "\\)"]],
          displayMath: [["$$", "$$"], ["\\[", "\\]"]],
        },
      };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js" async></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**Key elements:**
- `<div id="root">` — React mounts here via `createRoot()`
- MathJax `<script>` — Loaded async from CDN, configured before React runs
- rspack injects `<script src="index.[hash].js">` and `<link>` tags during build

---

## Summary: The Boot Flow

| Step | What Happens | Why It Matters |
|------|-------------|----------------|
| 1 | Browser loads `index.html` | MathJax config runs immediately |
| 2 | JS bundle downloads | rspack's single output file |
| 3 | `setup(createElement)` | Goober ready for dynamic styles |
| 4 | `applyTheme(getInitialTheme())` | No flash of wrong theme |
| 5 | `createRoot(#root)` | React 18 concurrent features enabled |
| 6 | Render tree mounts | DI container available to all components |
| 7 | `useEffect` hooks fire | Mermaid, MathJax, scroll tracking start |
| 8 | App is interactive | User can navigate, change theme, etc. |
