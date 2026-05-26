import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

const linkClass =
  "text-emerald-500 underline decoration-emerald-800/60 underline-offset-2 hover:text-emerald-400";

function renderBoldAndCode(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(text.slice(last, m.index));
    }
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={`${keyPrefix}-b-${idx}`} className="font-medium text-zinc-200">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      parts.push(
        <code
          key={`${keyPrefix}-c-${idx}`}
          className="border border-zinc-800 bg-zinc-900 px-1 font-mono text-[11px] text-emerald-600/90"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    last = m.index + token.length;
    idx += 1;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

function renderSegment(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(
        ...renderBoldAndCode(text.slice(last, m.index), `${keyPrefix}-t-${idx}`)
      );
    }
    const label = m[1];
    const href = m[2];
    if (href.startsWith("/")) {
      parts.push(
        <Link key={`${keyPrefix}-l-${idx}`} to={href} className={linkClass}>
          {label}
        </Link>
      );
    } else if (href.startsWith("http")) {
      parts.push(
        <a
          key={`${keyPrefix}-a-${idx}`}
          href={href}
          className={linkClass}
          target="_blank"
          rel="noreferrer"
        >
          {label}
        </a>
      );
    } else {
      parts.push(
        <span key={`${keyPrefix}-s-${idx}`} className="text-zinc-400">
          {label}
        </span>
      );
    }
    last = m.index + m[0].length;
    idx += 1;
  }

  if (last < text.length) {
    parts.push(...renderBoldAndCode(text.slice(last), `${keyPrefix}-end`));
  }

  return parts.length ? parts : renderBoldAndCode(text, keyPrefix);
}

type ManualInlineProps = {
  text: string;
  className?: string;
  as?: "span" | "p" | "li";
};

export function ManualInline({ text, className, as = "span" }: ManualInlineProps) {
  const content = renderSegment(text, "inline");
  const Tag = as;
  return <Tag className={cn(className)}>{content}</Tag>;
}
