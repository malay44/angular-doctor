import { ESLintUtils } from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/malay44/angular-doctor/blob/main/references/RULES.md#${name}`,
);
