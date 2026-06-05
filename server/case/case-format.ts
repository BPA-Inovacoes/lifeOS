/** Helpers para respostas Case em Markdown (renderizado na UI). */

export function caseHeading(title: string, level: 2 | 3 = 2): string {
  return `${"#".repeat(level)} ${title}`;
}

export function caseBullet(label: string, value: string): string {
  return `- **${label}:** ${value}`;
}

export function caseSection(title: string, bullets: string[], level: 2 | 3 = 3): string {
  if (!bullets.length) return "";
  return [caseHeading(title, level), "", ...bullets, ""].join("\n");
}

export function caseParagraph(text: string): string {
  return `${text}\n`;
}
