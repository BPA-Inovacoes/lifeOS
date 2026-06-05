import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

import { AuthInput } from "@/modules/auth/components/AuthInput";
import { Button } from "@/components/ui/button";
import { useAccountMutations } from "@/modules/account/hooks/useAccount";
import { ApiError, flattenApiErrors } from "@/services/http";
import { errorBoxClass, techCardClass } from "@/styles/designTokens";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

export function ChangePasswordForm() {
  const { changePassword } = useAccountMutations();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("A confirmação não coincide com a nova palavra-passe.");
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success("Palavra-passe alterada");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            setError(flattenApiErrors(err) ?? err.message);
          } else {
            setError("Não foi possível alterar a palavra-passe.");
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className={cn("border p-6", techCardClass)}>
      <h2 className="text-lg font-semibold text-foreground">Segurança</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Altera a palavra-passe da tua conta LifeOS.
      </p>

      <div className="mt-6 space-y-4">
        <AuthInput
          id="current-password"
          label="Palavra-passe actual"
          icon={Lock}
          type={showCurrent ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          trailing={
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              aria-label={showCurrent ? "Ocultar" : "Mostrar"}
              onClick={() => setShowCurrent((v) => !v)}
            >
              {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
        <AuthInput
          id="new-password"
          label="Nova palavra-passe"
          icon={Lock}
          type={showNew ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          trailing={
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              aria-label={showNew ? "Ocultar" : "Mostrar"}
              onClick={() => setShowNew((v) => !v)}
            >
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
        <AuthInput
          id="confirm-password"
          label="Confirmar nova palavra-passe"
          icon={Lock}
          type={showNew ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      {error ? <p className={cn("mt-4", errorBoxClass)}>{error}</p> : null}

      <Button
        type="submit"
        variant="secondary"
        className="mt-6"
        disabled={!canSubmit || changePassword.isPending}
      >
        {changePassword.isPending ? "A alterar…" : "Alterar palavra-passe"}
      </Button>
    </form>
  );
}
