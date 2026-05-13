import { createRule } from "../../utils/define-rule.js";

export const noDirectStoreInFeatureComponent = createRule({
  name: "no-direct-store-in-feature-component",
  meta: {
    type: "suggestion",
    docs: { description: "Feature components should access store/state through a facade service, not directly" },
    messages: {
      directStore: "Feature component imports `{{ source }}` directly. Access store/state through a facade service (`*-facade.service.ts`) to encapsulate state management.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? "";
    // Only apply in feature components
    const isFeatureComponent =
      filename.includes("/features/") && filename.endsWith(".component.ts");
    if (!isFeatureComponent) return {};

    return {
      ImportDeclaration(node) {
        const source = node.source.value as string;
        // Flag if importing from a store/state path without going through a facade
        const isStoreImport = /[Ss]tore|[Ss]tate/.test(source);
        const isFacade = /facade/i.test(source);

        if (isStoreImport && !isFacade) {
          context.report({
            node,
            messageId: "directStore",
            data: { source },
          });
        }
      },
    };
  },
});
