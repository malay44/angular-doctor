import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";

export const noZoneJsInZonelessApp = createRule({
  name: "no-zone-js-in-zoneless-app",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow zone.js imports in apps using provideZonelessChangeDetection()",
    },
    messages: {
      zoneImport:
        "`import 'zone.js'` detected alongside `provideZonelessChangeDetection()`. Remove zone.js from polyfills and imports — it conflicts with zoneless change detection.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let hasZonelessProvider = false;
    let zoneImportNode: unknown = null;

    return {
      ImportDeclaration(node) {
        if (node.source.value === "zone.js") {
          zoneImportNode = node;
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          (node.callee.name === "provideZonelessChangeDetection" ||
            node.callee.name === "provideExperimentalZonelessChangeDetection")
        ) {
          hasZonelessProvider = true;
        }
      },
      "Program:exit"() {
        if (hasZonelessProvider && zoneImportNode) {
          context.report({
            node: zoneImportNode as TSESTree.Node,
            messageId: "zoneImport",
          });
        }
      },
    };
  },
});
