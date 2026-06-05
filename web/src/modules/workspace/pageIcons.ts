import {
  BookOpen,
  Bookmark,
  Calendar,
  File,
  FileText,
  Flag,
  Home,
  Lightbulb,
  ListChecks,
  MapPin,
  NotebookPen,
  Pin,
  Star,
  type LucideIcon,
} from "lucide-react";

export const DEFAULT_PAGE_ICON = "file-text";

/** Ícones de página — documentos, notas e conteúdo. */
export const PAGE_ICON_PRESETS: {
  id: string;
  Icon: LucideIcon;
  label: string;
}[] = [
  { id: "file-text", Icon: FileText, label: "Documento" },
  { id: "file", Icon: File, label: "Ficheiro" },
  { id: "notebook-pen", Icon: NotebookPen, label: "Notas" },
  { id: "book-open", Icon: BookOpen, label: "Leitura" },
  { id: "lightbulb", Icon: Lightbulb, label: "Ideias" },
  { id: "list-checks", Icon: ListChecks, label: "Lista" },
  { id: "calendar", Icon: Calendar, label: "Calendário" },
  { id: "map-pin", Icon: MapPin, label: "Mapa" },
  { id: "home", Icon: Home, label: "Início" },
  { id: "star", Icon: Star, label: "Destaque" },
  { id: "flag", Icon: Flag, label: "Marco" },
  { id: "bookmark", Icon: Bookmark, label: "Guardado" },
  { id: "pin", Icon: Pin, label: "Fixo" },
];

/** Emojis e chaves antigas → preset actual. */
const LEGACY_ICON: Record<string, string> = {
  "📄": "file-text",
  "🏠": "home",
  "📁": "file",
  "📝": "notebook-pen",
  "📚": "book-open",
  "💡": "lightbulb",
  "📅": "calendar",
  "⭐": "star",
  "📌": "pin",
  "🚩": "flag",
  "✓": "list-checks",
  "◆": "star",
  "◇": "file",
  document: "file-text",
  home: "home",
  folder: "file",
  note: "notebook-pen",
};

const ICON_BY_ID = Object.fromEntries(
  PAGE_ICON_PRESETS.map((p) => [p.id, p.Icon])
) as Record<string, LucideIcon>;

export function normalizePageIconKey(icon?: string | null): string {
  if (!icon) return DEFAULT_PAGE_ICON;
  if (ICON_BY_ID[icon]) return icon;
  return LEGACY_ICON[icon] ?? DEFAULT_PAGE_ICON;
}

export function resolvePageIcon(icon?: string | null): LucideIcon {
  const key = normalizePageIconKey(icon);
  return ICON_BY_ID[key] ?? FileText;
}
