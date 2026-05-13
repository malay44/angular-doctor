import path from "node:path";
import fs from "node:fs";
import type { Diagnostic } from "../types.js";

export interface RunMadgeResult {
  diagnostics: Diagnostic[];
  skipped: boolean;
  reason?: string;
}

export const runMadge = async (
  rootDirectory: string,
): Promise<RunMadgeResult> => {
  const tsconfigPath = path.join(rootDirectory, "tsconfig.json");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let madge: any;
  try {
    madge = await import("madge");
  } catch {
    return { diagnostics: [], skipped: true, reason: "madge not installed" };
  }

  const srcDir = fs.existsSync(path.join(rootDirectory, "src"))
    ? path.join(rootDirectory, "src")
    : rootDirectory;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;
  try {
    const madgeFn = madge.default ?? madge;
    result = await madgeFn(srcDir, {
      fileExtensions: ["ts"],
      tsConfig: fs.existsSync(tsconfigPath) ? tsconfigPath : undefined,
    });
  } catch {
    return { diagnostics: [], skipped: true, reason: "madge failed to analyze" };
  }

  const cycles = result.circular();
  if (cycles.length === 0) return { diagnostics: [], skipped: false };

  const diagnostics: Diagnostic[] = (cycles as string[][]).map((cycle) => ({
    filePath: cycle[0] ?? "unknown",
    plugin: "madge",
    rule: "circular-dependency",
    severity: "warning",
    message: `Circular dependency: ${cycle.join(" → ")} → ${cycle[0]}`,
    help: "Break the cycle by extracting shared code to a separate file, or by inverting the dependency via an interface.",
    line: 0,
    column: 0,
    category: "Architecture",
  }));

  return { diagnostics, skipped: false };
};
