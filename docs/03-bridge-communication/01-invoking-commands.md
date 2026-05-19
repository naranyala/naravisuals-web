# Invoking Commands from Leptos

Invoking a command is the most common way to trigger backend logic.

## Using the JavaScript Bridge

Tauri provides a JS API to call Rust functions. In a Leptos app, you can call these via `wasm-bindgen` or by using a small JS helper.

```javascript
import { invoke } from '@tauri-apps/api/core';

async function callGreet() {
  const response = await invoke('greet', { name: 'Leptos User' });
  console.log(response);
}
```

## Integrating with Leptos Actions

In Leptos, you should wrap these calls in `create_action`. This allows you to track the loading state and handle the result reactively.

```rust
let greet_action = create_action(|name: &String| {
    // Call JS bridge to invoke 'greet'
});

// In view:
view! {
    <button on:click=move |_| greet_action.dispatch("World".to_string())>
        "Greet"
    </button>
    {move || greet_action.value().map(|res| view! { <p>{res}</p> })}
}
```

## Error Handling

Commands can return a `Result<T, E>`. If the Rust function returns an `Err`, the JS promise will reject, allowing you to catch the error in your frontend UI.
