export const ATTRIBUTE_CONFIGS = [
  { key: "focus", label: "Focus", description: "Capacidade de concentração contínua." },
  { key: "discipline", label: "Discipline", description: "Cumprimento de rotinas e hábitos." },
  { key: "execution", label: "Execution", description: "Capacidade de concluir o que importa." },
  { key: "knowledge", label: "Knowledge", description: "Profundidade de estudo e aprendizagem." },
  { key: "creativity", label: "Creativity", description: "Exploração, síntese e novas ideias." },
  { key: "consistency", label: "Consistency", description: "Regularidade e ritmo sustentável." },
  { key: "strategy", label: "Strategy", description: "Clareza de direcção e planeamento." },
  { key: "energy", label: "Energy", description: "Capacidade de manter cadência diária." },
] as const;

export const ATTRIBUTE_KEYS = ATTRIBUTE_CONFIGS.map((attr) => attr.key);

export type AttributeKey = (typeof ATTRIBUTE_CONFIGS)[number]["key"];
export type AttributeTier = "F" | "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";

const LEGACY_ATTRIBUTE_KEYS: Record<string, AttributeKey> = {
  foco: "focus",
  disciplina: "discipline",
  execucao: "execution",
  organizacao: "strategy",
  criatividade: "creativity",
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
