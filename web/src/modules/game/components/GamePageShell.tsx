import type { ReactNode } from "react";

import { gameSectionLabelClass } from "@/modules/game/styles/gameTokens";

type GamePageShellProps = {
  tag?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function GamePageShell({
  tag = "// game mode",
  title,
  description,
  children,
}: GamePageShellProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <header className="border-b border-border pb-6">
        <p className={gameSectionLabelClass}>{tag}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
