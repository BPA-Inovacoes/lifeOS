import { File, FileText, Home, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  "📄": FileText,
  "🏠": Home,
  "📁": File,
};

type PageIconProps = {
  icon?: string | null;
  active?: boolean;
  className?: string;
  size?: "sm" | "md";
};

const sizeClass = {
  sm: "size-3.5",
  md: "size-4",
};

export function PageIcon({
  icon,
  active = false,
  className,
  size = "sm",
}: PageIconProps) {
  const Icon = (icon && ICON_MAP[icon]) || FileText;

  return (
    <Icon
      className={cn(
        sizeClass[size],
        "shrink-0",
        active ? "text-emerald-500/90" : "text-zinc-400",
        className
      )}
      aria-hidden
    />
  );
}
