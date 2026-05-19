# Type-Safe Sharing

One of the biggest advantages of using Rust for both the frontend and backend is the ability to share types.

## The Shared Crate Pattern

Instead of defining the same `User` struct in both the `src-tauri` and `src` folders, create a separate crate (e.g., `my-app-types`) that both depend on.

```rust
// in shared_types/src/lib.rs
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct UserProfile {
    pub id: u64,
    pub username: String,
    pub email: String,
}
```

## Benefits of Shared Types

1. **Single Source of Truth**: If you add a field to `UserProfile`, both the backend and frontend will be updated.
2. **Compile-Time Checking**: If the backend changes a field from a `String` to an `Option<String>`, the frontend code will fail to compile until you handle the `None` case.
3. **Reduced Boilerplate**: No more manual JSON parsing or guessing the shape of the data coming across the bridge.

## Implementation Tip

Make sure your shared crate uses `serde` and is compatible with `wasm32-unknown-unknown` so it can be compiled into the Leptos frontend.
