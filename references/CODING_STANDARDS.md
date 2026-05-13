# Angular Doctor — Enforced Coding Standards

Each standard is enforced by a deterministic rule. No AI interpretation.

---

## Modernization (Angular 17+)

| Standard | Rule | Severity |
|---|---|---|
| No `@NgModule` in app code | `no-ngmodule` | error |
| Route guards must be functional (`CanActivateFn`) | `prefer-functional-router-guard` | warn |
| HTTP interceptors must be functional (`withInterceptors`) | `prefer-functional-interceptor` | warn |
| Use `provideHttpClient()` not `HttpClientModule` | `prefer-provide-http-client` | error |
| Bootstrap must include `provideZonelessChangeDetection()` | `require-provide-zoneless-change-detection` | warn |
| Use `input()` / `input.required()` instead of `@Input()` | `prefer-signal-input` | warn |
| Use `output()` instead of `@Output() EventEmitter` | `prefer-signal-output` | warn |

---

## Correctness

| Standard | Rule | Severity |
|---|---|---|
| No signal `.set/update()` inside `computed()` | `no-side-effect-in-computed` | error |
| `effect()` with subscriptions/timers must call `onCleanup()` | `effect-needs-cleanup` | error |
| `inject()` only in class field initializers or constructor | `no-inject-outside-injection-context` | error |
| Do not use `| async` on a signal | `no-async-pipe-on-signal` | error |
| HTTP observables in services must include `catchError` | `no-http-call-without-catch-error` | warn |

---

## Performance

| Standard | Rule | Severity |
|---|---|---|
| No `import 'zone.js'` alongside `provideZonelessChangeDetection()` | `no-zone-js-in-zoneless-app` | error |
| Replace `effect(() => b.set(a()))` with `computed()` | `prefer-computed-over-effect` | warn |
| Do not pass inline object/array literals to OnPush child `[input]` bindings | `no-inline-object-on-onpush-child` | warn |

---

## Security

| Standard | Rule | Severity |
|---|---|---|
| `innerHTML =` requires `DomSanitizer` import | `no-inner-html-binding-without-sanitizer` | error |
| `bypassSecurityTrust*` requires a justification comment on the same line | `no-bypass-security-trust` | error |
| No `eval()` or `new Function()` | `no-eval-or-function` | error |
| No hardcoded secrets (≥ 24 chars matching API key / JWT / AWS patterns) | `no-secrets-in-source` | error |
| No `localStorage.setItem` with token/password/jwt key | `no-localstorage-token-write` | warn |
| No dynamic `script.src` assignment from variables or storage | `no-dynamic-script-src` | error |
| `provideHttpClient()` must include `withXsrfProtection()` | `require-xsrf-protection` | warn |
| No unvalidated `location.replace/assign/href` redirects | `no-open-redirect` | error |
| No `sessionStorage/localStorage.setItem` in plain HTML files | `no-dev-token-file` | error |

---

## Architecture

| Standard | Rule | Severity |
|---|---|---|
| `HttpClient` must only be injected in `*-api.service.ts` files | `http-client-only-via-api-service` | warn |
| No `index.ts` barrel files with ≥ 2 re-exports | `no-barrel-files` | warn |
| No imports from forbidden packages (configured list) | `forbidden-imports` | error |
| Feature components must not import store/state directly — use facade | `no-direct-store-in-feature-component` | warn |

---

## Code Smells (Refactoring Guru)

| Standard | Rule | Severity |
|---|---|---|
| Class must not exceed 300 lines or 20 public members | `no-large-class` | warn |
| Method must not exceed 40 lines | `no-long-method` | warn |
| Function must not have more than 4 parameters | `no-long-parameter-list` | warn |
| No `switch(x.type/kind)` — use Strategy pattern via DI | `no-switch-on-type-tag` | warn |
| Service where every method only delegates — no Middle Man | `no-middle-man-service` | warn |
| Member access chain must not exceed depth 3 | `no-message-chain` | warn |

---

## Design Patterns (Refactoring Guru)

| Standard | Rule | Severity |
|---|---|---|
| RxJS subscriptions in Angular classes require `takeUntilDestroyed()` | `prefer-takeuntildestroyed` | error |
| 3+ `.pipe(map(r => r.data))` in one API service → extract to interceptor | `prefer-adapter-interceptor-for-envelope` | warn |

---

## Config

| Standard | Rule | Severity |
|---|---|---|
| `angular.json` production config must have `budgets` | `angular-json-budgets-required` | warn |
| `tsconfig.json` must have `"strict": true` | `tsconfig-strict-required` | warn |
| `tsconfig.json` must have `"strictTemplates": true` | `tsconfig-strict-templates-required` | warn |

---

## NOT enforced deterministically (AI-assisted review only)

The following require semantic/domain understanding and cannot be reliably detected by AST rules:

- **Data Clumps** — same parameter group repeated across unrelated function signatures
- **Feature Envy** — method accesses another class's data more than its own
- **Divergent Change** — single class changed for multiple unrelated reasons
- **Security justification quality** — whether a `bypassSecurityTrust*` comment is a real proof of safety vs. a rubber stamp
- **Business logic correctness** — whether computed values / algorithms are semantically correct
- **Accessibility semantics** — beyond structural checks (`alt` text, button type), whether labels are meaningful

For these, use code review with AI assistance. Do not rely on automated tooling.
