import { createRule } from "../../utils/define-rule.js";
import type { TSESTree } from "@typescript-eslint/utils";

export const preferInjectFn = createRule({
  name: "prefer-inject-fn",
  meta: {
    type: "suggestion",
    docs: { description: "Prefer inject() over constructor DI — Angular 14+ best practice for cleaner class initialization" },
    messages: {
      useInjectFn: "Constructor injection of `{{ name }}` — prefer `private {{ name }} = inject({{ type }})` as a class field instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    const isAngularClass = [".component.ts", ".service.ts", ".directive.ts", ".guard.ts", ".pipe.ts"]
      .some((s) => filename.endsWith(s));
    if (!isAngularClass) return {};

    return {
      TSParameterProperty(node: TSESTree.TSParameterProperty) {
        // Must be in a constructor
        const parent = node.parent; // FunctionExpression (constructor body)
        if (!parent || parent.type !== "FunctionExpression") return;
        const grandParent = parent.parent; // MethodDefinition
        if (!grandParent || grandParent.type !== "MethodDefinition") return;
        if (grandParent.kind !== "constructor") return;

        const param = node.parameter;
        const name = param.type === "Identifier" ? param.name :
                     param.type === "AssignmentPattern" && param.left.type === "Identifier" ? param.left.name :
                     "param";

        // Extract type annotation for the message
        const typeAnnotation = param.type === "Identifier" && param.typeAnnotation
          ? param.typeAnnotation.typeAnnotation
          : null;
        const typeName = typeAnnotation?.type === "TSTypeReference" && typeAnnotation.typeName.type === "Identifier"
          ? typeAnnotation.typeName.name
          : "Service";

        context.report({
          node,
          messageId: "useInjectFn",
          data: { name, type: typeName },
        });
      },
    };
  },
});
