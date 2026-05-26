import {
  Briefcase,
  Building2,
  CalendarClock,
  ClipboardList,
  Code2,
  Factory,
  GraduationCap,
  Handshake,
  HardHat,
  Laptop,
  LayoutGrid,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const DEFAULT_WORKSPACE_ICON = "briefcase";

/** Ícones do workspace — foco trabalho / equipa / operações. */
export const WORKSPACE_ICON_PRESETS: {
  id: string;
  Icon: LucideIcon;
  label: string;
}[] = [
  { id: "briefcase", Icon: Briefcase, label: "Trabalho" },
  { id: "building-2", Icon: Building2, label: "Empresa" },
  { id: "laptop", Icon: Laptop, label: "Remoto" },
  { id: "users", Icon: Users, label: "Equipa" },
  { id: "clipboard-list", Icon: ClipboardList, label: "Gestão" },
  { id: "calendar-clock", Icon: CalendarClock, label: "Agenda" },
  { id: "factory", Icon: Factory, label: "Operações" },
  { id: "handshake", Icon: Handshake, label: "Clientes" },
  { id: "code-2", Icon: Code2, label: "Tech" },
  { id: "trending-up", Icon: TrendingUp, label: "Vendas" },
  { id: "graduation-cap", Icon: GraduationCap, label: "Formação" },
  { id: "truck", Icon: Truck, label: "Logística" },
  { id: "hard-hat", Icon: HardHat, label: "Obra" },
  { id: "wallet", Icon: Wallet, label: "Finanças" },
];

/** Emojis e chaves antigas → preset actual. */
const LEGACY_ICON: Record<string, string> = {
  "✦": "briefcase",
  "◆": "briefcase",
  "📁": "building-2",
  "💼": "briefcase",
  "🎯": "clipboard-list",
  "🚀": "factory",
  "📚": "laptop",
  sparkles: "briefcase",
  folder: "building-2",
  target: "clipboard-list",
  rocket: "factory",
  "book-open": "laptop",
};

const ICON_BY_ID = Object.fromEntries(
  WORKSPACE_ICON_PRESETS.map((p) => [p.id, p.Icon])
) as Record<string, LucideIcon>;

export function normalizeWorkspaceIconKey(
  icon?: string | null
): string {
  if (!icon) return DEFAULT_WORKSPACE_ICON;
  if (ICON_BY_ID[icon]) return icon;
  return LEGACY_ICON[icon] ?? DEFAULT_WORKSPACE_ICON;
}

export function resolveWorkspaceIcon(
  icon?: string | null
): LucideIcon {
  const key = normalizeWorkspaceIconKey(icon);
  return ICON_BY_ID[key] ?? LayoutGrid;
}
