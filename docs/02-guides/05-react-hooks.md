---
title: React Hooks Reference
description: Complete guide to all 14 custom React hooks with usage examples
sidebar_label: React Hooks
sidebar_position: 7
---

# React Hooks Reference

:::note Custom Hooks Design
The project includes 14 custom React hooks in `src/hooks/`. Each hook is designed to be standalone, composable, and theme-aware. Hooks interact with the DI container via `useServices()` or `useService()`.
:::

The project includes 14 custom React hooks in `src/hooks/`. Each hook is designed to be standalone, composable, and theme-aware.

---

## Theme Hooks

### useDocsTheme

The **unified theme manager** for the entire documentation site. Manages UI theme, code theme, font family, font size, and line height in a single hook.

**What it manages:**
- UI theme (light/dark variants across 6 themes)
- Code block syntax highlighting theme (CSS filter-based)
- Font family (system, serif, mono, Inter, Source Sans)
- Font size (12px–20px, persisted to localStorage)
- Line height (1.2–2.2, persisted to localStorage)

**Returns:**
```typescript:desc=Return type of the useDocsTheme hook, providing theme state (isDark), code theme management (codeTheme, setCodeTheme), font settings (font, fontSize, lineHeight with setters), and a resetReadingPrefs utility for clearing persisted preferences.
{
  isDark: boolean;
  toggleTheme: () => void;
  codeTheme: ShikiCodeTheme;
  setCodeTheme: (theme: ShikiCodeTheme) => void;
  font: string;
  setFont: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  resetReadingPrefs: () => void;
}
```

**Usage:**
```typescript:desc=Example usage of useDocsTheme in a SettingsPanel component, demonstrating theme toggling and font size adjustment via a range slider.
import { useDocsTheme } from "./hooks/useDocsTheme";

function SettingsPanel() {
  const docsTheme = useDocsTheme();

  return (
    <div>
      <button onClick={docsTheme.toggleTheme}>
        Toggle {docsTheme.isDark ? "Light" : "Dark"} Mode
      </button>
      <input
        type="range"
        min={12}
        max={20}
        value={docsTheme.fontSize}
        onChange={(e) => docsTheme.setFontSize(Number(e.target.value))}
      />
    </div>
  );
}
```

**How it works:**
- Reads initial preferences from localStorage on mount
- Applies CSS custom properties (`--docs-font-size`, `--docs-line-height`) and `data-*` attributes on `<html>`
- Listens for `storage` events to sync theme changes across browser tabs
- All preferences persist automatically to localStorage

---

### useShikiTheme

Manages **code block syntax highlighting** independently from the UI theme. Since Shiki renders syntax at build time (always `github-dark`), this hook applies CSS filter transforms at runtime to change the appearance.

**Returns:** `[ShikiCodeTheme, (theme: ShikiCodeTheme) => void]`

**Supported themes:**
- `paperlike-white`, `paperlike-gray`, `paperlike-sepia`
- `paperlike-dark-gray`, `paperlike-dark-sepia`
- `navy`, `dark-navy`

**Usage:**
```typescript:desc=Example usage of useShikiTheme in a CodeThemePicker component, rendering a dropdown select to switch between paperlike and navy code syntax highlighting themes.
import { useShikiTheme } from "./hooks/useShikiTheme";

function CodeThemePicker() {
  const [codeTheme, setCodeTheme] = useShikiTheme();

  return (
    <select value={codeTheme} onChange={(e) => setCodeTheme(e.target.value)}>
      <option value="paperlike-white">Paper White</option>
      <option value="paperlike-dark-gray">Paper Dark</option>
      <option value="navy">Navy</option>
    </select>
  );
}
```

**How it works:**
- Sets `data-code-theme` attribute on `<html>` element
- CSS rules in `shiki-themes.css` apply filter chains to `.code-block` elements
- Persists selection to localStorage under key `"shiki-code-theme"`
- Syncs across tabs via `storage` event listener

---

### useTheme

A **simple dark/light toggle** — the minimal version of `useDocsTheme`. Used when you only need a binary theme switch without font or code theme controls.

**Returns:** `{ isDark: boolean; toggleTheme: () => void }`

**Usage:**
```typescript:desc=Minimal example of useTheme hook creating a simple dark/light mode toggle button that displays a sun or moon icon based on current theme state.
import { useTheme } from "./hooks/useTheme";

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{isDark ? "☀️" : "🌙"}</button>;
}
```

**How it works:**
- Reads initial state from `localStorage.getItem("theme")` or `prefers-color-scheme` media query
- Calls `services.theme.applyTheme()` to set `data-theme` attribute on `<html>`
- Persists to localStorage on every toggle

---

## Scroll & Navigation Hooks

### useScrollProgress

Tracks **vertical scroll position** as a normalized value from `0.0` (top) to `1.0` (bottom). Used for the scroll-to-top progress bar.

**Returns:** `number` (0.0 to 1.0)

**Usage:**
```typescript:desc=Example usage of useScrollProgress to render a visual progress bar that fills proportionally to the user's scroll position on the page.
import { useScrollProgress } from "./hooks/useScrollProgress";

function ScrollProgressBar() {
  const progress = useScrollProgress();

  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}
```

**How it works:**
- Subscribes to the `scroll` event on `window`
- Calculates `scrollY / (documentHeight - viewportHeight)`
- Throttled via requestAnimationFrame for performance

---

### useScrollToTop

Provides a **scroll-to-top utility** with smooth scrolling behavior.

**Returns:** `() => void` function

**Usage:**
```typescript:desc=Example usage of useScrollToTop to create a back-to-top button that smoothly scrolls the page to the top when clicked.
import { useScrollToTop } from "./hooks/useScrollToTop";

function BackToTopButton() {
  const scrollToTop = useScrollToTop();

  return <button onClick={scrollToTop}>↑ Back to Top</button>;
}
```

**How it works:**
- Calls `window.scrollTo({ top: 0, behavior: "smooth" })`
- Uses the DI container's DOM service for testability

---

### useActiveSection

Tracks which **heading section is currently visible** in the viewport using IntersectionObserver. Powers the Table of Contents active item highlighting.

**Returns:** `string` (active heading ID)

**Parameters:**
- `selector`: CSS selector for headings (default: `.doc-content h2, .doc-content h3`)

**Usage:**
```typescript:desc=Example usage of useActiveSection in a TableOfContents component to highlight the currently visible heading by comparing each heading's id against the active section returned by the hook.
import { useActiveSection } from "./hooks/useActiveSection";

function TableOfContents() {
  const activeId = useActiveSection(".doc-content h2, .doc-content h3");

  return (
    <ul>
      {headings.map((h) => (
        <li className={h.id === activeId ? "active" : ""}>
          <a href={`#${h.id}`}>{h.value}</a>
        </li>
      ))}
    </ul>
  );
}
```

**How it works:**
- Creates an IntersectionObserver with `rootMargin: "0px 0px -80% 0px"` (only top 20% of viewport is "active")
- Observes all heading elements matching the selector
- Updates active ID when a heading enters the active zone
- Cleans up observer on unmount or selector change

---

## Media & Input Hooks

### useMediaQuery

A **reactive CSS media query** hook. Returns `true` when the query matches, `false` otherwise. Re-renders automatically when the media state changes.

**Returns:** `boolean`

**Usage:**
```typescript:desc=Example usage of useMediaQuery to conditionally render mobile or desktop navigation based on viewport width, and detect user's system-level dark mode preference.
import { useMediaQuery } from "./hooks/useMediaQuery";

function ResponsiveLayout() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  return <div>{isMobile ? <MobileNav /> : <DesktopNav />}</div>;
}
```

**How it works:**
- Creates a `MediaQueryList` via `window.matchMedia(query)`
- Listens for `change` events on the MQL
- Returns current `.matches` state
- Cleans up listener on unmount

---

### useKeyboardShortcut

Registers **global keyboard shortcuts**. Supports modifier key combinations (Ctrl, Shift, Alt, Meta).

**Parameters:**
- `key`: The key to listen for (e.g., `"k"`, `"Escape"`, `"/"`)
- `handler`: Callback function `(e: KeyboardEvent) => void`
- `options`: `{ ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean }`

**Returns:** `() => void` unsubscribe function

**Usage:**
```typescript:desc=Example usage of useKeyboardShortcut to register Ctrl+K for opening a search box and "/" for toggling a search input, demonstrating both useEffect cleanup pattern and direct handler pattern.
import { useKeyboardShortcut } from "./hooks/useKeyboardShortcut";

function SearchBox() {
  useEffect(() => {
    return useKeyboardShortcut("k", () => openSearch(), { ctrl: true });
  }, []);

  // Or with the hook pattern:
  const [isOpen, setIsOpen] = useState(false);
  useKeyboardShortcut("/", () => setIsOpen(true), { shift: false });
}
```

**How it works:**
- Registers a `keydown` event listener on `document`
- Checks `event.key` and modifier keys against options
- Calls handler only when all conditions match
- Returns cleanup function to remove listener

---

## Utility Hooks

### useDebounce

**Delays value updates** by a specified number of milliseconds. Useful for search inputs, resize handlers, and any rapidly-changing value.

**Returns:** Debounced value

**Usage:**
```typescript:desc=Example usage of useDebounce to delay search input updates by 300ms, preventing excessive search requests while the user is still typing.
import { useDebounce } from "./hooks/useDebounce";

function SearchInput() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) performSearch(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

**How it works:**
- Uses `setTimeout` internally
- Clears previous timer on every value change
- Updates state only after the delay elapses
- Cleans up timer on unmount

---

### useLocalStorage

**Persists state to localStorage** with SSR safety. Works like `useState` but syncs to storage on every update.

**Returns:** `[value, setValue]` tuple (identical to `useState`)

**Usage:**
```typescript:desc=Example usage of useLocalStorage to persist a theme preference across page reloads, functioning like useState but automatically syncing to localStorage on every update.
import { useLocalStorage } from "./hooks/useLocalStorage";

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current: {theme}
    </button>
  );
}
```

**How it works:**
- On mount: reads from localStorage (with try/catch for SSR safety)
- On update: writes to localStorage and updates React state
- Falls back to the provided default value if storage is empty or inaccessible
- Listens for `storage` events to sync across tabs

---

### useClipboard

**Clipboard API wrapper** with copy state tracking. Provides a simple interface for copy-to-clipboard functionality.

**Returns:** `{ copy: (text: string) => void; copied: boolean }`

**Usage:**
```typescript:desc=Example usage of useClipboard to create a copy button that shows a checkmark confirmation for 2 seconds after copying text to the clipboard.
import { useClipboard } from "./hooks/useClipboard";

function CopyButton({ text }: { text: string }) {
  const { copy, copied } = useClipboard();

  return (
    <button onClick={() => copy(text)}>
      {copied ? "✓ Copied!" : "📋 Copy"}
    </button>
  );
}
```

**How it works:**
- Uses the modern `navigator.clipboard.writeText()` API
- Falls back to `document.execCommand("copy")` for older browsers
- Resets `copied` state after 2 seconds

---

### useCopyCode

**Copy button logic for code blocks**. Wraps `useClipboard` with code-block-specific behavior (extracts text from `<pre><code>` elements).

**Returns:** `{ handleCopy: (codeBlockEl: HTMLElement) => void; copied: boolean }`

**Usage:**
```typescript:desc=Example usage of useCopyCode to add a copy button to a code block component, extracting text from the nested <code> element and stripping line number prefixes.
import { useCopyCode } from "./hooks/useCopyCode";

function CodeBlock({ children }: { children: string }) {
  const { handleCopy, copied } = useCopyCode();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="code-block">
      <button onClick={() => handleCopy(ref.current!)}>
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre><code>{children}</code></pre>
    </div>
  );
}
```

**How it works:**
- Extracts text content from the `<code>` element inside the code block
- Strips line number prefixes if present
- Uses `useClipboard` internally for the actual copy operation

---

### useReadingTime

**Calculates reading time** from text content. Based on the average adult reading speed of 200 words per minute.

**Returns:** `{ minutes: number; seconds: number }`

**Usage:**
```typescript:desc=Example usage of useReadingTime to calculate and display estimated reading time for article content based on 200 words per minute.
import { useReadingTime } from "./hooks/useReadingTime";

function ArticleMeta({ content }: { content: string }) {
  const { minutes, seconds } = useReadingTime(content);

  return <span>{minutes} min {seconds} sec read</span>;
}
```

**How it works:**
- Strips HTML tags from content
- Counts words by splitting on whitespace
- Calculates `totalWords / 200` words per minute
- Returns minutes and remaining seconds

---

### useTitle

**Manages the browser tab title**. Updates `document.title` reactively when the input changes.

**Parameters:**
- `title`: The title string to display

**Usage:**
```typescript:desc=Example usage of useTitle to dynamically set the browser tab title with the current document name and site branding suffix.
import { useTitle } from "./hooks/useTitle";

function DocPage({ doc }: { doc: DocEntry }) {
  useTitle(`${doc.title} — My Docs`);

  return <h1>{doc.title}</h1>;
}
```

**How it works:**
- Sets `document.title` on every render
- Restores previous title on unmount (if tracked)
- SSR-safe: checks for `document` existence before accessing

---

## Hook Composition Patterns

### Combining Hooks for Responsive Layout

```typescript:desc=Hook composition example demonstrating how to combine useMediaQuery and useState to build a responsive layout that auto-closes the sidebar on mobile breakpoints and conditionally renders desktop vs mobile TOC.
function ResponsiveApp() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTocMobile = useMediaQuery("(max-width: 1024px)");
  const [sidebarVisible, setSidebarVisible] = useState(!isMobile);

  // Auto-close sidebar on mobile breakpoint
  useEffect(() => {
    if (isMobile) setSidebarVisible(false);
  }, [isMobile]);

  return (
    <div>
      {sidebarVisible && !isMobile && <Sidebar />}
      <main>
        {isTocMobile && <MobileTOC />}
        <DocViewer />
      </main>
    </div>
  );
}
```

### Combining Theme + Scroll Hooks

```typescript:desc=Hook composition example combining useDocsTheme, useScrollProgress, and useScrollToTop to create a floating back-to-top button that fades in based on scroll progress and respects the current theme.
function ReadingExperience() {
  const docsTheme = useDocsTheme();
  const scrollProgress = useScrollProgress();
  const scrollToTop = useScrollToTop();

  return (
    <>
      {scrollProgress > 0.05 && (
        <button onClick={scrollToTop} style={{ opacity: scrollProgress }}>
          ↑ Top
        </button>
      )}
      <DocViewer />
    </>
  );
}
```
