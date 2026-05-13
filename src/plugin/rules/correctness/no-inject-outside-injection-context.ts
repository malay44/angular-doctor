import { createRule } from "../../utils/define-rule.js";

export const noInjectOutsideInjectionContext = createRule({
  name: "no-inject-outside-injection-context",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow inject() calls inside method bodies, event handlers, or async callbacks — only valid during class construction",
    },
    messages: {
      outsideContext:
        "`inject()` called inside `{{ context }}`. It must be called during class construction (field initializer or constructor). Use `inject()` at the class field level.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // Track whether we're inside a class field initializer or constructor
    const methodStack: string[] = [];

    return {
      MethodDefinition(node) {
        const kind = node.kind;
        const name =
          node.key.type === "Identifier" ? node.key.name : "method";
        if (kind === "constructor") {
          methodStack.push("constructor");
        } else {
          methodStack.push(name);
        }
      },
      "MethodDefinition:exit"() {
        methodStack.pop();
      },
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "inject"
        ) {
          const currentContext = methodStack[methodStack.length - 1];
          if (currentContext && currentContext !== "constructor") {
            context.report({
              node,
              messageId: "outsideContext",
              data: { context: currentContext },
            });
          }
        }
      },
    };
  },
});
