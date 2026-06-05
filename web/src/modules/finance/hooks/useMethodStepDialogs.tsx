import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AccountFormDialog } from "@/modules/finance/components/AccountFormDialog";
import { toCreateAccountBody } from "@/modules/finance/lib/accountFormPayload";
import { MovementFormDialog } from "@/modules/finance/components/MovementFormDialog";
import type { MethodStepAction } from "@/modules/finance/lib/methodStepActions";
import { useFinanceMutations } from "@/modules/finance/hooks/useFinance";
import type {
  FinanceAccount,
  FinanceAccountType,
  FinanceCategory,
  FinanceMovementType,
} from "@/services/financeApi";
import { toast } from "@/store/toastStore";

type Options = {
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  currency: string;
  defaultAccountId?: string | null;
};

export function useMethodStepDialogs({
  accounts,
  categories,
  currency,
  defaultAccountId,
}: Options) {
  const navigate = useNavigate();
  const { createAccount, createMovement } = useFinanceMutations();

  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTypePreset, setAccountTypePreset] = useState<FinanceAccountType>("CHECKING");
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementTypePreset, setMovementTypePreset] = useState<FinanceMovementType>("EXPENSE");

  const runStepAction = useCallback(
    (action: MethodStepAction) => {
      switch (action.type) {
        case "navigate":
          navigate(action.to);
          break;
        case "create-account":
          setAccountTypePreset(action.accountType);
          setAccountOpen(true);
          break;
        case "create-movement":
          setMovementTypePreset(action.movementType);
          setMovementOpen(true);
          break;
      }
    },
    [navigate]
  );

  const dialogs = (
    <>
      <AccountFormDialog
        open={accountOpen}
        loading={createAccount.isPending}
        currency={currency}
        defaultType={accountTypePreset}
        onClose={() => setAccountOpen(false)}
        onSubmit={(payload) => {
          createAccount.mutate(toCreateAccountBody(payload), {
            onSuccess: () => {
              setAccountOpen(false);
              toast.success("Conta criada");
            },
            onError: () => toast.error("Erro ao criar conta."),
          });
        }}
      />
      <MovementFormDialog
        open={movementOpen}
        loading={createMovement.isPending}
        accounts={accounts}
        categories={categories}
        currency={currency}
        defaultType={movementTypePreset}
        defaultAccountId={defaultAccountId}
        onClose={() => setMovementOpen(false)}
        onSubmit={(body) =>
          createMovement.mutate(body, {
            onSuccess: () => {
              setMovementOpen(false);
              toast.success("Movimento registado");
            },
            onError: () => toast.error("Erro ao registar."),
          })
        }
      />
    </>
  );

  return { runStepAction, dialogs };
}
