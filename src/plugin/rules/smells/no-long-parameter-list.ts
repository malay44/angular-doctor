import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";
import { LONG_PARAMETER_LIST_THRESHOLD } from "../../../constants.js";

export const noLongParameterList = createRule({
  name: "no-long-parameter-list",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Flag functions/methods with too many parameters (Long Parameter List smell)",
    },
    messages: {
      tooManyParams:
        "`{{ name }}` has {{ count }} parameters (threshold: {{ threshold }}). Introduce a Parameter Object or use inject() for DI.",
    },
    schema: [
      {
        type: "object",
        properties: { max: { type: "number" } },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options = {}]) {
    const max = (options as { max?: number }).max ?? LONG_PARAMETER_LIST_THRESHOLD;

    const check = (node: { params: unknown[]; id?: { name?: string } | null; key?: { type: string; name?: string } | null }): void => {
      const count = node.params.length;
      if (count <= max) return;
      const name =
        (node as { id?: { name?: string } }).id?.name ??
        (node as { key?: { type: string; name?: string } }).key?.name ??
        "anonymous";
      context.report({
        node: node as TSESTree.Node,
        messageId: "tooManyParams",
        data: { name, count: String(count), threshold: String(max) },
      });
    };

    return {
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check,
      MethodDefinition(node) {
        const fn = node.value;
        if ((fn as { params: unknown[] }).params.length > max) {
          const name = node.key.type === "Identifier" ? node.key.name : "method";
          context.report({
            node,
            messageId: "tooManyParams",
            data: {
              name,
              count: String((fn as { params: unknown[] }).params.length),
              threshold: String(max),
            },
          });
        }
      },
    };
  },
});
