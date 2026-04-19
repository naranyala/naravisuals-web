# SSG Documentation Site Generator (docts)

A fast, modern static site generator for documentation built with **rspack**, **React 19**, **Shiki**, and **Mermaid**.

## Features

- **Blazing Fast Build**: Uses **rspack** and **Rust** for near-instant builds.
- **Rich Markdown**: Built-in support for diagrams (Mermaid), math (MathJax), and admonitions.
- **Developer-Centric**: Strong focus on DX with HMR, a strict validation system, and hybrid Bun/Rust toolchain.
- **Production Ready**: Optimized SPA output with SEO features, print support, and modular theming.

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production (TypeScript/Bun)
bun run build

# Build for production (Rust implementation)
bun run build --rust
```

## Documentation Summary

The full documentation is located in the `./docs` folder and is rendered as the site itself.

- **[Getting Started](./docs/01-getting-started)**: Introduction, Installation, and Project Overview.
- **[Architecture](./docs/02-architecture)**: Pipeline details, Dependency Injection, and the Hybrid Toolchain.
- **[Guides](./docs/03-guides)**: CLI reference, Customizing Themes, Writing Plugins, and SEO.
- **[Reference](./docs/04-reference)**: Project structure, Internal APIs, and Glossary.

## Directory Overview

- `docs/`: Markdown source files.
- `scripts/`: Bun/TypeScript build scripts and plugins.
- `scripts-rs/`: Rust-based build engine and CLI.
- `src/`: Frontend React application.
- `tests/`: Project test suite.

## License

MIT
