import { createRule } from "../../utils/define-rule.js";

export const preferAdapterInterceptor = createRule({
  name: "prefer-adapter-interceptor-for-envelope",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Flag repeated .pipe(map(r => r.data)) patterns — extract to an HTTP interceptor (Adapter pattern)",
    },
    messages: {
      repeatedEnvelopeUnwrap:
        "Repeated response-envelope unwrapping `.pipe(map(r => r.data))` detected. Extract to an `HttpInterceptorFn` that unwraps the `{ data: T }` envelope centrally.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    // Only flag in api.service.ts files
    if (!filename.includes("-api.service.ts") && !filename.includes(".api.service.ts")) {
      return {};
    }

    let envelopeUnwrapCount = 0;

    return {
      CallExpression(node) {
        // .pipe(map(r => r.data)) pattern
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "pipe"
        ) {
          for (const arg of node.arguments) {
            if (
              arg.type === "CallExpression" &&
              (arg.callee as { name?: string }).name === "map"
            ) {
              const mapArg = arg.arguments[0];
              if (
                mapArg &&
                (mapArg.type === "ArrowFunctionExpression" ||
                  mapArg.type === "FunctionExpression")
              ) {
                const body = (mapArg as { body: unknown }).body;
                if (
                  body &&
                  typeof body === "object" &&
                  (body as { type: string }).type === "MemberExpression" &&
                  (body as { property: { type: string; name?: string } }).property?.type === "Identifier" &&
                  (body as { property: { name?: string } }).property?.name === "data"
                ) {
                  envelopeUnwrapCount++;
                }
              }
            }
          }
        }
      },
      "Program:exit"(programNode) {
        if (envelopeUnwrapCount >= 3) {
          context.report({
            node: programNode,
            messageId: "repeatedEnvelopeUnwrap",
          });
        }
      },
    };
  },
});
