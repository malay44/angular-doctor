import { createRule } from "../../utils/define-rule.js";

const SIGNAL_WRITE_METHODS = new Set(["set", "update", "mutate"]);

export const noSideEffectInComputed = createRule({
  name: "no-side-effect-in-computed",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow signal writes (set/update/mutate) inside computed() bodies",
    },
    messages: {
      sideEffect:
        "Signal write `{{ method }}()` inside `computed()` causes infinite loop or unpredictable behavior. Use `effect()` for side effects.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const computedStack: boolean[] = [];

    return {
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "computed"
        ) {
          computedStack.push(true);
        }

        if (computedStack.length > 0) {
          // Check for signal.set(...), signal.update(...), signal.mutate(...)
          if (
            node.callee.type === "MemberExpression" &&
            node.callee.property.type === "Identifier" &&
            SIGNAL_WRITE_METHODS.has(node.callee.property.name)
          ) {
            context.report({
              node,
              messageId: "sideEffect",
              data: { method: node.callee.property.name },
            });
          }
        }
      },
      "CallExpression:exit"(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "computed"
        ) {
          computedStack.pop();
        }
      },
    };
  },
});
