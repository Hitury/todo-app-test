import { MoonIcon, ThemeIcon } from "../icons";
import { useTheme } from "../theme";
import type { Edit } from "../types";

export function Sidebar({
  categories,
  selected,
  onSelect,
  edit,
  setEdit,
  onCommit,
  onMenu,
}: {
  categories: string[];
  selected: string;
  onSelect: (name: string) => void;
  edit: Edit | null;
  setEdit: (edit: Edit | null) => void;
  onCommit: () => void;
  onMenu: (name: string, x: number, y: number) => void;
}) {
  const { theme, toggle } = useTheme();

  const editor = edit && (
    <input
      key="edit"
      autoFocus
      value={edit.text}
      onChange={(e) => setEdit({ of: edit.of, text: e.target.value })}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit();
        if (e.key === "Escape") setEdit(null);
      }}
      placeholder="Name"
      className="h-7 w-full shrink-0 rounded-md bg-raised px-2.5 text-[11px] text-ink outline-none placeholder:text-faint"
    />
  );

  return (
    <aside className="flex w-42 shrink-0 flex-col gap-2 border-r border-line bg-shell p-3">
      <div className="scroll-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {categories.map((c) =>
          edit?.of === c ? (
            editor
          ) : (
            <button
              key={c}
              onClick={() => onSelect(c)}
              onContextMenu={(e) => {
                e.preventDefault();
                onMenu(
                  c,
                  e.clientX,
                  Math.max(0, Math.min(e.clientY, innerHeight - 64)),
                );
              }}
              className={`flex h-7 shrink-0 items-center justify-between rounded-md px-2.5 text-left text-[11px] transition-colors ${
                selected === c
                  ? "bg-raised text-ink"
                  : "text-dim hover:bg-panel hover:text-ink"
              }`}
            >
              <span className="truncate">{c}</span>
            </button>
          ),
        )}

        {edit?.of === null ? (
          editor
        ) : (
          <button
            onClick={() => setEdit({ of: null, text: "" })}
            className="flex h-7 shrink-0 items-center rounded-md px-2.5 text-left text-[11px] text-faint transition-colors hover:bg-panel hover:text-ink"
          >
            + New category
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 p-1">
        <button
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-faint transition-colors hover:bg-panel hover:text-ink"
        >
          {theme === "dark" ? (
            <ThemeIcon className="h-3.5 w-3.5" />
          ) : (
            <MoonIcon className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </aside>
  );
}
