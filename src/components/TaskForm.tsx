import { useState, type FormEvent } from "react";

export function TaskForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [draft, setDraft] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    onAdd(title);
    setDraft("");
  };

  return (
    <form
      onSubmit={submit}
      className="flex h-7.5 shrink-0 items-center gap-2 rounded-lg border border-line bg-panel px-2.5 transition-colors focus-within:border-edge"
    >
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add a task"
        className="h-full min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-faint"
      />
      {/* <kbd className="shrink rounded border border-line bg-void/20 px-2 py-0.5 text-[9px] text-ink">
        Enter
      </kbd> */}
    </form>
  );
}
