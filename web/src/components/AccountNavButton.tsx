import { UserCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { paths } from "@/routes/paths";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function AccountNavButton({ className }: Props) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const active = location.pathname === paths.account;
  const label = user?.name?.trim() || user?.email || "Conta";

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "max-w-[11rem] gap-2 px-2 sm:max-w-[14rem] sm:px-3",
        active && "bg-secondary text-foreground",
        className
      )}
      aria-label={`Conta — ${label}`}
      title={label}
      asChild
    >
      <Link to={paths.account}>
        <UserCircle className="size-4 shrink-0" />
        <span className="truncate text-sm">{label}</span>
      </Link>
    </Button>
  );
}
