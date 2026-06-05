import type { FinancePillar } from "@/modules/finance/content/financeLearnContent";

export type LearnTrail = {
  id: string;
  title: string;
  description: string;
  pillar: FinancePillar;
  lessonIds: string[];
};

export const FINANCE_LEARN_TRAILS: LearnTrail[] = [
  {
    id: "awareness-101",
    title: "Consciência 101",
    description:
      "Património vs fluxo, hábitos nas categorias e ritual de revisão — base para decidir com calma.",
    pillar: "awareness",
    lessonIds: [
      "lesson-net-worth",
      "lesson-categories-habits",
      "lesson-review-ritual",
    ],
  },
  {
    id: "savings-101",
    title: "Poupança e protecção",
    description:
      "Primeira transferência, fundo de emergência real e o que não misturar com férias.",
    pillar: "savings",
    lessonIds: [
      "lesson-first-transfer",
      "lesson-emergency-not-vacation",
    ],
  },
  {
    id: "decisions-101",
    title: "Decisões com método",
    description:
      "Orçamento flexível, estratégias de dívida e quando investir — sem atalhos perigosos.",
    pillar: "budget",
    lessonIds: [
      "lesson-503020-flex",
      "lesson-snowball-vs-avalanche",
      "lesson-invest-after-cushion",
    ],
  },
];

export function getLearnTrail(id: string) {
  return FINANCE_LEARN_TRAILS.find((t) => t.id === id);
}

export function getTrailsForLesson(lessonId: string) {
  return FINANCE_LEARN_TRAILS.filter((t) => t.lessonIds.includes(lessonId));
}
