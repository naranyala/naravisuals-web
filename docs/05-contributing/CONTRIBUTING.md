# Contributing to Naravisuals Web

Thank you for your interest in contributing! We welcome help with the documentation engine, the React frontend, and the documentation content itself.

## How to Contribute

### 1. Find an Issue
Check our issue tracker or look for `TODO` comments in the codebase.

### 2. Set Up Your Environment
Follow our [Getting Started Guide](./../01-getting-started/01-introduction) to set up your local development environment.

### 3. Develop and Test
- **For Engine Changes**: Ensure all tests pass in the `scripts/` directory.
- **For Frontend Changes**: Run `bun run dev` and verify the UI.
- **For Documentation Changes**: Run `bun run build:docs` to ensure your markdown renders correctly.

### 4. Lint and Format
Before submitting a Pull Request, please ensure your code passes all linting and formatting checks:

```bash
bun run lint
bun run format
```

### 5. Submit a Pull Request
1. Fork the repository.
2. Create a feature branch.
3. Commit your changes following our coding standards.
4. Submit a PR with a clear description of your changes.

## Documentation Standards

When contributing to the documentation, please follow these guidelines:

- **Use the standard frontmatter**: Always include `title`, `description`, `sidebar_label`, and `sidebar_position`.
- **Use `:desc=` for code blocks**: This improves accessibility and provides better UI headers.
- **Maintain consistent links**: Use relative paths for internal links to ensure portability.
- **Keep it concise**: Technical documentation should be clear and to the point.

## Code of Conduct
Please be respectful and professional in all interactions.
