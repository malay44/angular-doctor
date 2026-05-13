import { createRule } from "../../utils/define-rule.js";
import type { TSESTree } from "@typescript-eslint/utils";

const QUERY_DECORATOR_MAP: Record<string, string> = {
  ViewChild: "viewChild",
  ViewChildren: "viewChildren",
  ContentChild: "contentChild",
  ContentChildren: "contentChildren",
};

export const preferSignalQuery = createRule({
  name: "prefer-signal-query",
  meta: {
    type: "suggestion",
    docs: { description: "Prefer signal-based query functions (viewChild, contentChild) over @ViewChild/@ContentChild decorators (Angular 17.3+)" },
    messages: {
      useSignalQuery: "`@{{ decorator }}()` — replace with `{{ fn }}()` signal query for reactive access without `ngAfterViewInit`.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    if (!filename.endsWith(".component.ts") && !filename.endsWith(".directive.ts")) return {};

    return {
      PropertyDefinition(node: TSESTree.PropertyDefinition) {
        const decorators = node.decorators ?? [];
        for (const decorator of decorators) {
          const expr = decorator.expression;
          const decoratorName =
            (expr.type === "Identifier" && QUERY_DECORATOR_MAP[expr.name]) ? expr.name :
            (expr.type === "CallExpression" && expr.callee.type === "Identifier" && QUERY_DECORATOR_MAP[expr.callee.name]) ? expr.callee.name :
            null;
          if (!decoratorName) continue;
          context.report({
            node,
            messageId: "useSignalQuery",
            data: {
              decorator: decoratorName,
              fn: QUERY_DECORATOR_MAP[decoratorName],
            },
          });
        }
      },
    };
  },
});
