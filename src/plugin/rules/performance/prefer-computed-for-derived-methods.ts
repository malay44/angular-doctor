import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";

const hasComponentDecorator = (node: TSESTree.ClassDeclaration | TSESTree.ClassExpression): boolean =>
  (node.decorators ?? []).some(
    (d) =>
      (d.expression.type === "Identifier" && d.expression.name === "Component") ||
      (d.expression.type === "CallExpression" &&
        d.expression.callee.type === "Identifier" &&
        d.expression.callee.name === "Component"),
  );

const isVoidLike = (typeAnnotation: TSESTree.TSTypeAnnotation | undefined): boolean => {
  if (!typeAnnotation) return true;
  const t = typeAnnotation.typeAnnotation;
  if (t.type === "TSVoidKeyword" || t.type === "TSUndefinedKeyword") return true;
  if (t.type === "TSTypeReference") {
    const name =
      t.typeName.type === "Identifier" ? t.typeName.name :
      t.typeName.type === "TSQualifiedName" ? t.typeName.right.name : "";
    if (name === "void" || name === "Promise") return true;
  }
  return false;
};

const containsSignalCall = (node: TSESTree.Node): boolean => {
  if (
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    node.callee.object.type === "MemberExpression" &&
    node.callee.object.object.type === "ThisExpression"
  ) return true;
  if (
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    node.callee.object.type === "ThisExpression"
  ) return true;
  if ("arguments" in node) {
    return (node as TSESTree.CallExpression).arguments.some(containsSignalCall);
  }
  return false;
};

export const preferComputedForDerivedMethods = createRule({
  name: "prefer-computed-for-derived-methods",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Component methods that return signal-derived values should be `computed()` properties to avoid re-allocating on every render cycle",
    },
    messages: {
      useComputed:
        "`{{ method }}()` returns a derived value from signal reads but is a plain method — it re-runs every template change detection cycle. Convert to `readonly {{ method }} = computed(() => ...)`.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    if (!filename.endsWith(".component.ts") && !filename.endsWith(".directive.ts")) return {};

    let inComponent = false;

    return {
      ClassDeclaration(node) {
        if (hasComponentDecorator(node)) inComponent = true;
      },
      "ClassDeclaration:exit"() {
        inComponent = false;
      },
      ClassExpression(node) {
        if (hasComponentDecorator(node)) inComponent = true;
      },
      "ClassExpression:exit"() {
        inComponent = false;
      },
      MethodDefinition(node) {
        if (!inComponent) return;
        if (node.kind !== "method") return;
        if (node.static) return;
        if (node.value.params.length !== 0) return;
        if (isVoidLike(node.value.returnType)) return;

        const body = node.value.body;
        if (!body || body.body.length !== 1) return;
        const stmt = body.body[0];
        if (stmt.type !== "ReturnStatement" || !stmt.argument) return;

        if (!containsSignalCall(stmt.argument)) return;

        const name =
          node.key.type === "Identifier" ? node.key.name :
          node.key.type === "Literal" ? String(node.key.value) : null;
        if (!name) return;

        context.report({ node, messageId: "useComputed", data: { method: name } });
      },
    };
  },
});
