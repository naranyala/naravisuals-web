/**
 * DI Provider & useServices / useService hook Tests
 */

import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { createContainer } from "../src/services/container";
import { createMockStorage, createMockTheme } from "../src/services/mocks";
import {
  ProvideService,
  ServicesProvider,
  useConfig,
  useService,
  useServices,
  useServicesList,
} from "../src/services/provider";

// ─── ServicesProvider ─────────────────────────────────────────────────────

describe("ServicesProvider", () => {
  test("provides container to children", () => {
    const c = createContainer();
    let read: any;
    function Reader() {
      read = useServices();
      return <div />;
    }
    render(
      <ServicesProvider container={c}>
        <Reader />
      </ServicesProvider>
    );
    expect(read).toBe(c);
  });

  test("creates container from options when no container passed", () => {
    let read: any;
    function Reader() {
      read = useServices();
      return <div />;
    }
    render(
      <ServicesProvider options={{ config: { siteTitle: "Custom" } }}>
        <Reader />
      </ServicesProvider>
    );
    expect(read.config.siteTitle).toBe("Custom");
  });

  test("throws when useServices used outside provider", () => {
    let caughtError: Error | null = null;

    function BrokenComponent() {
      try {
        useServices();
      } catch (e: any) {
        caughtError = e;
      }
      return <div />;
    }

    render(<BrokenComponent />);

    expect(caughtError).not.toBeNull();
    expect((caughtError as any)?.message).toContain(
      "useServices() must be used within a <ServicesProvider>"
    );
  });

  test("ProvideService overrides specific service for subtree", () => {
    const defaultC = createContainer();
    const customConfig = { siteTitle: "Overridden" };
    let readConfig: any;

    function Reader() {
      readConfig = useService("config");
      return <div />;
    }

    render(
      <ServicesProvider container={defaultC}>
        <ProvideService service="config" value={customConfig as any}>
          <Reader />
        </ProvideService>
      </ServicesProvider>
    );

    expect(readConfig.siteTitle).toBe("Overridden");
    expect(defaultC.config.siteTitle).not.toBe("Overridden");
  });
});

// ─── useService hooks ─────────────────────────────────────────────────────

describe("useService hooks", () => {
  test("useService returns specific service", () => {
    const c = createContainer();
    let read: any;
    function Reader() {
      read = useService("storage");
      return <div />;
    }
    render(
      <ServicesProvider container={c}>
        <Reader />
      </ServicesProvider>
    );
    expect(read).toBe(c.storage);
  });

  test("useServicesList returns multiple services", () => {
    const c = createContainer();
    let read: any;
    function Reader() {
      read = useServicesList("storage", "config");
      return <div />;
    }
    render(
      <ServicesProvider container={c}>
        <Reader />
      </ServicesProvider>
    );
    expect(read.storage).toBe(c.storage);
    expect(read.config).toBe(c.config);
  });

  test("useConfig returns config", () => {
    const c = createContainer();
    let read: any;
    function Reader() {
      read = useConfig();
      return <div />;
    }
    render(
      <ServicesProvider container={c}>
        <Reader />
      </ServicesProvider>
    );
    expect(read).toBe(c.config);
  });
});

// ─── Service Integration ──────────────────────────────────────────────────

describe("Service Integration", () => {
  test("mock services work together", () => {
    const storage = createMockStorage();
    const theme = createMockTheme(storage);
    theme.toggleTheme(false);
    expect(storage.getItem("theme")).toBe("dark");
    expect(theme.getInitialTheme()).toBe(true);
  });

  test("container services are connected", () => {
    const storage = createMockStorage();
    const c = createContainer({ storage });
    c.theme.toggleTheme(false);
    expect(storage.getItem("theme")).toBe("dark");
  });
});
