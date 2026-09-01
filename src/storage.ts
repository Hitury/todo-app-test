import type { Task } from "./types";

const CATEGORY_KEY = "prismtask.categories";
const TASK_KEY = "prismtask.tasks";

// Categories persist as newline-separated names: no JSON overhead, and a name
// can never contain a newline because it comes from a single-line input.
export const loadCategories = (): string[] => {
  const saved = localStorage.getItem(CATEGORY_KEY);
  return saved ? saved.split("\n") : [];
};

export const saveCategories = (categories: string[]) =>
  localStorage.setItem(CATEGORY_KEY, categories.join("\n"));

// Tasks are JSON: titles are arbitrary user text and need real escaping.
// A corrupt value resets the list rather than bricking the app on load.
export const loadTasks = (): Task[] => {
  try {
    return JSON.parse(localStorage.getItem(TASK_KEY) ?? "[]");
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[]) =>
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
