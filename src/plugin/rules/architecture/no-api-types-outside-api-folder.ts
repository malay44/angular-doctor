import { createRule } from "../../utils/define-rule.js";

const API_TYPE_PATTERN = /^[A-Z]\w*(ApiResponse|ApiRequest|Row|Dto|Wire|Envelope)(\w*)?$/;

export const noApiTypesOutsideApiFolder = createRule({
  name: "no-api-types-outside-api-folder",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "API wire types (names ending in ApiResponse, ApiRequest, Row, Dto, Wire, Envelope) should live in an `api/` subfolder — mixing wire shapes with domain models makes the contract boundary invisible and blocks independent versioning",
    },
    messages: {
      moveToApiFolder:
        "`{{ name }}` looks like a wire/API type but is declared outside an `api/` folder. " +
        "Move it to `<feature>/api/<feature>-api.types.ts` and keep `<feature>.models.ts` for domain/view types only.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const filename = context.filename ?? "";
    if (filename.includes("/api/") || filename.includes("\\api\\")) return {};
    if (!filename.endsWith(".ts")) return {};
    if (filename.endsWith(".spec.ts") || filename.endsWith(".test.ts")) return {};

    const checkName = (name: string, node: Parameters<typeof context.report>[0]["node"]) => {
      if (API_TYPE_PATTERN.test(name)) {
        context.report({ node, messageId: "moveToApiFolder", data: { name } });
      }
    };

    return {
      TSInterfaceDeclaration(node) {
        checkName(node.id.name, node);
      },
      TSTypeAliasDeclaration(node) {
        checkName(node.id.name, node);
      },
    };
  },
});
