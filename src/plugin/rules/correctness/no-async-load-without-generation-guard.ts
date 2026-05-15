import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/define-rule.js";

const IS_LOADING_PATTERN = /isLoading|isFetching|isPending|isRefreshing/;
const GENERATION_PATTERN = /generation|counter|requestId|loadId|version|sequence/i;

const hasInjectableDecorator = (node: TSESTree.ClassDeclaration | TSESTree.ClassExpression): boolean =>
  (node.decorators ?? []).some(
    (d) =>
      (d.expression.type === "Identifier" && d.expression.name === "Injectable") ||
      (d.expression.type === "CallExpression" &&
        d.expression.callee.type === "Identifier" &&
        d.expression.callee.name === "Injectable"),
  );

const hasIsLoadingEarlyReturn = (body: TSESTree.BlockStatement): boolean => {
  for (const stmt of body.body) {
    if (stmt.type !== "IfStatement") continue;
    const test = stmt.test;
    const isLoadingCall =
      (test.type === "CallExpression" &&
        test.callee.type === "MemberExpression" &&
        test.callee.property.type === "Identifier" &&
        IS_LOADING_PATTERN.test(test.callee.property.name)) ||
      (test.type === "MemberExpression" &&
        test.property.type === "Identifier" &&
        IS_LOADING_PATTERN.test(test.property.name));
    if (!isLoadingCall) continue;
    if (
      stmt.consequent.type === "ReturnStatement" ||
      (stmt.consequent.type === "BlockStatement" &&
        stmt.consequent.body.some((s) => s.type === "ReturnStatement"))
    ) return true;
  }
  return false;
};

const hasGenerationGuard = (sourceText: string): boolean =>
  GENERATION_PATTERN.test(sourceText);

export const noAsyncLoadWithoutGenerationGuard = createRule({
  name: "no-async-load-without-generation-guard",
  meta: {
    type: "problem",
    docs: {
      description:
        "Async load methods in Angular services that guard via `if (isLoading()) return` are vulnerable to stale-context race conditions — if the class/context changes while the load is in flight, old responses will write into the current store. Add a generation counter to discard stale results.",
    },
    messages: {
      missingGenerationGuard:
        "`{{ method }}` is async and returns early when `{{ guard }}` is true, but has no generation counter. " +
        "If the context changes while the load is in flight, the old response will overwrite the new state. " +
        "Add: `const gen = ++this.loadGeneration;` and check `if (gen !== this.loadGeneration) return;` after each await.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    if (!filename.endsWith(".service.ts")) return {};

    let inInjectable = false;

    return {
      ClassDeclaration(node) {
        if (hasInjectableDecorator(node)) inInjectable = true;
      },
      "ClassDeclaration:exit"() {
        inInjectable = false;
      },
      ClassExpression(node) {
        if (hasInjectableDecorator(node)) inInjectable = true;
      },
      "ClassExpression:exit"() {
        inInjectable = false;
      },
      MethodDefinition(node) {
        if (!inInjectable) return;
        if (!node.value.async) return;
        if (node.kind === "constructor") return;

        const body = node.value.body;
        if (!body) return;
        if (!hasIsLoadingEarlyReturn(body)) return;

        const sourceText = context.sourceCode.getText(body);
        if (hasGenerationGuard(sourceText)) return;

        const name = node.key.type === "Identifier" ? node.key.name : "method";
        const guardMatch = sourceText.match(IS_LOADING_PATTERN);
        const guard = guardMatch ? guardMatch[0] + "()" : "isLoading()";

        context.report({ node, messageId: "missingGenerationGuard", data: { method: name, guard } });
      },
    };
  },
});
