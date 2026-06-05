import { useCallback, useSyncExternalStore } from "react";

import type { ClarStepId } from "@/modules/finance/content/financeLearnClar";

const STORAGE_KEY = "lifeos-finance-learn-progress";

export type LessonProgress = {
  step: ClarStepId | "done";
  quizScore?: number;
  completedAt?: string;
  updatedAt: string;
};

type LearnProgressStore = {
  lessons: Record<string, LessonProgress>;
};

function readStore(): LearnProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lessons: {} };
    const parsed = JSON.parse(raw) as LearnProgressStore;
    if (!parsed?.lessons || typeof parsed.lessons !== "object") {
      return { lessons: {} };
    }
    return parsed;
  } catch {
    return { lessons: {} };
  }
}

function writeStore(store: LearnProgressStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("lifeos-learn-progress"));
}

let cachedSnapshot = readStore();

function subscribe(onStoreChange: () => void) {
  const handler = () => {
    cachedSnapshot = readStore();
    onStoreChange();
  };
  window.addEventListener("lifeos-learn-progress", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("lifeos-learn-progress", handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot() {
  return cachedSnapshot;
}

export function useLearnProgress() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const getLessonProgress = useCallback(
    (lessonId: string): LessonProgress | undefined => store.lessons[lessonId],
    [store.lessons]
  );

  const setLessonStep = useCallback((lessonId: string, step: ClarStepId | "done") => {
    const current = readStore();
    const prev = current.lessons[lessonId];
    current.lessons[lessonId] = {
      ...prev,
      step,
      updatedAt: new Date().toISOString(),
    };
    writeStore(current);
  }, []);

  const completeLesson = useCallback((lessonId: string, quizScore: number) => {
    const current = readStore();
    current.lessons[lessonId] = {
      step: "done",
      quizScore,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeStore(current);
  }, []);

  const completedCount = Object.values(store.lessons).filter((l) => l.step === "done").length;

  const trailProgress = useCallback(
    (lessonIds: string[]) => {
      const done = lessonIds.filter((id) => store.lessons[id]?.step === "done").length;
      return { done, total: lessonIds.length };
    },
    [store.lessons]
  );

  return {
    getLessonProgress,
    setLessonStep,
    completeLesson,
    completedCount,
    trailProgress,
    totalLessons: 8,
  };
}
