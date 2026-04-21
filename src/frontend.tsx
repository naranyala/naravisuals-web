/**
 * Entry point for the React app with Dependency Injection.
 *
 * This module initializes the React application with the dependency injection
 * container, error boundary, and root layout component.
 */

import { setup } from "goober";
import type { ReactElement, ReactNode } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./core/error-handling";
import { StoreProvider } from "./core/store";
import { MainLayout } from "./layout";
import { defaultContainer, ServicesProvider } from "./services";
import "./shared/styles/error-boundary.css";

// Setup goober with React createElement
const createElement = (
  type: React.ElementType,
  props: Record<string, unknown> | null,
  ...children: ReactNode[]
): ReactElement => (type as any)(props, ...children) as ReactElement;

setup({ createElement });

// Apply initial theme using injected service
// Default to catppuccin if no preference is stored
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("theme");
  const validThemes = [
    "catppuccin",
    "tokyonight",
    "gruvbox",
    "nord",
    "everforest",
    "solarized-light",
  ];
  const initialTheme = stored && validThemes.includes(stored) ? stored : "catppuccin";
  document.documentElement.setAttribute("data-theme", initialTheme);
  document.documentElement.setAttribute("data-code-theme", initialTheme);
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
        <StoreProvider>
          <MainLayout />
        </StoreProvider>
      </ServicesProvider>
    </ErrorBoundary>
  </StrictMode>
);

// React Refresh (HMR) setup
const hot = (import.meta as any).webpackHot;
if (hot) {
  hot.accept();
  hot.dispose(() => {
    root.unmount();
  });
}
