import path from "node:path";
import { Command } from "commander";
import { scan } from "./scan.js";
import type { AngularDoctorConfig, DiffInfo, ScanOptions } from "./types.js";
import { loadConfig } from "./utils/load-config.js";
import { filterSourceFiles, getDiffInfo } from "./utils/get-diff-files.js";
import { handleError } from "./utils/handle-error.js";
import { highlighter } from "./utils/highlighter.js";
import { logger } from "./utils/logger.js";
import { selectProjects } from "./utils/select-projects.js";

const VERSION = process.env.VERSION ?? "0.0.0";

interface CliFlags {
  lint: boolean;
  deadCode: boolean;
  scss: boolean;
  circularDeps: boolean;
  configChecks: boolean;
  verbose: boolean;
  score: boolean;
  yes: boolean;
  exitCode: boolean;
  report?: boolean | string;
  fast?: boolean;
  project?: string;
  diff?: boolean | string;
  staged?: boolean;
  rules?: string;
  explain?: string;
  annotations?: boolean;
  failOn?: "error" | "warn" | "none";
  offline?: boolean;
  jsonCompact?: boolean;
  json?: boolean;
  full?: boolean;
}

const exitWithHint = () => {
  logger.break();
  logger.log("Cancelled.");
  logger.break();
  process.exit(0);
};

process.on("SIGINT", exitWithHint);
process.on("SIGTERM", exitWithHint);

const AUTOMATED_ENVIRONMENT_VARIABLES = [
  "CI",
  "CLAUDECODE",
  "CURSOR_AGENT",
  "CODEX_CI",
  "OPENCODE",
  "AMP_HOME",
];

const isAutomatedEnvironment = (): boolean =>
  AUTOMATED_ENVIRONMENT_VARIABLES.some((envVariable) =>
    Boolean(process.env[envVariable]),
  );

const resolveCliScanOptions = (
  flags: CliFlags,
  userConfig: AngularDoctorConfig | null,
  programInstance: Command,
): ScanOptions => {
  const isCliOverride = (optionName: string) =>
    programInstance.getOptionValueSource(optionName) === "cli";

  return {
    lint: isCliOverride("lint") ? flags.lint : (userConfig?.lint ?? flags.lint),
    deadCode: isCliOverride("deadCode")
      ? flags.deadCode
      : (userConfig?.deadCode ?? flags.deadCode),
    scss: isCliOverride("scss") ? flags.scss : (userConfig?.scss ?? flags.scss),
    circularDeps: isCliOverride("circularDeps")
      ? flags.circularDeps
      : (userConfig?.circularDeps ?? flags.circularDeps),
    configChecks: isCliOverride("configChecks")
      ? flags.configChecks
      : (userConfig?.configChecks ?? true),
    verbose: isCliOverride("verbose")
      ? Boolean(flags.verbose)
      : (userConfig?.verbose ?? false),
    scoreOnly: flags.score,
    report: flags.report,
    fast: isCliOverride("fast")
      ? Boolean(flags.fast)
      : (userConfig?.fast ?? false),
    rules: flags.rules,
    staged: flags.staged,
    annotations: flags.annotations,
    failOn: flags.failOn ?? userConfig?.failOn,
    offline: flags.offline,
  };
};

const resolveDiffMode = async (
  diffInfo: DiffInfo | null,
  effectiveDiff: boolean | string | undefined,
  shouldSkipPrompts: boolean,
  isScoreOnly: boolean,
): Promise<boolean> => {
  if (effectiveDiff !== undefined && effectiveDiff !== false) {
    if (diffInfo) return true;
    if (!isScoreOnly) {
      logger.warn(
        "No feature branch or uncommitted changes detected. Running full scan.",
      );
      logger.break();
    }
    return false;
  }

  if (effectiveDiff === false || !diffInfo) return false;

  const changedSourceFiles = filterSourceFiles(diffInfo.changedFiles);
  if (changedSourceFiles.length === 0) return false;
  if (shouldSkipPrompts) return true;
  if (isScoreOnly) return false;

  // In non-interactive mode, skip diff prompts
  return false;
};

const program = new Command()
  .name("angular-doctor")
  .description("Diagnose Angular codebase health")
  .version(VERSION, "-v, --version", "display the version number")
  .argument("[directory]", "project directory to scan", ".")
  .option("--no-lint", "skip linting")
  .option("--no-dead-code", "skip dead code detection")
  .option("--verbose", "show file details per rule")
  .option("--score", "output only the score")
  .option("--report [path]", "write a markdown report (optional output path)")
  .option("--fast", "speed up by skipping dead code and type-aware lint")
  .option("-y, --yes", "skip prompts, scan all workspace projects")
  .option(
    "--project <name>",
    "select workspace project (comma-separated for multiple)",
  )
  .option(
    "--diff [base]",
    "scan only files changed vs base branch (Note: dead code detection is skipped in diff mode)",
  )
  .option(
    "--rules <categories>",
    "force-enable specific rule categories (signals,ngrx,material) or 'all'",
  )
  .option(
    "--exit-code",
    "exit with non-zero code when ESLint errors are found (for CI integration)",
  )
  .option("--no-scss", "skip SCSS linting")
  .option("--no-circular-deps", "skip circular dependency detection")
  .option("--no-config-checks", "skip angular.json/tsconfig checks")
  .option("--staged", "scan only git-staged files (for pre-commit hooks)")
  .option("--annotations", "emit GitHub Actions ::error/::warning annotation lines")
  .option(
    "--fail-on <level>",
    "exit non-zero on error, warn, or none (default: error)",
  )
  .option("--offline", "skip any network calls or telemetry")
  .option("--json", "output structured JSON report")
  .option("--json-compact", "output compact JSON report")
  .option(
    "--explain <file:line>",
    "explain why a rule fired at the given file:line location",
  )
  .option("--full", "scan entire codebase, ignoring uncommitted changes (overrides auto-diff)")
  .action(async (directory: string, flags: CliFlags) => {
    const isScoreOnly = flags.score;

    try {
      const resolvedDirectory = path.resolve(directory);
      const userConfig = loadConfig(resolvedDirectory);

      if (!isScoreOnly) {
        logger.log(`angular-doctor v${VERSION}`);
        logger.break();
      }

      const scanOptions = resolveCliScanOptions(flags, userConfig, program);
      const shouldSkipPrompts =
        flags.yes || isAutomatedEnvironment() || !process.stdin.isTTY;

      // Discover and (optionally) prompt to select workspace projects
      const projectDirectories = await selectProjects(
        resolvedDirectory,
        flags.project,
        shouldSkipPrompts,
      );

      // --staged: scan only git-staged files
      if (flags.staged) {
        const { spawnSync } = await import("node:child_process");
        const stagedResult = spawnSync("git", ["diff", "--cached", "--name-only"], {
          cwd: resolvedDirectory,
          encoding: "utf-8",
        });
        const stagedFiles = (stagedResult.stdout ?? "")
          .split("\n")
          .filter((f) => f.endsWith(".ts") || f.endsWith(".html") || f.endsWith(".scss"));
        if (stagedFiles.length === 0) {
          if (!isScoreOnly) logger.log("No staged source files. Nothing to scan.");
          process.exit(0);
        }
        if (!isScoreOnly) logger.log(`Scanning ${stagedFiles.length} staged file(s)...`);
      }

      const isDiffCliOverride = program.getOptionValueSource("diff") === "cli";
      const effectiveDiff = (flags.full || flags.staged) ? false : (isDiffCliOverride ? flags.diff : userConfig?.diff);
      const explicitBaseBranch =
        typeof effectiveDiff === "string" ? effectiveDiff : undefined;
      const diffInfo = (flags.full || flags.staged) ? null : getDiffInfo(resolvedDirectory, explicitBaseBranch);
      const isDiffMode = flags.full ? false : await resolveDiffMode(
        diffInfo,
        effectiveDiff,
        shouldSkipPrompts,
        isScoreOnly,
      );

      if (isDiffMode && diffInfo && !isScoreOnly) {
        if (diffInfo.isCurrentChanges) {
          logger.log("Scanning uncommitted changes");
        } else {
          logger.log(
            `Scanning changes: ${highlighter.info(diffInfo.currentBranch)} → ${highlighter.info(diffInfo.baseBranch)}`,
          );
        }
        logger.warn(
          "Note: Dead code detection skipped in diff mode. Run without --diff for full scan.",
        );
        logger.break();
      }

      for (const projectDirectory of projectDirectories) {
        let includePaths: string[] | undefined;

        if (isDiffMode) {
          const projectDiffInfo = getDiffInfo(
            projectDirectory,
            explicitBaseBranch,
          );
          if (projectDiffInfo) {
            const changedSourceFiles = filterSourceFiles(
              projectDiffInfo.changedFiles,
            );
            if (changedSourceFiles.length === 0) {
              if (!isScoreOnly) {
                logger.dim(
                  `No changed source files in ${projectDirectory}, skipping.`,
                );
                logger.break();
              }
              continue;
            }
            includePaths = changedSourceFiles;
          }
        }

        if (!isScoreOnly) {
          logger.dim(`Scanning ${projectDirectory}...`);
          logger.break();
        }

        const scanResult = await scan(projectDirectory, { ...scanOptions, includePaths });

        // --annotations: emit GitHub Actions annotation lines
        if (flags.annotations) {
          for (const d of scanResult.diagnostics) {
            const level = d.severity === "error" ? "error" : "warning";
            process.stdout.write(
              `::${level} file=${d.filePath},line=${d.line},col=${d.column}::${d.message} [${d.rule}]\n`,
            );
          }
        }

        // --json / --json-compact: emit structured JSON
        if (flags.json || flags.jsonCompact) {
          const report = {
            score: scanResult.scoreResult?.score ?? 0,
            label: scanResult.scoreResult?.label ?? "",
            errorCount: scanResult.errorCount,
            warningCount: scanResult.warningCount,
            diagnostics: scanResult.diagnostics,
          };
          const json = flags.jsonCompact
            ? JSON.stringify(report)
            : JSON.stringify(report, null, 2);
          process.stdout.write(json + "\n");
        }

        // --fail-on: controlled exit code
        const failOn = flags.failOn ?? "error";
        if (failOn === "error" && scanResult.errorCount > 0) {
          process.exitCode = 1;
        } else if (failOn === "warn" && (scanResult.errorCount > 0 || scanResult.warningCount > 0)) {
          process.exitCode = 1;
        }

        // Legacy --exit-code flag or CI environment
        const shouldSetExitCode = flags.exitCode || isAutomatedEnvironment();
        if (shouldSetExitCode && scanResult.errorCount > 0) {
          process.exitCode = 1;
        }

        if (!isScoreOnly) {
          logger.break();
        }
      }
    } catch (error) {
      handleError(error);
    }
  })
  .addHelpText(
    "after",
    `
${highlighter.dim("Learn more:")}
  ${highlighter.info("https://github.com/antonygiomarxdev/angular-doctor")}
`,
  );

const main = async () => {
  await program.parseAsync();
};

main();
