import { createRule } from "../../utils/define-rule.js";

const SENSITIVE_KEY_PATTERN = /token|jwt|secret|password|apikey|api_key/i;

export const noLocalStorageTokenWrite = createRule({
  name: "no-localstorage-token-write",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn about storing sensitive values (tokens, passwords) in localStorage",
    },
    messages: {
      sensitiveKey:
        "`localStorage.setItem('{{ key }}', ...)` stores a sensitive value. Use httpOnly cookies or an in-memory service for authentication tokens.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== "MemberExpression" ||
          node.callee.property.type !== "Identifier" ||
          node.callee.property.name !== "setItem"
        ) {
          return;
        }

        const obj = node.callee.object;
        const isLocalStorage =
          (obj.type === "Identifier" && obj.name === "localStorage") ||
          (obj.type === "MemberExpression" &&
            obj.property.type === "Identifier" &&
            obj.property.name === "localStorage");

        if (!isLocalStorage) return;

        const keyArg = node.arguments[0];
        if (keyArg?.type === "Literal" && typeof keyArg.value === "string") {
          if (SENSITIVE_KEY_PATTERN.test(keyArg.value)) {
            context.report({
              node,
              messageId: "sensitiveKey",
              data: { key: keyArg.value },
            });
          }
        }
      },
    };
  },
});
