import { cn } from "@/lib/utils";

export type CaseIconMotion = "idle" | "active" | "thinking";

type Props = {
  size?: "sm" | "chat" | "md" | "lg";
  motion?: CaseIconMotion;
  className?: string;
};

const sizeClass = {
  sm: "size-6",
  chat: "size-10",
  md: "size-9",
  lg: "size-12",
};

export function CaseIcon({ size = "md", motion = "idle", className }: Props) {
  return (
    <span
      className={cn("case-icon-wrap inline-flex shrink-0 items-center justify-center", className)}
      data-motion={motion}
      aria-hidden
    >
      <img
        src="/case-icon.png"
        alt=""
        className={cn("case-icon-img object-contain drop-shadow-[0_0_8px_rgba(132,204,22,0.45)]", sizeClass[size])}
        draggable={false}
      />
    </span>
  );
}
