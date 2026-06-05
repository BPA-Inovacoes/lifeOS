import type { AttributeKey, AttributeSnapshot } from "./attributes";

export type PlayerClassKey =
  | "empire_builder"
  | "strategist"
  | "disciplined_monk"
  | "athlete"
  | "entrepreneur"
  | "academic"
  | "adventurer";

export type PlayerClassDef = {
  key: PlayerClassKey;
  label: string;
  description: string;
  requires: Partial<Record<AttributeKey, number>>;
};

/** Ordem: classes mais exigentes primeiro. */
export const PLAYER_CLASSES: PlayerClassDef[] = [
  {
    key: "empire_builder",
    label: "Construtor de Impérios",
    description: "Finanças e liderança ao mais alto nível.",
    requires: { finance: 90, leadership: 90 },
  },
  {
    key: "strategist",
    label: "Estratega",
    description: "Visão, planeamento e execução avançada.",
    requires: { leadership: 80, knowledge: 70 },
  },
  {
    key: "disciplined_monk",
    label: "Monge Disciplinado",
    description: "Rotina sólida com base espiritual.",
    requires: { discipline: 80, spirituality: 50 },
  },
  {
    key: "athlete",
    label: "Atleta",
    description: "Saúde e consistência física.",
    requires: { health: 70, discipline: 60 },
  },
  {
    key: "entrepreneur",
    label: "Empreendedor",
    description: "Gera riqueza e lidera projectos.",
    requires: { finance: 50, leadership: 50 },
  },
  {
    key: "academic",
    label: "Académico",
    description: "Foco em conhecimento e aprendizagem.",
    requires: { knowledge: 60 },
  },
];

export function resolvePlayerClass(attrs: AttributeSnapshot): {
  key: PlayerClassKey;
  label: string;
  description: string;
} {
  for (const playerClass of PLAYER_CLASSES) {
    const matches = Object.entries(playerClass.requires).every(([key, min]) => {
      const value = attrs[key as AttributeKey] ?? 0;
      return value >= min;
    });
    if (matches) {
      return {
        key: playerClass.key,
        label: playerClass.label,
        description: playerClass.description,
      };
    }
  }

  return {
    key: "adventurer",
    label: "Aventureiro",
    description: "Ainda a descobrir o teu caminho — continua a evoluir.",
  };
}
