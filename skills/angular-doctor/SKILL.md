---
name: angular-doctor
description: Run after Angular changes to catch correctness, performance, security, architecture, template, and code-smell issues in Angular 17–21 codebases. Use when reviewing Angular code, finishing a feature, migrating to control flow / signals / standalone / zoneless, fixing lint failures, or auditing an Angular project for Refactoring Guru code smells and design pattern misuse.
license: MIT
compatibility: Requires Node.js 20+. Reads angular.json, tsconfig*.json, karma.conf.* from project root. Optional stylelint (SCSS checks) and madge (circular dep detection) are bundled.
allowed-tools: Bash(npx:*) Bash(node:*) Bash(git:*) Read
metadata:
  version: "2.0.0"
  vercel:
    pathPatterns:
      - "**/*.ts"
      - "**/*.html"
      - "**/*.scss"
      - "angular.json"
      - "tsconfig*.json"
    importPatterns:
      - "@angular/core"
      - "@angular/common"
      - "@angular/router"
      - "@angular/forms"
    promptSignals:
      phrases:
        - "angular doctor"
        - "angular lint"
        - "scan angular"
        - "angular 21"
        - "audit angular"
        - "refactoring guru"
        - "code smells angular"
      anyOf:
        - "angular"
        - "ng lint"
        - "standalone"
        - "signals"
        - "zoneless"
      minScore: 6
---

# Angular Doctor

Scans your Angular codebase for **correctness, performance, security, architecture, code smells, and design pattern misuse**. Outputs a 0–100 health score with actionable diagnostics.

Checks cover:
- **Modernization** — NgModule → standalone, `@Input/@Output` → signals, constructor DI → `inject()`, `*ngIf/*ngFor` → `@if/@for`, class guards → functional guards, `HttpClientModule` → `provideHttpClient()`, zoneless providers
- **Correctness** — `@for` missing `track`, signal writes inside `computed()`, `inject()` outside injection context, `effect()` without cleanup, async pipe on signals
- **Performance** — `OnPush` enforcement, zone.js in zoneless apps, `effect()` vs `computed()`, inline objects on OnPush children
- **Security** — `[innerHTML]` without sanitizer, `bypassSecurityTrust*`, `eval()`, hardcoded secrets, `localStorage` token writes
- **Architecture** — `HttpClient` in components, barrel files, circular dependencies, forbidden imports
- **Code Smells** (Refactoring Guru) — Large Class, Long Method, Long Parameter List, Switch Statements, Middle Man, Message Chains
- **Patterns** (Refactoring Guru) — Observer: missing `takeUntilDestroyed`; Adapter: repeated envelope unwrapping → interceptor
- **Config** — `angular.json` missing budgets, `tsconfig.json` missing `strict` + `strictTemplates`, zone.js in polyfills while zoneless

## Usage

```bash
# Full scan with verbose output
npx -y angular-doctor@latest . --verbose

# Scan only changed files vs main branch
npx -y angular-doctor@latest . --diff main

# Pre-commit: staged files only
npx -y angular-doctor@latest . --staged

# CI with GitHub Actions annotations
npx -y angular-doctor@latest . --annotations --fail-on error

# Machine-readable JSON report
npx -y angular-doctor@latest . --json > report.json

# Skip slow checks for fast feedback
npx -y angular-doctor@latest . --no-dead-code --no-circular-deps --fast
```

## Workflow

1. Run the scan.
2. Fix all **errors** first (score penalty 1.5× per unique rule triggered).
3. Re-run to verify the score improved.
4. Address **warnings** iteratively (score penalty 0.75× per unique rule).
5. Target score ≥ 75 ("Great") before merging.

## Score formula

```
score = max(0, round(100 − 1.5 × |unique error rules| − 0.75 × |unique warn rules|))
```

Unique rule keys are counted, not violation instances — fixing one rule that fires 50 times recovers the full penalty in one commit.

**Labels:** ≥ 75 → Great · ≥ 50 → Needs work · < 50 → Critical

## Key flags

| Flag | Description |
|---|---|
| `--verbose` | Show all violations per rule with file:line details |
| `--diff [base]` | Scan only files changed vs base branch (default: main/master) |
| `--staged` | Scan only git-staged files — ideal for pre-commit hooks |
| `--annotations` | Emit `::error file=…,line=…::` for GitHub Actions |
| `--fail-on <error\|warn\|none>` | Control exit code threshold |
| `--json` | Structured JSON output for tooling |
| `--no-dead-code` | Skip knip dead-code detection |
| `--no-scss` | Skip SCSS/stylelint checks |
| `--no-circular-deps` | Skip circular dependency (madge) check |
| `--fast` | Skip slow checks (dead code, circular deps) |
| `--rules <categories>` | Force-enable: `signals`, `ngrx`, `material`, `all` |

## Suppression

```typescript
// angular-doctor-disable-next-line no-bypass-security-trust
const safe = sanitizer.bypassSecurityTrustHtml(trustedHtml);
```

## See also

- Full rule catalog: `references/RULES.md`
- Angular 21 gotchas: `references/ANGULAR_21_GOTCHAS.md`
- Refactoring Guru smells: https://refactoring.guru/refactoring/smells
- angular-eslint rules: https://github.com/angular-eslint/angular-eslint
