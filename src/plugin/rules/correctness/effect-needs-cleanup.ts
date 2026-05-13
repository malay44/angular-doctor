import { createRule } from "../../utils/define-rule.js";

const CLEANUP_REQUIRING_CALLS = new Set([
  "setInterval",
  "setTimeout",
  "addEventListener",
  "subscribe",
  "fromEvent",
  "interval",
  "timer",
]);

export const effectNeedsCleanup = createRule({
  name: "effect-needs-cleanup",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require cleanup via onCleanup() inside effect() calls that create subscriptions or timers",
    },
    messages: {
      missingCleanup:
        "`effect()` contains `{{ call }}` but no `onCleanup(...)` call. Resource will leak when component is destroyed. Add `onCleanup(() => { ... })` to release the resource.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "effect"
        ) {
          return;
        }

        const callback = node.arguments[0];
        if (!callback) return;

        let hasCleanupRequiringCall: string | null = null;
        let hasOnCleanup = false;

        const walk = (n: unknown): void => {
          if (!n || typeof n !== "object") return;
          const astNode = n as { type: string; callee?: unknown; arguments?: unknown[]; object?: unknown; property?: unknown; name?: string; [key: string]: unknown };

          if (astNode.type === "CallExpression") {
            const callee = astNode.callee as { type?: string; name?: string; property?: { name?: string } };
            const calleeName =
              callee.type === "Identifier"
                ? callee.name ?? ""
                : callee.type === "MemberExpression"
                  ? (callee.property as { name?: string })?.name ?? ""
                  : "";

            if (CLEANUP_REQUIRING_CALLS.has(calleeName)) {
              hasCleanupRequiringCall = calleeName;
            }
            if (calleeName === "onCleanup") {
              hasOnCleanup = true;
            }

            for (const arg of astNode.arguments ?? []) walk(arg);
          }

          for (const key of Object.keys(astNode)) {
            if (key === "parent") continue;
            const val = astNode[key];
            if (Array.isArray(val)) val.forEach(walk);
            else if (val && typeof val === "object" && (val as { type?: string }).type) walk(val);
          }
        };

        walk(callback);

        if (hasCleanupRequiringCall && !hasOnCleanup) {
          context.report({
            node,
            messageId: "missingCleanup",
            data: { call: hasCleanupRequiringCall },
          });
        }
      },
    };
  },
});
