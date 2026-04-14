# Package.json Scripts - docts CLI Integration

All npm scripts now route through the unified `docts` CLI tool.

## Available Scripts

| Command | Description | Example |
|---------|-------------|---------|
| `bun run dev` | Start development server with HMR | `bun run dev` |
| `bun run build` | Full production build | `bun run build` |
| `bun run start` | Serve production build | `bun run start` |
| `bun run preview` | Build + serve locally | `bun run preview` |
| `bun run build:docs` | Regenerate documentation | `bun run build:docs` |
| `bun run test` | Run test suite | `bun run test` |
| `bun run test:watch` | Run tests in watch mode | `bun run test:watch` |
| `bun run test:coverage` | Run tests with coverage | `bun run test:coverage` |
| `bun run lint` | Check code quality | `bun run lint` |
| `bun run lint:fix` | Auto-fix lint issues | `bun run lint:fix` |
| `bun run clean` | Clean build artifacts | `bun run clean` |
| `bun run info` | Show project information | `bun run info` |
| `bun run format` | Format codebase | `bun run format` |
| `bun run format:check` | Check formatting | `bun run format:check` |

## Direct CLI Usage

You can also use the CLI directly:

```bash
# Via bun
bun run scripts/cli.mts build
bun run scripts/cli.mts dev -p 8080

# Direct execution (if executable)
./scripts/cli.mts preview
./scripts/cli.mts test --coverage
```

## Command Options

### Build Options
```bash
bun run build -- --no-lint      # Skip lint checks
bun run build -- --strict       # Fail on lint errors
bun run build -- --no-clean     # Skip dist clean
```

### Port Options
```bash
bun run dev -- --port 8080
bun run start -- --port 9000
bun run preview -- -p 8080
```

### Test Options
```bash
bun run test -- --watch
bun run test -- --coverage
```

## Migration Notes

**Old scripts (removed):**
- `rm -rf dist && bun run build:docs && biome check . && NODE_ENV=production rspack build`
- `bun run build:docs && rspack serve`
- `node server/prod-server.mjs`
- `bun test`
- `biome check .`

**New approach:**
All commands now route through `docts` CLI which provides:
- Consistent colored output
- Build timing and statistics
- Better error messages
- Command aliases
- Help documentation
