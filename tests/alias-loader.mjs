import path from "node:path";
import { pathToFileURL } from "node:url";

const sourceRoot = path.resolve(process.cwd(), "src");

export async function resolve(specifier, context, defaultResolve) {
  if (specifier === "next/server") {
    return defaultResolve("next/server.js", context, defaultResolve);
  }

  if (specifier.startsWith("@/")) {
    const absolutePath = path.join(sourceRoot, `${specifier.slice(2)}.ts`);
    return defaultResolve(pathToFileURL(absolutePath).href, context, defaultResolve);
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !path.extname(specifier)
  ) {
    try {
      return defaultResolve(`${specifier}.ts`, context, defaultResolve);
    } catch {}
  }

  return defaultResolve(specifier, context, defaultResolve);
}
