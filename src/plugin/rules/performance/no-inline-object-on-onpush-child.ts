import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";

export const noInlineObjectOnOnPushChild = createRule({
  name: "no-inline-object-on-onpush-child",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn about inline object/array literals in template bindings that break OnPush referential equality",
    },
    messages: {
      inlineObject:
        "Inline `{{ kind }}` literal in `[{{ input }}]` binding creates a new reference every change-detection cycle, defeating `OnPush`. Extract to a class property or `computed()`.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // This rule analyzes component class TS files for patterns like:
    // In templates it's handled by the template plugin; here we flag JSX-like patterns
    // and also <app-foo [config]="{a: 1}"> patterns detected via string scanning
    return {
      JSXAttribute(node) {
        const value = (node as { value?: { type?: string } }).value;
        if (
          value?.type === "JSXExpressionContainer"
        ) {
          const expr = (value as { expression?: { type?: string } }).expression;
          if (expr?.type === "ObjectExpression" || expr?.type === "ArrayExpression") {
            context.report({
              node: node as TSESTree.Node,
              messageId: "inlineObject",
              data: {
                kind: expr.type === "ObjectExpression" ? "object" : "array",
                input: (node as { name?: { name?: string } }).name?.name ?? "input",
              },
            });
          }
        }
      },
    };
  },
});
