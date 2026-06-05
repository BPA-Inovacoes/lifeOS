import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { GamePageShell } from "@/modules/game/components/GamePageShell";
import { getGameManualMarkdown } from "@/modules/game/help/gameManualSource";
import { ManualViewer } from "@/modules/help/ManualViewer";
import { paths } from "@/routes/paths";

export function GameManualPage() {
  return (
    <GamePageShell
      tag="// manual"
      title="Manual do Game Mode"
      description="LifeOS RPG v1.1 — XP, LifeCoins, hábitos tipados, clientes, missões e evolução."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-violet-900/30 bg-violet-950/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-violet-900/90 dark:text-violet-400/90" />
          <p className="text-sm text-muted-foreground">
            Produtividade no Focus · Progressão no Game
          </p>
        </div>
        <Link
          to={paths.game.home}
          className="font-mono text-xs uppercase tracking-wider text-violet-900/90 dark:text-violet-400/90 hover:text-violet-800 dark:hover:text-violet-300"
        >
          ← Perfil
        </Link>
      </div>

      <ManualViewer
        getMarkdown={getGameManualMarkdown}
        accent="violet"
        linkClassName="text-violet-900 dark:text-violet-400 decoration-violet-800/60 hover:text-violet-800 dark:hover:text-violet-300"
      />
    </GamePageShell>
  );
}
