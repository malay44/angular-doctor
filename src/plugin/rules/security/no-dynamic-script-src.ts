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
    // Track variables assigned from document.createElement('script')
    const scriptVarNames = new Set<string>();

    const isStorageAccess = (node: import("@typescript-eslint/utils").TSESTree.Node): boolean => {
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

    const isScriptVar = (node: import("@typescript-eslint/utils").TSESTree.Node): boolean => {
      if (node.type === "Identifier") {
        return /script/i.test(node.name) || scriptVarNames.has(node.name);
      }
      return false;
    };

    const isDynamic = (node: import("@typescript-eslint/utils").TSESTree.Node): boolean =>
      !(node.type === "Literal" && typeof (node as { value: unknown }).value === "string");

    return {
      // Track: const el = document.createElement('script')
      VariableDeclarator(node) {
        if (!node.init || node.init.type !== "CallExpression") return;
        const call = node.init;
        if (
          call.callee.type === "MemberExpression" &&
          call.callee.object.type === "Identifier" &&
          call.callee.object.name === "document" &&
          call.callee.property.type === "Identifier" &&
          call.callee.property.name === "createElement" &&
          call.arguments[0]?.type === "Literal" &&
          String((call.arguments[0] as { value: unknown }).value).toLowerCase() === "script" &&
          node.id.type === "Identifier"
        ) {
          scriptVarNames.add(node.id.name);
        }
      },
      AssignmentExpression(node) {
        if (node.left.type !== "MemberExpression") return;
        const member = node.left;
        if (member.property.type !== "Identifier" || member.property.name !== "src") return;
        if (!isDynamic(node.right)) return;

        const isScript = isScriptVar(member.object);
        const isFromStorage = isStorageAccess(node.right);

        if (isScript || isFromStorage) {
          context.report({ node, messageId: "dynamicScriptSrc" });
        }
      },
    };
  },
});
