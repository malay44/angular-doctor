import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";

const STORAGE_METHODS = new Set(["getItem", "setItem", "removeItem", "clear", "key"]);

const STORAGE_WHITELISTED_FILENAMES = [
  "storage.service",
  "session.service",
  "cache.service",
  "token.service",
  "cookie.service",
];

const isSessionStorageCall = (node: TSESTree.CallExpression): boolean => {
  const callee = node.callee;
  if (callee.type !== "MemberExpression") return false;
  const obj = callee.object;
  const prop = callee.property;
  if (prop.type !== "Identifier" || !STORAGE_METHODS.has(prop.name)) return false;
  if (obj.type === "Identifier" && obj.name === "sessionStorage") return true;
  if (
    obj.type === "MemberExpression" &&
    obj.property.type === "Identifier" &&
    obj.property.name === "sessionStorage"
  ) return true;
  return false;
};

const hasInjectableDecorator = (node: TSESTree.ClassDeclaration | TSESTree.ClassExpression): boolean =>
  (node.decorators ?? []).some(
    (d) =>
      (d.expression.type === "Identifier" && d.expression.name === "Injectable") ||
      (d.expression.type === "CallExpression" &&
        d.expression.callee.type === "Identifier" &&
        d.expression.callee.name === "Injectable"),
  );

export const noSessionStorageInService = createRule({
  name: "no-session-storage-in-service",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Avoid direct `sessionStorage` access in Angular services — it bypasses the signal store, makes the service untestable, and can cause stale-context bugs when the session value outlives the Angular context",
    },
    messages: {
      avoidSessionStorage:
        "`sessionStorage.{{ method }}()` called directly in a service. " +
        "Prefer reading from the signal store (e.g. `this.classStore.x()`) and use `sessionStorage` only as a write-through cache, not as primary state.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    if (!filename.endsWith(".service.ts")) return {};
    if (STORAGE_WHITELISTED_FILENAMES.some((w) => filename.includes(w))) return {};

    let inInjectable = false;

    return {
      ClassDeclaration(node) {
        if (hasInjectableDecorator(node)) inInjectable = true;
      },
      "ClassDeclaration:exit"() {
        inInjectable = false;
      },
      ClassExpression(node) {
        if (hasInjectableDecorator(node)) inInjectable = true;
      },
      "ClassExpression:exit"() {
        inInjectable = false;
      },
      CallExpression(node) {
        if (!inInjectable) return;
        if (!isSessionStorageCall(node)) return;
        const callee = node.callee as TSESTree.MemberExpression;
        const method = (callee.property as TSESTree.Identifier).name;
        context.report({ node, messageId: "avoidSessionStorage", data: { method } });
      },
    };
  },
});
