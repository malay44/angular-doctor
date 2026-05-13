import { createRule } from "../../utils/define-rule.js";

const SIGNAL_WRITE_METHODS = new Set(["set", "update", "mutate"]);

export const preferComputedOverEffect = createRule({
  name: "prefer-computed-over-effect",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer computed() over effect() when the effect only writes to another signal",
    },
    messages: {
      preferComputed:
        "`effect()` only writes to a signal (`{{ method }}`). Replace with `computed()` to derive the value declaratively and avoid unnecessary re-execution.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "effect"
        ) {
          return;
        }

        const callback = node.arguments[0];
        if (
          !callback ||
          (callback.type !== "ArrowFunctionExpression" &&
            callback.type !== "FunctionExpression")
        ) {
          return;
        }

        const body = callback.type === "ArrowFunctionExpression"
          ? callback.body
          : (callback as { body: unknown }).body;

        if (!body || typeof body !== "object") return;
        const bodyNode = body as { type: string; body?: unknown[]; expression?: unknown };

        const statements =
          bodyNode.type === "BlockStatement"
            ? (bodyNode.body ?? [])
            : bodyNode.type === "CallExpression"
              ? [{ type: "ExpressionStatement", expression: bodyNode }]
              : [];

        if (statements.length !== 1) return;

        const stmt = (statements[0] as { type: string; expression?: unknown });
        if (stmt.type !== "ExpressionStatement") return;

        const expr = stmt.expression as { type?: string; callee?: { type?: string; property?: { type?: string; name?: string } } };
        if (
          expr?.type === "CallExpression" &&
          expr.callee?.type === "MemberExpression" &&
          expr.callee.property?.type === "Identifier" &&
          SIGNAL_WRITE_METHODS.has(expr.callee.property.name ?? "")
        ) {
          context.report({
            node,
            messageId: "preferComputed",
            data: { method: expr.callee.property.name ?? "set" },
          });
        }
      },
    };
  },
});
