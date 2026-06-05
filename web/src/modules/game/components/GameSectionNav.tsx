import { Link } from "react-router-dom";
import {
  BarChart3,
  Castle,
  Target,
  Trophy,
  User,
} from "lucide-react";

import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { listItemClass } from "@/styles/designTokens";

const SECTIONS = [
  {
    to: paths.game.home,
    label: "Perfil",
    hint: "Ficha de personagem",
    icon: User,
  },
  {
    to: paths.game.missions,
    label: "Missões",
    hint: "Diárias e objectivos",
    icon: Target,
  },
  {
    to: paths.game.dungeons,
    label: "Dungeons",
    hint: "Desafios e bosses",
    icon: Castle,
  },
  {
    to: paths.game.achievements,
    label: "Conquistas",
    hint: "Badges e sequências",
    icon: Trophy,
  },
  {
    to: paths.game.stats,
    label: "Estatísticas",
    hint: "Atributos e heatmap",
    icon: BarChart3,
  },
] as const;

export function GameSectionNav() {
  return (
    <nav
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
      aria-label="Secções do Game Mode"
    >
      {SECTIONS.map(({ to, label, hint, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className={cn(listItemClass, "flex-col items-start gap-2 py-3")}
        >
          <Icon className="size-4 text-violet-900/90 dark:text-violet-400/90" />
          <span className="font-medium text-foreground">{label}</span>
          <span className="font-mono text-xs uppercase text-muted-foreground">{hint}</span>
        </Link>
      ))}
    </nav>
  );
}
