/** Tag for code samples: strips the first/last blank line so code can be written flush-left. */
export const pas = (s: TemplateStringsArray, ...vals: unknown[]) =>
  String.raw({ raw: s.raw }, ...vals)
    .replace(/^\n/, '')
    .replace(/\n\s*$/, '');
