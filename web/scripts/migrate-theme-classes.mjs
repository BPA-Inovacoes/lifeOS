/**
 * Substitui classes zinc hardcoded por tokens semânticos (light/dark via CSS vars).
 * Uso: node scripts/migrate-theme-classes.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src");

const REPLACEMENTS = [
  ["bg-zinc-950/90", "bg-background/90"],
  ["bg-zinc-950/85", "bg-background/85"],
  ["bg-zinc-950/80", "bg-background/80"],
  ["bg-zinc-950/60", "bg-background/60"],
  ["bg-zinc-950/50", "bg-background/50"],
  ["bg-zinc-950/35", "bg-background/35"],
  ["bg-zinc-950/30", "bg-background/30"],
  ["bg-zinc-950/20", "bg-background/20"],
  ["bg-zinc-950", "bg-background"],
  ["bg-zinc-900/80", "bg-secondary/80"],
  ["bg-zinc-900/50", "bg-secondary/50"],
  ["bg-zinc-900/40", "bg-secondary/40"],
  ["bg-zinc-900/30", "bg-secondary/30"],
  ["bg-zinc-900/20", "bg-secondary/20"],
  ["bg-zinc-900/10", "bg-secondary/10"],
  ["bg-zinc-900", "bg-card"],
  ["bg-zinc-800/50", "bg-muted/50"],
  ["bg-zinc-800", "bg-muted"],
  ["border-zinc-800", "border-border"],
  ["border-zinc-700", "border-border"],
  ["border-zinc-600", "border-border"],
  ["text-zinc-100", "text-foreground"],
  ["text-zinc-200", "text-foreground"],
  ["text-zinc-300", "text-foreground/90"],
  ["text-zinc-400", "text-muted-foreground"],
  ["text-zinc-500", "text-muted-foreground"],
  ["text-zinc-600", "text-muted-foreground/80"],
  ["hover:bg-zinc-900/80", "hover:bg-secondary/80"],
  ["hover:bg-zinc-900", "hover:bg-secondary"],
  ["hover:bg-zinc-800", "hover:bg-muted"],
  ["hover:text-zinc-300", "hover:text-foreground"],
  ["hover:text-zinc-200", "hover:text-foreground"],
  ["hover:border-zinc-700", "hover:border-border"],
  ["hover:border-zinc-600", "hover:border-border"],
];

const SKIP_DIRS = new Set(["node_modules"]);
const SKIP_FILES = new Set([
  path.normalize("styles/designTokens.ts"),
  path.normalize("modules/game/styles/gameTokens.ts"),
  path.normalize("modules/finance/styles/financeTokens.ts"),
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function migrate(content) {
  let out = content;
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (SKIP_FILES.has(rel)) continue;

  const before = fs.readFileSync(file, "utf8");
  const after = migrate(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    console.log(rel);
  }
}

console.log(`\n${changed} ficheiros actualizados.`);
