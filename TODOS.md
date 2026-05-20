# Project Roadmap and TODOs

## Compiler and Parser Enhancements
- Implement full CommonMark specification support for broader compatibility.
- Extend the AST to support markdown tables and task lists.
- Develop a build-time full-text search index to enable efficient client-side querying.
- Integrate a link validator to detect and report broken internal references during the build process.

## Frontend and User Experience
- Implement a system-aware dark and light mode theme toggle.
- Integrate smooth page transition animations to improve perceived performance.
- Develop a floating Table of Contents for better navigation in long-form articles.
- Optimize the Top Panel and sidebar for mobile devices and small screens.

## Feature Extensions
- Integrate Mermaid.js to allow rendering of diagrams and flowcharts.
- Add a "Copy to Clipboard" utility for all code blocks.
- Build a "Search-as-you-type" interface within the Tools sidebar.
- Implement LaTeX support using KaTeX for mathematical notation.

## Infrastructure and Quality Assurance
- Configure a CI/CD pipeline using GitHub Actions for automated testing and deployment.
- Expand the test suite for the RuntimeRenderer to cover all AST node types.
- Optimize the final WASM binary size using `wasm-opt`.
- Implement a documentation versioning system to support multiple versions of the docs.
