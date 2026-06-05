import { Focus, Gamepad2, Sparkles, Wallet } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppTechBackground } from "@/components/AppTechBackground";
import { AppBrand } from "@/components/AppBrand";
import { LifeOSLoading } from "@/components/LifeOSLoading";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toggleGameMode } from "@/services/gameApi";
import { ApiError } from "@/services/http";
import { useAppModeStore } from "@/store/appModeStore";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { homeForMode, type AppMode } from "@/routes/paths";
import { financeAccentRing } from "@/modules/finance/styles/financeTokens";
import { cn } from "@/lib/utils";
import { sectionLabelClass } from "@/styles/designTokens";

type ModeCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  selectedRing?: string;
  hoverHint?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ModeCard({
  title,
  description,
  icon,
  accent,
  selectedRing = "border-emerald-600/60 ring-1 ring-emerald-600/30",
  hoverHint = "text-emerald-600/80",
  selected,
  disabled,
  onClick,
}: ModeCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col items-start gap-4 border p-6 text-left transition-all",
        "border-border bg-card/90 hover:border-border hover:bg-secondary/80",
        "disabled:pointer-events-none disabled:opacity-60",
        selected && selectedRing
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center border border-border bg-secondary",
          accent
        )}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <span
        className={cn(
          "font-mono text-xs uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100",
          hoverHint
        )}
      >
        Entrar →
      </span>
    </button>
  );
}

export function ModeSelectPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setActiveMode = useAppModeStore((s) => s.setActiveMode);
  const setGameModeEnabled = useUiStore((s) => s.setGameModeEnabled);
  const [busy, setBusy] = useState<AppMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (mode: AppMode) => {
    setBusy(mode);
    setError(null);
    try {
      const profile = await toggleGameMode(mode === "game");
      setGameModeEnabled(profile.gameModeEnabled);
      setActiveMode(mode);
      navigate(homeForMode(mode), { replace: true });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : "Não foi possível preparar o modo. Tenta outra vez.";
      setError(msg);
    } finally {
      setBusy(null);
    }
  };

  const loadingVariant =
    busy === "game" ? "game" : busy === "finance" ? "finance" : "focus";
  const loadingMessage =
    busy === "game"
      ? "A preparar Game Mode"
      : busy === "finance"
        ? "A preparar Modo Finanças"
        : "A preparar Focus Mode";

  if (busy) {
    return (
      <LifeOSLoading
        fullScreen
        size="lg"
        variant={loadingVariant}
        message={loadingMessage}
        rotatingMessages={[
          "A sincronizar preferências...",
          "A carregar interface...",
        ]}
      />
    );
  }

  const displayName = user?.name?.trim() || user?.email || "Operador";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <AppTechBackground fixed className="z-0" />
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle showSystem />
      </div>
      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-10 text-center">
          <AppBrand size="default" showTagline className="justify-center" />
          <p className={cn(sectionLabelClass, "mt-6")}>// escolher interface</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Olá, {displayName}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Focus, Game e Finanças são experiências separadas. Escolhe como queres
            trabalhar hoje — podes trocar mais tarde em{" "}
            <span className="text-muted-foreground">/mode</span>.
          </p>
        </div>

        {error ? (
          <p className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-900/80 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <ModeCard
            title="Focus Mode"
            description="Execução diária: painel Agora, workspaces, páginas, bases de dados e produtividade sem distrações."
            icon={<Focus className="size-6 text-emerald-800 dark:text-emerald-500" />}
            accent="text-emerald-800 dark:text-emerald-500"
            onClick={() => void choose("focus")}
          />
          <ModeCard
            title="Game Mode"
            description="Command Center: XP, níveis, missões, conquistas e progressão sobre a tua actividade real."
            icon={<Gamepad2 className="size-6 text-violet-900 dark:text-violet-400" />}
            accent="text-violet-900 dark:text-violet-400"
            selectedRing="border-violet-600/60 ring-1 ring-violet-600/30"
            hoverHint="text-violet-900/90 dark:text-violet-400/90"
            onClick={() => void choose("game")}
          />
          <ModeCard
            title="Modo Finanças"
            description="Educação financeira prática: métodos guiados, contas, movimentos e rituais para gerires o teu dinheiro."
            icon={<Wallet className="size-6 text-amber-900 dark:text-amber-400" />}
            accent="text-amber-900 dark:text-amber-400"
            selectedRing={financeAccentRing}
            hoverHint="text-amber-900/90 dark:text-amber-400/90"
            onClick={() => void choose("finance")}
          />
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Sparkles className="size-3.5 text-emerald-600/70" />
          A escolha fica guardada até trocares de modo ou saíres da conta.
        </p>
      </div>
    </div>
  );
}
