import { createRule } from "../../utils/define-rule.js";

export const noAsyncPipeOnSignal = createRule({
  name: "no-async-pipe-on-signal",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow using the async pipe on an Angular signal — signals are synchronous and don't need async unwrapping",
    },
    messages: {
      asyncOnSignal:
        "`{{ name }}` looks like a signal (name ends without `$`). Using `| async` on a signal creates double subscription. Read the signal directly: `{{ name }}()` in the template.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // This rule works at TS level — check for .pipe(async) patterns in observable assignments
    // Full template-level detection is in the template plugin; this catches TS-side pipe chains
    return {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "pipe"
        ) {
          const obj = node.callee.object;
          if (
            obj.type === "CallExpression" &&
            obj.callee.type === "Identifier" &&
            obj.callee.name === "signal"
          ) {
            context.report({
              node,
              messageId: "asyncOnSignal",
              data: { name: "signal()" },
            });
          }
        }
      },
    };
  },
});
