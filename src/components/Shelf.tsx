import { CheckIcon, CloseIcon } from "../icons";
import type { Task } from "../types";

export function Shelf({
  title,
  tasks,
  onToggle,
  onRemove,
}: {
  title: string;
  tasks: Task[];
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <section className="shrink-0">
      <h2 className="mb-1.5 px-0.5 text-[12px] font-semibold text-ink">
        {title}
      </h2>

      <div className="overflow-hidden rounded-lg border border-none bg-transparent">
        {tasks.length === 0 ? (
          <p className="px-2.5 py-3 text-center text-[11px] text-faint">
            Nothing here yet
          </p>
        ) : (
          tasks.map((t, i) => (
            <Row
              key={t.id}
              task={t}
              first={i === 0}
              onToggle={() => onToggle(t.id)}
              onRemove={() => onRemove(t.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function Row({
  task,
  first,
  onToggle,
  onRemove,
}: {
  task: Task;
  first: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`group flex justify-between h-8.5 items-center gap-2.5 px-2.5 transition-colors hover:bg-raised ${ first ? "" : "border-t border-line"}`}
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
