export type Prop = { id: string; name: string; type: string; config?: unknown };

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

export function suggestTaskPoints(priority: string): number {
  return TASK_PRIORITY_POINTS[priority] ?? 15;
}

export function suggestHabitPoints(frequency: string): number {
  return HABIT_FREQUENCY_POINTS[frequency] ?? 10;
}

export function findProp(properties: Prop[], name: string) {
  return properties.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
}

export function isTaskCompleted(status: string) {
  return status.toLowerCase().includes("conclu");
}

export function isGoalCompleted(status: string) {
  return status.toLowerCase().includes("atingido");
}

export function isStudyCompleted(status: string) {
  return status.toLowerCase().includes("dominado");
}

export function isClientClosed(status: string) {
  return status.toLowerCase().includes("fechado");
}

export function suggestClientPoints(valueEuro: unknown): number {
  const n = parsePoints(valueEuro);
  if (n >= 10000) return 500;
  if (n >= 5000) return 400;
  if (n >= 1000) return 300;
  if (n >= 500) return 250;
  return 300;
}

export function applyRowPoints(
  template: string,
  properties: Prop[],
  values: Record<string, unknown>,
  previous?: Record<string, unknown>
): Record<string, unknown> {
  const out = { ...values };
  const pointsProp = findProp(properties, "Pontos");
  if (!pointsProp) return out;

  if (template === "TASKS") {
    const priorityProp = findProp(properties, "Prioridade");
    const statusProp = properties.find((p) => p.type === "STATUS");
    const priority = priorityProp
      ? String(out[priorityProp.id] ?? "")
      : "";
    const suggested = suggestTaskPoints(priority);

    const priorityChanged =
      priorityProp &&
      previous &&
      String(previous[priorityProp.id] ?? "") !== priority;

    const pointsTouched =
      previous &&
      String(previous[pointsProp.id] ?? "") !== String(out[pointsProp.id] ?? "");

    if (
      out[pointsProp.id] === null ||
      out[pointsProp.id] === undefined ||
      out[pointsProp.id] === "" ||
      priorityChanged
    ) {
      out[pointsProp.id] = suggested;
    }

    const statusChanged =
      statusProp &&
      previous &&
      String(previous[statusProp.id] ?? "") !== String(out[statusProp.id] ?? "");

    if (
      statusProp &&
      isTaskCompleted(String(out[statusProp.id] ?? "")) &&
      statusChanged &&
      !pointsTouched
    ) {
      const base = parsePoints(out[pointsProp.id]) || suggested;
      if (base < suggested) out[pointsProp.id] = suggested;
    }
  }

  if (template === "HABITS") {
    const freqProp = findProp(properties, "Frequência") ?? findProp(properties, "Frequencia");
    const frequency = freqProp ? String(out[freqProp.id] ?? "") : "";
    const suggested = suggestHabitPoints(frequency);

    const freqChanged =
      freqProp &&
      previous &&
      String(previous[freqProp.id] ?? "") !== frequency;

    if (
      out[pointsProp.id] === null ||
      out[pointsProp.id] === undefined ||
      out[pointsProp.id] === "" ||
      freqChanged
    ) {
      out[pointsProp.id] = suggested;
    }
  }

  if (template === "CLIENTS") {
    const valueProp =
      findProp(properties, "Valor (€)") ??
      findProp(properties, "Valor") ??
      findProp(properties, "Valor EUR");
    const value = valueProp ? out[valueProp.id] : 0;
    const suggested = suggestClientPoints(value);

    if (
      out[pointsProp.id] === null ||
      out[pointsProp.id] === undefined ||
      out[pointsProp.id] === ""
    ) {
      out[pointsProp.id] = suggested;
    }
  }

  return out;
}

export function rowPoints(
  properties: Prop[],
  values: Record<string, unknown>
): number {
  const pointsProp = findProp(properties, "Pontos");
  if (pointsProp) return parsePoints(values[pointsProp.id]);

  if (properties.some((p) => p.type === "STATUS")) {
    const statusProp = properties.find((p) => p.type === "STATUS")!;
    const priorityProp = findProp(properties, "Prioridade");
    const status = String(values[statusProp.id] ?? "");
    if (isTaskCompleted(status)) {
      const priority = priorityProp
        ? String(values[priorityProp.id] ?? "")
        : "";
      return suggestTaskPoints(priority);
    }
    return 0;
  }

  const freqProp =
    findProp(properties, "Frequência") ?? findProp(properties, "Frequencia");
  const doneProp = properties.find(
    (p) => p.type === "CHECKBOX" && p.name.toLowerCase().includes("feito")
  );
  if (doneProp && Boolean(values[doneProp.id])) {
    const freq = freqProp ? String(values[freqProp.id] ?? "") : "";
    return suggestHabitPoints(freq);
  }

  const statusProp = properties.find((p) => p.type === "STATUS");
  if (statusProp && isClientClosed(String(values[statusProp.id] ?? ""))) {
    const pointsProp = findProp(properties, "Pontos");
    const valueProp =
      findProp(properties, "Valor (€)") ??
      findProp(properties, "Valor") ??
      findProp(properties, "Valor EUR");
    const stored = pointsProp ? parsePoints(values[pointsProp.id]) : 0;
    if (stored > 0) return stored;
    return suggestClientPoints(valueProp ? values[valueProp.id] : 0);
  }

  return 0;
}
