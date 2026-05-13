import { createRule } from "../../utils/define-rule.js";
import { MESSAGE_CHAIN_DEPTH_THRESHOLD } from "../../../constants.js";

const getMemberChainDepth = (node: { type: string; object?: unknown }): number => {
  if (node.type !== "MemberExpression") return 0;
  return 1 + getMemberChainDepth(node.object as { type: string; object?: unknown });
};

export const noMessageChain = createRule({
  name: "no-message-chain",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Flag deep member-access chains (a.b.c.d) — Message Chains smell from Refactoring Guru",
    },
    messages: {
      deepChain:
        "Member access chain depth {{ depth }} exceeds threshold {{ threshold }}. Use a local variable or introduce a method/computed to name the intermediate values.",
    },
    schema: [
      {
        type: "object",
        properties: { maxDepth: { type: "number" } },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options = {}]) {
    const maxDepth = (options as { maxDepth?: number }).maxDepth ?? MESSAGE_CHAIN_DEPTH_THRESHOLD;

    return {
      MemberExpression(node) {
        const parent = node.parent;
        // Only report on the outermost member expression (not nested ones)
        if (parent?.type === "MemberExpression") return;

        const depth = getMemberChainDepth(node as { type: string; object?: unknown });
        if (depth > maxDepth) {
          context.report({
            node,
            messageId: "deepChain",
            data: { depth: String(depth), threshold: String(maxDepth) },
          });
        }
      },
    };
  },
});
