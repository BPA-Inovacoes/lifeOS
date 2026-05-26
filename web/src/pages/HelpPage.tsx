import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

import { ManualViewer } from "@/modules/help/ManualViewer";
import { pageShellClass, sectionLabelClass } from "@/styles/designTokens";

export function HelpPage() {
  return (
    <div className={pageShellClass}>
      <header className="mb-8 space-y-3 border-b border-zinc-800 pb-6">
        <p className={sectionLabelClass}>// ajuda</p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center border border-zinc-800 bg-zinc-900">
              <BookOpen className="size-5 text-emerald-600/80" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Manual de utilizador
              </h1>
              <p className="mt-1 max-w-xl text-sm text-zinc-500">
                Como usar espaços, páginas, bases de dados, painel e pontos.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="font-mono text-[10px] uppercase tracking-wider text-emerald-600/90 hover:text-emerald-500"
          >
            ← Painel
          </Link>
        </div>
      </header>

      <ManualViewer />
    </div>
  );
}
