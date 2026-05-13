import { createRule } from "../../utils/define-rule.js";
import type { TSESTree } from "@typescript-eslint/utils";

const HTTP_METHODS = new Set(["get", "post", "put", "delete", "patch", "head", "request"]);

const hasCatchError = (pipeCall: TSESTree.CallExpression): boolean => {
  for (const arg of pipeCall.arguments) {
    if (
      (arg.type === "Identifier" && arg.name === "catchError") ||
      (arg.type === "CallExpression" &&
        arg.callee.type === "Identifier" &&
        arg.callee.name === "catchError") ||
      (arg.type === "CallExpression" &&
        arg.callee.type === "MemberExpression" &&
        arg.callee.property.type === "Identifier" &&
        arg.callee.property.name === "catchError")
    ) {
      return true;
    }
  }
  return false;
};

const findPipeInChain = (node: TSESTree.Node): TSESTree.CallExpression | null => {
  let current: TSESTree.Node = node;
  while (current.parent) {
    const p = current.parent;
    if (
      p.type === "CallExpression" &&
      p.callee.type === "MemberExpression" &&
      p.callee.property.type === "Identifier" &&
      p.callee.property.name === "pipe" &&
      p.callee.object === current
    ) {
      return p;
    }
    if (
      p.type === "ExpressionStatement" ||
      p.type === "VariableDeclarator" ||
      p.type === "ReturnStatement" ||
      p.type === "AssignmentExpression"
    ) {
      break;
    }
    current = p;
  }
  return null;
};

export const noHttpCallWithoutCatchError = createRule({
  name: "no-http-call-without-catch-error",
  meta: {
    type: "suggestion",
    docs: { description: "HTTP observables in services should include catchError() to handle failures gracefully" },
    messages: {
      missingCatchError: "HTTP `{{ method }}()` call is not followed by `.pipe(catchError(...))`. Unhandled HTTP errors will propagate and may crash the application.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    if (!filename.endsWith(".service.ts")) return {};

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== "MemberExpression") return;
        if (callee.property.type !== "Identifier") return;
        if (!HTTP_METHODS.has(callee.property.name)) return;

        const obj = callee.object;
        let objName = "";
        if (obj.type === "Identifier") objName = obj.name;
        else if (
          obj.type === "MemberExpression" &&
          obj.property.type === "Identifier"
        ) {
          objName = obj.property.name;
          if (obj.object.type === "ThisExpression") {
            objName = obj.property.name;
          }
        }
        if (!/http/i.test(objName) && !(obj.type === "MemberExpression" && obj.object.type === "ThisExpression" && /http/i.test((obj.property as TSESTree.Identifier).name ?? ""))) {
          if (obj.type !== "MemberExpression" || !/http/i.test(objName)) return;
        }

        const pipeCall = findPipeInChain(node);
        if (!pipeCall || !hasCatchError(pipeCall)) {
          context.report({
            node,
            messageId: "missingCatchError",
            data: { method: callee.property.name },
          });
        }
      },
    };
  },
});
