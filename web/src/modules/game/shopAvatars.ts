import {
  BookOpen,
  Briefcase,
  Crown,
  Flame,
  GraduationCap,
  Sparkles,
  Swords,
  Target,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";

const SHOP_AVATAR_ICONS: Record<string, LucideIcon> = {
  user: User,
  target: Target,
  flame: Flame,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  swords: Swords,
  crown: Crown,
  sparkles: Sparkles,
};

const SHOP_TITLE_ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  zap: Zap,
  "book-open": BookOpen,
  handshake: Briefcase,
  briefcase: Briefcase,
  crown: Crown,
};

export function resolveShopAvatarIcon(key?: string | null): LucideIcon {
  if (!key) return User;
  return SHOP_AVATAR_ICONS[key] ?? User;
}

export function resolveShopItemIcon(
  type: "TITLE" | "AVATAR",
  iconKey?: string | null
): LucideIcon {
  if (!iconKey) return Sparkles;
  if (type === "AVATAR") return SHOP_AVATAR_ICONS[iconKey] ?? Sparkles;
  return SHOP_TITLE_ICONS[iconKey] ?? Sparkles;
}
