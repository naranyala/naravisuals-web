/**
 * React Context and Provider for Dependency Injection
 *
 * Provides the service container to all React components via Context.
 * Components can access services through the `useServices()` hook.
 */

import { createContext, type ReactNode, useContext } from "react";
import { type ContainerOptions, createContainer, type ServiceContainer } from "./container";

// ─── Context ──────────────────────────────────────────────────────────────

const ServicesContext = createContext<ServiceContainer | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

interface ServicesProviderProps {
  children: ReactNode;
  /** Optional container override - useful for testing or custom configs */
  container?: ServiceContainer;
  /** Optional container options for quick customization */
  options?: ContainerOptions;
}

export function ServicesProvider({ children, container, options }: ServicesProviderProps) {
  const resolvedContainer = container ?? createContainer(options);

  return <ServicesContext.Provider value={resolvedContainer}>{children}</ServicesContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────

/**
 * Access all injected services
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const services = useServices();
 *   const isDark = services.storage.getItem("theme") === "dark";
 *
 *   return (
 *     <button onClick={() => services.theme.toggleTheme(isDark)}>
 *       Toggle
 *     </button>
 *   );
 * }
 * ```
 */
export function useServices(): ServiceContainer {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error(
      "useServices() must be used within a <ServicesProvider>. " +
        "Wrap your app with <ServicesProvider><App /></ServicesProvider>"
    );
  }
  return context;
}

/**
 * Access a specific service
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const router = useService("router");
 *   const path = router.getCurrentPath();
 *   return <div>Path: {path}</div>;
 * }
 * ```
 */
export function useService<K extends keyof ServiceContainer>(service: K): ServiceContainer[K] {
  const container = useServices();
  return container[service];
}
