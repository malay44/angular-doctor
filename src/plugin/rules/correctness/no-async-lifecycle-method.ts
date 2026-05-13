import { createRule } from "../../utils/define-rule.js";

const LIFECYCLE_HOOKS = new Set([
  "ngOnInit", "ngOnDestroy", "ngOnChanges",
  "ngAfterViewInit", "ngAfterViewChecked",
  "ngAfterContentInit", "ngAfterContentChecked",
  "ngDoCheck", "ngOnReset",
]);

export const noAsyncLifecycleMethod = createRule({
  name: "no-async-lifecycle-method",
  meta: {
    type: "problem",
    docs: { description: "Angular lifecycle hooks must not be async — Angular does not await them, errors are silently swallowed" },
    messages: {
      asyncLifecycle: "`{{ name }}()` is marked `async`. Angular ignores the returned Promise — use signals or explicit subscription management instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      MethodDefinition(node) {
        if (node.key.type !== "Identifier") return;
        if (!LIFECYCLE_HOOKS.has(node.key.name)) return;
        if (!node.value.async) return;
        context.report({
          node,
          messageId: "asyncLifecycle",
          data: { name: node.key.name },
        });
      },
    };
  },
});
