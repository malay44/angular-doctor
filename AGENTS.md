# Angular Doctor — Agent Quality Gate

Run after every Angular change. Fix all errors before marking work done.

## When to run

- After implementing a feature or fixing a bug
- Before committing (use `--staged` for pre-commit)
- After migrating NgModules → standalone, guards → functional, interceptors → functional
- After adding signals, effects, computed
- After touching HTTP services

## Commands

```bash
# Quick scan (staged files only — for pre-commit)
npx -y angular-doctor@latest . --staged --fail-on error

# Full scan with details
npx -y angular-doctor@latest . --verbose --no-dead-code

# CI with GitHub Actions annotations
npx -y angular-doctor@latest . --annotations --fail-on error --json

# Fast feedback (skip slow checks)
npx -y angular-doctor@latest . --fast --fail-on error
```

## Pass criteria

| Condition | Required |
|---|---|
| Score ≥ 75 | ✓ before merging |
| Zero **error** rules | ✓ always |
| Zero **warn** rules in touched files | ✓ for new code |

## What agents must NOT do

- Do not disable rules with `// angular-doctor-disable` without a written reason
- Do not suppress `no-bypass-security-trust` without a real trust justification
- Do not suppress `no-secrets-in-source` — move secrets to environment variables
- Do not fix scores by excluding files — fix the actual issue

## Deterministic vs AI-assisted checks

angular-doctor checks are **deterministic only** (AST rules, config validators, dep graph).

Use AI assistance ONLY for issues that cannot be detected by static analysis:
- **Data Clumps** — same parameter group appearing across 3+ unrelated functions (requires semantic understanding of whether params belong together)
- **Feature Envy** — a method accesses another class's data more than its own (requires intent understanding)
- **Divergent Change** — a class changes for multiple unrelated reasons (requires domain knowledge)
- **Trust validation** — whether a `bypassSecurityTrust*` comment actually proves safety
- **Business logic correctness** — whether an algorithm produces correct results

For all other checks: trust the tool output. If a rule fires, fix the code.

## Rule categories and owners

| Category | Rules | Who fixes |
|---|---|---|
| Modernization | NgModule→standalone, guards, interceptors, signals | Developer migrating |
| Correctness | signal misuse, inject context, effect cleanup | Developer implementing |
| Performance | OnPush, zone.js, computed vs effect | Developer + reviewer |
| Security | bypass trust, secrets, XSRF, open redirect, script injection | **Security review required** |
| Architecture | barrel files, HttpClient in components, store facades | Team lead decision |
| Code Smells | large class, long method, parameter list, message chains | Refactoring sprint |
| Patterns | takeUntilDestroyed, adapter interceptor | Developer implementing |
| Config | angular.json budgets, tsconfig strict | DevOps / lead |

## See also

- Full rule catalog: `references/RULES.md`
- Angular 21 gotchas: `references/ANGULAR_21_GOTCHAS.md`
- Suppression syntax: `// angular-doctor-disable-next-line <rule-name>`
