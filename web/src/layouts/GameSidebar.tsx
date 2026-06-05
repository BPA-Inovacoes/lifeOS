import {
  BarChart3,
  BookOpen,
  Castle,
  Gamepad2,
  LogOut,
  Repeat2,
  ShoppingBag,
  Target,
  Trophy,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { AppBrand } from "@/components/AppBrand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { paths } from "@/routes/paths";
import { useAppModeStore } from "@/store/appModeStore";
import {
  lifeosScrollbarThinClass,
  navItemClass,
  sectionLabelMutedClass,
} from "@/styles/designTokens";
import {
  gameNavItemActiveClass,
  gameNavItemIdleClass,
} from "@/modules/game/styles/gameTokens";

type GameSidebarProps = {
  onLogout: () => void;
  className?: string;
};

const RPG_NAV: {
  to: string;
  end?: boolean;
  label: string;
  icon: typeof User;
}[] = [
  { to: paths.game.home, end: true, label: "Perfil", icon: User },
  { to: paths.game.missions, label: "Missões", icon: Target },
  { to: paths.game.dungeons, label: "Dungeons", icon: Castle },
  { to: paths.game.achievements, label: "Conquistas", icon: Trophy },
  { to: paths.game.stats, label: "Estatísticas", icon: BarChart3 },
  { to: paths.game.shop, label: "Loja", icon: ShoppingBag },
];

export function GameSidebar({ onLogout, className }: GameSidebarProps) {
  const clearActiveMode = useAppModeStore((s) => s.clearActiveMode);

  const switchMode = () => {
    clearActiveMode();
    window.location.assign(paths.modeSelect);
  };

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-violet-300/40 bg-background/90 backdrop-blur-sm dark:border-violet-900/30",
        className
      )}
    >
      <div className="shrink-0 border-b border-border px-4 py-4">
        <AppBrand size="sidebar" showTagline accent="game" />
        <p className="mt-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-violet-900/90 dark:text-violet-400/90">
          <Gamepad2 className="size-3" />
          RPG · LifeOS
        </p>
      </div>

      <nav
        className={cn(
          "min-h-0 flex-1 overflow-y-auto p-2",
          lifeosScrollbarThinClass
        )}
        aria-label="Navegação Game Mode"
      >
        <p className={cn(sectionLabelMutedClass, "mb-1 px-3")}>Personagem</p>
        {RPG_NAV.map(({ to, end, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(navItemClass, isActive ? gameNavItemActiveClass : gameNavItemIdleClass)
            }
          >
            <Icon className="size-4 shrink-0 text-violet-900/90 dark:text-violet-400/90" />
            {label}
          </NavLink>
        ))}

        <p className={cn(sectionLabelMutedClass, "mb-1 mt-5 px-3")}>Ajuda</p>
        <NavLink
          to={paths.game.manual}
          className={({ isActive }) =>
            cn(navItemClass, isActive ? gameNavItemActiveClass : gameNavItemIdleClass)
          }
        >
          <BookOpen className="size-4 shrink-0 text-violet-900/90 dark:text-violet-400/90" />
          Manual
        </NavLink>

        <p className={cn(sectionLabelMutedClass, "mb-1 mt-5 px-3")}>Sistema</p>
        <button
          type="button"
          onClick={switchMode}
          className={cn(navItemClass, gameNavItemIdleClass, "w-full")}
        >
          <Repeat2 className="size-4 shrink-0 text-muted-foreground" />
          Trocar modo
        </button>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-violet-900/40 hover:border-violet-700/60 hover:text-violet-800 dark:hover:text-violet-300"
          onClick={onLogout}
        >
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
