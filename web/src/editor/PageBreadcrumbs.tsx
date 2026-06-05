import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { BreadcrumbItem } from "@/utils/buildPageBreadcrumbs";

export function PageBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      className="flex flex-wrap items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground"
      aria-label="Navegação estrutural"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1">
          {i > 0 ? <ChevronRight className="size-3 opacity-50" /> : null}
          {item.to ? (
            <Link to={item.to} className="hover:text-emerald-500">
              {item.label}
            </Link>
          ) : (
            <span className="text-muted-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
