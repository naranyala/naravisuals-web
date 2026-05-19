# Reactive State in Leptos

At the heart of Leptos is its fine-grained reactivity system. Unlike frameworks that re-render entire components (like React), Leptos only updates the specific parts of the DOM that depend on a piece of state.

## Signals

Signals are the primary way to manage state. A signal consists of a getter and a setter.

```rust
let (count, set_count) = create_signal(0);
```

- `count()`: Returns the current value.
- `set_count.set(val)`: Updates the value.
- `set_count.update(|n| *n += 1)`: Updates the value using a closure.

## Derived Signals (Memos)

Memos are signals that depend on other signals. They are cached and only re-calculate when their dependencies change.

```rust
let double_count = create_memo(move |_| count() * 2);
```

## Effects

Effects allow you to run side-effecting code (like logging or calling a JS API) whenever a signal changes.

```rust
create_effect(move |_| {
    logging::log!("Count is now: {}", count());
});
```
