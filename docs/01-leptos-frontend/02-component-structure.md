# Component Structure

Components in Leptos are the building blocks of your UI. They are defined using the `#[component]` macro, which allows you to pass properties as function arguments.

## The view! Macro

The `view!` macro is where you define your HTML structure. It looks like HTML but is actually Rust code that generates highly efficient DOM operations.

```rust
#[component]
fn Welcome(name: String) -> impl IntoView {
    view! {
        <div>
            <h1>"Welcome, " {name} "!"</h1>
            <p>"Enjoy your Tauri app."</p>
        </div>
    }
}
```

## Dynamic Lists

To render lists, Leptos provides the `<For />` component, which efficiently manages lists of items by tracking them via a key.

```rust
view! {
    <ul>
        <For
            each=move || items()
            key=|item| item.id
            children=|item| view! { <li>{item.name}</li> }
        />
    </ul>
}
```

## Conditional Rendering

You can use the `<Show />` component or simple Rust match expressions inside the `view!` macro to conditionally display elements.
