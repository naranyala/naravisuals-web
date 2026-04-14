# docts CLI - Quick Reference

## Installation
```bash
# The CLI is built into the project
bun run docts <command>
```

## Most Common Commands

```bash
# Development (with hot reload)
docts dev
docts dev -p 8080

# Production build
docts build

# Build + preview locally
docts preview
docts preview -p 8080

# Regenerate docs only (fast)
docts docs

# Run tests
docts test
docts test --coverage

# Check code quality
docts lint
docts lint:fix

# Clean artifacts
docts clean

# Show project info
docts info

# Help
docts --help
```

## Build Options

```bash
docts build --no-lint      # Skip lint (faster)
docts build --strict       # Fail on lint errors
docts build --no-clean     # Skip dist clean
```

## Command Aliases

| Primary | Aliases |
|---------|---------|
| `dev` | `serve` |
| `build` | `bundle` |
| `test` | `tests` |
| `info` | `status` |
| `lint:fix` | `lint --fix` |
