# Why Choose This Stack?

When building desktop applications, developers often face a tradeoff between development speed (Web technologies) and system performance (Native technologies). The combination of Tauri, Leptos, and Rust eliminates this tradeoff.

## The Problems with Traditional Frameworks

- **Electron**: While powerful, Electron bundles a full Chromium browser and Node.js runtime, leading to massive binary sizes (often 100MB+) and high RAM consumption.
- **Pure Native (C++/Qt)**: Offers extreme performance but often comes with a steeper learning curve, slower development cycles, and more complex UI design processes.

## The Solution: Tauri + Leptos + Rust

- **Tauri**: Instead of bundling a browser, Tauri uses the system's native webview (WebView2 on Windows, WebKit on macOS/Linux). This results in binaries that are often under 10MB.
- **Leptos**: By using Rust on the frontend via WebAssembly, you get compile-time type safety and fine-grained reactivity, meaning the UI only updates the exact DOM nodes that change.
- **Rust**: You use one language for everything. The same types and logic can often be shared between the frontend and backend.
