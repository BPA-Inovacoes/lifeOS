import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  content: string;
  className?: string;
};

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function parseBullet(line: string) {
  const trimmed = line.trimStart();
  const match = trimmed.match(/^[-*]\s+(.*)$/);
  return match ? match[1] : trimmed;
}

export function CaseMessageBody({ content, className }: Props) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push(
      <ul key={key++} className="my-1.5 list-disc space-y-1 pl-4">
        {listItems.map((item, i) => (
          <li key={i} className="leading-snug">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h3 key={key++} className="mt-2 first:mt-0 text-sm font-semibold text-foreground">
          {line.slice(3)}
        </h3>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      blocks.push(
        <h4 key={key++} className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {line.slice(4)}
        </h4>
      );
      continue;
    }

    if (/^[-*]\s+/.test(line.trimStart())) {
      listItems.push(parseBullet(line));
      continue;
    }

    flushList();
    blocks.push(
      <p key={key++} className="leading-snug">
        {renderInline(line)}
      </p>
    );
  }

  flushList();

  return <div className={cn("space-y-0.5", className)}>{blocks}</div>;
}
