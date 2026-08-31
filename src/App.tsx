import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { CheckIcon, CloseIcon, MinusIcon, ThemeIcon } from "./icons";
import "./App.css";

const appWindow = getCurrentWindow();

type Category = { name: string; count: number };

const CATEGORIES: Category[] = [
  { name: "Personal", count: 1 },
  { name: "Work", count: 0 },
  { name: "Study", count: 0 },
];

type Task = { id: number; title: string; done: boolean };

const TODAY: Task[] = [];

const UPCOMING: Task[] = [
  { id: 1, title: "Play Elden Ring Tarnished Edition", done: true },
];
function App() {
  const [category, setCategory] = useState("Work");

  return (
    <div className="flex h-screen w-full flex-col bg-void font-ui text-ink overflow-hidden rounded-[10px]">
      <header data-tauri-drag-region className="flex h-8 shrink-0 items-center justify-between border-b border-line bg-shell px-3 py-5">
        <span data-tauri-drag-region className="pointer-events-none pl-1 text-[11px] font-semibold tracking-wide">
          Todo <span className="text-amber">App</span>
        </span>
        
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => appWindow.minimize()}
            className="grid h-6 w-7 place-items-center rounded text-dim transition-colors hover:bg-hover hover:text-ink"
          >
            <MinusIcon className="h-3 w-3" />
          </button>
          <button
            onClick={() => appWindow.close()}
            className="grid h-6 w-7 place-items-center rounded text-dim transition-colors hover:bg-[#c4402f] hover:text-white"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-42 shrink-0 flex-col gap-2 border-r border-line bg-shell p-2">
          <div className="flex min-h-0 flex-1 flex-col gap-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={`flex h-7 shrink-0 items-center justify-between rounded-md px-2.5 text-left text-[11px] transition-colors ${
                  category === c.name
                    ? "bg-raised text-ink"
                    : "text-dim hover:bg-panel hover:text-ink"
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className="text-[10px] text-faint">{c.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-1">
            <button className="grid h-6 w-6 shrink-0 place-items-center rounded text-faint transition-colors hover:bg-panel hover:text-ink">
              <ThemeIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </aside>
        <main className="scroll-thin flex min-w-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
          <div className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-panel px-2.5 transition-colors focus-within:border-edge">
            <input
              placeholder="Add a task"
              className="h-full min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-faint"
            />
            {/* <kbd className="shrink-0 rounded border border-line bg-void/0 px-2 py-1 text-[9px] text-ink">
              Enter
            </kbd> */}
          </div>
          <Shelf title="Tasks" tasks={UPCOMING} />
        </main>
      </div>
    </div>
  );
}

function Shelf({ title, tasks }: { title: string; tasks: Task[] }) {
  return (
    <section className="shrink-0">
      <h2 className="mb-1.5 px-0.5 text-[12px] font-semibold text-ink">
        {title}
      </h2>

      <div className="overflow-hidden rounded-lg border border-line bg-panel">
        {tasks.map((t, i) => (
          <Row key={t.id} task={t} first={i === 0} />
        ))}
      </div>
    </section>
  );
}

function Row({ task, first }: { task: Task; first: boolean }) {
  return (
    <div
      className={`group flex justify-between h-8.5 items-center gap-2.5 px-2.5 transition-colors hover:bg-raised ${ first ? "" : "border-t border-line"}`}
    >
      <span className={`grid h-3.75 w-3.75 shrink-0 place-items-center rounded-[5px] border transition-colors ${ task.done ? "border-amber bg-amber text-void" : "border-edge group-hover:border-dim" }`}>
        {task.done && <CheckIcon className="h-2.5 w-2.5" />}
      </span>
      <span className={`min-w-0 flex-1 truncate text-[12px] ${ task.done ? "text-faint line-through" : "text-ink" }`}>
        {task.title}
      </span>
    </div>
  );
}

export default App;
