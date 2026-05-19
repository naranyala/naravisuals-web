# OS API Overview

Tauri provides a set of plugins and APIs that allow your application to behave like a first-class citizen on the user's operating system.

## Beyond the Browser

A standard web app is trapped in a sandbox. It cannot know the computer's name, cannot access files outside the browser's "upload" dialog, and cannot create system-level shortcuts. Tauri breaks these barriers.

## The Plugin Architecture

Tauri's functionality is modular. Instead of including everything in the core, features are split into plugins:
- `tauri-plugin-fs`: Filesystem access.
- `tauri-plugin-shell`: Opening URLs or executing external commands.
- `tauri-plugin-http`: Making native HTTP requests (bypassing CORS).
- `tauri-plugin-dialog`: Native save/open file dialogs.

## Choosing Between Rust and JS APIs

Most Tauri plugins provide both a Rust API (for the backend) and a JS API (for the frontend).
- Use the **Rust API** for secure, heavy-duty operations.
- Use the **JS API** for simple UI-driven tasks (like opening a folder picker).
