import { useEffect, useState } from "react";



import { AppModal } from "@/components/AppModal";

import {

  FinanceButton,

  FinanceDateInput,

  FinanceInput,

  FinanceSelect,

} from "@/modules/finance/components/finance-ui";

import {

  financeChipActiveClass,

  financeChipIdleClass,

  financeLabelClass,

  financeModalClass,

} from "@/modules/finance/styles/financeTokens";
import { detectClientDefaultCurrency } from "@/modules/finance/financeLocale";
import {
  currencyAmountLabel,

  type FinanceAccount,

  type FinanceCategory,

  type FinanceMovementType,

} from "@/services/financeApi";

import { cn } from "@/lib/utils";



type Props = {

  open: boolean;

  loading?: boolean;

  accounts: FinanceAccount[];

  categories: FinanceCategory[];

  defaultType?: FinanceMovementType;

  defaultAccountId?: string | null;

  defaultAmount?: number;

  defaultCategoryId?: string;

  defaultNote?: string;

  defaultDate?: string;

  linkedClientRowId?: string;

  defaultTransferDestId?: string | null;

  title?: string;

  subtitle?: string;

  lockType?: boolean;

  currency?: string;

  onClose: () => void;

  onSubmit: (body: Record<string, unknown>) => void;

};



export function MovementFormDialog({

  open,

  loading,

  accounts,

  categories,

  defaultType = "EXPENSE",

  defaultAccountId,

  defaultAmount,

  defaultCategoryId,

  defaultNote,

  defaultDate,

  linkedClientRowId,

  defaultTransferDestId,

  title = "Registar movimento",

  subtitle,

  lockType = false,

  currency = detectClientDefaultCurrency(),

  onClose,

  onSubmit,

}: Props) {

  const [type, setType] = useState<FinanceMovementType>(defaultType);

  const [accountId, setAccountId] = useState("");

  const [destId, setDestId] = useState("");

  const [amount, setAmount] = useState("");

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [categoryId, setCategoryId] = useState("");

  const [note, setNote] = useState("");



  useEffect(() => {

    if (!open) return;

    setType(defaultType);

    setAccountId(defaultAccountId ?? accounts[0]?.id ?? "");

    setDestId(
      defaultTransferDestId ??
        accounts.find((a) => a.id !== defaultAccountId)?.id ??
        ""
    );

    setAmount(defaultAmount != null ? String(defaultAmount) : "");

    setDate(defaultDate ?? new Date().toISOString().slice(0, 10));

    setCategoryId(defaultCategoryId ?? "");

    setNote(defaultNote ?? "");

  }, [
    open,
    defaultType,
    defaultAccountId,
    defaultTransferDestId,
    defaultAmount,
    defaultCategoryId,
    defaultNote,
    defaultDate,
    accounts,
  ]);



  const filteredCategories = categories.filter((c) =>

    type === "INCOME" ? c.kind === "INCOME" : c.kind === "EXPENSE"

  );



  const submit = () => {

    const parsed = parseFloat(amount.replace(",", "."));

    if (!accountId || Number.isNaN(parsed) || parsed <= 0) return;



    if (type === "TRANSFER") {

      if (!destId || destId === accountId) return;

      onSubmit({

        type,

        accountId,

        transferDestAccountId: destId,

        amount: parsed,

        date,

        note: note || undefined,

      });

      return;

    }



    if (type === "ADJUSTMENT") {

      if (!note.trim()) return;

      onSubmit({ type, accountId, amount: parsed, date, note: note.trim() });

      return;

    }



    onSubmit({

      type,

      accountId,

      amount: parsed,

      date,

      categoryId: categoryId || undefined,

      linkedClientRowId: type === "INCOME" ? linkedClientRowId : undefined,

      note: note || undefined,

    });

  };



  return (

    <AppModal

      open={open}

      onClose={onClose}

      disabled={loading}

      ariaLabel="Registar movimento"

      panelClassName={financeModalClass}

    >

      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}

      {!lockType ? (
      <div className="mt-4 flex flex-wrap gap-2">

        {(["EXPENSE", "INCOME", "TRANSFER", "ADJUSTMENT"] as const).map((t) => (

          <button

            key={t}

            type="button"

            className={cn(

              "border px-2 py-1 font-mono text-xs uppercase transition-colors",

              type === t ? financeChipActiveClass : financeChipIdleClass

            )}

            onClick={() => setType(t)}

          >

            {t === "EXPENSE" ? "Despesa" : t === "INCOME" ? "Receita" : t === "TRANSFER" ? "Transferir" : "Ajuste"}

          </button>

        ))}

      </div>
      ) : null}

      <div className="mt-4 space-y-3">

        <div>

          <label className={financeLabelClass}>Conta{type === "TRANSFER" ? " origem" : ""}</label>

          <FinanceSelect className="mt-1" value={accountId} onChange={(e) => setAccountId(e.target.value)}>

            {accounts.map((a) => (

              <option key={a.id} value={a.id}>

                {a.name}

              </option>

            ))}

          </FinanceSelect>

        </div>



        {type === "TRANSFER" ? (

          <div>

            <label className={financeLabelClass}>Conta destino</label>

            <FinanceSelect className="mt-1" value={destId} onChange={(e) => setDestId(e.target.value)}>

              {accounts.filter((a) => a.id !== accountId).map((a) => (

                <option key={a.id} value={a.id}>

                  {a.name}

                </option>

              ))}

            </FinanceSelect>

          </div>

        ) : null}



        <div className="grid grid-cols-2 gap-3">

          <div>

            <label className={financeLabelClass}>{currencyAmountLabel(currency)}</label>

            <FinanceInput inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />

          </div>

          <div>

            <label className={financeLabelClass}>Data</label>

            <FinanceDateInput value={date} onChange={(e) => setDate(e.target.value)} />

          </div>

        </div>



        {(type === "EXPENSE" || type === "INCOME") && (

          <div>

            <label className={financeLabelClass}>Categoria</label>

            <FinanceSelect className="mt-1" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>

              <option value="">—</option>

              {filteredCategories.map((c) => (

                <option key={c.id} value={c.id}>

                  {c.name}

                </option>

              ))}

            </FinanceSelect>

          </div>

        )}



        <div>

          <label className={financeLabelClass}>Nota{type === "ADJUSTMENT" ? " (obrigatória)" : ""}</label>

          <FinanceInput value={note} onChange={(e) => setNote(e.target.value)} />

        </div>

      </div>



      <div className="mt-6 flex gap-2">

        <FinanceButton type="button" className="flex-1" disabled={loading} onClick={submit}>

          Guardar

        </FinanceButton>

        <FinanceButton type="button" variant="outline" disabled={loading} onClick={onClose}>

          Cancelar

        </FinanceButton>

      </div>

    </AppModal>

  );

}

