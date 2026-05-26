export const BLOCK_TYPES = [
  "PARAGRAPH",
  "HEADING_1",
  "HEADING_2",
  "HEADING_3",
  "CHECKLIST",
  "TODO",
  "QUOTE",
  "CALLOUT",
  "CODE",
  "IMAGE",
  "DIVIDER",
  "TOGGLE",
  "DATABASE_EMBED",
  "KANBAN_EMBED",
  "CALENDAR_EMBED",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export type BlockContent = {
  text?: string;
  checked?: boolean;
  language?: string;
  url?: string;
  items?: { id: string; text: string; checked: boolean }[];
  [key: string]: unknown;
};

export type BlockDto = {
  id: string;
  pageId: string;
  parentId: string | null;
  type: BlockType;
  content: BlockContent;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
