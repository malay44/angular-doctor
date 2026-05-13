import { createRule } from "../../utils/define-rule.js";

export const noNgModule = createRule({
  name: "no-ngmodule",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow @NgModule in app code — use standalone components instead (Angular 17+)",
    },
    messages: {
      noNgModule:
        "@NgModule is legacy. Migrate to standalone components with `standalone: true`. Remove NgModule declarations.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Decorator(node) {
        const expr = node.expression;
        if (
          expr.type === "CallExpression" &&
          expr.callee.type === "Identifier" &&
          expr.callee.name === "NgModule"
        ) {
          context.report({ node, messageId: "noNgModule" });
        }
      },
    };
  },
});
