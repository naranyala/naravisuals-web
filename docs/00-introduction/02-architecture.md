# Architecture Overview

Understanding how a Tauri + Leptos application is structured is key to building scalable software. The app is split into two primary environments: the **Core Process** and the **WebView Process**.

## The Core Process (Rust)

The Core process is a native Rust application. It has full access to the operating system and is responsible for:
- Window management and lifecycle.
- Accessing the filesystem, network, and system APIs.
- Managing global application state.
- Handling security and permissions.

## The WebView Process (Leptos/WASM)

The WebView process is where your user interface lives. In this stack, it is a Leptos application compiled to WebAssembly (WASM). It is responsible for:
- Rendering the HTML/CSS.
- Handling user interactions.
- Managing local UI state.

## The Bridge (IPC)

Because the Core and WebView processes are isolated for security reasons, they communicate via **Inter-Process Communication (IPC)**. This bridge allows the frontend to "invoke" Rust functions and the backend to "emit" events to the UI.
