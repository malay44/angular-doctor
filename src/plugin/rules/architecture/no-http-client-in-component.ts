import { createRule } from "../../utils/define-rule.js";

export const noHttpClientInComponent = createRule({
  name: "http-client-only-via-api-service",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow injecting HttpClient directly in components — use an API service layer",
    },
    messages: {
      directInjection:
        "`HttpClient` injected directly in a component. Create a `*-api.service.ts` that wraps endpoints and inject that instead. Components should depend on facade/API services.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    const isComponent = filename.includes(".component.ts");
    if (!isComponent) return {};

    return {
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "inject"
        ) {
          const arg = node.arguments[0];
          if (
            arg?.type === "Identifier" &&
            arg.name === "HttpClient"
          ) {
            context.report({ node, messageId: "directInjection" });
          }
        }
      },
      // Also catch constructor DI: constructor(private http: HttpClient)
      Identifier(node) {
        if (node.name !== "HttpClient") return;
        const parent = node.parent;
        if (
          parent?.type === "TSTypeReference" &&
          parent.parent?.type === "TSTypeAnnotation"
        ) {
          const param = parent.parent.parent;
          if (param?.type === "Identifier" && param.parent?.type === "FunctionExpression") {
            // Inside constructor params
          }
        }
      },
    };
  },
});
