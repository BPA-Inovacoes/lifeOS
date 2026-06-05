import { PRODUCT_TAGLINE_AUTH } from "@/constants/product";
import { AppBrand } from "@/components/AppBrand";
import { cn } from "@/lib/utils";

type AuthBrandProps = {
  size?: "default" | "compact";
  className?: string;
};

export function AuthBrand({ size = "default", className }: AuthBrandProps) {
  const compact = size === "compact";

  return (
    <div className={cn("select-none text-center", className)}>
      <AppBrand
        size={compact ? "compact" : "default"}
        tagline={PRODUCT_TAGLINE_AUTH}
      />
      <div
        className={cn(
          "mx-auto flex w-full max-w-[200px] items-center gap-2",
          compact ? "mt-2" : "mt-3 sm:mt-4"
        )}
      >
        <div className="h-px flex-1 bg-muted" />
        <span className="font-mono text-sm text-muted-foreground">v1.0</span>
        <div className="h-px flex-1 bg-muted" />
      </div>
    </div>
  );
}
