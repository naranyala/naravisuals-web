# Rigorstarter Webpage

A high-performance documentation website built with Rust, Leptos, and WebAssembly.

## Overview

Rigorstarter is a documentation engine that shifts the heavy lifting of markdown parsing from the browser to the build pipeline. By pre-compiling markdown into a structured Abstract Syntax Tree (AST) and embedding that data directly into the WASM binary, the site achieves near-instant page transitions and zero-latency content loading.

## Architecture

The project utilizes a custom build-time pipeline:

1.  **md-compiler**: A custom Rust tool that scans the `docs/` directory and parses markdown files into a specialized AST.
2.  **Embedded Storage**: The resulting ASTs are stored as JSON strings and embedded into the final binary using `include_str!`, removing the need for runtime HTTP requests for article content.
3.  **Leptos Frontend**: A Client-Side Rendered (CSR) application that consumes the embedded ASTs and renders them into the DOM using a custom `RuntimeRenderer`.

## Key Features

- **Zero-Latency Content**: Articles are embedded in the WASM binary for instant loading.
- **Dynamic Navigation**: A reactive sidebar and top-panel breadcrumbs that automatically update based on the article hierarchy.
- **Custom Extensions**: Support for specialized markdown blocks beyond standard specifications.
- **Type-Safe Rendering**: The AST is shared between the compiler and the renderer, ensuring structural consistency.

## Getting Started

### Prerequisites

- Rust toolchain
- Trunk (WASM bundler)
- Wasm-bindgen CLI

### Installation and Build

1. Clone the repository.
2. Run the build script to compile markdown and the frontend:
   ```bash
   ./build.sh
   ```
3. Start the development server:
   ```bash
   ./serve.sh
   ```

## Project Structure

- `docs/`: Source markdown files organized by category.
- `scripts/`: The `md-compiler` crate responsible for parsing and AST generation.
- `src/`: The Leptos frontend application.
- `styles/`: Global CSS and layout definitions.
