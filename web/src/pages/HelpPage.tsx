import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { ManualViewer } from "@/modules/help/ManualViewer";
import { paths } from "@/routes/paths";
import { pageShellClass, sectionLabelClass } from "@/styles/designTokens";

export function HelpPage() {
  return (
    <div className={pageShellClass}>
      <header className="mb-8 space-y-3 border-b border-border pb-6">
        <p className={sectionLabelClass}>// ajuda</p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center border border-border bg-card">
              <BookOpen className="size-5 text-emerald-600/80" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Manual de utilizador
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Como usar espaços, páginas, bases de dados, painel e pontos.
              </p>
            </div>
          </div>
          <Link
            to={paths.focus.dashboard}
            className="font-mono text-xs uppercase tracking-wider text-emerald-600/90 hover:text-emerald-500"
          >
            ← Painel
          </Link>
        </div>
      </header>

      <ManualViewer />
    </div>
  );
}
