import { createRule } from "../../utils/define-rule.js";
import {
  GIANT_COMPONENT_LINE_THRESHOLD,
  GIANT_CLASS_MEMBER_THRESHOLD,
} from "../../../constants.js";

export const noLargeClass = createRule({
  name: "no-large-class",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Flag Angular classes that are too large (Long Class smell from Refactoring Guru)",
    },
    messages: {
      tooManyLines:
        "Class `{{ name }}` is {{ lines }} lines long (threshold: {{ threshold }}). Split into smaller focused classes.",
      tooManyMembers:
        "Class `{{ name }}` has {{ members }} public members (threshold: {{ threshold }}). Extract responsibilities into separate services.",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxLines: { type: "number" },
          maxMembers: { type: "number" },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options = {}]) {
    const maxLines = (options as { maxLines?: number }).maxLines ?? GIANT_COMPONENT_LINE_THRESHOLD;
    const maxMembers = (options as { maxMembers?: number }).maxMembers ?? GIANT_CLASS_MEMBER_THRESHOLD;

    return {
      ClassDeclaration(node) {
        if (!node.loc) return;
        const lines = node.loc.end.line - node.loc.start.line + 1;
        const name = node.id?.name ?? "anonymous";

        if (lines > maxLines) {
          context.report({
            node,
            messageId: "tooManyLines",
            data: {
              name,
              lines: String(lines),
              threshold: String(maxLines),
            },
          });
        }

        const publicMembers = node.body.body.filter((member) => {
          const m = member as { accessibility?: string; type: string };
          return (
            (m.type === "PropertyDefinition" || m.type === "MethodDefinition") &&
            (!m.accessibility || m.accessibility === "public")
          );
        }).length;

        if (publicMembers > maxMembers) {
          context.report({
            node,
            messageId: "tooManyMembers",
            data: {
              name,
              members: String(publicMembers),
              threshold: String(maxMembers),
            },
          });
        }
      },
    };
  },
});
