import type { ESLint } from "eslint";

// Modernization
import { noNgModule } from "./rules/modernization/no-ngmodule.js";
import { preferFunctionalRouterGuard } from "./rules/modernization/prefer-functional-router-guard.js";
import { preferFunctionalInterceptor } from "./rules/modernization/prefer-functional-interceptor.js";
import { preferProvideHttpClient } from "./rules/modernization/prefer-provide-http-client.js";
import { requireProvideZoneless } from "./rules/modernization/require-provide-zoneless.js";
import { preferSignalInput } from "./rules/modernization/prefer-signal-input.js";
import { preferSignalOutput } from "./rules/modernization/prefer-signal-output.js";
import { preferSignalQuery } from "./rules/modernization/prefer-signal-query.js";
import { preferInjectFn } from "./rules/modernization/prefer-inject-fn.js";

// Correctness
import { noSideEffectInComputed } from "./rules/correctness/no-side-effect-in-computed.js";
import { effectNeedsCleanup } from "./rules/correctness/effect-needs-cleanup.js";
import { noInjectOutsideInjectionContext } from "./rules/correctness/no-inject-outside-injection-context.js";
import { noAsyncPipeOnSignal } from "./rules/correctness/no-async-pipe-on-signal.js";
import { noHttpCallWithoutCatchError } from "./rules/correctness/no-http-call-without-catch-error.js";
import { noAsyncLifecycleMethod } from "./rules/correctness/no-async-lifecycle-method.js";
import { noTypeGuardWithoutUnknownInput } from "./rules/correctness/no-type-guard-without-unknown-input.js";
import { noConditionalLoadingSkip } from "./rules/correctness/no-conditional-loading-skip.js";
import { noAsyncLoadWithoutGenerationGuard } from "./rules/correctness/no-async-load-without-generation-guard.js";

// Performance
import { noZoneJsInZonelessApp } from "./rules/performance/no-zone-js-in-zoneless-app.js";
import { preferComputedOverEffect } from "./rules/performance/prefer-computed-over-effect.js";
import { noInlineObjectOnOnPushChild } from "./rules/performance/no-inline-object-on-onpush-child.js";
import { preferComputedForDerivedMethods } from "./rules/performance/prefer-computed-for-derived-methods.js";

// Security
import { noInnerHtmlBinding } from "./rules/security/no-inner-html-binding.js";
import { noBypassSecurityTrust } from "./rules/security/no-bypass-security-trust.js";
import { noEvalOrFunction } from "./rules/security/no-eval-or-function.js";
import { noSecretsInSource } from "./rules/security/no-secrets-in-source.js";
import { noLocalStorageTokenWrite } from "./rules/security/no-localstorage-token-write.js";
import { noDynamicScriptSrc } from "./rules/security/no-dynamic-script-src.js";
import { requireXsrfProtection } from "./rules/security/require-xsrf-protection.js";
import { noOpenRedirect } from "./rules/security/no-open-redirect.js";
import { noDevTokenFile } from "./rules/security/no-dev-token-file.js";
import { noSessionStorageInService } from "./rules/security/no-session-storage-in-service.js";

// Architecture
import { noHttpClientInComponent } from "./rules/architecture/no-http-client-in-component.js";
import { noBarrelFiles } from "./rules/architecture/no-barrel-files.js";
import { forbiddenImports } from "./rules/architecture/forbidden-imports.js";
import { noDirectStoreInFeatureComponent } from "./rules/architecture/no-direct-store-in-feature-component.js";
import { noApiTypesOutsideApiFolder } from "./rules/architecture/no-api-types-outside-api-folder.js";

// Smells (Refactoring Guru)
import { noLargeClass } from "./rules/smells/no-large-class.js";
import { noLongMethod } from "./rules/smells/no-long-method.js";
import { noLongParameterList } from "./rules/smells/no-long-parameter-list.js";
import { noSwitchOnTypeTag } from "./rules/smells/no-switch-on-type-tag.js";
import { noMiddleManService } from "./rules/smells/no-middle-man-service.js";
import { noMessageChain } from "./rules/smells/no-message-chain.js";

// Patterns (Refactoring Guru design patterns)
import { preferTakeUntilDestroyed } from "./rules/patterns/prefer-takeuntildestroyed.js";
import { preferAdapterInterceptor } from "./rules/patterns/prefer-adapter-interceptor.js";

// typescript-eslint RuleModule is structurally incompatible with ESLint 9's RuleDefinition
// at the type level only; runtime behavior is correct.
export const angularDoctorPlugin = {
  meta: {
    name: "angular-doctor",
    version: "2.0.0",
  },
  rules: {
    // Modernization
    "no-ngmodule": noNgModule,
    "prefer-functional-router-guard": preferFunctionalRouterGuard,
    "prefer-functional-interceptor": preferFunctionalInterceptor,
    "prefer-provide-http-client": preferProvideHttpClient,
    "require-provide-zoneless-change-detection": requireProvideZoneless,
    "prefer-signal-input": preferSignalInput,
    "prefer-signal-output": preferSignalOutput,
    "prefer-signal-query": preferSignalQuery,
    "prefer-inject-fn": preferInjectFn,

    // Correctness
    "no-type-guard-without-unknown-input": noTypeGuardWithoutUnknownInput,
    "no-conditional-loading-skip": noConditionalLoadingSkip,
    "no-async-load-without-generation-guard": noAsyncLoadWithoutGenerationGuard,
    "no-side-effect-in-computed": noSideEffectInComputed,
    "effect-needs-cleanup": effectNeedsCleanup,
    "no-inject-outside-injection-context": noInjectOutsideInjectionContext,
    "no-async-pipe-on-signal": noAsyncPipeOnSignal,
    "no-http-call-without-catch-error": noHttpCallWithoutCatchError,
    "no-async-lifecycle-method": noAsyncLifecycleMethod,

    // Performance
    "no-zone-js-in-zoneless-app": noZoneJsInZonelessApp,
    "prefer-computed-over-effect": preferComputedOverEffect,
    "no-inline-object-on-onpush-child": noInlineObjectOnOnPushChild,
    "prefer-computed-for-derived-methods": preferComputedForDerivedMethods,

    // Security
    "no-inner-html-binding-without-sanitizer": noInnerHtmlBinding,
    "no-bypass-security-trust": noBypassSecurityTrust,
    "no-eval-or-function": noEvalOrFunction,
    "no-secrets-in-source": noSecretsInSource,
    "no-localstorage-token-write": noLocalStorageTokenWrite,
    "no-dynamic-script-src": noDynamicScriptSrc,
    "require-xsrf-protection": requireXsrfProtection,
    "no-open-redirect": noOpenRedirect,
    "no-dev-token-file": noDevTokenFile,
    "no-session-storage-in-service": noSessionStorageInService,

    // Architecture
    "http-client-only-via-api-service": noHttpClientInComponent,
    "no-barrel-files": noBarrelFiles,
    "forbidden-imports": forbiddenImports,
    "no-direct-store-in-feature-component": noDirectStoreInFeatureComponent,
    "no-api-types-outside-api-folder": noApiTypesOutsideApiFolder,

    // Smells
    "no-large-class": noLargeClass,
    "no-long-method": noLongMethod,
    "no-long-parameter-list": noLongParameterList,
    "no-switch-on-type-tag": noSwitchOnTypeTag,
    "no-middle-man-service": noMiddleManService,
    "no-message-chain": noMessageChain,

    // Patterns
    "prefer-takeuntildestroyed": preferTakeUntilDestroyed,
    "prefer-adapter-interceptor-for-envelope": preferAdapterInterceptor,
  },
} as unknown as ESLint.Plugin;

export type AngularDoctorRuleNames = string;

export const PLUGIN_RULE_CATEGORY_MAP: Record<string, string> = {
  "angular-doctor/no-ngmodule": "Modernization",
  "angular-doctor/prefer-functional-router-guard": "Modernization",
  "angular-doctor/prefer-functional-interceptor": "Modernization",
  "angular-doctor/prefer-provide-http-client": "Modernization",
  "angular-doctor/require-provide-zoneless-change-detection": "Modernization",
  "angular-doctor/prefer-signal-input": "Modernization",
  "angular-doctor/prefer-signal-output": "Modernization",
  "angular-doctor/prefer-signal-query": "Modernization",
  "angular-doctor/prefer-inject-fn": "Modernization",
  "angular-doctor/no-side-effect-in-computed": "Correctness",
  "angular-doctor/effect-needs-cleanup": "Correctness",
  "angular-doctor/no-inject-outside-injection-context": "Correctness",
  "angular-doctor/no-async-pipe-on-signal": "Correctness",
  "angular-doctor/no-http-call-without-catch-error": "Correctness",
  "angular-doctor/no-async-lifecycle-method": "Correctness",
  "angular-doctor/no-type-guard-without-unknown-input": "Correctness",
  "angular-doctor/no-conditional-loading-skip": "Correctness",
  "angular-doctor/no-async-load-without-generation-guard": "Correctness",
  "angular-doctor/no-zone-js-in-zoneless-app": "Performance",
  "angular-doctor/prefer-computed-over-effect": "Performance",
  "angular-doctor/no-inline-object-on-onpush-child": "Performance",
  "angular-doctor/prefer-computed-for-derived-methods": "Performance",
  "angular-doctor/no-inner-html-binding-without-sanitizer": "Security",
  "angular-doctor/no-bypass-security-trust": "Security",
  "angular-doctor/no-eval-or-function": "Security",
  "angular-doctor/no-secrets-in-source": "Security",
  "angular-doctor/no-localstorage-token-write": "Security",
  "angular-doctor/no-dynamic-script-src": "Security",
  "angular-doctor/require-xsrf-protection": "Security",
  "angular-doctor/no-open-redirect": "Security",
  "angular-doctor/no-dev-token-file": "Security",
  "angular-doctor/no-session-storage-in-service": "Security",
  "angular-doctor/http-client-only-via-api-service": "Architecture",
  "angular-doctor/no-barrel-files": "Architecture",
  "angular-doctor/forbidden-imports": "Architecture",
  "angular-doctor/no-direct-store-in-feature-component": "Architecture",
  "angular-doctor/no-api-types-outside-api-folder": "Architecture",
  "angular-doctor/no-large-class": "Code Smells",
  "angular-doctor/no-long-method": "Code Smells",
  "angular-doctor/no-long-parameter-list": "Code Smells",
  "angular-doctor/no-switch-on-type-tag": "Code Smells",
  "angular-doctor/no-middle-man-service": "Code Smells",
  "angular-doctor/no-message-chain": "Code Smells",
  "angular-doctor/prefer-takeuntildestroyed": "Patterns",
  "angular-doctor/prefer-adapter-interceptor-for-envelope": "Patterns",
};

export const PLUGIN_RULE_SEVERITY_MAP: Record<string, "error" | "warning"> = {
  "angular-doctor/no-ngmodule": "error",
  "angular-doctor/prefer-functional-router-guard": "warning",
  "angular-doctor/prefer-functional-interceptor": "warning",
  "angular-doctor/prefer-provide-http-client": "error",
  "angular-doctor/require-provide-zoneless-change-detection": "warning",
  "angular-doctor/prefer-signal-input": "warning",
  "angular-doctor/prefer-signal-output": "warning",
  "angular-doctor/prefer-signal-query": "warning",
  "angular-doctor/prefer-inject-fn": "warning",
  "angular-doctor/no-side-effect-in-computed": "error",
  "angular-doctor/effect-needs-cleanup": "error",
  "angular-doctor/no-inject-outside-injection-context": "error",
  "angular-doctor/no-async-pipe-on-signal": "error",
  "angular-doctor/no-http-call-without-catch-error": "warning",
  "angular-doctor/no-async-lifecycle-method": "error",
  "angular-doctor/no-type-guard-without-unknown-input": "error",
  "angular-doctor/no-conditional-loading-skip": "error",
  "angular-doctor/no-async-load-without-generation-guard": "warning",
  "angular-doctor/no-zone-js-in-zoneless-app": "error",
  "angular-doctor/prefer-computed-over-effect": "warning",
  "angular-doctor/no-inline-object-on-onpush-child": "warning",
  "angular-doctor/prefer-computed-for-derived-methods": "warning",
  "angular-doctor/no-inner-html-binding-without-sanitizer": "error",
  "angular-doctor/no-bypass-security-trust": "error",
  "angular-doctor/no-eval-or-function": "error",
  "angular-doctor/no-secrets-in-source": "error",
  "angular-doctor/no-localstorage-token-write": "warning",
  "angular-doctor/no-dynamic-script-src": "error",
  "angular-doctor/require-xsrf-protection": "warning",
  "angular-doctor/no-open-redirect": "error",
  "angular-doctor/no-dev-token-file": "error",
  "angular-doctor/no-session-storage-in-service": "warning",
  "angular-doctor/http-client-only-via-api-service": "warning",
  "angular-doctor/no-barrel-files": "warning",
  "angular-doctor/forbidden-imports": "error",
  "angular-doctor/no-direct-store-in-feature-component": "warning",
  "angular-doctor/no-api-types-outside-api-folder": "warning",
  "angular-doctor/no-large-class": "warning",
  "angular-doctor/no-long-method": "warning",
  "angular-doctor/no-long-parameter-list": "warning",
  "angular-doctor/no-switch-on-type-tag": "warning",
  "angular-doctor/no-middle-man-service": "warning",
  "angular-doctor/no-message-chain": "warning",
  "angular-doctor/prefer-takeuntildestroyed": "error",
  "angular-doctor/prefer-adapter-interceptor-for-envelope": "warning",
};

export const PLUGIN_RULE_HELP_MAP: Record<string, string> = {
  "angular-doctor/no-ngmodule":
    "Migrate to standalone: `@Component({ standalone: true, imports: [...] })`",
  "angular-doctor/prefer-functional-router-guard":
    "Use `export const authGuard: CanActivateFn = (route, state) => { ... }`",
  "angular-doctor/prefer-functional-interceptor":
    "Use `provideHttpClient(withInterceptors([(req, next) => next(req)]))`",
  "angular-doctor/prefer-provide-http-client":
    "Replace `HttpClientModule` with `provideHttpClient()` in app.config.ts",
  "angular-doctor/require-provide-zoneless-change-detection":
    "Add `provideZonelessChangeDetection()` to your ApplicationConfig providers",
  "angular-doctor/prefer-signal-input":
    "Replace `@Input() prop: T` with `prop = input<T>()` or `prop = input.required<T>()`",
  "angular-doctor/prefer-signal-output":
    "Replace `@Output() event = new EventEmitter<T>()` with `event = output<T>()`",
  "angular-doctor/prefer-signal-query":
    "Replace `@ViewChild(MyComp) myRef!: MyComp` with `myRef = viewChild(MyComp)` — no more `ngAfterViewInit` required",
  "angular-doctor/prefer-inject-fn":
    "Replace constructor injection: `constructor(private svc: MyService)` → `private svc = inject(MyService)`",
  "angular-doctor/no-side-effect-in-computed":
    "Move signal writes to `effect()`, keep `computed()` pure",
  "angular-doctor/effect-needs-cleanup":
    "Add `onCleanup(() => clearInterval(id))` inside the effect callback",
  "angular-doctor/no-inject-outside-injection-context":
    "Move `inject()` to a class field initializer: `private svc = inject(MyService);`",
  "angular-doctor/no-async-pipe-on-signal":
    "Read signals directly: `{{ count() }}` — no `| async` needed",
  "angular-doctor/no-zone-js-in-zoneless-app":
    "Remove `zone.js` from polyfills array in angular.json",
  "angular-doctor/prefer-computed-over-effect":
    "Replace `effect(() => { b.set(a()) })` with `const b = computed(() => a())`",
  "angular-doctor/no-inline-object-on-onpush-child":
    "Extract to a class property: `readonly config = { a: 1 };` and bind `[config]=\"config\"`",
  "angular-doctor/no-inner-html-binding-without-sanitizer":
    "Use `sanitizer.sanitize(SecurityContext.HTML, value)` before binding",
  "angular-doctor/no-bypass-security-trust":
    "Add a comment explaining why the value is safe, or use `sanitize()` instead",
  "angular-doctor/no-eval-or-function":
    "Parse JSON with `JSON.parse()`, use lookup tables for dynamic dispatch",
  "angular-doctor/no-secrets-in-source":
    "Move secrets to environment variables or inject via `InjectionToken`",
  "angular-doctor/no-localstorage-token-write":
    "Use httpOnly cookies or keep tokens in memory via an `AuthService`",
  "angular-doctor/no-http-call-without-catch-error":
    "Add `.pipe(catchError(err => { ... }))` to handle HTTP failures and prevent uncaught errors",
  "angular-doctor/no-async-lifecycle-method":
    "Angular ignores the returned Promise. Use `ngOnInit() { this.data$ = this.svc.load(); }` and subscribe in the template with `| async` or use signals.",
  "angular-doctor/no-dynamic-script-src":
    "Use a static allowlist for script URLs; never assign user/storage-sourced URLs to script.src",
  "angular-doctor/require-xsrf-protection":
    "Add `withXsrfProtection()` to `provideHttpClient(withXsrfProtection())` in app.config.ts",
  "angular-doctor/no-open-redirect":
    "Validate redirect URLs against an allowlist: `const SAFE = new Set(['/dashboard']); if (!SAFE.has(url)) throw new Error('unsafe redirect');`",
  "angular-doctor/no-dev-token-file":
    "Remove dev token injection files before deploying. Use server-side session setup or environment-specific auth flows instead.",
  "angular-doctor/no-session-storage-in-service":
    "Read primary state from the signal store. Use sessionStorage only as a write-through cache: write on store update, read only when store is unavailable (e.g. page reload before first API response).",
  "angular-doctor/http-client-only-via-api-service":
    "Create `<feature>-api.service.ts`, inject `HttpClient` there, and inject the api service in the component",
  "angular-doctor/no-barrel-files":
    "Use direct relative imports instead of `index.ts` re-exports",
  "angular-doctor/forbidden-imports":
    "Remove the forbidden import and use the approved alternative",
  "angular-doctor/no-direct-store-in-feature-component":
    "Create a `<feature>-facade.service.ts` that wraps store access, and inject the facade in the component instead.",
  "angular-doctor/no-api-types-outside-api-folder":
    "Move wire types to `<feature>/api/<feature>-api.types.ts`. Keep `<feature>.models.ts` for domain/view types only.",
  "angular-doctor/no-large-class":
    "Split into smaller focused classes: facade service + api service + state signal",
  "angular-doctor/no-long-method":
    "Extract sections into private methods with descriptive names",
  "angular-doctor/no-long-parameter-list":
    "Introduce a Parameter Object interface or use `inject()` for DI parameters",
  "angular-doctor/no-switch-on-type-tag":
    "Use a `Map<Type, Handler>` or DI multi-provider Strategy pattern",
  "angular-doctor/no-middle-man-service":
    "Remove the indirection — inject the delegated service directly, or add real behavior",
  "angular-doctor/no-message-chain":
    "Introduce a local variable: `const plan = user.account.subscription.plan;`",
  "angular-doctor/prefer-takeuntildestroyed":
    "Add `.pipe(takeUntilDestroyed(this.destroyRef))` before `.subscribe()`",
  "angular-doctor/prefer-adapter-interceptor-for-envelope":
    "Create an `HttpInterceptorFn` that unwraps `{ data: T }` centrally",
  "angular-doctor/no-type-guard-without-unknown-input":
    "Change the parameter type to `unknown`: `function isMyType(value: unknown): value is MyType { return typeof value === 'object' && value !== null && 'key' in value; }`",
  "angular-doctor/no-conditional-loading-skip":
    "Move `setIsLoading(false)` to an unconditional `finally` block. Express the conditional state separately: `catch { if (condition) this.store.setPartialState(); } finally { this.store.setIsLoading(false); }`",
  "angular-doctor/no-async-load-without-generation-guard":
    "Add: `private loadGeneration = 0;` then `const gen = ++this.loadGeneration;` at load start, and check `if (gen !== this.loadGeneration) return;` after each await.",
  "angular-doctor/prefer-computed-for-derived-methods":
    "Replace method with a computed signal: `readonly unitPages = computed(() => this.navPages(this.facade.units()));`",
};
