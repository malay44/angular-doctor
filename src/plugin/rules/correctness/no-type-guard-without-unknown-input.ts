import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";

const isUnknownOrAny = (typeAnnotation: TSESTree.TSTypeAnnotation | undefined): boolean => {
  if (!typeAnnotation) return false;
  const t = typeAnnotation.typeAnnotation;
  return t.type === "TSUnknownKeyword" || t.type === "TSAnyKeyword";
};

const hasTypePredicateReturn = (
  returnType: TSESTree.TSTypeAnnotation | undefined,
): boolean => {
  if (!returnType) return false;
  return returnType.typeAnnotation.type === "TSTypePredicate";
};

export const noTypeGuardWithoutUnknownInput = createRule({
  name: "no-type-guard-without-unknown-input",
  meta: {
    type: "problem",
    docs: {
      description:
        "Type guard functions must accept `unknown` as their input type — accepting a typed value defeats the purpose of runtime validation and silently skips the check when the wrong shape is passed",
    },
    messages: {
      useUnknown:
        "`{{ name }}` is a type guard (returns `{{ predicate }}`) but its first parameter is typed as `{{ paramType }}` instead of `unknown`. " +
        "Change the parameter type to `unknown` so the guard actually validates at runtime.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const checkFunction = (
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression
        | TSESTree.ArrowFunctionExpression,
      name: string | null,
    ) => {
      if (!hasTypePredicateReturn(node.returnType)) return;
      if (node.params.length === 0) return;

      const firstParam = node.params[0];
      const paramTypeAnnotation =
        firstParam.type === "Identifier" || firstParam.type === "AssignmentPattern"
          ? (firstParam as TSESTree.Identifier).typeAnnotation
          : undefined;

      if (isUnknownOrAny(paramTypeAnnotation)) return;

      const paramType = paramTypeAnnotation
        ? context.sourceCode.getText(paramTypeAnnotation.typeAnnotation)
        : "typed";

      const predicate = context.sourceCode.getText(
        (node.returnType as TSESTree.TSTypeAnnotation).typeAnnotation,
      );

      context.report({
        node,
        messageId: "useUnknown",
        data: {
          name: name ?? "anonymous",
          predicate,
          paramType,
        },
      });
    };

    return {
      FunctionDeclaration(node) {
        checkFunction(node, node.id?.name ?? null);
      },
      "VariableDeclarator > ArrowFunctionExpression"(node: TSESTree.ArrowFunctionExpression) {
        const parent = node.parent as TSESTree.VariableDeclarator;
        const name = parent.id.type === "Identifier" ? parent.id.name : null;
        checkFunction(node, name);
      },
      "MethodDefinition > FunctionExpression"(node: TSESTree.FunctionExpression) {
        const parent = node.parent as TSESTree.MethodDefinition;
        const name = parent.key.type === "Identifier" ? parent.key.name : null;
        checkFunction(node, name);
      },
    };
  },
});
