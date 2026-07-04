import { useEffect, useRef } from "react";

const PHRASES = ["aurora.lol/user"];

export function TypewriterTitle() {
  const idxRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const phrase = PHRASES[idxRef.current];
      if (!deletingRef.current) {
        charRef.current++;
        document.title = phrase.slice(0, charRef.current) + " ▍";
        if (charRef.current >= phrase.length) {
          deletingRef.current = true;
          timer = setTimeout(tick, 1600);
          return;
        }
      } else {
        charRef.current--;
        document.title = phrase.slice(0, charRef.current) + " ▍";
        if (charRef.current <= 0) {
          deletingRef.current = false;
          idxRef.current = (idxRef.current + 1) % PHRASES.length;
          timer = setTimeout(tick, 400);
          return;
        }
      }
      timer = setTimeout(tick, deletingRef.current ? 50 : 110);
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
