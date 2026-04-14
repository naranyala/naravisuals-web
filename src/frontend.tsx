/**
 * Entry point for the React app with Dependency Injection.
 */

import { setup } from "goober";
import type { ReactElement, ReactNode } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import { defaultContainer, ServicesProvider } from "./services";
import "./styles/error-boundary.css";

// Setup goober with React createElement
const createElement = (
  type: React.ElementType,
  props: Record<string, unknown> | null,
  ...children: ReactNode[]
): ReactElement => type(props, ...children) as ReactElement;

setup({ createElement });

// Apply initial theme using injected service
// Default to paperlike-dark-gray if no preference is stored
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("shiki-code-theme");
  const validThemes = [
    "paperlike-white",
    "paperlike-gray",
    "paperlike-sepia",
    "paperlike-dark-gray",
    "paperlike-dark-sepia",
    "navy",
    "dark-navy",
  ];
  const initialTheme = stored && validThemes.includes(stored) ? stored : "paperlike-dark-gray";
  document.documentElement.setAttribute("data-theme", initialTheme);
}

const elem = defaultContainer.dom.getElementById("root");
if (!elem) {
  throw new Error("Root element not found");
}

const root = createRoot(elem);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <ServicesProvider container={defaultContainer}>
        <App />
      </ServicesProvider>
    </ErrorBoundary>
  </StrictMode>
);

// React Refresh (HMR) setup
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
  import.meta.webpackHot.dispose(() => {
    root.unmount();
  });
}
