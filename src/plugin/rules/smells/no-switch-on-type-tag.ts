import { createRule } from "../../utils/define-rule.js";

export const noSwitchOnTypeTag = createRule({
  name: "no-switch-on-type-tag",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Flag switch statements over a type/kind discriminant — prefer Strategy via DI or discriminated union exhaustive check (Refactoring Guru: Switch Statements smell)",
    },
    messages: {
      switchOnType:
        "`switch ({{ discriminant }})` on a type/kind property. Consider a Strategy pattern via Angular DI tokens or exhaustive discriminated union with `never` check instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      SwitchStatement(node) {
        const discriminant = node.discriminant;
        if (discriminant.type !== "MemberExpression") return;
        const prop = discriminant.property;
        if (prop.type !== "Identifier") return;
        const propName = prop.name.toLowerCase();
        if (
          propName === "type" ||
          propName === "kind" ||
          propName === "variant" ||
          propName === "category"
        ) {
          const sourceCode = context.sourceCode ?? (context as unknown as { getSourceCode(): { getText(n: unknown): string } }).getSourceCode();
          const discriminantText = sourceCode.getText
            ? sourceCode.getText(discriminant)
            : "x.type";
          context.report({
            node,
            messageId: "switchOnType",
            data: { discriminant: discriminantText },
          });
        }
      },
    };
  },
});
