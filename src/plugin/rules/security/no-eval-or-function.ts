import { createRule } from "../../utils/define-rule.js";

export const noEvalOrFunction = createRule({
  name: "no-eval-or-function",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow eval() and new Function() — code injection risk",
    },
    messages: {
      noEval: "`eval()` executes arbitrary code. Use a safe alternative.",
      noFunction:
        "`new Function(...)` dynamically creates and executes code. Use a type-safe alternative.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "eval"
        ) {
          context.report({ node, messageId: "noEval" });
        }
      },
      NewExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "Function"
        ) {
          context.report({ node, messageId: "noFunction" });
        }
      },
    };
  },
});
