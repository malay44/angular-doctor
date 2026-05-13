import { createRule } from "../../utils/define-rule.js";

interface Options {
  forbidden: string[];
}

export const forbiddenImports = createRule<[Options], "forbidden">({
  name: "forbidden-imports",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow configured forbidden import paths/packages",
    },
    messages: {
      forbidden:
        "Import of `{{ source }}` is forbidden. {{ reason }}",
    },
    schema: [
      {
        type: "object",
        properties: {
          forbidden: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ forbidden: [] }],
  create(context, [options]) {
    const forbidden = options.forbidden ?? [];
    if (forbidden.length === 0) return {};

    return {
      ImportDeclaration(node) {
        const source = node.source.value as string;
        for (const pattern of forbidden) {
          if (source === pattern || source.startsWith(pattern + "/")) {
            context.report({
              node,
              messageId: "forbidden",
              data: {
                source,
                reason: `Package \`${pattern}\` is not allowed in this project.`,
              },
            });
            break;
          }
        }
      },
    };
  },
});
