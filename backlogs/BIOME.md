# Biome Linter & Formatter Integration

This project uses [Biome](https://biomejs.dev/) for fast, unified linting and formatting. Biome is a Rust-based tool that's 100x faster than ESLint + Prettier.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run lint` | Check code for lint errors (read-only) |
| `npm run lint:fix` | Auto-fix lint issues where possible |
| `npm run format` | Format code with Biome |
| `npm run format:check` | Check if code is formatted |

## Workflow Integration

### Pre-Build Lint Check
The `build` command automatically runs lint checks before building:

```bash
npm run build
# Runs: docs generation → lint check → rspack build
```

If lint errors are found, the build will fail.

### Development Workflow

**During development:**
```bash
# 1. Format your code
npm run format

# 2. Check for lint issues
npm run lint

# 3. Auto-fix issues where possible
npm run lint:fix

# 4. Start dev server
npm run dev
```

**Before committing:**
```bash
# Ensure code is formatted and linted
npm run lint:fix && npm run format
```

## Configuration

Biome is configured in `biome.json` with project-specific rules:

- **Formatter**: 2-space indentation, 100 char line width, double quotes
- **Linter**: Recommended rules with customizations for React patterns
- **Ignored files**: `node_modules`, `dist`, auto-generated `docs-data.ts`

## IDE Integration

### VS Code

Install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for:
- Real-time lint feedback
- Auto-format on save
- Quick fixes

### Settings

Add to your `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.biome": "explicit"
  }
}
```

## Rules Customization

Edit `biome.json` to adjust rules:

```json
{
  "linter": {
    "rules": {
      "style": {
        "useNodejsImportProtocol": "warn"  // Change to "error" or "off"
      }
    }
  }
}
```

See [Biome's rule documentation](https://biomejs.dev/linter/rules/) for all available rules.
