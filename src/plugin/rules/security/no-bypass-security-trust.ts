import { createRule } from "../../utils/define-rule.js";

const BYPASS_METHODS = new Set([
  "bypassSecurityTrustHtml",
  "bypassSecurityTrustScript",
  "bypassSecurityTrustStyle",
  "bypassSecurityTrustUrl",
  "bypassSecurityTrustResourceUrl",
]);

export const noBypassSecurityTrust = createRule({
  name: "no-bypass-security-trust",
  meta: {
    type: "problem",
    docs: {
      description:
        "Flag calls to DomSanitizer.bypassSecurityTrust* — require explicit acknowledgment",
    },
    messages: {
      bypass:
        "`{{ method }}()` bypasses Angular's XSS protection. Ensure the value is truly safe and add a comment explaining why. Consider `sanitize()` instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.property.type === "Identifier" &&
          BYPASS_METHODS.has(callee.property.name)
        ) {
          const sourceCode = context.sourceCode ?? (context as unknown as { getSourceCode(): { getCommentsBefore(n: unknown): unknown[] } }).getSourceCode();
          const comments = sourceCode.getCommentsBefore
            ? sourceCode.getCommentsBefore(node)
            : [];
          const hasJustification = comments.some((c) => {
            const comment = c as { value: string };
            return (
              comment.value.toLowerCase().includes("safe") ||
              comment.value.toLowerCase().includes("trusted") ||
              comment.value.toLowerCase().includes("sanitized")
            );
          });

          if (!hasJustification) {
            context.report({
              node,
              messageId: "bypass",
              data: { method: callee.property.name },
            });
          }
        }
      },
    };
  },
});
