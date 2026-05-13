import { createRule } from "../../utils/define-rule.js";

const ZONELESS_PROVIDERS = new Set([
  "provideZonelessChangeDetection",
  "provideExperimentalZonelessChangeDetection",
]);

export const requireProvideZoneless = createRule({
  name: "require-provide-zoneless-change-detection",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Recommend provideZonelessChangeDetection() for Angular 18+ apps",
    },
    messages: {
      missingZoneless:
        "No zoneless change detection provider found. Add `provideZonelessChangeDetection()` (Angular 18+) to your ApplicationConfig providers for signal-based reactivity.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let hasZonelessProvider = false;
    let hasApplicationConfig = false;

    return {
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          ZONELESS_PROVIDERS.has(node.callee.name)
        ) {
          hasZonelessProvider = true;
        }
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "bootstrapApplication"
        ) {
          hasApplicationConfig = true;
        }
      },
      "Program:exit"(programNode) {
        const filename = context.filename ?? "";
        const isAppConfig =
          filename.includes("app.config") || filename.includes("main.ts");
        if (isAppConfig && hasApplicationConfig && !hasZonelessProvider) {
          context.report({
            node: programNode,
            messageId: "missingZoneless",
          });
        }
      },
    };
  },
});
