import { Fragment } from "react";
import { CheckIcon, CloseIcon } from "../icons";
import type { Task } from "../types";
import { useDragReorder } from "../useDragReorder";
import { DueDate } from "./DueDate";

export function Shelf({
  title,
  tasks,
  now,
  soon,
  muted,
  onToggle,
  onRemove,
  onDue,
  onMove,
}: {
  title: string;
  tasks: Task[];
  now: string;
  soon: string;
  muted?: boolean;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
  onDue: (id: number, due?: string, time?: string) => void;
  onMove: (id: number, targetId: number) => void;
}) {
  const ids = tasks.map((t) => t.id);
  const { rowRef, onPointerDown, dragId, at } = useDragReorder(ids, onMove);

  return (
    <section className={`shrink-0 ${muted ? "opacity-55" : ""}`}>
      <h2 className="mb-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-dim">
        {title}
      </h2>

      <div className="rounded-lg bg-transparent">
        {tasks.map((t, i) => (
          <Fragment key={t.id}>
            {at === i && <Marker />}
            <Row
              task={t}
              first={i === 0}
              now={now}
              soon={soon}
              elRef={rowRef(t.id)}
              dragging={dragId === t.id}
              onPointerDown={onPointerDown}
              onToggle={() => onToggle(t.id)}
              onRemove={() => onRemove(t.id)}
              onDue={(due, time) => onDue(t.id, due, time)}
            />
          </Fragment>
        ))}
        {at === tasks.length && <Marker />}
      </div>
    </section>
  );
}

// Zero-height so moving the drop marker never shifts the rows it is measuring
// against — that shift is what makes an insertion line flicker.
const Marker = () => (
  <div className="relative h-0">
    <div className="absolute inset-x-0 -top-px h-0.5 rounded-full bg-amber" />
  </div>
);

function Row({
  task,
  first,
  now,
  soon,
  elRef,
  dragging,
  onPointerDown,
  onToggle,
  onRemove,
  onDue,
}: {
  task: Task;
  first: boolean;
  now: string;
  soon: string;
  elRef: (el: HTMLElement | null) => void;
  dragging: boolean;
  onPointerDown: (e: React.PointerEvent, id: number) => void;
  onToggle: () => void;
  onRemove: () => void;
  onDue: (due?: string, time?: string) => void;
}) {
  // Overdue reads as grey, due today or tomorrow as amber, anything further
  // out stays quiet.
  const tone = !task.due
    ? "text-faint"
    : task.due < now
      ? "text-faint"
      : task.due <= soon
        ? "text-amber"
        : "text-dim";

  return (
    <div
      ref={elRef}
      onPointerDown={(e) => onPointerDown(e, task.id)}
      className={`group flex justify-between h-8.5 items-center gap-2.5 px-2.5 transition-[background-color,opacity] hover:bg-raised cursor-grab active:cursor-grabbing ${ dragging ? "opacity-40" : "" } ${ first ? "" : "border-t border-line"}`}
    >
      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.title}
        className={`grid h-3.75 w-3.75 shrink-0 place-items-center rounded-[5px] border transition-colors ${ task.done ? "border-amber bg-amber text-on-amber" : "border-edge hover:border-dim" }`}
      >
        {task.done && <CheckIcon className="h-2.5 w-2.5" />}
      </button>
      <span className={`min-w-0 flex-1 truncate text-[12px] ${ task.done ? "text-faint line-through" : "text-ink" }`}>
        {task.title}
      </span>
      <DueDate due={task.due} time={task.time} tone={tone} onChange={onDue} />
      <button
        onClick={onRemove}
        aria-label={`Delete ${task.title}`}
        className="grid h-4 w-4 shrink-0 place-items-center rounded text-faint opacity-0 transition hover:text-[#c4402f] focus-visible:opacity-100 group-hover:opacity-100"
      >
        <CloseIcon className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}
