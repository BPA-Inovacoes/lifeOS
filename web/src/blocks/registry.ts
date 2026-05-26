import type { ComponentType } from "react";

import { CalloutBlock } from "@/blocks/components/CalloutBlock";
import { DividerBlock } from "@/blocks/components/DividerBlock";
import { HeadingBlock } from "@/blocks/components/HeadingBlock";
import { ParagraphBlock } from "@/blocks/components/ParagraphBlock";
import { QuoteBlock } from "@/blocks/components/QuoteBlock";
import { TodoBlock } from "@/blocks/components/TodoBlock";
import type { BlockType } from "@/types/block";
import type { BlockRendererProps } from "@/blocks/types";

type BlockEntry = {
  label: string;
  component: ComponentType<BlockRendererProps>;
};

export const blockRegistry: Record<BlockType, BlockEntry> = {
  PARAGRAPH: { label: "Texto", component: ParagraphBlock },
  HEADING_1: { label: "Título 1", component: HeadingBlock },
  HEADING_2: { label: "Título 2", component: HeadingBlock },
  HEADING_3: { label: "Título 3", component: HeadingBlock },
  TODO: { label: "Tarefa", component: TodoBlock },
  CHECKLIST: { label: "Lista", component: TodoBlock },
  QUOTE: { label: "Citação", component: QuoteBlock },
  CALLOUT: { label: "Destaque", component: CalloutBlock },
  CODE: { label: "Código", component: ParagraphBlock },
  IMAGE: { label: "Imagem", component: ParagraphBlock },
  DIVIDER: { label: "Divisor", component: DividerBlock },
  TOGGLE: { label: "Toggle", component: ParagraphBlock },
  DATABASE_EMBED: { label: "Base de dados", component: CalloutBlock },
  KANBAN_EMBED: { label: "Kanban", component: CalloutBlock },
  CALENDAR_EMBED: { label: "Calendário", component: CalloutBlock },
};

export function getBlockComponent(type: BlockType) {
  return blockRegistry[type]?.component ?? blockRegistry.PARAGRAPH.component;
}
