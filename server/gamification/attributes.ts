/**
 * Atributos RPG v1 — 7 eixos de vida (LifeOS RPG System).
 * @see docs/LIFEOS-RPG.md
 */

export const ATTRIBUTE_CONFIGS = [
  {
    key: "knowledge",
    label: "Conhecimento",
    description: "Estudos, leitura, cursos e formação.",
    emoji: "📚",
  },
  {
    key: "finance",
    label: "Finanças",
    description: "Capacidade de gerar riqueza e cumprir metas financeiras.",
    emoji: "💰",
  },
  {
    key: "leadership",
    label: "Liderança",
    description: "Gestão, comunicação, projectos e equipas.",
    emoji: "🏢",
  },
  {
    key: "discipline",
    label: "Disciplina",
    description: "Consistência, hábitos e cumprimento diário.",
    emoji: "⚔",
  },
  {
    key: "relationships",
    label: "Relacionamentos",
    description: "Família, networking e actividades sociais.",
    emoji: "❤️",
  },
  {
    key: "spirituality",
    label: "Espiritualidade",
    description: "Crescimento espiritual e momentos de reflexão.",
    emoji: "✝",
  },
  {
    key: "health",
    label: "Saúde",
    description: "Exercício, sono e bem-estar físico.",
    emoji: "💪",
  },
] as const;

export const ATTRIBUTE_KEYS = ATTRIBUTE_CONFIGS.map((attr) => attr.key);

export type AttributeKey = (typeof ATTRIBUTE_CONFIGS)[number]["key"];
export type AttributeTier = "F" | "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";

/** Chaves v0 (produtividade genérica) → v1 com peso de migração. */
export const V0_ATTRIBUTE_MIGRATION: Record<
  string,
  { target: AttributeKey; weight: number }[]
> = {
  focus: [{ target: "discipline", weight: 1 }],
  execution: [
    { target: "leadership", weight: 0.7 },
    { target: "discipline", weight: 0.3 },
  ],
  strategy: [{ target: "leadership", weight: 1 }],
  creativity: [{ target: "knowledge", weight: 1 }],
  consistency: [{ target: "discipline", weight: 1 }],
  energy: [{ target: "health", weight: 1 }],
  knowledge: [{ target: "knowledge", weight: 1 }],
  discipline: [{ target: "discipline", weight: 1 }],
  finance: [{ target: "finance", weight: 1 }],
  leadership: [{ target: "leadership", weight: 1 }],
  relationships: [{ target: "relationships", weight: 1 }],
  spirituality: [{ target: "spirituality", weight: 1 }],
  health: [{ target: "health", weight: 1 }],
};

const LEGACY_ATTRIBUTE_KEYS: Record<string, AttributeKey> = {
  foco: "discipline",
  disciplina: "discipline",
  execucao: "leadership",
  execução: "leadership",
  organizacao: "leadership",
  organização: "leadership",
  criatividade: "knowledge",
  conhecimento: "knowledge",
  financas: "finance",
  finanças: "finance",
  lideranca: "leadership",
  liderança: "leadership",
  relacionamentos: "relationships",
  espiritualidade: "spirituality",
  saude: "health",
  saúde: "health",
};

export function normalizeAttributeKey(key: string): AttributeKey | null {
  const normalized = key.trim().toLowerCase();
  const canonical = ATTRIBUTE_KEYS.find((attr) => attr === normalized);
  if (canonical) return canonical;
  return LEGACY_ATTRIBUTE_KEYS[normalized] ?? null;
}

export function attributeLabel(key: string): string {
  return ATTRIBUTE_CONFIGS.find((attr) => attr.key === key)?.label ?? key;
}

export function attributeTier(value: number): AttributeTier {
  if (value >= 950) return "SSS";
  if (value >= 700) return "SS";
  if (value >= 480) return "S";
  if (value >= 320) return "A";
  if (value >= 200) return "B";
  if (value >= 120) return "C";
  if (value >= 60) return "D";
  if (value >= 25) return "E";
  return "F";
}

export type AttributeSnapshot = Partial<Record<AttributeKey, number>>;

/** Migra valores de chaves antigas para o mapa v1 (sem persistir). */
export function mergeLegacyAttributeValues(
  rows: { key: string; value: number }[]
): Record<AttributeKey, number> {
  const merged = Object.fromEntries(
    ATTRIBUTE_KEYS.map((key) => [key, 0])
  ) as Record<AttributeKey, number>;

  for (const row of rows) {
    const canonical = normalizeAttributeKey(row.key);
    if (canonical && ATTRIBUTE_KEYS.includes(canonical)) {
      merged[canonical] += row.value;
      continue;
    }

    const routes = V0_ATTRIBUTE_MIGRATION[row.key.toLowerCase()];
    if (!routes) continue;

    for (const route of routes) {
      merged[route.target] += row.value * route.weight;
    }
  }

  return merged;
}
