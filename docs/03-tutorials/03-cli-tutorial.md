---
title: Getting Started with the CLI
description: A hands-on tutorial for mastering the docts command-line interface.
sidebar_label: CLI Tutorial
sidebar_position: 3
tags: ["tutorials", "cli", "getting-started"]
---

# Getting Started with the CLI

The `docts` CLI is your primary interface for interacting with the Naravisuals Web documentation engine. Whether you are developing new content, running a full production build, or verifying the quality of your documentation, the CLI provides the necessary tools.

## 1. Setting Up Your Environment

Before you can use the CLI, ensure you have [Bun](https://bun.sh) installed on your system.

```bash:desc=Check bun installation
bun --version
```

Once Bun is installed, navigate to your project directory and install the dependencies:

```bash:desc=Install project dependencies
bun install
```

## 2. The Development Workflow

The most common command you will use is `dev`. This starts a local development server with **Hot Module Replacement (HMR)**.

### Running the Dev Server

```bash:desc=Start the development server
bun run dev
```

The server will typically start at `http://localhost:3000`. When you make changes to any `.md` file in the `docs/` directory, the server will automatically rebuild the affected parts and refresh your browser.

### Verifying Your Changes

As you build your documentation, keep an eye on the terminal. The `dev` command also runs a light validation pass. If you make a mistake (like a broken Mermaid diagram), an error message will appear in your terminal.

## 3. Quality Control: Linting and Validation

One of the most powerful features of Naravisuals Web is its strict validation system. You should run these commands regularly (and they are automatically run in CI).

### Running the Linter

The linter uses [Biome](httpss://biomejs.dev/) to check your code and markdown for quality and consistency.

```bash:desc=Run the linter
bun run lint
```

If the linter finds issues, it will report them with file names and line numbers. You can attempt to fix many of them automatically:

```bash:desc=Auto-fix lint issues
bun run lint:fix
```

### Strict Validation

For a deeper check, including broken links and structural integrity, use the `validate` command.

```bash:desc=Run full validation
bun run validate:strict
```

The `validate:strict` command is designed to fail the build if *any* warning or error is detected, making it ideal for CI/CD pipelines.

## 4. Production Builds

When you are ready to deploy your documentation, use the `build` command.

```bash:desc=Generate a production build
bun run build
```

This command performs a complete, optimized build:
1.  **Cleans** the `dist/` directory.
2.  **Generates** all TypeScript compilation units from your markdown.
3.  **Validates** all content and links.
4.  **Runs Biome** to ensure everything meets coding standards.
5.  **Bundles** the React application using Rspack.
6.  **Optimizes** all assets for production.

The final, ready-to-deploy site will be located in the `dist/` folder.

## 5. Summary of Common Commands

| Command | Purpose | When to use it |
|---------|---------|---------------|
| `bun run dev` | Local development | During active writing and testing |
| `bun run build` | Production build | Before deployment |
| `bun run lint` | Check code quality | Periodically or before committing |
| `bun run validate:strict` | Full content check | In CI/CD or before major releases |
| `bun run clean` | Reset environment | If you encounter strange build issues |

## Next Steps

- **[Writing Plugins](./01-writing-plugins)**: Learn how to extend the engine with your own custom features.
- **[Build Pipeline](../architecture/01-build-pipeline)**: Understand the technical details of how your content is transformed.
