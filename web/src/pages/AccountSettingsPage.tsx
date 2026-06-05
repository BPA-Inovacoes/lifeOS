import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Gamepad2, Shield, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { LifeOSLoading } from "@/components/LifeOSLoading";
import { QueryErrorPanel } from "@/components/QueryErrorPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountProfileForm } from "@/modules/account/components/AccountProfileForm";
import { ChangePasswordForm } from "@/modules/account/components/ChangePasswordForm";
import { useAccountProfile } from "@/modules/account/hooks/useAccount";
import { getFinanceCurrency } from "@/modules/finance/financeCurrencies";
import { useFinanceProfile } from "@/modules/finance/hooks/useFinance";
import { fetchGameProfile } from "@/services/gameApi";
import { homeForMode, paths } from "@/routes/paths";
import { useAppModeStore } from "@/store/appModeStore";
import {
  metaLabelClass,
  pageShellClass,
  sectionLabelClass,
  techCardClass,
} from "@/styles/designTokens";
import { cn } from "@/lib/utils";

function formatMemberSince(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ModeSummaryCard({
  title,
  description,
  to,
  icon: Icon,
  accentClass,
}: {
  title: string;
  description: string;
  to: string;
  icon: typeof Gamepad2;
  accentClass: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-start gap-3 border p-4 transition-colors hover:bg-secondary/50",
        techCardClass
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center border border-border bg-secondary",
          accentClass
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-foreground group-hover:underline">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

export function AccountSettingsPage() {
  const activeMode = useAppModeStore((s) => s.activeMode);
  const backTo = activeMode ? homeForMode(activeMode) : paths.modeSelect;

  const { data: profile, isLoading, isError, refetch } = useAccountProfile();

  const { data: gameProfile } = useQuery({
    queryKey: ["game", "profile"],
    queryFn: fetchGameProfile,
    staleTime: 60_000,
  });

  const { data: financeProfile } = useFinanceProfile();

  if (isLoading) {
    return (
      <div className={pageShellClass}>
        <LifeOSLoading message="A carregar perfil" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className={pageShellClass}>
        <QueryErrorPanel
          title="Perfil indisponível"
          message="Não foi possível carregar os dados da conta."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const financeCurrency = financeProfile?.currency;
  const currencyMeta = financeCurrency ? getFinanceCurrency(financeCurrency) : null;

  return (
    <div className={cn(pageShellClass, "max-w-2xl space-y-8")}>
      <header className="border-b border-border pb-6">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-emerald-800 dark:hover:text-emerald-500"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
        <p className={cn(sectionLabelClass, "mt-4")}>// conta</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Gestão de perfil</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Conta LifeOS, segurança e atalhos para os teus modos.
        </p>
      </header>

      <div className={cn("border p-4", techCardClass)}>
        <p className={metaLabelClass}>Resumo</p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Membro desde</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {formatMemberSince(profile.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Função</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {profile.role === "ADMIN" ? "Administrador" : "Utilizador"}
            </dd>
          </div>
        </dl>
      </div>

      <AccountProfileForm profile={profile} />
      <ChangePasswordForm />

      <section className="space-y-3">
        <div>
          <p className={sectionLabelClass}>// modos</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Perfis por modo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada modo tem definições próprias — avatar no Game, moeda em Finanças, etc.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeSummaryCard
            title="Game Mode"
            description={
              gameProfile
                ? `Nível ${gameProfile.level} · ${gameProfile.rankTitle}`
                : "Personagem, XP e conquistas"
            }
            to={paths.game.home}
            icon={Gamepad2}
            accentClass="text-violet-800 dark:text-violet-400"
          />
          <ModeSummaryCard
            title="Modo Finanças"
            description={
              currencyMeta
                ? `${currencyMeta.flag} ${currencyMeta.shortLabel} · ${currencyMeta.label}`
                : "Moeda, contas e métodos"
            }
            to={paths.finance.home}
            icon={Wallet}
            accentClass="text-amber-800 dark:text-amber-400"
          />
          <ModeSummaryCard
            title="Focus Mode"
            description="Workspaces, páginas e bases de dados"
            to={paths.focus.dashboard}
            icon={Shield}
            accentClass="text-emerald-800 dark:text-emerald-500"
          />
        </div>
      </section>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">Aparência da interface</p>
        <ThemeToggle showSystem />
      </div>
    </div>
  );
}
