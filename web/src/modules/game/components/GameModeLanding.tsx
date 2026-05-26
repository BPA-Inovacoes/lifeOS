import { Gamepad2, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { GameModeToggle } from "@/modules/game/components/GameModeToggle";
import {
  gameAccentLineClass,
  gameGlassClass,
  gamePanelClass,
  gamePanelGlowClass,
} from "@/modules/game/styles/gameTokens";
import { sectionLabelClass } from "@/styles/designTokens";

type GameModeLandingProps = {
  onEnable: () => void;
  loading?: boolean;
};

const FEATURES = [
  {
    icon: Zap,
    title: "XP & níveis",
    desc: "Progressão visual a cada tarefa, hábito ou estudo.",
  },
  {
    icon: Target,
    title: "Missões diárias",
    desc: "Objectivos automáticos com recompensas.",
  },
  {
    icon: Trophy,
    title: "Conquistas",
    desc: "Desbloqueia badges por consistência e execução.",
  },
  {
    icon: Sparkles,
    title: "Stats avançados",
    desc: "Radar de atributos, heatmap e feed de actividade.",
  },
] as const;

export function GameModeLanding({ onEnable, loading }: GameModeLandingProps) {
  return (
    <div className="relative mx-auto flex min-h-[min(640px,75vh)] max-w-3xl flex-col justify-center px-6 py-12 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_55%)]" />

      <section className={`relative ${gamePanelClass} ${gameGlassClass}`}>
        <div className={gamePanelGlowClass} aria-hidden />
        <div className={gameAccentLineClass} aria-hidden />

        <div className="border-b border-zinc-800/80 px-6 py-8 md:px-10">
          <p className={sectionLabelClass}>// game mode</p>
          <div className="mt-4 flex flex-wrap items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center border border-emerald-800/40 bg-emerald-950/30">
              <Gamepad2 className="size-7 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Camada de progressão
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-500">
                Transforma produtividade em evolução — XP, streaks, missões e
                conquistas. Opcional, elegante, sem afectar o Focus Mode.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-zinc-800/50 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-3 bg-zinc-950/80 px-6 py-5 md:px-8"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-emerald-600/80" />
              <div>
                <p className="text-sm font-medium text-zinc-200">{title}</p>
                <p className="mt-1 text-xs text-zinc-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/80 px-6 py-6 md:px-10">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              Modo actual
            </p>
            <GameModeToggle
              enabled={false}
              loading={loading}
              onChange={(enabled) => {
                if (enabled) onEnable();
              }}
            />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">Painel Agora</Link>
          </Button>
        </div>
      </section>

      <p className="relative mt-6 text-center font-mono text-[10px] text-zinc-600">
        Focus Mode permanece minimalista · Game Mode carrega só quando activo
      </p>
    </div>
  );
}
