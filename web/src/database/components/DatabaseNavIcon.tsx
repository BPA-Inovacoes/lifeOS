import { resolveDatabaseIcon } from "@/database/databaseIcons";
import { cn } from "@/lib/utils";

type DatabaseNavIconProps = {
  template: string;
  name?: string;
  /** Chave Lucide (bases CUSTOM) — ex. briefcase, laptop */
  icon?: string | null;
  active?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-6",
};

export function DatabaseNavIcon({
  template,
  name,
  icon,
  active = false,
  className,
  size = "md",
}: DatabaseNavIconProps) {
  const Icon = resolveDatabaseIcon(template, name, icon);

  return (
    <Icon
      className={cn(
        sizeClass[size],
        "shrink-0 stroke-[1.5]",
        active ? "text-emerald-800/90 dark:text-emerald-500/90" : "text-muted-foreground",
        className
      )}
      aria-hidden
    />
  );
}
