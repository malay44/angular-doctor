import { createRule } from "../../utils/define-rule.js";

const REDIRECT_METHODS = new Set(["replace", "assign"]);

export const noOpenRedirect = createRule({
  name: "no-open-redirect",
  meta: {
    type: "problem",
    docs: { description: "Detect unvalidated open redirects via location.replace/assign/href" },
    messages: {
      openRedirect: "Unvalidated redirect via `{{ expr }}` — if this value comes from user input or URL params, this is an open redirect. Validate the URL against an allowlist before redirecting.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const isLocationObject = (node: import("@typescript-eslint/utils").TSESTree.Node): boolean => {
      if (node.type === "Identifier" && node.name === "location") return true;
      if (
        node.type === "MemberExpression" &&
        node.object.type === "Identifier" &&
        node.object.name === "window" &&
        node.property.type === "Identifier" &&
        node.property.name === "location"
      ) return true;
      return false;
    };

    const isDynamicValue = (node: import("@typescript-eslint/utils").TSESTree.Node): boolean =>
      !(node.type === "Literal" && typeof (node as { value: unknown }).value === "string");

    return {
      // location.replace(x) / location.assign(x) / window.location.replace(x)
      CallExpression(node) {
        if (node.callee.type !== "MemberExpression") return;
        const { object, property } = node.callee;
        if (property.type !== "Identifier") return;
        if (!REDIRECT_METHODS.has(property.name)) return;
        if (!isLocationObject(object)) return;
        const arg = node.arguments[0];
        if (!arg || !isDynamicValue(arg)) return;
        context.report({
          node,
          messageId: "openRedirect",
          data: { expr: `location.${property.name}()` },
        });
      },
      // location.href = x / window.location.href = x
      AssignmentExpression(node) {
        if (node.left.type !== "MemberExpression") return;
        const { object, property } = node.left;
        if (property.type !== "Identifier" || property.name !== "href") return;
        if (!isLocationObject(object)) return;
        if (!isDynamicValue(node.right)) return;
        context.report({ node, messageId: "openRedirect", data: { expr: "location.href" } });
      },
    };
  },
});
