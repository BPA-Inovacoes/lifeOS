import { Mail, User } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthInput } from "@/modules/auth/components/AuthInput";
import { Button } from "@/components/ui/button";
import { useAccountMutations } from "@/modules/account/hooks/useAccount";
import { ApiError, flattenApiErrors } from "@/services/http";
import type { AuthUser } from "@/types/auth";
import { errorBoxClass, primaryBtnClass, techCardClass } from "@/styles/designTokens";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

type Props = {
  profile: AuthUser;
};

export function AccountProfileForm({ profile }: Props) {
  const { updateProfile } = useAccountMutations();
  const [name, setName] = useState(profile.name ?? "");
  const [email, setEmail] = useState(profile.email);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(profile.name ?? "");
    setEmail(profile.email);
  }, [profile.email, profile.name]);

  const dirty =
    name.trim() !== (profile.name ?? "").trim() ||
    email.trim().toLowerCase() !== profile.email.toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload: { name?: string; email?: string } = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedName !== (profile.name ?? "").trim()) payload.name = trimmedName;
    if (trimmedEmail !== profile.email.toLowerCase()) payload.email = trimmedEmail;
    if (Object.keys(payload).length === 0) return;

    updateProfile.mutate(payload, {
      onSuccess: () => toast.success("Perfil actualizado"),
      onError: (err) => {
        if (err instanceof ApiError) {
          setError(flattenApiErrors(err) ?? err.message);
        } else {
          setError("Não foi possível guardar o perfil.");
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className={cn("border p-6", techCardClass)}>
      <h2 className="text-lg font-semibold text-foreground">Dados da conta</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Nome e email usados em todos os modos (Focus, Game, Finanças).
      </p>

      <div className="mt-6 space-y-4">
        <AuthInput
          id="account-name"
          label="Nome"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={120}
        />
        <AuthInput
          id="account-email"
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      {error ? <p className={cn("mt-4", errorBoxClass)}>{error}</p> : null}

      <Button
        type="submit"
        className={cn("mt-6", primaryBtnClass)}
        disabled={!dirty || updateProfile.isPending}
      >
        {updateProfile.isPending ? "A guardar…" : "Guardar alterações"}
      </Button>
    </form>
  );
}
