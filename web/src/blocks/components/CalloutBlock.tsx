import { SlashableText } from "@/blocks/SlashableText";
import type { BlockRendererProps } from "@/blocks/types";

export function CalloutBlock({ block, editable, onChange, slash }: BlockRendererProps) {
  const text = (block.content.text as string) ?? "";

  return (
    <div className="rounded-none border border-zinc-800 border-l-2 border-l-emerald-600 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-200">
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
