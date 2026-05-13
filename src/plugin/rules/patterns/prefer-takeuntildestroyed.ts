import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";

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
      filename.includes(".service.ts") ||
      filename.includes(".directive.ts");

    if (!isAngularClass) return {};

    let hasTakeUntilDestroyed = false;
    let subscribeNodes: TSESTree.Node[] = [];

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === "MemberExpression" &&
          callee.property.type === "Identifier"
        ) {
          if (callee.property.name === "subscribe") {
            subscribeNodes.push(node);
          }
          if (callee.property.name === "takeUntilDestroyed") {
            hasTakeUntilDestroyed = true;
          }
        }
        if (
          callee.type === "Identifier" &&
          callee.name === "takeUntilDestroyed"
        ) {
          hasTakeUntilDestroyed = true;
        }
      },
      "Program:exit"() {
        if (!hasTakeUntilDestroyed && subscribeNodes.length > 0) {
          for (const node of subscribeNodes) {
            context.report({ node, messageId: "missingCleanup" });
          }
        }
        // Reset for next file
        hasTakeUntilDestroyed = false;
        subscribeNodes = [];
      },
    };
  },
});
