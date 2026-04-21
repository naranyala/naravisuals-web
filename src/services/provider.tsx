/**
 * React Context and Provider for Dependency Injection
 *
 * Provides the service container to all React components via Context.
 * Components can access services through the `useServices()` hook.
 */

import { createContext, type ReactNode, useContext, useMemo } from "react";
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
  // We useMemo here to avoid recreating the container on every render if options change
  // but options should generally be static at the root.
  const resolvedContainer = useMemo(() => {
    return container ?? createContainer(options);
  }, [container, options]);

  return <ServicesContext.Provider value={resolvedContainer}>{children}</ServicesContext.Provider>;
}

/**
 * Provide a specific service override for a subtree.
 * Useful for localized state or mocking specific services in a part of the app.
 */
export function ProvideService<K extends keyof ServiceContainer>({
  service,
  value,
  children,
}: {
  service: K;
  value: ServiceContainer[K];
  children: ReactNode;
}) {
  const parentContainer = useServices();
  const overriddenContainer = useMemo(
    () => ({
      ...parentContainer,
      [service]: value,
    }),
    [parentContainer, service, value]
  );

  return (
    <ServicesContext.Provider value={overriddenContainer}>{children}</ServicesContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────

/**
 * Access all injected services
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
 * const router = useService("router");
 * ```
 */
export function useService<K extends keyof ServiceContainer>(service: K): ServiceContainer[K] {
  const container = useServices();
  return container[service];
}

/**
 * Access multiple specific services at once
 *
 * @example
 * ```tsx
 * const { router, theme } = useServicesList("router", "theme");
 * ```
 */
export function useServicesList<K extends keyof ServiceContainer>(
  ...services: K[]
): Pick<ServiceContainer, K> {
  const container = useServices();
  return useMemo(() => {
    const result = {} as Pick<ServiceContainer, K>;
    for (const key of services) {
      result[key] = container[key];
    }
    return result;
  }, [container, services]);
}

/**
 * Access a service if it exists, otherwise return undefined.
 * Useful for optional features or components used outside the main app tree.
 */
export function useOptionalService<K extends keyof ServiceContainer>(
  service: K
): ServiceContainer[K] | undefined {
  const context = useContext(ServicesContext);
  return context ? context[service] : undefined;
}

/**
 * Access the app configuration
 */
export function useConfig(): ServiceContainer["config"] {
  return useService("config");
}
