import { createRule } from "../../utils/define-rule.js";

const CLASS_GUARD_INTERFACES = new Set([
  "CanActivate",
  "CanActivateChild",
  "CanDeactivate",
  "CanLoad",
  "CanMatch",
  "Resolve",
]);

export const preferFunctionalRouterGuard = createRule({
  name: "prefer-functional-router-guard",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer functional route guards (CanActivateFn, etc.) over class-based guards",
    },
    messages: {
      preferFunctional:
        "Class-based guard `{{ name }}` implements `{{ iface }}`. Use a functional guard (`CanActivateFn`, `CanDeactivateFn`, etc.) instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ClassDeclaration(node) {
        if (!node.implements || node.implements.length === 0) return;
        for (const impl of node.implements) {
          const expr = impl.expression;
          const ifaceName =
            expr.type === "Identifier"
              ? expr.name
              : expr.type === "MemberExpression" &&
                  expr.property.type === "Identifier"
                ? expr.property.name
                : null;
          if (ifaceName && CLASS_GUARD_INTERFACES.has(ifaceName)) {
            context.report({
              node,
              messageId: "preferFunctional",
              data: {
                name: node.id?.name ?? "anonymous",
                iface: ifaceName,
              },
            });
            break;
          }
        }
      },
    };
  },
});
