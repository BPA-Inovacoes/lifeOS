import { SlashableText } from "@/blocks/SlashableText";
import type { BlockRendererProps } from "@/blocks/types";

export function TodoBlock({ block, editable, onChange, slash }: BlockRendererProps) {
  const text = (block.content.text as string) ?? "";
  const checked = Boolean(block.content.checked);

  return (
    <label className="flex items-start gap-3 py-0.5">
      <input
        type="checkbox"
        checked={checked}
        disabled={!editable}
        className="mt-1 size-4 rounded-none border-border accent-emerald-600"
        onChange={(e) =>
          onChange?.({ ...block.content, checked: e.target.checked })
        }
      />
      <SlashableText
        as="span"
        text={text}
        editable={editable}
        className={`flex-1 text-[15px] ${checked ? "text-muted-foreground line-through" : "text-foreground"}`}
        onChange={(next) => onChange?.({ ...block.content, text: next })}
        onSlashInput={slash?.onSlashInput}
        onSlashKeyDown={slash?.onSlashKeyDown}
      />
    </label>
  );
}
