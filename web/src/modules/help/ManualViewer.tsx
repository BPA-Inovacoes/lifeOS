import { useEffect, useMemo, useState } from "react";

import { ManualInline } from "@/modules/help/ManualInline";
import { getManualMarkdown } from "@/modules/help/manualSource";
import {
  extractToc,
  parseManualMarkdown,
  type ManualBlock,
} from "@/modules/help/parseManual";
import { cn } from "@/lib/utils";
import {
  lifeosScrollbarThinClass,
  sectionLabelMutedClass,
  techCardClass,
} from "@/styles/designTokens";

type ManualAccent = "emerald" | "violet" | "amber";

const accentStyles: Record<
  ManualAccent,
  { h2Border: string; h3Text: string; tocHover: string; tocActive: string }
> = {
  emerald: {
    h2Border: "border-emerald-600/80",
    h3Text: "text-emerald-600/90",
    tocHover: "hover:text-emerald-500",
    tocActive:
      "border-emerald-600/90 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  violet: {
    h2Border: "border-violet-600/80",
    h3Text: "text-violet-500/90",
    tocHover: "hover:text-violet-400",
    tocActive:
      "border-violet-600/90 bg-violet-500/10 text-violet-800 dark:text-violet-300",
  },
  amber: {
    h2Border: "border-amber-600/80",
    h3Text: "text-amber-500/90",
    tocHover: "hover:text-amber-900 dark:hover:text-amber-400",
    tocActive:
      "border-amber-600/90 bg-amber-500/10 text-amber-950 dark:text-amber-300",
  },
};

type ManualViewerProps = {
  showToc?: boolean;
  className?: string;
  getMarkdown?: () => string;
  accent?: ManualAccent;
  linkClassName?: string;
};

function ManualTable({
  headers,
  rows,
  accent,
  linkClassName,
}: {
  headers: string[];
  rows: string[][];
  accent: ManualAccent;
  linkClassName?: string;
}) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[280px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/80">
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                <ManualInline text={h} accent={accent} linkClassName={linkClassName} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-border/80 last:border-0 hover:bg-secondary/40"
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-foreground">
                  <ManualInline text={cell} accent={accent} linkClassName={linkClassName} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManualBlockView({
  block,
  accent,
  linkClassName,
}: {
  block: ManualBlock;
  accent: ManualAccent;
  linkClassName?: string;
}) {
  const styles = accentStyles[accent];
  const inlineProps = { accent, linkClassName };

  switch (block.type) {
    case "h1":
      return (
        <h1 className="border-b border-border pb-4 text-2xl font-semibold tracking-tight text-foreground">
          <ManualInline text={block.text} {...inlineProps} />
        </h1>
      );
    case "h2":
      return (
        <h2
          id={block.id}
          className={cn(
            "scroll-mt-24 border-l-2 pl-3 text-lg font-semibold text-foreground",
            styles.h2Border
          )}
        >
          <ManualInline text={block.text} {...inlineProps} />
        </h2>
      );
    case "h3":
      return (
        <h3
          id={block.id}
          className={cn(
            "scroll-mt-24 font-mono text-xs uppercase tracking-wider",
            styles.h3Text
          )}
        >
          <ManualInline text={block.text} {...inlineProps} />
        </h3>
      );
    case "p":
      return (
        <p className="text-sm leading-relaxed text-muted-foreground">
          <ManualInline text={block.text} {...inlineProps} />
        </p>
      );
    case "ul":
      return (
        <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
          {block.items.map((item, i) => (
            <li key={i}>
              <ManualInline text={item} {...inlineProps} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-inside list-decimal space-y-1.5 text-sm text-muted-foreground">
          {block.items.map((item, i) => (
            <li key={i}>
              <ManualInline text={item} {...inlineProps} />
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <ManualTable
          headers={block.headers}
          rows={block.rows}
          accent={accent}
          linkClassName={linkClassName}
        />
      );
    case "blockquote":
      return (
        <blockquote className="border-l-2 border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
          <ManualInline text={block.text} {...inlineProps} />
        </blockquote>
      );
    case "hr":
      return <hr className="border-border" />;
    default:
      return null;
  }
}

export function ManualViewer({
  showToc = true,
  className,
  getMarkdown = getManualMarkdown,
  accent = "emerald",
  linkClassName,
}: ManualViewerProps) {
  const styles = accentStyles[accent];

  const { blocks, toc } = useMemo(() => {
    const blocks = parseManualMarkdown(getMarkdown());
    return { blocks, toc: extractToc(blocks) };
  }, [getMarkdown]);

  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.location.hash.replace(/^#/, "") || null;
  });

  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      setActiveId(id || null);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={cn(
        "grid gap-8",
        showToc && "lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] lg:gap-12",
        className
      )}
    >
      {showToc && toc.length > 0 ? (
        <nav
          className={cn(
            techCardClass,
            "top-24 h-fit shrink-0 p-4 lg:sticky lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto",
            lifeosScrollbarThinClass
          )}
          aria-label="Índice do manual"
        >
          <p className={sectionLabelMutedClass}>// índice</p>
          <ul className="mt-3 space-y-0.5">
            {toc.map((item) => (
              <li
                key={item.id}
                className={item.level === 3 ? "pl-3" : undefined}
              >
                <a
                  href={`#${item.id}`}
                  aria-current={activeId === item.id ? "location" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={cn(
                    "block rounded-r border-l-2 py-1 pl-2 font-mono text-sm leading-snug transition-colors",
                    activeId === item.id
                      ? styles.tocActive
                      : cn("border-transparent text-muted-foreground", styles.tocHover)
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <article className="min-w-0 space-y-5">
        {blocks.map((block, i) => (
          <ManualBlockView
            key={`${block.type}-${i}`}
            block={block}
            accent={accent}
            linkClassName={linkClassName}
          />
        ))}
      </article>
    </div>
  );
}
