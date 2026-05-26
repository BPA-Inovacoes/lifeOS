import { SlashableText } from "@/blocks/SlashableText";
import type { BlockRendererProps } from "@/blocks/types";

const styles: Record<string, string> = {
  HEADING_1: "text-3xl font-semibold tracking-tight",
  HEADING_2: "text-2xl font-semibold tracking-tight",
  HEADING_3: "text-xl font-medium",
};

export function HeadingBlock({ block, editable, onChange, slash }: BlockRendererProps) {
  const text = (block.content.text as string) ?? "";
  const className = styles[block.type] ?? styles.HEADING_1;

  return (
    <SlashableText
      text={text}
      editable={editable}
      className={className}
      onChange={(next) => onChange?.({ ...block.content, text: next })}
      onSlashInput={slash?.onSlashInput}
      onSlashKeyDown={slash?.onSlashKeyDown}
    />
  );
}
