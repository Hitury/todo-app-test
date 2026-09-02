import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const DURATION = 400;

// A damped spring sampled into a linear() easing. An ease-out arrives at the
// target and stops dead; this overshoots ~9% and settles, which is what reads
// as fluid. Computed once at load — 33 points is plenty for a 400ms move.
const spring = () => {
  const decay = 6.5;
  const freq = 8.5;
  const points = Array.from({ length: 33 }, (_, i) => {
    const t = i / 32;
    const y =
      1 -
      Math.exp(-decay * t) *
        (Math.cos(freq * t) + (decay / freq) * Math.sin(freq * t));
    return y.toFixed(4);
  });
  points[points.length - 1] = "1"; // land exactly on target
  return `linear(${points.join(",")})`;
};

// linear() needs a recent webview; older ones get a bezier with the same
// overshoot shape rather than the old dead stop.
const SPRING = spring();
const EASING = CSS.supports("animation-timing-function", SPRING)
  ? SPRING
  : "cubic-bezier(.34,1.3,.36,1)";

// Pointer-based reordering. HTML5 drag-and-drop refuses to start when the
// press lands on a nested control, which is why rows sometimes would not pick
// up, and it gives no hook for animating the drop.
export function useDragReorder(
  ids: number[],
  onMove: (id: number, targetId: number) => void,
) {
  const rows = useRef(new Map<number, HTMLElement>());
  const before = useRef(new Map<number, number>());
  const [drag, setDrag] = useState<{ id: number; at: number } | null>(null);

  const rowRef = (id: number) => (el: HTMLElement | null) => {
    if (el) rows.current.set(id, el);
    else rows.current.delete(id);
  };

  const onPointerDown = (e: ReactPointerEvent, id: number) => {
    // Leave the checkbox, the date button and the delete button alone.
    if (e.button !== 0 || (e.target as HTMLElement).closest("button,input")) return;
    e.preventDefault();
    setDrag({ id, at: ids.indexOf(id) });
  };

  useEffect(() => {
    if (!drag) return;

    // Insertion index = first row whose midpoint the pointer is above.
    const move = (e: PointerEvent) => {
      let at = ids.length;
      for (let i = 0; i < ids.length; i++) {
        const el = rows.current.get(ids[i]);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (e.clientY < r.top + r.height / 2) {
          at = i;
          break;
        }
      }
      // Only re-render when the slot actually changes.
      setDrag((d) => (d && d.at !== at ? { ...d, at } : d));
    };

    const up = () => {
      const { id, at } = drag;
      const from = ids.indexOf(id);
      setDrag(null);
      // Both of these land the task back where it started.
      if (from < 0 || at === from || at === from + 1) return;
      // Record where every row sits before React moves them (the F and L of
      // FLIP); the layout effect below plays the difference back.
      before.current.clear();
      rows.current.forEach((el, rowId) =>
        before.current.set(rowId, el.getBoundingClientRect().top),
      );
      onMove(id, at < from ? ids[at] : ids[at - 1]);
    };

    const cancel = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [drag, ids, onMove]);
  
  const order = ids.join();
  useLayoutEffect(() => {
    if (!before.current.size) return;
    rows.current.forEach((el, id) => {
      const prev = before.current.get(id);
      if (prev === undefined) return;
      const delta = prev - el.getBoundingClientRect().top;
      if (!delta) return;
      el.animate(
        [{ transform: `translateY(${delta}px)` }, { transform: "none" }],
        { duration: DURATION, easing: EASING },
      );
    });
    before.current.clear();
  }, [order]);

  return { rowRef, onPointerDown, dragId: drag?.id, at: drag?.at };
}
