import { createRule } from "../../utils/define-rule.js";
import type { TSESTree } from "@typescript-eslint/utils";

export const noDynamicScriptSrc = createRule({
  name: "no-dynamic-script-src",
  meta: {
    type: "problem",
    docs: { description: "Disallow dynamic assignment to script element .src property — risk of arbitrary script injection" },
    messages: {
      dynamicScriptSrc: "Dynamic assignment to `.src` on a script element. Loading scripts from dynamic/storage-based URLs bypasses CSP. Use a static allowlist or Trusted Types.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const isStorageAccess = (node: TSESTree.Node): boolean => {
      if (node.type !== "CallExpression") return false;
      const callee = node.callee;
      return (
        callee.type === "MemberExpression" &&
        callee.object.type === "Identifier" &&
        (callee.object.name === "sessionStorage" || callee.object.name === "localStorage") &&
        callee.property.type === "Identifier" &&
        callee.property.name === "getItem"
      );
    };

    const isScriptObject = (node: TSESTree.Node): boolean => {
      if (node.type === "Identifier") {
        return /script/i.test(node.name);
      }
      return false;
    };

    return {
      AssignmentExpression(node) {
        if (node.left.type !== "MemberExpression") return;
        const member = node.left;
        if (member.property.type !== "Identifier" || member.property.name !== "src") return;
        // Only flag if RHS is dynamic (not a string literal)
        if (node.right.type === "Literal" && typeof (node.right as TSESTree.Literal).value === "string") return;

        const isScript = isScriptObject(member.object);
        const isFromStorage = isStorageAccess(node.right);

        if (isScript || isFromStorage) {
          context.report({ node, messageId: "dynamicScriptSrc" });
        }
      },
    };
  },
});
