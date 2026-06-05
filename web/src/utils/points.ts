const TASK_PRIORITY_POINTS: Record<string, number> = {
  Alta: 30,
  Média: 20,
  Baixa: 10,
};

const HABIT_FREQUENCY_POINTS: Record<string, number> = {
  Diário: 15,
  Semanal: 40,
};

export function parsePoints(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

export function rowPointsFromProps(
  properties: { id: string; name: string; type: string }[],
  values: Record<string, unknown>
): number {
  const pointsProp = properties.find(
    (p) => p.name.toLowerCase() === "pontos"
  );
  if (pointsProp) return parsePoints(values[pointsProp.id]);

  const statusProp = properties.find((p) => p.type === "STATUS");
  if (statusProp) {
    const status = String(values[statusProp.id] ?? "");
    if (status.toLowerCase().includes("conclu")) {
      const pri = properties.find((p) => p.name === "Prioridade");
      return TASK_PRIORITY_POINTS[String(pri ? values[pri.id] : "")] ?? 15;
    }
    return 0;
  }

  const doneProp = properties.find(
    (p) => p.type === "CHECKBOX" && p.name.toLowerCase().includes("feito")
  );
  if (doneProp && values[doneProp.id]) {
    const freq = properties.find(
      (p) => p.name === "Frequência" || p.name === "Frequencia"
    );
    return HABIT_FREQUENCY_POINTS[String(freq ? values[freq.id] : "")] ?? 10;
  }
  return 0;
}

export function formatPoints(n: number) {
  return `+${n} pt`;
}

export function pointsBadgeClass(earned: boolean) {
  return earned
    ? "border-emerald-900/60 bg-emerald-950/50 text-emerald-800 dark:text-emerald-400"
    : "border-border bg-secondary/80 text-muted-foreground";
}
