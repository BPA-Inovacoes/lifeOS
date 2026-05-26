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
      <div className="mx-auto mt-4 flex w-full max-w-[200px] items-center gap-2">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="font-mono text-[9px] text-zinc-600">v1.0</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>
    </div>
  );
}
