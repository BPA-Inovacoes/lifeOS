import { SlashableText } from "@/blocks/SlashableText";
import type { BlockRendererProps } from "@/blocks/types";

export function QuoteBlock({ block, editable, onChange, slash }: BlockRendererProps) {
  const text = (block.content.text as string) ?? "";

  return (
    <blockquote className="border-l-2 border-emerald-600/60 pl-4 text-muted-foreground">
      <SlashableText
        text={text}
        editable={editable}
        className="italic"
        onChange={(next) => onChange?.({ ...block.content, text: next })}
        onSlashInput={slash?.onSlashInput}
        onSlashKeyDown={slash?.onSlashKeyDown}
      />
    </blockquote>
  );
}
