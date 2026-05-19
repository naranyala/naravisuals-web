# Getting Started with Leptos in Tauri

Leptos is a full-stack Rust framework that is uniquely suited for Tauri because it can be compiled to WebAssembly (WASM), allowing you to write your frontend logic in Rust.

## Installation and Setup

To use Leptos in a Tauri project, you typically set up a CSR (Client-Side Rendering) project. This ensures that the Tauri webview can load the WASM binary and render the UI without needing a separate server.

## The WASM Pipeline

Your Rust code in the frontend is compiled using `wasm-pack` or `trunk`. Trunk is the most common tool for this, as it handles the HTML entry point, CSS bundling, and WASM compilation in one step.

## Project Structure

A typical Tauri + Leptos project looks like this:
- `src-tauri/`: The Rust backend (Tauri Core).
- `src/`: The Rust frontend (Leptos components).
- `index.html`: The entry point for the webview.
