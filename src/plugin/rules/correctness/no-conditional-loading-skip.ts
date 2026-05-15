import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";

const LOADING_SETTER_PATTERN = /setIsLoading|setLoading|setIsPending|setPending|setIsFetching/;

const isFalseInit = (node: TSESTree.VariableDeclarator): boolean =>
  node.init !== null &&
  node.init !== undefined &&
  node.init.type === "Literal" &&
  node.init.value === false;

const collectFalseFlags = (body: TSESTree.Statement[]): Set<string> => {
  const flags = new Set<string>();
  for (const stmt of body) {
    if (
      stmt.type === "VariableDeclaration" &&
      stmt.declarations.some(
        (d) => d.id.type === "Identifier" && isFalseInit(d),
      )
    ) {
      for (const d of stmt.declarations) {
        if (d.id.type === "Identifier" && isFalseInit(d)) {
          flags.add(d.id.name);
        }
      }
    }
  }
  return flags;
};

const hasConditionalLoadingSkip = (
  finallyBody: TSESTree.BlockStatement,
  falseFlags: Set<string>,
): TSESTree.IfStatement | null => {
  for (const stmt of finallyBody.body) {
    if (stmt.type !== "IfStatement") continue;
    const test = stmt.test;
    if (
      test.type === "UnaryExpression" &&
      test.operator === "!" &&
      test.argument.type === "Identifier" &&
      falseFlags.has(test.argument.name)
    ) {
      const hasLoadingCall = JSON.stringify(stmt.consequent).match(LOADING_SETTER_PATTERN);
      if (hasLoadingCall) return stmt;
    }
  }
  return null;
};

export const noConditionalLoadingSkip = createRule({
  name: "no-conditional-loading-skip",
  meta: {
    type: "problem",
    docs: {
      description:
        "Avoid conditionally skipping `setIsLoading(false)` in a `finally` block — a flag-guarded finally can leave the component in a permanent loading state when an error path sets the flag to `true`",
    },
    messages: {
      conditionalSkip:
        "`setIsLoading(false)` (or equivalent) is guarded by `if (!{{ flag }})` in a `finally` block. " +
        "If `{{ flag }}` is set to `true` in the `catch` block, loading state will never be cleared. " +
        "Move cleanup to an unconditional `finally` and express the error state separately (e.g. `store.setError(...)`).",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TryStatement(node) {
        if (!node.finalizer) return;

        const fnBody = (() => {
          let parent: TSESTree.Node | undefined = node.parent;
          while (parent) {
            if (
              parent.type === "FunctionDeclaration" ||
              parent.type === "FunctionExpression" ||
              parent.type === "ArrowFunctionExpression"
            ) {
              return parent.body?.type === "BlockStatement" ? parent.body.body : undefined;
            }
            parent = parent.parent;
          }
          return undefined;
        })();

        if (!fnBody) return;
        const falseFlags = collectFalseFlags(fnBody);
        if (falseFlags.size === 0) return;

        const offender = hasConditionalLoadingSkip(node.finalizer, falseFlags);
        if (!offender) return;

        const test = offender.test as TSESTree.UnaryExpression;
        const flagName = (test.argument as TSESTree.Identifier).name;
        context.report({ node: offender, messageId: "conditionalSkip", data: { flag: flagName } });
      },
    };
  },
});
