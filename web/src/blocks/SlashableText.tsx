import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

type SlashableTextProps = {
  text: string;
  className?: string;
  placeholder?: string;
  editable?: boolean;
  onChange?: (text: string) => void;
  onSlashInput?: (text: string) => void;
  onSlashKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  as?: "div" | "span";
};

export function SlashableText({
  text,
  className,
  placeholder,
  editable,
  onChange,
  onSlashInput,
  onSlashKeyDown,
  as: Tag = "div",
}: SlashableTextProps) {
  if (!editable) {
    return (
      <Tag className={className}>
        {text || <span className="text-muted-foreground">Vazio</span>}
      </Tag>
    );
  }

  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      className={cn(className, "outline-none")}
      data-placeholder={placeholder}
      onInput={(e) => {
        const next = e.currentTarget.textContent ?? "";
        onSlashInput?.(next);
      }}
      onKeyDown={onSlashKeyDown}
      onBlur={(e) => onChange?.(e.currentTarget.textContent ?? "")}
    >
      {text}
    </Tag>
  );
}
