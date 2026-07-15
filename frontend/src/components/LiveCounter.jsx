import { useEffect, useRef, useState } from "react";

/**
 * Animates from whatever is currently displayed to `end` every time `end`
 * changes — not just once. This matters because on first render `end` is
 * usually 0 (the API call hasn't resolved yet); the counter needs to
 * re-animate again once the real number arrives, not get stuck at 0.
 */
export default function LiveCounter({ end = 0, duration = 900, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const from = displayRef.current;
    const to = Number.isFinite(end) ? end : 0;

    if (from === to) return undefined;

    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      displayRef.current = current;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        displayRef.current = to;
        setDisplay(to);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration]);

  return (
    <span>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
