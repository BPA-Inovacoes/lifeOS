import { resolvePageIcon } from "@/modules/workspace/pageIcons";
import { cn } from "@/lib/utils";

type PageIconProps = {
  icon?: string | null;
  active?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export function PageIcon({
  icon,
  active = false,
  className,
  size = "sm",
}: PageIconProps) {
  const Icon = resolvePageIcon(icon);

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
