# Custom Markdown → Rust Compiler

Compiles markdown documentation into **Leptos Rust components** that are directly imported by the frontend.

## Architecture

```
scripts/
├── src/
│   ├── main.rs              # Entry point
│   ├── parser/
│   │   ├── mod.rs           # Parser implementation
│   │   ├── ast.rs           # Abstract Syntax Tree
│   │   ├── tokenizer.rs     # Lexer
│   │   └── rustgen.rs       # Rust/Leptos code generator
│   └── plugins/
│       ├── mod.rs           # Plugin trait + registry
│       └── callout.rs       # Example: :::callout blocks
```

## Workflow

```
docs/*.md → [Tokenizer] → Tokens → [Parser] → AST → [Plugins] → [RustGen] → generated/*.rs
```

## Output

The compiler generates:
- `generated/doc_*.rs` - Leptos components for each markdown file
- `generated/mod.rs` - Module declarations
- `generated/docs_data.rs` - Component registry function

## Plugin System

### Creating a Plugin

```rust
use crate::parser::ast::Node;
use crate::plugins::MarkdownPlugin;

pub struct MyPlugin;

impl MarkdownPlugin for MyPlugin {
    fn name(&self) -> &str { "my-plugin" }
    
    // Handle custom :::extension blocks
    fn render_extension_rust(&self, node: &Node) -> Option<String> {
        // Return Some(rust_code) to handle, None to skip
        None
    }
    
    // Override standard node rendering
    fn render_node_rust(&self, node: &Node) -> Option<String> {
        None
    }
}
```

### Registering

```rust
fn create_plugin_registry() -> PluginRegistry {
    let mut registry = PluginRegistry::new();
    registry.register(Box::new(CalloutPlugin));
    registry.register(Box::new(MyPlugin));
    registry
}
```

## Custom Syntax

### Callout Blocks

```markdown
:::note
This is a note callout.
:::

:::warning
This is a warning.
:::

:::tip
This is a tip.
:::
```

Supported: `note`, `warning`, `tip`, `info`, `danger`, `example`

## Usage

```bash
./build.sh
# or
cd scripts && cargo run && cd .. && trunk build
```
