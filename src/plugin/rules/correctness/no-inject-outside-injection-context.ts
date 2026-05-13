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
    const scopeStack: string[] = [];

    return {
      MethodDefinition(node) {
        const name = node.key.type === "Identifier" ? node.key.name : "method";
        scopeStack.push(node.kind === "constructor" ? "constructor" : name);
      },
      "MethodDefinition:exit"() {
        scopeStack.pop();
      },
      ArrowFunctionExpression() {
        if (scopeStack.length > 0) scopeStack.push("callback");
      },
      "ArrowFunctionExpression:exit"() {
        if (scopeStack.length > 0 && scopeStack[scopeStack.length - 1] === "callback") scopeStack.pop();
      },
      FunctionExpression(node) {
        if (scopeStack.length > 0 && node.parent?.type !== "MethodDefinition") {
          scopeStack.push("callback");
        }
      },
      "FunctionExpression:exit"(node) {
        if (scopeStack.length > 0 && scopeStack[scopeStack.length - 1] === "callback") scopeStack.pop();
      },
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "inject") return;
        const top = scopeStack[scopeStack.length - 1];
        if (top && top !== "constructor") {
          context.report({ node, messageId: "outsideContext", data: { context: top } });
        }
      },
    };
  },
});
