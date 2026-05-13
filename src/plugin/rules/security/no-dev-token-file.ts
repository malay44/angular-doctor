import { createRule } from "../../utils/define-rule.js";

export const noDevTokenFile = createRule({
  name: "no-dev-token-file",
  meta: {
    type: "problem",
    docs: { description: "Detect sessionStorage/localStorage token injection in plain HTML files — common dev helper left in production" },
    messages: {
      devTokenFile: "`{{ storage }}.setItem(...)` in a plain HTML file (`{{ filename }}`). Dev token injection files allow session hijacking if deployed to production. Remove before shipping.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? "";
    const isPlainHtml = filename.endsWith(".html") && !filename.endsWith(".component.html");
    if (!isPlainHtml) return {};

    const basename = filename.split("/").pop() ?? filename;

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== "MemberExpression") return;
        if (
          callee.object.type !== "Identifier" ||
          !["sessionStorage", "localStorage"].includes(callee.object.name)
        ) return;
        if (
          callee.property.type !== "Identifier" ||
          callee.property.name !== "setItem"
        ) return;

        context.report({
          node,
          messageId: "devTokenFile",
          data: {
            storage: callee.object.name,
            filename: basename,
          },
        });
      },
    };
  },
});
