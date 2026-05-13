import { createRule } from "../../utils/define-rule.js";

const LEGACY_HTTP_MODULES = new Set([
  "HttpClientModule",
  "HttpClientJsonpModule",
  "HttpClientXsrfModule",
]);

export const preferProvideHttpClient = createRule({
  name: "prefer-provide-http-client",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer provideHttpClient() over HttpClientModule (Angular 15+)",
    },
    messages: {
      legacyModule:
        "`{{ name }}` is deprecated. Replace with `provideHttpClient(withInterceptors([...]))` in your app config.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Identifier(node) {
        if (
          LEGACY_HTTP_MODULES.has(node.name) &&
          node.parent?.type === "ArrayExpression"
        ) {
          context.report({
            node,
            messageId: "legacyModule",
            data: { name: node.name },
          });
        }
      },
    };
  },
});
