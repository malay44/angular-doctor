import { createRule } from "../../utils/define-rule.js";
import path from "node:path";

export const noBarrelFiles = createRule({
  name: "no-barrel-files",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow index.ts barrel files that re-export siblings (defeats tree-shaking)",
    },
    messages: {
      barrelFile:
        "`index.ts` barrel file detected with {{ count }} re-export(s). Barrel files inflate bundles and defeat tree-shaking. Use direct relative imports instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    const basename = path.basename(filename);
    if (basename !== "index.ts" && basename !== "index.js") return {};

    let reExportCount = 0;

    return {
      ExportAllDeclaration() {
        reExportCount++;
      },
      ExportNamedDeclaration(node) {
        if (node.source) reExportCount++;
      },
      "Program:exit"(programNode) {
        if (reExportCount >= 2) {
          context.report({
            node: programNode,
            messageId: "barrelFile",
            data: { count: String(reExportCount) },
          });
        }
      },
    };
  },
});
