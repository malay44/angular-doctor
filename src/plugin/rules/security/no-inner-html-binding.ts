import { createRule } from "../../utils/define-rule.js";

export const noInnerHtmlBinding = createRule({
  name: "no-inner-html-binding-without-sanitizer",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow [innerHTML] binding without DomSanitizer — potential XSS vector",
    },
    messages: {
      unsafeInnerHtml:
        "`[innerHTML]` binding is an XSS risk. Either sanitize with `DomSanitizer.sanitize(SecurityContext.HTML, value)` or use text interpolation `{{ value }}` if you don't need HTML.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let hasSanitizerImport = false;

    return {
      ImportDeclaration(node) {
        if (node.source.value === "@angular/platform-browser") {
          const specs = node.specifiers;
          if (
            specs.some(
              (s) =>
                s.type === "ImportSpecifier" &&
                (s.imported as { name: string }).name === "DomSanitizer",
            )
          ) {
            hasSanitizerImport = true;
          }
        }
      },
      // Detect property assignments: element.innerHTML = ...
      AssignmentExpression(node) {
        const left = node.left;
        if (
          left.type === "MemberExpression" &&
          left.property.type === "Identifier" &&
          left.property.name === "innerHTML" &&
          !hasSanitizerImport
        ) {
          context.report({ node, messageId: "unsafeInnerHtml" });
        }
      },
    };
  },
});
