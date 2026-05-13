import { createRule } from "../../utils/define-rule.js";
import type { TSESTree } from "@typescript-eslint/utils";

const isCallTo = (node: TSESTree.Node, name: string): boolean =>
  node.type === "CallExpression" &&
  node.callee.type === "Identifier" &&
  node.callee.name === name;

export const requireXsrfProtection = createRule({
  name: "require-xsrf-protection",
  meta: {
    type: "problem",
    docs: { description: "Require withXsrfProtection() when configuring provideHttpClient() — prevents CSRF attacks" },
    messages: {
      missingXsrf: "`provideHttpClient()` is missing `withXsrfProtection()`. Add it to protect state-changing requests from CSRF attacks.",
      xsrfDisabled: "`withNoXsrfProtection()` explicitly disables CSRF protection. Ensure this is intentional and add a comment explaining why.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "provideHttpClient"
        ) return;

        const args = node.arguments;
        const hasXsrf = args.some((a) => isCallTo(a, "withXsrfProtection"));
        const hasNoXsrf = args.some((a) => isCallTo(a, "withNoXsrfProtection"));

        if (hasNoXsrf) {
          // Check for justification comment
          const sourceCode = context.sourceCode;
          const comments = sourceCode.getCommentsBefore(node);
          const hasJustification = comments.some((c) =>
            /csrf|xsrf|intentional|safe|reason/i.test((c as { value: string }).value)
          );
          if (!hasJustification) {
            context.report({ node, messageId: "xsrfDisabled" });
          }
          return;
        }

        if (!hasXsrf) {
          context.report({ node, messageId: "missingXsrf" });
        }
      },
    };
  },
});
