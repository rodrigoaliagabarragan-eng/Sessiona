export function cleanSingleLineText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function cleanMultilineText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
}

export function optionalText(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalized = cleanSingleLineText(value);
  return normalized.length > 0 ? normalized : null;
}

export function optionalMultilineText(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalized = cleanMultilineText(value);
  return normalized.length > 0 ? normalized : null;
}
