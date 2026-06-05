import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** `fixed` cobre o viewport inteiro; `absolute` preenche o contentor pai */
  fixed?: boolean;
};

export function AppTechBackground({ className, fixed = false }: Props) {
  return (
    <div
      className={cn(
        "pointer-events-none inset-0 overflow-hidden",
        fixed ? "fixed" : "absolute",
        className
      )}
      aria-hidden
    >
      <div className="lifeos-tech-grid absolute inset-0 opacity-[0.45] dark:opacity-[0.35]" />
      <div className="lifeos-tech-vignette absolute inset-0" />
    </div>
  );
}
