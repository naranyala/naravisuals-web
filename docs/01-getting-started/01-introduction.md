---
title: Introduction
description: Overview of the SSG Documentation Site Generator and its core concepts
sidebar_label: Introduction
sidebar_position: 1
---

# Introduction

The **SSG Documentation Site Generator** is a high-performance, developer-focused tool for creating beautiful documentation sites from Markdown. It is built on modern technologies like **React 19**, **rspack**, **Bun**, and **Rust**, providing a lightning-fast experience for both authors and readers.

## Project Overview

This tool was designed to solve the limitations of traditional documentation generators:

- **Performance**: Uses **rspack** for near-instant bundling and **Rust** for heavy lifting in the build pipeline.
- **Rich Content**: Built-in support for **Mermaid.js** diagrams, **MathJax** equations, and Docusaurus-style **admonitions**.
- **Developer Experience**: Hot Module Replacement (HMR) for both code and markdown content.
- **Quality Ensured**: A strict **validation system** checks for broken links, missing code block descriptions, and malformed diagrams at build time.

## Core Concepts

The system operates on three primary abstractions:

### 1. The Build Pipeline
The pipeline transforms raw `.md` files into optimized React components. It uses a **plugin system** that processes content in three phases:
- `preProcess`: Transforms raw markdown (e.g., extracting math).
- `marked`: Converts markdown to HTML via a custom renderer.
- `postProcess`: Enhances the HTML (e.g., wrapping code blocks, rendering Mermaid).

### 2. Dependency Injection (DI)
The frontend uses a DI container to manage services like SEO, navigation, and theme state. This makes the components highly testable and allows for easy swapping of service implementations.

### 3. Unified Validation
Instead of catching errors in the browser, the system validates content during the build. This includes:
- **Codeblock Descriptions**: Ensures every snippet has an explanation.
- **Mermaid Syntax**: Catches diagram errors before they reach the user.
- **Reference Integrity**: Validates footnotes and internal links.

## Design Decisions

```mermaid:desc=Mindmap showing the five core design decisions behind the project.
mindmap
  root((Design Decisions))
    Performance
      Rust Build Engine
      rspack Bundler
    Quality
      Build-time Validation
      Strict Type System
    Extensibility
      Plugin Interface
      DI Container
    Experience
      Markdown-First
      HMR support
    Output
      SPA with SEO
      Print-ready CSS
```

## Next Steps

- **[Installation](./installation)**: Get up and running in minutes.
- **[Build Pipeline](../architecture/build-pipeline)**: Understand the transformation process.
- **[CLI Reference](../guides/cli-reference)**: Learn about the `docts` command.
