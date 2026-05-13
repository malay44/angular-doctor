import { createRule } from "../../utils/define-rule.js";

export const noMiddleManService = createRule({
  name: "no-middle-man-service",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Flag services whose every public method only delegates to another service (Middle Man smell from Refactoring Guru)",
    },
    messages: {
      middleMan:
        "Service `{{ name }}` appears to be a Middle Man — every public method delegates directly to another service. Remove the indirection or add real behavior.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    if (!filename.includes(".service.ts")) return {};

    return {
      ClassDeclaration(node) {
        const methods = node.body.body.filter(
          (m) =>
            m.type === "MethodDefinition" &&
            (m as { accessibility?: string; kind: string }).kind === "method" &&
            (!( m as { accessibility?: string }).accessibility ||
              (m as { accessibility?: string }).accessibility === "public"),
        ) as Array<{
          type: string;
          key: { type: string; name?: string };
          value: { body: { type: string; body: unknown[] } | null };
        }>;

        if (methods.length < 2) return;

        const isDelegatingMethod = (method: typeof methods[number]): boolean => {
          const body = method.value.body;
          if (!body || body.type !== "BlockStatement") return false;
          const stmts = body.body;
          if (stmts.length !== 1) return false;
          const stmt = stmts[0] as { type: string; argument?: { type: string }; expression?: { type: string } };
          const expr =
            stmt.type === "ReturnStatement"
              ? stmt.argument
              : stmt.type === "ExpressionStatement"
                ? stmt.expression
                : null;
          if (!expr) return false;
          // return this.otherService.method(...)
          return (
            expr.type === "CallExpression" &&
            (expr as { callee?: { type?: string; object?: { type?: string; object?: { type?: string; property?: { type?: string; name?: string } } } } }).callee?.type === "MemberExpression" &&
            (expr as { callee?: { object?: { type?: string; object?: { type?: string } } } }).callee?.object?.type === "MemberExpression" &&
            (expr as { callee?: { object?: { object?: { type?: string } } } }).callee?.object?.object?.type === "ThisExpression"
          );
        };

        const allDelegate = methods.every(isDelegatingMethod);
        if (allDelegate) {
          context.report({
            node,
            messageId: "middleMan",
            data: { name: node.id?.name ?? "Service" },
          });
        }
      },
    };
  },
});
