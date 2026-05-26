import { useMemo } from "react";

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

function ManualTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto border border-zinc-800">
      <table className="w-full min-w-[280px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/80">
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500"
              >
                <ManualInline text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-zinc-800/80 last:border-0 hover:bg-zinc-900/40"
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-zinc-300">
                  <ManualInline text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManualBlockView({ block }: { block: ManualBlock }) {
  switch (block.type) {
    case "h1":
      return (
        <h1 className="border-b border-zinc-800 pb-4 text-2xl font-semibold tracking-tight text-white">
          <ManualInline text={block.text} />
        </h1>
      );
    case "h2":
      return (
        <h2
          id={block.id}
          className="scroll-mt-24 border-l-2 border-emerald-600/80 pl-3 text-lg font-semibold text-white"
        >
          <ManualInline text={block.text} />
        </h2>
      );
    case "h3":
      return (
        <h3
          id={block.id}
          className="scroll-mt-24 font-mono text-xs uppercase tracking-wider text-emerald-600/90"
        >
          <ManualInline text={block.text} />
        </h3>
      );
    case "p":
      return (
        <p className="text-sm leading-relaxed text-zinc-400">
          <ManualInline text={block.text} />
        </p>
      );
    case "ul":
      return (
        <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-400">
          {block.items.map((item, i) => (
            <li key={i}>
              <ManualInline text={item} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-inside list-decimal space-y-1.5 text-sm text-zinc-400">
          {block.items.map((item, i) => (
            <li key={i}>
              <ManualInline text={item} />
            </li>
          ))}
        </ol>
      );
    case "table":
      return <ManualTable headers={block.headers} rows={block.rows} />;
    case "blockquote":
      return (
        <blockquote className="border-l-2 border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
          <ManualInline text={block.text} />
        </blockquote>
      );
    case "hr":
      return <hr className="border-zinc-800" />;
    default:
      return null;
  }
}

type ManualViewerProps = {
  showToc?: boolean;
  className?: string;
};

export function ManualViewer({ showToc = true, className }: ManualViewerProps) {
  const { blocks, toc } = useMemo(() => {
    const blocks = parseManualMarkdown(getManualMarkdown());
    return { blocks, toc: extractToc(blocks) };
  }, []);

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
                  className={cn(
                    "block py-1 font-mono leading-snug transition-colors hover:text-emerald-500",
                    item.level === 2
                      ? "text-[11px] text-zinc-400"
                      : "text-[10px] text-zinc-600"
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
          <ManualBlockView key={`${block.type}-${i}`} block={block} />
        ))}
      </article>
    </div>
  );
}
