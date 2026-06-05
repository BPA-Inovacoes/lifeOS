import { SlashableText } from "@/blocks/SlashableText";
import type { BlockRendererProps } from "@/blocks/types";

export function CalloutBlock({ block, editable, onChange, slash }: BlockRendererProps) {
  const text = (block.content.text as string) ?? "";

  return (
    <div className="rounded-none border border-border border-l-2 border-l-emerald-600 bg-secondary/80 px-4 py-3 text-sm text-foreground">
      <SlashableText
        text={text}
        editable={editable}
        onChange={(next) => onChange?.({ ...block.content, text: next })}
        onSlashInput={slash?.onSlashInput}
        onSlashKeyDown={slash?.onSlashKeyDown}
      />
    </div>
  );
}
