import type { KeyboardEvent } from "react";

import type { BlockContent, BlockDto } from "@/types/block";

export type BlockSlashProps = {
  onSlashInput?: (text: string) => void;
  onSlashKeyDown?: (e: KeyboardEvent<HTMLDivElement | HTMLSpanElement>) => void;
};

export type BlockRendererProps = {
  block: BlockDto;
  editable?: boolean;
  onChange?: (content: BlockContent) => void;
  slash?: BlockSlashProps;
};
