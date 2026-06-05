/**
 * Melhora contraste de texto no modo claro — cores escuras + variantes dark:
 * Uso: node scripts/fix-light-text.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src");

const SIMPLE = [
  ["text-muted-foreground/80", "text-muted-foreground"],
  ["text-muted-foreground/70", "text-muted-foreground"],
  ["text-foreground/80", "text-muted-foreground"],
  ["text-foreground/90", "text-foreground"],
];

/** Só substitui se não for sufixo de dark: ou hover: etc. */
const REGEX_REPLACEMENTS = [
  [/text-amber-400\/90/g, "text-amber-900/90 dark:text-amber-400/90"],
  [/text-amber-400\/80/g, "text-amber-900/90 dark:text-amber-400/80"],
  [/text-amber-400/g, "text-amber-900 dark:text-amber-400"],
  [/text-amber-300/g, "text-amber-950 dark:text-amber-300"],
  [/text-violet-400\/90/g, "text-violet-900/90 dark:text-violet-400/90"],
  [/text-violet-400/g, "text-violet-900 dark:text-violet-400"],
  [/text-violet-300/g, "text-violet-950 dark:text-violet-300"],
  [/text-emerald-400\/90/g, "text-emerald-800/90 dark:text-emerald-400/90"],
  [/text-emerald-400/g, "text-emerald-800 dark:text-emerald-400"],
  [/text-emerald-500\/90/g, "text-emerald-800/90 dark:text-emerald-500/90"],
  [/(?<![\w-])text-emerald-500/g, "text-emerald-800 dark:text-emerald-500"],
  [/text-red-400/g, "text-red-700 dark:text-red-400"],
  [/hover:text-emerald-400/g, "hover:text-emerald-700 dark:hover:text-emerald-400"],
  [/hover:text-violet-300/g, "hover:text-violet-800 dark:hover:text-violet-300"],
  [/hover:text-amber-400/g, "hover:text-amber-900 dark:hover:text-amber-400"],
];

const SKIP = new Set([
  "styles/designTokens.ts",
  "components/toastThemes.ts",
  "components/AppBrand.tsx",
  "components/ui/date-picker-popover.tsx",
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function migrate(content) {
  let out = content;
  for (const [from, to] of SIMPLE) out = out.split(from).join(to);
  for (const [re, to] of REGEX_REPLACEMENTS) {
    out = out.replace(re, (match, offset, str) => {
      const before = str.slice(Math.max(0, offset - 6), offset);
      if (before.endsWith("dark:") || before.endsWith("hover:") || before.endsWith("group-")) {
        return match;
      }
      return to;
    });
  }
  // Corrigir duplicações acidentais dark:dark:
  out = out.replace(/dark:dark:/g, "dark:");
  out = out.replace(/dark:text-amber-900 dark:text-amber-400/g, "text-amber-900 dark:text-amber-400");
  out = out.replace(/dark:text-violet-900 dark:text-violet-400/g, "text-violet-900 dark:text-violet-400");
  out = out.replace(/dark:text-emerald-800 dark:text-emerald-/g, "text-emerald-800 dark:text-emerald-");
  return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (SKIP.has(rel)) continue;
  const before = fs.readFileSync(file, "utf8");
  const after = migrate(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
  }
}
console.log(`${changed} ficheiros actualizados.`);
