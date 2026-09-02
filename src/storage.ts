import type { Task } from "./types";

const CATEGORY_KEY = "prismtask.categories";
const TASK_KEY = "prismtask.tasks";

export const loadCategories = (): string[] => {
  const saved = localStorage.getItem(CATEGORY_KEY);
  return saved ? saved.split("\n") : [];
};

export const saveCategories = (categories: string[]) =>
  localStorage.setItem(CATEGORY_KEY, categories.join("\n"));

export const loadTasks = (): Task[] => {
  try {
    return JSON.parse(localStorage.getItem(TASK_KEY) ?? "[]");
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[]) =>
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
