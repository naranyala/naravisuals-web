---
title: Installation Guide
description: Step-by-step setup to get rspack-react-docs running locally
sidebar_label: Installation
sidebar_position: 2
tags: [installation, setup]
---

# Installation Guide

Get rspack-react-docs running on your local machine in minutes.

## Prerequisites

| Requirement | Version | Why |
|-------------|---------|-----|
| **Bun** | v1.0+ | Package manager + TypeScript runtime |
| **Node.js** | v18+ | Fallback runtime (if not using Bun) |
| **Git** | any | Version control |

No Rust, no Python, no system dependencies required.

## Quick Setup

### 1. Clone the Repository

```bash:desc=Clone and enter the project directory
git clone https://github.com/your-org/your-repo.git
cd your-repo
```

### 2. Install Dependencies

```bash:desc=Install all Node.js dependencies via Bun
bun install
```

This installs both runtime dependencies (React, marked, Shiki, Mermaid, MathJax, goober, Valtio) and dev dependencies (rspack, Biome, Testing Library).

### 3. Start Development Server

```bash:desc=Start the dev server with hot module replacement
bun run dev
```

This command:
1. Runs `scripts/build-docs.mts` to scan and parse all markdown files
2. Generates `src/generated/` TypeScript files
3. Starts the rspack dev server with HMR on port 3000

Open `http://localhost:3000` in your browser.

### 4. Edit Documentation

Add or edit `.md` files in the `docs/` directory. The dev server will automatically rebuild and hot-reload.

## Available Commands

```bash:desc=Common development workflow commands
# Development
bun run dev              # Start dev server with HMR
bun run build            # Production build
bun run preview          # Build + serve locally
bun run start            # Serve existing dist/

# Documentation
bun run build:docs       # Regenerate docs only
bun run docs             # Alias for build:docs

# Quality
bun run lint             # Run Biome linter
bun run lint:fix         # Auto-fix lint issues
bun run format           # Format code with Biome
bun run format:check     # Check formatting

# Validation
bun run validate         # Run all markdown validators
bun run validate:strict  # Fail on validation errors
bun run validate:stats   # Show validation statistics
bun run validate:llm     # LLM-friendly output format

# Testing
bun run test             # Run test suite
bun run test:watch       # Watch mode
bun run test:coverage    # With coverage report

# Utilities
bun run clean            # Remove build artifacts
bun run info             # Show project information
```

## Production Build

```bash:desc=Build for production and preview
bun run build
bun run preview
```

The `build` command:
1. Cleans the `dist/` directory
2. Runs `build-docs.mts` to generate TypeScript files
3. Runs Biome lint checks
4. Runs rspack production build with minification
5. Copies MathJax and Mermaid libraries to `dist/`

The output in `dist/` is a fully static site — no server-side rendering, no API calls. Deploy it anywhere.

## Deployment Options

| Platform | How |
|----------|-----|
| **Vercel** | Connect repo, set build command to `bun run build`, output `dist/` |
| **Netlify** | Same — build `bun run build`, publish `dist/` |
| **GitHub Pages** | Push `dist/` to `gh-pages` branch |
| **Docker** | Use `node:20-slim`, install bun, run build, serve with `npx serve dist` |
| **Any static host** | Upload `dist/` contents |

## Troubleshooting

### Port Already in Use

The CLI automatically finds an available port starting from 3000:

```:desc=Port already in use warning message
⚠ Port 3000 is in use, using port 3001 instead
```

Or specify a port manually:

```bash:desc=Start dev server on a specific port
bun run dev --port 8080
```

### Build Fails

```bash:desc=Clean and rebuild
bun run clean
bun run build
```

### Documentation Regeneration

If you've added new `.md` files and they're not appearing:

```bash:desc=Force docs regeneration
bun run docs
```

### Validation Errors

```bash:desc=Check for markdown validation issues
bun run validate:strict
```
