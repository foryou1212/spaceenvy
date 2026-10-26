// Regression tests for CSV export escaping.
import { expect, it } from "vitest";
import { csvCell } from "./csv";

it("represents missing values as empty CSV cells", () => {
  expect(csvCell(null)).toBe('""');
  expect(csvCell(undefined)).toBe('""');
});

it("escapes quotes inside values", () => {
  expect(csvCell('A "quoted" value')).toBe('"A ""quoted"" value"');
});

it("prefixes formula-like values to prevent spreadsheet execution", () => {
  expect(csvCell("  =1+1")).toBe('"\'  =1+1"');
  expect(csvCell("@SUM(A1:A2)")).toBe('"\'@SUM(A1:A2)"');
});
