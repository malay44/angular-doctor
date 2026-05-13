import { createRule } from "../../utils/define-rule.js";

export const preferFunctionalInterceptor = createRule({
  name: "prefer-functional-interceptor",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer functional HTTP interceptors over class-based interceptors",
    },
    messages: {
      preferFunctional:
        "Class-based interceptor detected. Use `withInterceptors([fn])` from `provideHttpClient` instead of `HTTP_INTERCEPTORS` provider.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ClassDeclaration(node) {
        if (!node.implements) return;
        const hasInterceptor = node.implements.some((impl) => {
          const expr = impl.expression;
          return (
            (expr.type === "Identifier" && expr.name === "HttpInterceptor") ||
            (expr.type === "MemberExpression" &&
              expr.property.type === "Identifier" &&
              expr.property.name === "HttpInterceptor")
          );
        });
        if (hasInterceptor) {
          context.report({ node, messageId: "preferFunctional" });
        }
      },
    };
  },
});
