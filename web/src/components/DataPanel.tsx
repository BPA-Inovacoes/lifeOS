import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  dataPanelClass,
  dataPanelFooterClass,
  techCardAccentClass,
} from "@/styles/designTokens";

type DataPanelProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  accent?: "emerald" | "amber" | "red";
  className?: string;
};

const accentColors = {
  emerald: "bg-emerald-600",
  amber: "bg-amber-600",
  red: "bg-red-600",
};

export function DataPanel({
  children,
  header,
  footer,
  accent = "emerald",
  className,
}: DataPanelProps) {
  return (
    <section className={cn(dataPanelClass, className)}>
      <div
        className={cn(techCardAccentClass, accentColors[accent])}
        aria-hidden
      />
      {header ? (
        <div className="border-b border-border px-4 py-3">{header}</div>
      ) : null}
      {children}
      {footer ? <div className={dataPanelFooterClass}>{footer}</div> : null}
    </section>
  );
}
