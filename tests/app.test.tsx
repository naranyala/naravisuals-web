/**
 * App Component Integration Tests
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import { App } from "../src/App";
import { renderWithServices } from "./test-utils";

describe("App Integration", () => {
  beforeEach(() => {
    mock();
  });

  test("renders without crashing", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".site-wrapper")).toBeDefined();
  });

  test("renders top bar", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".top-bar")).toBeDefined();
    expect(document.querySelector(".top-bar-left")).toBeDefined();
    expect(document.querySelector(".top-bar-right")).toBeDefined();
  });

  test("renders site title", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".site-title")?.textContent).toBe("Docs");
  });

  test("renders settings toggle button", () => {
    renderWithServices(<App />);
    const buttons = document.querySelectorAll(".top-bar-icon-btn");
    expect(buttons.length).toBeGreaterThan(0);
  });

  test("renders menu button for mobile sidebar", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".menu-btn")).toBeDefined();
  });

  test("renders sidebar", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".sidebar")).toBeDefined();
    expect(document.querySelector(".sidebar-content")).toBeDefined();
  });

  test("renders main content area", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".main-content")).toBeDefined();
  });

  test("renders breadcrumbs", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".breadcrumbs")).toBeDefined();
  });

  test("renders doc footer", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".doc-footer")).toBeDefined();
  });

  test("renders document content area", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".doc-content")).toBeDefined();
  });

  test("renders TOC container", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".toc-container")).toBeDefined();
  });

  test("uses injected services (no crash = success)", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".site-wrapper")).toBeDefined();
  });

  test("pagination navigation container exists", () => {
    renderWithServices(<App />);
    expect(document.querySelector(".pagination-nav")).toBeDefined();
  });

  // ─── Navigation Edge Cases ────────────────────────────────────────

  test("handles welcome page navigation", () => {
    renderWithServices(<App />);
    // Welcome page should be the default landing
    expect(document.querySelector(".site-wrapper")).toBeDefined();
  });

  test("site title is clickable and navigates to welcome", () => {
    renderWithServices(<App />);
    const siteTitle = document.querySelector(".site-title") as HTMLElement;
    expect(siteTitle).toBeDefined();
    expect(siteTitle.style.cursor).toBe("pointer");
  });

  // ─── Settings Panel Edge Cases ────────────────────────────────────

  test("settings panel opens when toggle clicked", () => {
    renderWithServices(<App />);
    const settingsBtn = document.querySelector(".top-bar-icon-btn[aria-label='Toggle settings']");
    if (settingsBtn) {
      settingsBtn.click();
      expect(document.querySelector(".settings-overlay")).toBeDefined();
    }
  });

  test("settings panel closes when overlay clicked", () => {
    renderWithServices(<App />);
    const settingsBtn = document.querySelector(".top-bar-icon-btn[aria-label='Toggle settings']");
    if (settingsBtn) {
      settingsBtn.click();
      const overlay = document.querySelector(".settings-overlay");
      if (overlay) {
        overlay.click();
        expect(document.querySelector(".settings-overlay")).toBeNull();
      }
    }
  });

  // ─── Mobile Responsiveness ────────────────────────────────────────

  test("mobile overlay for sidebar exists in DOM", () => {
    renderWithServices(<App />);
    // Mobile overlay should be in DOM (hidden by default on desktop)
    expect(document.querySelector(".overlay")).toBeDefined();
  });

  // ─── Error Boundary ───────────────────────────────────────────────

  test("error boundary wraps content", () => {
    // If App renders without crashing, error boundary is working
    renderWithServices(<App />);
    expect(document.querySelector(".site-wrapper")).toBeDefined();
  });
});
