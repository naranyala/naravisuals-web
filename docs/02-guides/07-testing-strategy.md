---
title: Testing Strategy
description: Test architecture, setup, and best practices
sidebar_label: Testing
sidebar_position: 9
---

# Testing Strategy

:::tip Testing Philosophy
Tests focus on behavior, not implementation. Use `renderWithServices()` to ensure DI container is properly wired, then assert on what the user sees.
:::

## Test Framework Stack

- **Test runner**: Bun's built-in `bun:test`
- **DOM environment**: JSDOM
- **Testing utilities**: `@testing-library/react` + `@testing-library/jest-dom`

## Configuration

### bunfig.toml

```toml:desc=Bun test configuration that preloads the JSDOM setup script before running tests
[test]
preload = ["./tests/setup.ts"]
```

### Test Commands

```bash:desc=Common Bun test commands for running, watching, and generating coverage reports
bun test              # Run all tests
bun test --watch      # Watch mode
bun test --coverage   # Coverage report
```

### Test Flow

```mermaid:desc=Sequence diagram showing the test execution flow: preload runs JSDOM setup before each test, then test files execute with renderWithServices helper, then afterEach Cleanup resets state.
sequenceDiagram
    participant Runner as bun test
    participant Preload as tests/setup.ts
    participant Test as Test Files
    participant Utils as test-utils.tsx
    participant Cleanup as afterEach
    
    Runner->>Preload: preload (before ALL tests)
    Preload->>Preload: Create JSDOM environment
    Preload->>Preload: Mock window/document/navigator
    Preload->>Preload: Stub IntersectionObserver
    
    Runner->>Test: Run each test file
    Test->>Utils: renderWithServices()
    Utils->>Utils: Create ServicesProvider
    Utils->>Utils: Return result with services
    Utils-->>Test: Return rendered component
    
    Test->>Cleanup: afterEach cleanup
    Cleanup->>Cleanup: Unmount React trees
    Cleanup->>Cleanup: Reset JSDOM to fresh state
```

## Test Setup (`tests/setup.ts`)

Creates JSDOM environment before each test:

- Attaches `window`, `document`, `navigator`, `HTMLElement`, etc. to `globalThis`
- Mocks: `matchMedia`, `scrollTo`, `scrollY`, `innerWidth`, `history`, `localStorage`
- Stubs `IntersectionObserver` (no-op implementation)
- `afterEach`: Cleans up React trees and resets JSDOM to fresh state
- Silences React 19 deprecation warnings and "not wrapped in act" warnings

## Test Utilities (`tests/test-utils.tsx`)

### renderWithServices

Renders a component wrapped in `ServicesProvider` with mock services:

```typescript:desc=Example of using renderWithServices to render a Sidebar component with mock sidebar data
const { container, getByText } = renderWithServices(
  <Sidebar />,
  { mockSidebarData }
);

// Access mock services for assertions
const services = result.services;
```

### Mock Data

```typescript:desc=Reusable mock data objects for doc entries and sidebar structure in tests
mockDocEntry         // Sample doc entry
mockSidebarData      // Sample sidebar structure
```

## Test Files (15 total)

| File | Scope | What it tests |
|------|-------|---------------|
| `app.test.tsx` | Integration | App renders all layout sections, routing |
| `build-pipeline.test.ts` | Unit | Frontmatter parsing, TOC extraction, slugify, code title, all 3 plugins, end-to-end pipeline |
| `services.test.ts` | Unit | Container creation, all service interfaces, config |
| `mocks.test.ts` | Unit | Mock implementations, simulation helpers |
| `di-provider.test.tsx` | Unit | `ServicesProvider`, `useServices()`, `useService()` |
| `sidebar.test.tsx` | Component | Categories, active state, navigation clicks, dates |
| `table-of-contents.test.tsx` | Component | TOC items, level classes, href links |
| `breadcrumbs.test.tsx` | Component | Items rendering, links, current item span |
| `docviewer.test.tsx` | Component | HTML rendering, code blocks, tables, blockquotes |
| `docfooter.test.tsx` | Component | Pagination, edit link, prev/next navigation |
| `error-boundary.test.tsx` | Component | Error catching and recovery |
| `generated-output.test.ts` | Data | Generated sidebar and docs data integrity |
| `diagnostics.test.ts` | Unit | Diagnostics collection class |

## Best Practices

1. **Use `renderWithServices`** — ensures DI is properly set up
2. **Use container-scoped queries** — `container.querySelector()` avoids DOM leaks between tests
3. **Use `fn()` for mocks** — bun:test's `fn()` creates spy functions
4. **Use `beforeEach` for setup** — reset mocks and state before each test
5. **Test behavior, not implementation** — assert on what the user sees, not internal state

## Mock Service Helpers

Mock services include test helpers for simulating events:

```typescript:desc=Mock service methods for simulating browser navigation, resize, keyboard events, and viewport changes
// Simulate browser navigation
services.router._simulateNavigation('/docs/guides/build-system');

// Simulate resize
services.dom._simulateResize();

// Simulate keydown
services.dom._simulateKeydown('k');

// Change viewport width
services.dom._setViewportWidth(768);
```

## Coverage

Covered directories:
- `src/**/*.ts`
- `src/**/*.tsx`

Excluded:
- `src/generated/` (auto-generated TypeScript files)
- `frontend.tsx` (entry point)
- test files themselves
