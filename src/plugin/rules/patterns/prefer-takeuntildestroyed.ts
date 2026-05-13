import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";

const isTakeUntilDestroyedArg = (node: TSESTree.Node): boolean => {
  if (node.type === "Identifier" && node.name === "takeUntilDestroyed") return true;
  if (
    node.type === "CallExpression" &&
    (
      (node.callee.type === "Identifier" && node.callee.name === "takeUntilDestroyed") ||
      (node.callee.type === "MemberExpression" &&
        node.callee.property.type === "Identifier" &&
        node.callee.property.name === "takeUntilDestroyed")
    )
  ) return true;
  return false;
};

const chainHasTakeUntilDestroyed = (subscribeNode: TSESTree.CallExpression): boolean => {
  let current: TSESTree.Node = (subscribeNode.callee as TSESTree.MemberExpression).object;
  while (current.type === "CallExpression") {
    const call = current as TSESTree.CallExpression;
    if (
      call.callee.type === "MemberExpression" &&
      call.callee.property.type === "Identifier" &&
      call.callee.property.name === "pipe"
    ) {
      if (call.arguments.some(isTakeUntilDestroyedArg)) return true;
    }
    if (call.callee.type === "MemberExpression") {
      current = call.callee.object;
    } else {
      break;
    }
  }
  return false;
};

const isStoredInClassProperty = (subscribeNode: TSESTree.CallExpression): boolean => {
  const parent = subscribeNode.parent;
  if (!parent) return false;
  if (
    parent.type === "AssignmentExpression" &&
    parent.left.type === "MemberExpression" &&
    parent.left.object.type === "ThisExpression"
  ) return true;
  if (parent.type === "VariableDeclarator") {
    return true;
  }
  return false;
};

export const preferTakeUntilDestroyed = createRule({
  name: "prefer-takeuntildestroyed",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require takeUntilDestroyed() or explicit unsubscription for RxJS subscriptions in Angular classes (Observer pattern hygiene)",
    },
    messages: {
      missingCleanup:
        "`.subscribe()` without `takeUntilDestroyed()` or stored subscription will leak memory when the component is destroyed. Add `.pipe(takeUntilDestroyed(this.destroyRef))` or store and unsubscribe.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    const isAngularClass =
      filename.includes(".component.ts") ||
      filename.includes(".directive.ts");

    if (!isAngularClass) return {};

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "subscribe"
        ) {
          if (!chainHasTakeUntilDestroyed(node) && !isStoredInClassProperty(node)) {
            context.report({ node, messageId: "missingCleanup" });
          }
        }
      },
    };
  },
});
