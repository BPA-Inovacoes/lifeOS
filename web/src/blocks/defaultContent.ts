import type { BlockContent, BlockType } from "@/types/block";

export function defaultContentForType(type: BlockType): BlockContent {
  switch (type) {
    case "TODO":
    case "CHECKLIST":
      return { text: "", checked: false };
    case "DIVIDER":
      return {};
    case "CODE":
      return { text: "", language: "typescript" };
    case "IMAGE":
      return { url: "", caption: "" };
    default:
      return { text: "" };
  }
}
