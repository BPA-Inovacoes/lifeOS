import { useEffect, useState } from "react";

import { PointsCell } from "@/database/components/PointsCell";
import { RelationCell } from "@/database/components/RelationCell";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { statusBadgeClass } from "@/database/utils/statusStyles";
import { fieldClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";
import type { DatabaseProperty } from "@/types/database";

type PropertyCellProps = {
  workspaceId?: string;
  property: DatabaseProperty;
  value: unknown;
  onChange: (value: unknown) => void;
};

const selectClass = cn(fieldClass, "h-9 cursor-pointer appearance-none pr-8");

function DebouncedTextInput({
  value,
  onChange,
  type = "text",
  className,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  className?: string;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  const commit = useDebouncedCallback(onChange, 450);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <Input
      type={type}
      value={local}
      className={className}
      placeholder={placeholder}
      onChange={(e) => {
        const next = e.target.value;
        setLocal(next);
        commit(next);
      }}
      onBlur={() => {
        if (local !== value) onChange(local);
      }}
    />
  );
}

export function PropertyCell({
  workspaceId,
  property,
  value,
  onChange,
}: PropertyCellProps) {
  const options = (property.config.options as string[] | undefined) ?? [];
  const strValue = String(value ?? "");

  switch (property.type) {
    case "CHECKBOX":
      return (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(value)}
            className="size-4 rounded-none border-border accent-emerald-600"
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="font-mono text-xs uppercase text-muted-foreground">
            {Boolean(value) ? "sim" : "não"}
          </span>
        </label>
      );
    case "STATUS":
      return (
        <select
          value={strValue}
          className={cn(
            selectClass,
            statusBadgeClass(strValue || "Por fazer")
          )}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-card text-foreground">
              {opt}
            </option>
          ))}
        </select>
      );
    case "SELECT":
      return (
        <select
          value={strValue}
          className={selectClass}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" className="bg-card">
            —
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-card">
              {opt}
            </option>
          ))}
        </select>
      );
    case "RELATION":
      if (!workspaceId) {
        return (
          <span className="font-mono text-sm text-muted-foreground">—</span>
        );
      }
      return (
        <RelationCell
          workspaceId={workspaceId}
          property={property}
          value={value}
          onChange={onChange}
        />
      );
    case "DATE":
      return (
        <DateInput
          value={value ? String(value).slice(0, 10) : ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
    case "NUMBER":
      if (property.name.toLowerCase() === "pontos") {
        return (
          <PointsCell
            value={value}
            onChange={(n) => onChange(n)}
          />
        );
      }
      return (
        <DebouncedTextInput
          type="number"
          value={value === null || value === undefined ? "" : String(value)}
          className="h-9 tabular-nums"
          onChange={(raw) =>
            onChange(raw === "" ? null : Number(raw))
          }
        />
      );
    case "TEXT":
    case "EMAIL":
    case "URL":
      return (
        <DebouncedTextInput
          value={strValue}
          className="h-9"
          placeholder={
            property.type === "TEXT" ? "Nova tarefa" : "—"
          }
          onChange={(next) => onChange(next)}
        />
      );
    default:
      return (
        <DebouncedTextInput
          value={strValue}
          className="h-9"
          placeholder="—"
          onChange={(next) => onChange(next)}
        />
      );
  }
}
