import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils";

export type AppModalAlign = "center" | "top";

type AppModalProps = {
  open: boolean;
  children: ReactNode;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  /** Impede fechar (ex.: durante submit). */
  disabled?: boolean;
  align?: AppModalAlign;
  role?: "dialog" | "alertdialog";
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  zIndex?: number;
  panelClassName?: string;
};

export function AppModal({
  open,
  children,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  disabled,
  align = "center",
  role = "dialog",
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  zIndex = 200,
  panelClassName,
}: AppModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape && !disabled) onClose?.();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeOnEscape, disabled, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex p-4 sm:p-6",
        align === "top" ? "items-start justify-center pt-[12vh]" : "items-center justify-center"
      )}
      style={{ zIndex }}
      role={role}
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
        aria-label="Fechar"
        disabled={disabled || !closeOnBackdrop}
        onClick={() => {
          if (!disabled && closeOnBackdrop) onClose?.();
        }}
      />
      <div
        ref={panelRef}
        className={cn("relative z-10 w-full max-w-lg lifeos-modal-enter", panelClassName)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
