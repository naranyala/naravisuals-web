---
title: Coding Standards
description: Guidelines for code quality, linting, and UI patterns in the project
sidebar_label: Coding Standards
sidebar_position: 7
tags: [development, standards, linting]
---

# Coding Standards

To ensure a high-quality, maintainable codebase, this project follows strict coding standards enforced by automated tools and specific architectural patterns.

## 1. Automated Quality Enforcement

### TypeScript (Strict Mode)
The project uses TypeScript in strict mode. All new code must:
- Avoid the `any` type (unless strictly necessary for third-party interop).
- Handle `null` and `undefined` explicitly.
- Use the `override` modifier for class methods that override base class behavior.

The build system runs `tsc --noEmit` on every production build. **Type errors will halt the build.**

### Biome (Linter & Formatter)
We use [Biome](https://biomejs.dev/) for lightning-fast linting and formatting. Our configuration is strict:
- **No unused variables or imports**: Elevated to error level.
- **Complexity checks**: We enforce readable code by limiting nested logic.
- **Safety**: Non-null assertions (`!`) are restricted.

Run linting manually with:
```bash:desc=CLI command to run the linter.
docts lint
```

## 2. UI Patterns

### Conditional CSS with `clsx`
To manage conditional classes in React components, always use the `clsx` utility. Avoid template literal string concatenation for classes, as it leads to trailing spaces and poor readability.

**Recommended Pattern:**
```tsx:desc=Clean conditional classes with clsx.
import { clsx } from "clsx";

function SidebarItem({ active, disabled }) {
  return (
    <div className={clsx("sidebar-item", {
      "is-active": active,
      "is-disabled": disabled
    })}>
      ...
    </div>
  );
}
```

### Event-Driven Communication
Components should be decoupled where possible. Use the `IEventBusService` (accessible via `useServices()`) to communicate global state changes or lifecycle events.

**Common Events:**
- `nav:navigate`: Triggered when the user initiates navigation.
- `theme:change`: Triggered when the visual theme is toggled.
- `mermaid:rendered`: Triggered when a diagram finishes rendering.

## 3. Build Infrastructure

### Optimized File Scanning
When writing scripts that process the filesystem (e.g., scanners, validators), always use `fast-glob`. It provides significant performance benefits over recursive `fs.readdirSync`.

```typescript:desc=Using fast-glob in scripts.
import glob from "fast-glob";

const files = await glob("docs/**/*.md", { absolute: true });
```

## 4. Documentation Guidelines

Every document should include:
1.  **Standard Frontmatter**: Title, description, sidebar position.
2.  **Codeblock Descriptions**: Use the `:desc=` attribute on all code blocks to assist LLMs and improve accessibility.
3.  **Mermaid Diagrams**: Use for complex architectures or flows.

## References

- [Biome JS](https://biomejs.dev/) - Modern toolchain for web projects.
