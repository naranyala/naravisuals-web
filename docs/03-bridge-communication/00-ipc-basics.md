# IPC Basics: The Bridge

Inter-Process Communication (IPC) is the mechanism that allows the Leptos frontend and the Tauri Rust backend to talk to each other.

## Why IPC is Necessary

The frontend runs in a Webview (a browser-like environment), and the backend runs as a native OS process. They live in different memory spaces. To communicate, they must serialize data into JSON, send it across a bridge, and deserialize it on the other side.

## The Two Communication Patterns

There are two primary ways to communicate:

1. **Invoke (Request-Response)**: The frontend asks the backend to do something and waits for a result.
   - *Example*: "Please calculate the sum of these numbers and tell me the answer."
2. **Emit (Event-Driven)**: The backend (or frontend) sends a message without expecting an immediate reply.
   - *Example*: "The download is 50% complete."

## Serialization with Serde

Because data is sent as JSON, every type sent across the bridge must implement `serde::Serialize` and `serde::Deserialize`. This ensures that the Rust types in the backend match the objects expected by the frontend.
