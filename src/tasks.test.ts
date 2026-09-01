import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  daysFromNow,
  groupByDue,
  isoDate,
  monthDays,
  reorder,
  today,
} from "./tasks.ts";
import type { Task } from "./types.ts";

const task = (id: number, due?: string, time?: string): Task => ({
  id,
  title: `t${id}`,
  done: false,
  category: "c",
  due,
  time,
});

test("isoDate uses the local calendar day, not UTC", () => {
  // 23:30 local on the 5th is already the 6th in UTC east of Greenwich, and
  // still the 5th west of it. The label must follow the local calendar.
  assert.equal(isoDate(new Date(2026, 2, 5, 23, 30)), "2026-03-05");
  assert.equal(isoDate(new Date(2026, 2, 5, 0, 30)), "2026-03-05");
  assert.equal(isoDate(new Date(2026, 0, 9)), "2026-01-09", "pads month/day");
});

test("daysFromNow rolls over months and years", () => {
  assert.equal(daysFromNow(0), today());
  assert.notEqual(daysFromNow(1), today());
  // setDate normalizes: Dec 31 + 1 day is next year, not day 32.
  const d = new Date(2026, 11, 31);
  d.setDate(d.getDate() + 1);
  assert.equal(isoDate(d), "2027-01-01");
});

test("groupByDue splits past, today and the rest", () => {
  const tasks = [
    task(1, "2026-03-04"), // past
    task(2, "2026-03-05"), // today
    task(3, "2026-03-06"), // upcoming
    task(4), // undated
  ];
  const g = groupByDue(tasks, "2026-03-05");
  assert.deepEqual(g.past.map((t) => t.id), [1]);
  assert.deepEqual(g.due.map((t) => t.id), [2]);
  assert.deepEqual(g.rest.map((t) => t.id), [3, 4], "undated counts as rest");
  // Every task lands in exactly one bucket.
  assert.equal(g.past.length + g.due.length + g.rest.length, tasks.length);
});

test("reorder moves a task and leaves the others in order", () => {
  const tasks = [task(1), task(2), task(3), task(4)];
  const ids = (ts: Task[]) => ts.map((t) => t.id);
  assert.deepEqual(ids(reorder(tasks, 1, 3)), [2, 3, 1, 4], "down: after target");
  assert.deepEqual(ids(reorder(tasks, 4, 2)), [1, 4, 2, 3], "up: before target");
  assert.equal(reorder(tasks, 2, 2), tasks, "same task is a no-op");
  assert.equal(reorder(tasks, 9, 1), tasks, "unknown id is a no-op");
  assert.deepEqual(ids(tasks), [1, 2, 3, 4], "input is never mutated");
});

test("groupByDue treats a passed time on the current day as overdue", () => {
  const tasks = [
    task(1, "2026-03-05", "09:00"), // today, already passed
    task(2, "2026-03-05", "18:00"), // today, still ahead
    task(3, "2026-03-05"), // today, no time
  ];
  const g = groupByDue(tasks, "2026-03-05", "15:30");
  assert.deepEqual(g.past.map((t) => t.id), [1]);
  assert.deepEqual(g.due.map((t) => t.id), [2, 3], "untimed today is never late");
  assert.equal(g.rest.length, 0);
  // Default: without a clock time, nothing today counts as overdue.
  assert.equal(groupByDue(tasks, "2026-03-05").past.length, 0);
});

test("monthDays counts leap years and lands the first day correctly", () => {
  // 1 Feb 2024 was a Thursday, and Feb 2024 had 29 days.
  assert.deepEqual(monthDays(2024, 1), { blanks: 4, days: 29 });
  assert.equal(monthDays(2026, 1).days, 28);
  assert.equal(monthDays(2000, 1).days, 29, "century leap year");
  assert.equal(monthDays(1900, 1).days, 28, "century non-leap year");
  assert.equal(monthDays(2026, 3).days, 30, "April");
});
