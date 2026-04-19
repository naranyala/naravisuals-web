/**
 * Unified Reporting Tests
 *
 * Tests the ReportGenerator for consistent formatting and issue tracking.
 */

import { describe, expect, test } from "bun:test";
import { ReportGenerator } from "../scripts/report/generator.ts";

describe("ReportGenerator", () => {
  test("tracks and reports issues correctly", () => {
    const reporter = new ReportGenerator();
    reporter.addReport({
      validator: "test-validator",
      label: "Test Validator",
      filesChecked: 1,
      issues: [{ severity: "error", file: "test.md", message: "An error occurred" }],
      pass: false,
    });

    expect(reporter.hasErrors()).toBe(true);
    expect(reporter.hasStrictFailure()).toBe(true);
  });

  test("tracks info and warnings", () => {
    const reporter = new ReportGenerator();
    reporter.addReport({
      validator: "test-validator",
      label: "Test Validator",
      filesChecked: 1,
      issues: [
        { severity: "warning", file: "test.md", message: "A warning" },
        { severity: "info", file: "test.md", message: "Some info" },
      ],
      pass: true,
    });

    expect(reporter.hasErrors()).toBe(false);
    expect(reporter.hasStrictFailure()).toBe(false);
  });

  test("supports adding custom sections", () => {
    const reporter = new ReportGenerator();
    const addLine = reporter.addSection("My Section", "Subtitle");
    addLine("Line 1");
    addLine("Line 2");

    // We can't easily test the console output, but we can verify the state
    // if we added getters, but for now we'll just ensure it doesn't crash
    expect(() => reporter.print()).not.toThrow();
  });

  test("correctly identifies non-strict passes", () => {
    const reporter = new ReportGenerator();
    reporter.addReport({
      validator: "non-strict",
      label: "Non Strict",
      filesChecked: 1,
      issues: [],
      pass: true,
    });
    expect(reporter.hasStrictFailure()).toBe(false);
  });
});
