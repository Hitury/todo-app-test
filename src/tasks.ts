import type { Task } from "./types";

// Local calendar date as YYYY-MM-DD — the exact format <input type="date">
// reads and writes. Not toISOString(): that is UTC and lands on the wrong day
// for most of the world.
export const isoDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

export const today = () => isoDate(new Date());

// setDate normalizes month and year rollover, and stays correct across DST
// where adding 24h of milliseconds would not.
export const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoDate(d);
};

export const nowTime = () => new Date().toTimeString().slice(0, 5);

// Leading blank cells and day count for a calendar grid. `month` is 0-based;
// day 0 of the next month is the last day of this one, so leap years and
// 30/31-day months come out of the Date constructor rather than a table.
export const monthDays = (year: number, month: number) => ({
  blanks: new Date(year, month, 1).getDay(),
  days: new Date(year, month + 1, 0).getDate(),
});

// A dated task is overdue once its day has passed, or once its time has passed
// on the current day. Both formats compare lexicographically, so plain string
// comparison is enough. `at` defaults to midnight: nothing today is overdue
// unless a caller says what time it is.
const isOverdue = (t: Task, now: string, at: string) =>
  !!t.due && (t.due < now || (t.due === now && !!t.time && t.time < at));

// Undated tasks live in `rest`.
export const groupByDue = (tasks: Task[], now: string, at = "00:00") => ({
  due: tasks.filter((t) => t.due === now && !isOverdue(t, now, at)),
  rest: tasks.filter((t) => !t.due || t.due > now),
  past: tasks.filter((t) => isOverdue(t, now, at)),
});

// Moves `id` to `targetId`'s slot, keeping every other task's order. Dragging
// down lands after the target, dragging up lands before it — what the removal
// shifting the index does for free, and what a drag actually feels like.
export const reorder = (tasks: Task[], id: number, targetId: number): Task[] => {
  const from = tasks.findIndex((t) => t.id === id);
  const to = tasks.findIndex((t) => t.id === targetId);
  if (from < 0 || to < 0 || from === to) return tasks;
  const next = [...tasks];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};
