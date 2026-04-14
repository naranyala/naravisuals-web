/**
 * DI Provider & useServices / useService hook Tests
 */

import { describe, expect, mock, test } from "bun:test";
import { render } from "@testing-library/react";
import { createContainer } from "../src/services/container";
import { createMockStorage, createMockTheme } from "../src/services/mocks";
import { ServicesProvider, useService, useServices } from "../src/services/provider";

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
    // useServices() calls useContext() which requires a React render tree.
    // When called outside any Provider, React returns the default context value (null),
    // and the hook throws. We test this by rendering a component without the provider.
    const { useServices } = require("../src/services/provider");
    let caughtError: Error | null = null;

    function BrokenComponent() {
      try {
        useServices();
      } catch (e: any) {
        caughtError = e;
      }
      return <div />;
    }

    // Render WITHOUT ServicesProvider
    render(<BrokenComponent />);

    expect(caughtError).not.toBeNull();
    expect(caughtError!.message).toContain("useServices() must be used within a <ServicesProvider>");
  });
});

// ─── useService hook ─────────────────────────────────────────────────────

describe("useService", () => {
  test("returns storage", () => {
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

  test("returns router", () => {
    const c = createContainer();
    let read: any;
    function Reader() {
      read = useService("router");
      return <div />;
    }
    render(
      <ServicesProvider container={c}>
        <Reader />
      </ServicesProvider>
    );
    expect(read).toBe(c.router);
  });

  test("returns dom", () => {
    const c = createContainer();
    let read: any;
    function Reader() {
      read = useService("dom");
      return <div />;
    }
    render(
      <ServicesProvider container={c}>
        <Reader />
      </ServicesProvider>
    );
    expect(read).toBe(c.dom);
  });

  test("returns theme", () => {
    const c = createContainer();
    let read: any;
    function Reader() {
      read = useService("theme");
      return <div />;
    }
    render(
      <ServicesProvider container={c}>
        <Reader />
      </ServicesProvider>
    );
    expect(read).toBe(c.theme);
  });

  test("returns config", () => {
    const c = createContainer();
    let read: any;
    function Reader() {
      read = useService("config");
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
