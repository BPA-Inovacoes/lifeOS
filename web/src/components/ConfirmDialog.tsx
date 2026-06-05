import { AlertTriangle } from "lucide-react";

import { AppModal } from "@/components/AppModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "danger" | "warning";

const variantStyles: Record<
  ConfirmDialogVariant,
  {
    accent: string;
    eyebrow: string;
    eyebrowClass: string;
    iconBox: string;
    iconClass: string;
    confirmBtn: string;
  }
> = {
  danger: {
    accent: "bg-red-600",
    eyebrow: "// confirmar eliminação",
    eyebrowClass: "text-red-500/90",
    iconBox: "border-red-900/50 bg-red-950/50",
    iconClass: "text-red-500",
    confirmBtn:
      "border border-red-800 bg-red-800 text-white hover:bg-red-700",
  },
  warning: {
    accent: "bg-amber-600",
    eyebrow: "// confirmar acção",
    eyebrowClass: "text-amber-500/90",
    iconBox: "border-amber-900/50 bg-amber-950/50",
    iconClass: "text-amber-500",
    confirmBtn:
      "border border-amber-800 bg-amber-800 text-white hover:bg-amber-700",
  },
};

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  variant?: ConfirmDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  variant = "danger",
  confirmLabel = "Apagar",
  cancelLabel = "Cancelar",
  loading,
  loadingLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const v = variantStyles[variant];

  return (
    <AppModal
      open={open}
      role="alertdialog"
      zIndex={210}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      disabled={loading}
      onClose={onCancel}
      ariaLabelledBy="confirm-dialog-title"
      ariaDescribedBy="confirm-dialog-desc"
      panelClassName="max-w-md"
    >
      <div
        className={cn(
          "relative rounded-none border border-border bg-background shadow-2xl"
        )}
      >
        <div className={cn("absolute left-0 top-0 h-1 w-full", v.accent)} aria-hidden />

        <div className="border-b border-border px-6 py-5">
          <p
            className={cn(
              "font-mono text-xs uppercase tracking-[0.2em]",
              v.eyebrowClass
            )}
          >
            {v.eyebrow}
          </p>
          <div className="mt-4 flex gap-4">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center border",
                v.iconBox
              )}
            >
              <AlertTriangle className={cn("size-5", v.iconClass)} aria-hidden />
            </div>
            <div className="min-w-0">
              <h2
                id="confirm-dialog-title"
                className="text-lg font-semibold leading-snug text-foreground"
              >
                {title}
              </h2>
              <p
                id="confirm-dialog-desc"
                className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
              >
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={loading}
            className={cn("w-full sm:w-auto", v.confirmBtn)}
            onClick={onConfirm}
          >
            {loading
              ? loadingLabel ?? "A processar…"
              : confirmLabel}
          </Button>
        </div>
      </div>
    </AppModal>
  );
}
