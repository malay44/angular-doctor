import { createRule } from "../../utils/define-rule.js";

export const preferSignalInput = createRule({
  name: "prefer-signal-input",
  meta: {
    type: "suggestion",
    docs: { description: "Prefer signal-based inputs (input()) over @Input() decorator (Angular 17+)" },
    messages: {
      useSignalInput: "@Input() decorator detected on `{{ name }}`. Migrate to signal-based input: `{{ name }} = input<T>()` or `{{ name }} = input.required<T>()`.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      PropertyDefinition(node) {
        const decorators = node.decorators ?? [];
        const hasInputDecorator = decorators.some((d) => {
          const expr = d.expression;
          return (
            (expr.type === "Identifier" && expr.name === "Input") ||
            (expr.type === "CallExpression" &&
              expr.callee.type === "Identifier" &&
              expr.callee.name === "Input")
          );
        });
        if (!hasInputDecorator) return;
        const propName =
          node.key.type === "Identifier" ? node.key.name : "property";
        context.report({ node, messageId: "useSignalInput", data: { name: propName } });
      },
    };
  },
});
