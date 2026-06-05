import type { LucideIcon } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

import { authFieldClass } from "@/modules/auth/authStyles";
import { cn } from "@/lib/utils";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  trailing?: ReactNode;
};

function hasValue(value: string | number | readonly string[] | undefined) {
  return String(value ?? "").length > 0;
}

const iconIdle = "text-muted-foreground transition-colors duration-200";
const iconActive =
  "text-emerald-800 dark:text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.45)] transition-colors duration-200";

function mergeRef<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else ref.current = node;
    }
  };
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput(
    {
      id,
      label,
      icon: Icon,
      error,
      trailing,
      className,
      defaultValue,
      value,
      onChange,
      onBlur,
      ...props
    },
    fieldRef
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [filled, setFilled] = useState(
      () => hasValue(value) || hasValue(defaultValue)
    );

    useEffect(() => {
      const el = inputRef.current;
      if (el) setFilled(hasValue(el.value));
    }, [value, defaultValue]);

    const setRefs = useCallback(mergeRef(inputRef, fieldRef), [fieldRef]);

    return (
      <div className="space-y-2">
        <label
          htmlFor={id}
          className={cn(
            "flex items-center gap-1.5 font-mono text-sm uppercase tracking-wider transition-colors duration-200",
            filled ? "text-muted-foreground" : "text-muted-foreground"
          )}
        >
          <Icon
            className={cn("size-3", filled ? iconActive : iconIdle)}
            aria-hidden
          />
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            ref={setRefs}
            defaultValue={defaultValue}
            value={value}
            className={cn(
              authFieldClass,
              "px-4",
              trailing && "pr-11",
              className
            )}
            onChange={(e) => {
              setFilled(hasValue(e.target.value));
              onChange?.(e);
            }}
            onBlur={(e) => {
              setFilled(hasValue(e.target.value));
              onBlur?.(e);
            }}
            {...props}
          />
          {trailing ? (
            <div className="absolute right-0 top-0 flex h-11 items-center pr-3">
              {trailing}
            </div>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}
      </div>
    );
  }
);
