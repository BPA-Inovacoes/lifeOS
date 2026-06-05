import { SlashableText } from "@/blocks/SlashableText";
import type { BlockRendererProps } from "@/blocks/types";
import { cn } from "@/lib/utils";

export function ParagraphBlock({ block, editable, onChange, slash }: BlockRendererProps) {
  const text = (block.content.text as string) ?? "";

  return (
    <SlashableText
      text={text}
      editable={editable}
      className={cn(
        "min-h-[1.5rem] text-[15px] leading-relaxed",
        editable &&
          "empty:before:font-mono empty:before:text-xs empty:before:text-muted-foreground empty:before:content-['Escreve_ou_pressiona_/_para_comandos…']"
      )}
      onChange={(next) => onChange?.({ ...block.content, text: next })}
      onSlashInput={slash?.onSlashInput}
      onSlashKeyDown={slash?.onSlashKeyDown}
    />
  );
}
