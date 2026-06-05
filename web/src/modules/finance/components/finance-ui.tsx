import * as React from "react";

import { DateInput, type DateInputProps } from "@/components/ui/date-input";
import { Input, type InputProps } from "@/components/ui/input";
import {
  financeBtnBaseClass,
  financeFieldClass,
  financeGhostBtnClass,
  financeOutlineBtnClass,
  financePrimaryBtnClass,
  financeSelectClass,
} from "@/modules/finance/styles/financeTokens";
import { cn } from "@/lib/utils";

type FinanceButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
};

export function FinanceButton({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: FinanceButtonProps) {
  const variantClass =
    variant === "outline"
      ? financeOutlineBtnClass
      : variant === "ghost"
        ? financeGhostBtnClass
        : financePrimaryBtnClass;

  const sizeClass =
    size === "sm" ? "h-9 px-3 text-sm" : size === "lg" ? "h-12 px-8 text-base" : "h-10 px-4 py-2 text-base";

  return (
    <button
      type={type}
      className={cn(financeBtnBaseClass, sizeClass, variantClass, className)}
      {...props}
    />
  );
}

export const FinanceInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input ref={ref} className={cn(financeFieldClass, className)} {...props} />
  )
);
FinanceInput.displayName = "FinanceInput";

type FinanceSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const FinanceSelect = React.forwardRef<HTMLSelectElement, FinanceSelectProps>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(financeSelectClass, className)} {...props} />
  )
);
FinanceSelect.displayName = "FinanceSelect";

export function FinanceDateInput({ className, ...props }: Omit<DateInputProps, "accent">) {
  return (
    <DateInput
      accent="amber"
      className={cn("focus:border-amber-600", className)}
      {...props}
    />
  );
}
