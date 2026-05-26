import * as React from "react";

import { dateInputClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";

export type DateInputProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type"
>;

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="date"
        className={cn(dateInputClass, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput };
