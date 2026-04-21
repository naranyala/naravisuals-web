---
title: API Glossary
description: Definitions of key terms and internal APIs
sidebar_label: API Glossary
sidebar_position: 7
tags: ["reference", "api", "glossary", "terms"]
---

# API Glossary

This glossary defines key terms and internal APIs used throughout the project.

## Document Model

### `DocEntry`
The primary data structure representing a rendered document.
- **Fields**: `id`, `slug`, `title`, `content` (HTML), `toc`, `metadata`.

### `SidebarItem`
A node in the sidebar tree. Can be a `SidebarDocItem` (a page) or a `SidebarCategoryItem` (a folder).

## Build Pipeline

### `MarkdownPlugin`
An interface for extending the markdown transformation process.
- **`preProcess(md)`**: Runs before parsing.
- **`postProcess(html)`**: Runs after parsing.

### `MarkdownValidator`
An interface for build-time quality checks.
- **`validate(content, path)`**: Returns a list of issues.

## Frontend Services

### `IDocService`
Service responsible for fetching and searching doc entries.
- **Methods**: `getDoc(slug)`, `getAllDocs()`, `search(query)`.

### `IThemeService`
Manages application-wide theme state (dark/light/sepia).
- **Methods**: `setTheme(mode)`, `getTheme()`.

### `ISeoService`
Dynamically updates HTML meta tags and document title based on the current page.

## Navigation

### `TOC` (Table of Contents)
An array of objects representing headings: `{ value, id, level }`.

### `Slug`
The URL path segment for a document, derived from its file path but without numeric prefixes and `.md` extension.
- **Example**: `docs/01-getting-started/01-project-overview.md` -> `getting-started/project-overview`.
