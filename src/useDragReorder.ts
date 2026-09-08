import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const DURATION = 400;

const spring = () => {
  const decay = 6.5;
  const freq = 6.5;
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

const SPRING = spring();
const EASING = CSS.supports("animation-timing-function", SPRING)
  ? SPRING
  : "cubic-bezier(.34,1.3,.36,1)";

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
    if (e.button !== 0 || (e.target as HTMLElement).closest("button,input")) return;
    e.preventDefault();
    setDrag({ id, at: ids.indexOf(id) });
  };

  useEffect(() => {
    if (!drag) return;
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
      setDrag((d) => (d && d.at !== at ? { ...d, at } : d));
    };

    const up = () => {
      const { id, at } = drag;
      const from = ids.indexOf(id);
      setDrag(null);
      if (from < 0 || at === from || at === from + 1) return;
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
