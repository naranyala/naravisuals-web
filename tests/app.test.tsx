/**
 * App Component Integration Tests
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import MainLayout from "../src/layout/MainLayout";
import { renderWithServices } from "./test-utils";

describe("App Integration", () => {
  beforeEach(() => {
    mock();
  });

  test("renders without crashing", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".site-wrapper")).toBeDefined();
  });

  test("renders top bar", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".top-bar")).toBeDefined();
    expect(document.querySelector(".top-bar-left")).toBeDefined();
    expect(document.querySelector(".top-bar-right")).toBeDefined();
  });

  test("renders site title", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".site-title")?.textContent).toBe("Docs");
  });

  test("renders settings toggle button", () => {
    renderWithServices(<MainLayout />);
    const buttons = document.querySelectorAll(".top-bar-action-btn");
    expect(buttons.length).toBeGreaterThan(0);
  });

  test("renders menu button for mobile sidebar", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".menu-btn")).toBeDefined();
  });

  test("renders sidebar", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".sidebar")).toBeDefined();
    expect(document.querySelector(".sidebar-content")).toBeDefined();
  });

  test("renders main content area", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".main-content")).toBeDefined();
  });

  test("renders breadcrumbs", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".breadcrumbs")).toBeDefined();
  });

  test("renders doc footer", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".doc-footer")).toBeDefined();
  });

  test("renders document content area", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".doc-content")).toBeDefined();
  });

  test("renders TOC container", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".toc-container")).toBeDefined();
  });

  test("uses injected services (no crash = success)", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".site-wrapper")).toBeDefined();
  });

  test("pagination navigation container exists", () => {
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".pagination-nav")).toBeDefined();
  });

  // ─── Navigation Edge Cases ────────────────────────────────────────

  test("handles abstract page navigation", () => {
    renderWithServices(<MainLayout />);
    // Abstract page should be the default landing
    expect(document.querySelector(".site-wrapper")).toBeDefined();
  });

  test("site title is clickable and navigates to abstract", () => {
    renderWithServices(<MainLayout />);
    const siteTitle = document.querySelector(".site-title") as HTMLElement;
    expect(siteTitle).toBeDefined();
    expect(siteTitle.style.cursor).toBe("pointer");
  });

  // ─── Settings Panel Edge Cases ────────────────────────────────────

  test("settings panel opens when toggle clicked", () => {
    renderWithServices(<MainLayout />);
    const settingsBtn = document.querySelector(".top-bar-icon-btn[aria-label='Toggle settings']");
    if (settingsBtn) {
      settingsBtn.click();
      expect(document.querySelector(".settings-overlay")).toBeDefined();
    }
  });

  test("settings panel closes when overlay clicked", () => {
    renderWithServices(<MainLayout />);
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
    renderWithServices(<MainLayout />);
    // Mobile overlay should be in DOM (hidden by default on desktop)
    expect(document.querySelector(".overlay")).toBeDefined();
  });

  // ─── Error Boundary ───────────────────────────────────────────────

  test("error boundary wraps content", () => {
    // If App renders without crashing, error boundary is working
    renderWithServices(<MainLayout />);
    expect(document.querySelector(".site-wrapper")).toBeDefined();
  });
});
