import { createRule } from "../../utils/define-rule.js";

export const preferSignalOutput = createRule({
  name: "prefer-signal-output",
  meta: {
    type: "suggestion",
    docs: { description: "Prefer output() over @Output() EventEmitter (Angular 17+)" },
    messages: {
      useSignalOutput: "@Output() with EventEmitter detected on `{{ name }}`. Migrate to `{{ name }} = output<T>()` (Angular 17+).",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      PropertyDefinition(node) {
        const decorators = node.decorators ?? [];
        const hasOutputDecorator = decorators.some((d) => {
          const expr = d.expression;
          return (
            (expr.type === "Identifier" && expr.name === "Output") ||
            (expr.type === "CallExpression" &&
              expr.callee.type === "Identifier" &&
              expr.callee.name === "Output")
          );
        });
        if (!hasOutputDecorator) return;
        const propName =
          node.key.type === "Identifier" ? node.key.name : "property";
        context.report({ node, messageId: "useSignalOutput", data: { name: propName } });
      },
    };
  },
});
