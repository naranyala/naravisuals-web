# A Webpage

A high-performance documentation framework built with Rust, Leptos, and WebAssembly. It is designed to deliver a seamless reading experience by moving the computational cost of markdown parsing from the client's browser to the build process.

## Core Concept

Unlike traditional documentation sites that fetch markdown files at runtime or render them on the fly, Rigorstarter uses a pre-compilation strategy. Markdown source files are transformed into a structured Abstract Syntax Tree (AST) during the build phase. This AST is then embedded directly into the WebAssembly binary, enabling near-instantaneous page loads and transitions.

## Technical Architecture

The system consists of three primary components:

### 1. md-compiler
A dedicated Rust tool located in the `scripts/` directory. It performs the following steps:
- Scans the `docs/` directory for markdown files.
- Parses the content into a custom AST.
- Generates JSON representations of the ASTs.
- Produces Rust source files (`src/docs_data.rs` and `src/search_index.rs`) that embed this data using `include_str!`.

### 2. Embedded Data Layer
By embedding the parsed content directly into the binary, the application eliminates the need for runtime HTTP requests to fetch article content, significantly reducing Time to Interactive (TTI).

### 3. Leptos Frontend
A Client-Side Rendered (CSR) application that provides:
- A custom `RuntimeRenderer` that converts the embedded AST nodes into Leptos views.
- Reactive navigation and state management for a fluid user experience.
- An integrated Markdown Editor for real-time previewing and testing of AST rendering.

## Key Features

- Instant Content Loading: Embedded ASTs ensure zero-latency access to documentation.
- Type-Safe Rendering: The shared AST structure between the compiler and renderer prevents structural regressions.
- Build-Time Validation: The pipeline can be extended to validate links and structure before deployment.
- Reactive UI: Built with Leptos for high-performance DOM updates.

## Getting Started

### Prerequisites

- Rust toolchain (latest stable)
- Trunk (WASM bundler)
- Wasm-bindgen CLI

### Installation and Development

1. Clone the repository.
2. Execute the build script to compile markdown assets and build the frontend:
   ```bash
   ./build.sh
   ```
3. Start the development server:
   ```bash
   ./serve.sh
   ```

## Project Structure

- `docs/`: Source markdown articles.
- `scripts/`: The `md-compiler` source code.
- `src/`: The Leptos frontend application, including the renderer and components.
- `styles/`: Global CSS and layout definitions.
