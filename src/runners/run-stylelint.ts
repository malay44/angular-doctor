import fs from "node:fs";
import path from "node:path";
import type { Diagnostic } from "../types.js";

interface StylelintResult {
  source?: string;
  warnings: Array<{
    rule: string;
    severity: string;
    text: string;
    line: number;
    column: number;
  }>;
}

export interface RunStylelintResult {
  diagnostics: Diagnostic[];
  skipped: boolean;
  reason?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  "color-no-invalid-hex": "SCSS",
  "color-no-hex": "SCSS",
  "property-no-unknown": "SCSS",
  "selector-pseudo-class-no-unknown": "SCSS",
  "scss/no-global-function-names": "SCSS",
  "order/properties-order": "SCSS",
  "csstools/value-no-unknown-custom-properties": "SCSS",
};

export const runStylelint = async (
  rootDirectory: string,
  options?: { tokensFile?: string },
): Promise<RunStylelintResult> => {
  const scssFiles = fs
    .readdirSync(rootDirectory, { recursive: true, withFileTypes: true })
    .filter(
      (f) =>
        f.isFile() &&
        f.name.endsWith(".scss") &&
        !f.parentPath?.includes("node_modules") &&
        !f.parentPath?.includes("dist") &&
        !f.parentPath?.includes(".angular"),
    );

  if (scssFiles.length === 0) {
    return { diagnostics: [], skipped: true, reason: "No SCSS files found" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stylelint: any;
  try {
    stylelint = await import("stylelint");
  } catch {
    return { diagnostics: [], skipped: true, reason: "stylelint not installed" };
  }

  const tokensFile = options?.tokensFile ?? null;
  const customRules: Record<string, unknown> = {
    "color-no-invalid-hex": true,
    "property-no-unknown": true,
    "no-duplicate-selectors": true,
    "no-empty-source": true,
    "scss/no-global-function-names": true,
  };

  // Enforce no hex unless in tokens file
  if (tokensFile) {
    customRules["color-no-hex"] = [true, { message: `Hex literals must live in ${tokensFile}` }];
  }

  const config = {
    extends: ["stylelint-config-standard-scss"],
    rules: customRules,
  };

  const filePaths = scssFiles.map((f) =>
    path.join((f.parentPath as string) ?? rootDirectory, f.name),
  );

  let results: StylelintResult[] = [];
  try {
    const lintResult = await stylelint.default.lint({
      files: filePaths,
      config,
    });
    results = lintResult.results as StylelintResult[];
  } catch {
    return { diagnostics: [], skipped: true, reason: "stylelint failed to run" };
  }

  const diagnostics: Diagnostic[] = [];

  for (const result of results) {
    for (const warning of result.warnings ?? []) {
      diagnostics.push({
        filePath: path.relative(rootDirectory, result.source ?? ""),
        plugin: "stylelint",
        rule: warning.rule,
        severity: warning.severity === "error" ? "error" : "warning",
        message: warning.text,
        help: `See https://stylelint.io/user-guide/rules/${warning.rule}`,
        line: warning.line,
        column: warning.column,
        category: CATEGORY_MAP[warning.rule] ?? "SCSS",
      });
    }
  }

  return { diagnostics, skipped: false };
};
