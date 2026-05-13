import fs from "node:fs";
import path from "node:path";
import type { Diagnostic } from "../types.js";

export interface RunConfigChecksResult {
  diagnostics: Diagnostic[];
  skipped: boolean;
}

interface AngularJsonBuildConfig {
  options?: { budgets?: unknown[] };
  configurations?: Record<string, { budgets?: unknown[]; optimization?: unknown }>;
}

interface AngularJson {
  projects?: Record<string, {
    architect?: {
      build?: AngularJsonBuildConfig;
    };
  }>;
}

interface TsConfig {
  compilerOptions?: {
    strict?: boolean;
    noImplicitAny?: boolean;
    strictNullChecks?: boolean;
    target?: string;
  };
  angularCompilerOptions?: {
    strictTemplates?: boolean;
  };
}

const checkAngularJson = (rootDirectory: string, diagnostics: Diagnostic[]): void => {
  const angularJsonPath = path.join(rootDirectory, "angular.json");
  if (!fs.existsSync(angularJsonPath)) return;

  let config: AngularJson;
  try {
    config = JSON.parse(fs.readFileSync(angularJsonPath, "utf-8")) as AngularJson;
  } catch {
    return;
  }

  for (const [projectName, project] of Object.entries(config.projects ?? {})) {
    const buildConfig = project.architect?.build;
    if (!buildConfig) continue;

    const prodConfig = buildConfig.configurations?.["production"];
    if (!prodConfig?.budgets || prodConfig.budgets.length === 0) {
      diagnostics.push({
        filePath: "angular.json",
        plugin: "angular-doctor",
        rule: "angular-json-budgets-required",
        severity: "warning",
        message: `Project "${projectName}" production config missing "budgets". Add initial and anyComponentStyle budgets.`,
        help: 'Add: { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" } to configurations.production.budgets',
        line: 0,
        column: 0,
        category: "Config",
      });
    }
  }
};

const checkTsConfig = (rootDirectory: string, diagnostics: Diagnostic[]): void => {
  const tsconfigPath = path.join(rootDirectory, "tsconfig.json");
  if (!fs.existsSync(tsconfigPath)) return;

  let config: TsConfig;
  try {
    config = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8")) as TsConfig;
  } catch {
    return;
  }

  const co = config.compilerOptions ?? {};
  const aco = config.angularCompilerOptions ?? {};

  if (!co.strict && !co.noImplicitAny && !co.strictNullChecks) {
    diagnostics.push({
      filePath: "tsconfig.json",
      plugin: "angular-doctor",
      rule: "tsconfig-strict-required",
      severity: "warning",
      message: 'TypeScript strict mode is not enabled. Add "strict": true to compilerOptions.',
      help: 'Set "strict": true in tsconfig.json compilerOptions for safer TypeScript.',
      line: 0,
      column: 0,
      category: "Config",
    });
  }

  if (!aco.strictTemplates) {
    diagnostics.push({
      filePath: "tsconfig.json",
      plugin: "angular-doctor",
      rule: "tsconfig-strict-templates-required",
      severity: "warning",
      message: 'Angular strict template checking is not enabled. Add "strictTemplates": true to angularCompilerOptions.',
      help: 'Set "strictTemplates": true in tsconfig.json angularCompilerOptions.',
      line: 0,
      column: 0,
      category: "Config",
    });
  }
};

const checkForZoneJsInAngularJson = (rootDirectory: string, diagnostics: Diagnostic[]): void => {
  const angularJsonPath = path.join(rootDirectory, "angular.json");
  if (!fs.existsSync(angularJsonPath)) return;

  const content = fs.readFileSync(angularJsonPath, "utf-8");
  if (content.includes("zone.js")) {
    // Check if there's also provideZonelessChangeDetection in project source
    const srcDir = path.join(rootDirectory, "src");
    if (!fs.existsSync(srcDir)) return;

    const hasZonelessProvider = findInDirectory(srcDir, "provideZonelessChangeDetection");
    if (hasZonelessProvider) {
      diagnostics.push({
        filePath: "angular.json",
        plugin: "angular-doctor",
        rule: "polyfills-no-zone-when-zoneless",
        severity: "error",
        message:
          "zone.js found in angular.json while provideZonelessChangeDetection() is used. Remove zone.js from polyfills.",
        help: "Remove zone.js from the polyfills array in angular.json build options.",
        line: 0,
        column: 0,
        category: "Config",
      });
    }
  }
};

const findInDirectory = (dir: string, searchString: string): boolean => {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !["node_modules", "dist", ".angular"].includes(entry.name)) {
        if (findInDirectory(fullPath, searchString)) return true;
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        if (fs.readFileSync(fullPath, "utf-8").includes(searchString)) return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
};

export const runConfigChecks = async (
  rootDirectory: string,
): Promise<RunConfigChecksResult> => {
  const diagnostics: Diagnostic[] = [];

  checkAngularJson(rootDirectory, diagnostics);
  checkTsConfig(rootDirectory, diagnostics);
  checkForZoneJsInAngularJson(rootDirectory, diagnostics);

  return { diagnostics, skipped: false };
};
