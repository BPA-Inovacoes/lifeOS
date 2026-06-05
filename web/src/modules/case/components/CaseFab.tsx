import { CaseIcon } from "@/modules/case/components/CaseIcon";
import { useCaseStore } from "@/store/caseStore";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "focus" | "game" | "finance";
};

const variantAccent = {
  focus: "hover:[--case-fab-accent:rgb(217_249_157/1)]",
  game: "hover:[--case-fab-accent:rgb(196_181_253/1)]",
  finance: "hover:[--case-fab-accent:rgb(253_224_71/1)]",
};

/** Hexágono regular (vértice no topo). */
const HEXAGON_POINTS = "50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27";

export function CaseFab({ variant = "focus" }: Props) {
  const toggle = useCaseStore((s) => s.toggle);
  const open = useCaseStore((s) => s.open);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={open ? "Fechar Case" : "Abrir Case"}
      aria-expanded={open}
      data-variant={variant}
      className={cn(
        "case-fab fixed bottom-5 right-5 z-40 flex size-16 items-center justify-center",
        "bg-zinc-950/95 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95",
        open && "case-fab-open scale-95",
        variantAccent[variant]
      )}
    >
      <svg
        className="case-fab-shape pointer-events-none absolute inset-0 z-0 size-full"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <polygon className="case-fab-fill" points={HEXAGON_POINTS} />
        <polygon className="case-fab-stroke" fill="none" points={HEXAGON_POINTS} />
      </svg>
      <span className="case-fab-light" aria-hidden />
      <CaseIcon size="lg" motion={open ? "active" : "idle"} className="relative z-10" />
    </button>
  );
}
