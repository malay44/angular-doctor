import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";
import { LONG_METHOD_LINE_THRESHOLD } from "../../../constants.js";

export const noLongMethod = createRule({
  name: "no-long-method",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Flag methods longer than threshold (Long Method smell from Refactoring Guru)",
    },
    messages: {
      longMethod:
        "Method `{{ name }}` is {{ lines }} lines long (threshold: {{ threshold }}). Extract into smaller, focused methods.",
    },
    schema: [
      {
        type: "object",
        properties: { maxLines: { type: "number" } },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options = {}]) {
    const maxLines = (options as { maxLines?: number }).maxLines ?? LONG_METHOD_LINE_THRESHOLD;

    const checkMethod = (node: { loc?: { start: { line: number }; end: { line: number } }; key?: { type: string; name?: string } | null; kind?: string }): void => {
      if (!node.loc) return;
      const lines = node.loc.end.line - node.loc.start.line + 1;
      if (lines <= maxLines) return;

      const name =
        node.key?.type === "Identifier"
          ? node.key.name ?? "anonymous"
          : "anonymous";

      context.report({
        node: node as TSESTree.Node,
        messageId: "longMethod",
        data: {
          name,
          lines: String(lines),
          threshold: String(maxLines),
        },
      });
    };

    return {
      MethodDefinition: checkMethod,
      FunctionDeclaration(node) {
        if (!node.loc) return;
        const lines = node.loc.end.line - node.loc.start.line + 1;
        if (lines <= maxLines) return;
        const name = node.id?.name ?? "anonymous";
        context.report({
          node,
          messageId: "longMethod",
          data: { name, lines: String(lines), threshold: String(maxLines) },
        });
      },
    };
  },
});
