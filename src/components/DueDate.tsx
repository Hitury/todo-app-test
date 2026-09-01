import { useState } from "react";
import { CalendarIcon, ChevronIcon } from "../icons";
import { isoDate, monthDays, today } from "../tasks";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const PANEL_W = 224; // w-56
const PANEL_H = 268;

// Keeps the panel on screen without letting an unknown viewport (innerWidth
// reads 0 while a window is still laying out) shove it into the corner.
const clamp = (v: number, max: number) => Math.max(8, max > 0 ? Math.min(v, max) : v);

// "2026-09-02" parsed as local, not UTC — new Date("2026-09-02") is midnight
// UTC and reads as the day before for anyone west of Greenwich.
const parse = (due: string) => new Date(`${due}T00:00`);

const label = (due: string, time?: string) => {
  const d = parse(due).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return time ? `${d}, ${time}` : d;
};

export function DueDate({
  due,
  time,
  tone,
  onChange,
}: {
  due?: string;
  time?: string;
  tone: string;
  onChange: (due?: string, time?: string) => void;
}) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const [view, setView] = useState(() => (due ? parse(due) : new Date()));

  const year = view.getFullYear();
  const month = view.getMonth();
  const { blanks, days } = monthDays(year, month);
  const now = today();

  const open = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setView(due ? parse(due) : new Date());
    setAt({
      x: clamp(r.right - PANEL_W, innerWidth - PANEL_W - 8),
      y: clamp(r.bottom + 6, innerHeight - PANEL_H),
    });
  };

  const shiftMonth = (by: number) => setView(new Date(year, month + by, 1));

  return (
    <>
      <button
        onClick={open}
        aria-label={due ? `Due ${label(due, time)}` : "Set a due date"}
        className={`flex shrink-0 items-center gap-1 rounded-md border border-transparent px-1.5 py-0.5 text-[10px] transition-colors hover:border-line hover:bg-raised ${tone} ${
          due || at ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <CalendarIcon className="h-2.5 w-2.5" />
        {due ? label(due, time) : "Set date"}
      </button>

      {at && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setAt(null)} />
          <div
            style={{ top: at.y, left: at.x }}
            className="fixed z-20 w-56 rounded-lg border border-line bg-panel p-2 text-[11px] shadow-lg"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <button
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="grid h-5 w-5 place-items-center rounded text-dim transition-colors hover:bg-raised hover:text-ink"
              >
                <ChevronIcon className="h-3 w-3" />
              </button>
              <span className="text-[11px] font-semibold text-ink">
                {view.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className="grid h-5 w-5 place-items-center rounded text-dim transition-colors hover:bg-raised hover:text-ink"
              >
                <ChevronIcon className="h-3 w-3 rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((d, i) => (
                <span
                  key={i}
                  className="grid h-5 place-items-center text-[9px] text-faint"
                >
                  {d}
                </span>
              ))}
              {Array.from({ length: blanks }, (_, i) => (
                <span key={`b${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => {
                const value = isoDate(new Date(year, month, i + 1));
                const selected = value === due;
                return (
                  <button
                    key={value}
                    onClick={() => {
                      onChange(value, time);
                      setAt(null);
                    }}
                    className={`grid h-6 place-items-center rounded-md text-[10px] transition-colors ${
                      selected
                        ? "bg-amber text-on-amber"
                        : value === now
                          ? "text-amber hover:bg-raised"
                          : "text-dim hover:bg-raised hover:text-ink"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center gap-2 border-t border-line pt-2">
              <label className="flex flex-1 items-center gap-1.5 text-[10px] text-faint">
                Time
                {/* Uncontrolled on purpose. A half-typed time reads as "",
                    so a controlled value would wipe the stored time between
                    keystrokes and re-assign the field, resetting its segments
                    — a two-digit hour could never land. */}
                <input
                  type="time"
                  key={due}
                  defaultValue={time ?? ""}
                  disabled={!due}
                  onChange={(e) => e.target.value && onChange(due, e.target.value)}
                  // Empty on the way out is a real clear; empty mid-edit is not.
                  onBlur={(e) => !e.target.value && time && onChange(due, undefined)}
                  className="w-full bg-transparent text-[10px] text-ink outline-none disabled:text-faint"
                />
              </label>
              <button
                onClick={() => {
                  onChange(undefined, undefined);
                  setAt(null);
                }}
                className="rounded px-1.5 py-0.5 text-[10px] text-faint transition-colors hover:bg-raised hover:text-ink"
              >
                Clear
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
