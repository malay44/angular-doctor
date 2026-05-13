import { createRule } from "../../utils/define-rule.js";
import {
  SECRET_MIN_LENGTH_CHARS,
  SECRET_PATTERNS,
} from "../../../constants.js";

export const noSecretsInSource = createRule({
  name: "no-secrets-in-source",
  meta: {
    type: "problem",
    docs: {
      description:
        "Detect hardcoded API keys, tokens, and secrets in source code",
    },
    messages: {
      secret:
        "String literal looks like a secret (matches {{ pattern }} pattern, length {{ len }}). Move it to environment variables or a secrets manager.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        if (node.value.length < SECRET_MIN_LENGTH_CHARS) return;

        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(node.value)) {
            context.report({
              node,
              messageId: "secret",
              data: {
                pattern: pattern.toString().slice(1, 30) + "...",
                len: String(node.value.length),
              },
            });
            return;
          }
        }
      },
    };
  },
});
