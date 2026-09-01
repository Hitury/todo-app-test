import { getCurrentWindow } from "@tauri-apps/api/window";
import { CloseIcon, MinusIcon } from "../icons";

const appWindow = getCurrentWindow();

export function TitleBar() {
  return (
    <header data-tauri-drag-region className="flex h-8 shrink-0 items-center justify-between border-b border-line bg-shell px-3 py-5">
      <span data-tauri-drag-region className="pointer-events-none pl-1 text-[13px] font-bold tracking-wide">
        Prism<span className="text-amber">Task</span>
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
  );
}
