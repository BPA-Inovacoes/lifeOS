export type ManualBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string; id: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "blockquote"; text: string }
  | { type: "hr" };

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function isTableSeparator(line: string): boolean {
  return /^\|?[\s:-]+\|[\s|:-]+\|?$/.test(line.trim());
}

export function parseManualMarkdown(source: string): ManualBlock[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ManualBlock[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    const text = buf.join(" ").trim();
    if (text) blocks.push({ type: "p", text });
    buf.length = 0;
  };

  let paragraphBuf: string[] = [];

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(paragraphBuf);
      i += 1;
      continue;
    }

    if (trimmed === "---") {
      flushParagraph(paragraphBuf);
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph(paragraphBuf);
      blocks.push({ type: "h1", text: trimmed.slice(2).trim() });
      i += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph(paragraphBuf);
      const text = trimmed.slice(3).trim();
      blocks.push({ type: "h2", text, id: slugifyHeading(text) });
      i += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph(paragraphBuf);
      const h3Text = trimmed.slice(4).trim();
      blocks.push({ type: "h3", text: h3Text, id: slugifyHeading(h3Text) });
      i += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph(paragraphBuf);
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join(" ") });
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.includes("|")) {
      flushParagraph(paragraphBuf);
      const headers = parseTableRow(trimmed);
      i += 1;
      if (i < lines.length && isTableSeparator(lines[i])) i += 1;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph(paragraphBuf);
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph(paragraphBuf);
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    paragraphBuf.push(trimmed);
    i += 1;
  }

  flushParagraph(paragraphBuf);
  return blocks;
}

export type ManualTocEntry = {
  id: string;
  label: string;
  level: 2 | 3;
};

export function extractToc(blocks: ManualBlock[]): ManualTocEntry[] {
  const out: ManualTocEntry[] = [];
  for (const b of blocks) {
    if (b.type === "h2") out.push({ id: b.id, label: b.text, level: 2 });
    if (b.type === "h3") out.push({ id: b.id, label: b.text, level: 3 });
  }
  return out;
}
