# Angular Doctor — Rule Catalog

Complete listing of all rules. Format: `RULE-ID · CATEGORY · SEVERITY · WHAT IT DETECTS`.

---

## Modernization (5 rules)

| Rule | Severity | Detects |
|---|---|---|
| `angular-doctor/no-ngmodule` | **error** | `@NgModule` decorator in app code — migrate to standalone |
| `angular-doctor/prefer-functional-router-guard` | warn | Class-based `CanActivate`/`CanDeactivate`/`Resolve` guards |
| `angular-doctor/prefer-functional-interceptor` | warn | Class implementing `HttpInterceptor` — use `withInterceptors([fn])` |
| `angular-doctor/prefer-provide-http-client` | **error** | `HttpClientModule` in imports array — replace with `provideHttpClient()` |
| `angular-doctor/require-provide-zoneless-change-detection` | warn | `bootstrapApplication` without `provideZonelessChangeDetection()` |

---

## Correctness (4 rules)

| Rule | Severity | Detects |
|---|---|---|
| `angular-doctor/no-side-effect-in-computed` | **error** | `signal.set/update()` inside `computed()` body |
| `angular-doctor/effect-needs-cleanup` | **error** | `effect()` with `setInterval/subscribe/addEventListener` but no `onCleanup()` |
| `angular-doctor/no-inject-outside-injection-context` | **error** | `inject()` called inside a method body (not field initializer/constructor) |
| `angular-doctor/no-async-pipe-on-signal` | **error** | `.pipe()` on a `signal()` — signals are synchronous, `| async` not needed |

---

## Performance (3 rules)

| Rule | Severity | Detects |
|---|---|---|
| `angular-doctor/no-zone-js-in-zoneless-app` | **error** | `import 'zone.js'` alongside `provideZonelessChangeDetection()` |
| `angular-doctor/prefer-computed-over-effect` | warn | `effect()` whose only body is a signal write — should be `computed()` |
| `angular-doctor/no-inline-object-on-onpush-child` | warn | Inline object/array literal in template binding to an `OnPush` child |

---

## Security (5 rules)

| Rule | Severity | Detects |
|---|---|---|
| `angular-doctor/no-inner-html-binding-without-sanitizer` | **error** | `element.innerHTML = ...` without `DomSanitizer` import |
| `angular-doctor/no-bypass-security-trust` | **error** | `bypassSecurityTrustHtml/Script/Style/Url/ResourceUrl` without justification comment |
| `angular-doctor/no-eval-or-function` | **error** | `eval()` or `new Function(...)` |
| `angular-doctor/no-secrets-in-source` | **error** | String literals ≥ 24 chars matching API key / JWT / AWS key patterns |
| `angular-doctor/no-localstorage-token-write` | warn | `localStorage.setItem` with a token/password/jwt key |

---

## Architecture (3 rules)

| Rule | Severity | Detects |
|---|---|---|
| `angular-doctor/http-client-only-via-api-service` | warn | `inject(HttpClient)` in a `*.component.ts` file |
| `angular-doctor/no-barrel-files` | warn | `index.ts` with ≥ 2 re-export statements |
| `angular-doctor/forbidden-imports` | **error** | Configurable list of forbidden packages/paths |

---

## Code Smells — Refactoring Guru (6 rules)

| Rule | Severity | Smell | Detects |
|---|---|---|---|
| `angular-doctor/no-large-class` | warn | Large Class | Class > 300 lines OR > 20 public members |
| `angular-doctor/no-long-method` | warn | Long Method | Method > 40 lines |
| `angular-doctor/no-long-parameter-list` | warn | Long Parameter List | Function/constructor with > 4 parameters |
| `angular-doctor/no-switch-on-type-tag` | warn | Switch Statements | `switch (x.type/kind/variant/category)` |
| `angular-doctor/no-middle-man-service` | warn | Middle Man | Service where every method only delegates to another service |
| `angular-doctor/no-message-chain` | warn | Message Chains | Member access chain depth > 3 (`a.b.c.d`) |

---

## Design Patterns — Refactoring Guru (2 rules)

| Rule | Severity | Pattern | Detects |
|---|---|---|---|
| `angular-doctor/prefer-takeuntildestroyed` | **error** | Observer | `.subscribe()` in Angular class without `takeUntilDestroyed()` |
| `angular-doctor/prefer-adapter-interceptor-for-envelope` | warn | Adapter | ≥ 3 `.pipe(map(r => r.data))` in same api service — extract to interceptor |

---

## Config Checks (3 rules)

| Rule | Severity | Detects |
|---|---|---|
| `angular-doctor-config/angular-json-budgets-required` | warn | `angular.json` production config missing `budgets` array |
| `angular-doctor-config/tsconfig-strict-required` | warn | `tsconfig.json` missing `"strict": true` |
| `angular-doctor-config/tsconfig-strict-templates-required` | warn | `tsconfig.json` missing `"strictTemplates": true` |

---

## Upstream rules (from @angular-eslint, typescript-eslint)

All upstream rules in `@angular-eslint/eslint-plugin` v21 are also enabled. See:
- https://github.com/angular-eslint/angular-eslint/tree/main/packages/eslint-plugin/docs/rules
- https://github.com/angular-eslint/angular-eslint/tree/main/packages/eslint-plugin-template/docs/rules

---

## Configuration

Disable specific rules in `angular-doctor.config.json`:

```json
{
  "ignore": {
    "rules": ["angular-doctor/no-barrel-files", "angular-doctor/no-large-class"],
    "files": ["**/legacy/**"]
  },
  "forbiddenImports": ["@apollo/client", "@angular/material"],
  "scss_tokensFile": "src/styles/tokens.scss"
}
```
