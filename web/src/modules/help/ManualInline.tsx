import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

const linkClassDefault =
  "text-emerald-800 dark:text-emerald-500 underline decoration-emerald-800/60 underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-400";

type ManualInlineAccent = "emerald" | "violet" | "amber";

function linkClassFor(accent: ManualInlineAccent, override?: string) {
  if (override) return override;
  if (accent === "violet") {
    return "text-violet-900 dark:text-violet-400 underline decoration-violet-800/60 underline-offset-2 hover:text-violet-800 dark:hover:text-violet-300";
  }
  if (accent === "amber") {
    return "text-amber-900 dark:text-amber-400 underline decoration-amber-800/60 underline-offset-2 hover:text-amber-300";
  }
  return linkClassDefault;
}

function codeClassFor(accent: ManualInlineAccent) {
  if (accent === "violet") {
    return "border border-border bg-card px-1 font-mono text-sm text-violet-900/90 dark:text-violet-400/90";
  }
  if (accent === "amber") {
    return "border border-border bg-card px-1 font-mono text-sm text-amber-900/90 dark:text-amber-400/90";
  }
  return "border border-border bg-card px-1 font-mono text-sm text-emerald-600/90";
}

function renderBoldAndCode(
  text: string,
  keyPrefix: string,
  accent: ManualInlineAccent
): ReactNode[] {
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
        <strong key={`${keyPrefix}-b-${idx}`} className="font-medium text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      parts.push(
        <code
          key={`${keyPrefix}-c-${idx}`}
          className={codeClassFor(accent)}
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

function renderSegment(
  text: string,
  keyPrefix: string,
  accent: ManualInlineAccent,
  linkClass?: string
): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  const resolvedLinkClass = linkClassFor(accent, linkClass);

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(
        ...renderBoldAndCode(text.slice(last, m.index), `${keyPrefix}-t-${idx}`, accent)
      );
    }
    const label = m[1];
    const href = m[2];
    if (href.startsWith("/")) {
      parts.push(
        <Link key={`${keyPrefix}-l-${idx}`} to={href} className={resolvedLinkClass}>
          {label}
        </Link>
      );
    } else if (href.startsWith("http")) {
      parts.push(
        <a
          key={`${keyPrefix}-a-${idx}`}
          href={href}
          className={resolvedLinkClass}
          target="_blank"
          rel="noreferrer"
        >
          {label}
        </a>
      );
    } else {
      parts.push(
        <span key={`${keyPrefix}-s-${idx}`} className="text-muted-foreground">
          {label}
        </span>
      );
    }
    last = m.index + m[0].length;
    idx += 1;
  }

  if (last < text.length) {
    parts.push(...renderBoldAndCode(text.slice(last), `${keyPrefix}-end`, accent));
  }

  return parts.length ? parts : renderBoldAndCode(text, keyPrefix, accent);
}

type ManualInlineProps = {
  text: string;
  className?: string;
  as?: "span" | "p" | "li";
  accent?: ManualInlineAccent;
  linkClassName?: string;
};

export function ManualInline({
  text,
  className,
  as = "span",
  accent = "emerald",
  linkClassName,
}: ManualInlineProps) {
  const content = renderSegment(text, "inline", accent, linkClassName);
  const Tag = as;
  return <Tag className={cn(className)}>{content}</Tag>;
}
