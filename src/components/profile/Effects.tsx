import { useEffect } from "react";

export function ClickEffect({ color, style = "burst" }: { color: string; style?: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (style === "ripple") {
        const el = document.createElement("span");
        el.style.cssText = `
          position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
          width: 8px; height: 8px; border-radius: 999px;
          border: 2px solid ${color}; transform: translate(-50%, -50%);
          pointer-events: none; z-index: 9999;
          animation: ripple 0.7s ease-out forwards;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 800);
        return;
      }
      if (style === "sparkle") {
        for (let i = 0; i < 6; i++) {
          const el = document.createElement("span");
          const angle = (Math.PI * 2 * i) / 6;
          const dist = 30 + Math.random() * 20;
          el.style.cssText = `
            position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
            width: 4px; height: 4px; border-radius: 999px;
            background: ${color}; box-shadow: 0 0 8px ${color};
            pointer-events: none; z-index: 9999;
            --tx: ${Math.cos(angle) * dist}px;
            --ty: ${Math.sin(angle) * dist}px;
            animation: sparkle 0.6s ease-out forwards;
          `;
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 700);
        }
        return;
      }
      if (style === "heart") {
        const el = document.createElement("span");
        el.textContent = "♥";
        el.style.cssText = `
          position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
          color: ${color}; font-size: 22px; pointer-events: none; z-index: 9999;
          text-shadow: 0 0 12px ${color};
          transform: translate(-50%, -50%);
          animation: heart-float 0.9s ease-out forwards;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
        return;
      }
      const el = document.createElement("span");
      el.style.cssText = `
        position: fixed; left: ${e.clientX - 12}px; top: ${e.clientY - 12}px;
        width: 24px; height: 24px; border-radius: 999px;
        pointer-events: none; z-index: 9999;
        background: radial-gradient(circle, ${color}, transparent 70%);
        box-shadow: 0 0 30px ${color};
        animation: burst 0.6s ease-out forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 700);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [color, style]);
  return null;
}

export function CustomCursor({ accent, secondary }: { accent: string; secondary: string }) {
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.style.cssText = `
      position: fixed; left: 0; top: 0; width: 22px; height: 22px; border-radius: 999px;
      pointer-events: none; z-index: 9998;
      background: linear-gradient(135deg, ${accent}, ${secondary});
      box-shadow: 0 0 20px ${accent}, 0 0 40px ${secondary};
      mix-blend-mode: screen;
      opacity: 0;
      will-change: transform;
      contain: layout style paint;
    `;
    document.body.appendChild(cursor);

    let x = 0, y = 0, raf = 0, dirty = false;
    const paint = () => {
      raf = 0;
      dirty = false;
      cursor.style.transform = `translate3d(${x - 11}px, ${y - 11}px, 0)`;
    };
    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (cursor.style.opacity !== "1") cursor.style.opacity = "1";
      if (!dirty) {
        dirty = true;
        raf = requestAnimationFrame(paint);
      }
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      if (raf) cancelAnimationFrame(raf);
      cursor.remove();
    };
  }, [accent, secondary]);
  return null;
}


export function CursorTrail({ color }: { color: string }) {
  useEffect(() => {
    let last = 0;
    const move = (e: MouseEvent) => {
      const now = performance.now();
      if (now - last < 24) return;
      last = now;
      const el = document.createElement("span");
      el.style.cssText = `
        position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
        width: 8px; height: 8px; border-radius: 999px;
        background: ${color}; box-shadow: 0 0 12px ${color};
        pointer-events: none; z-index: 9997;
        transform: translate(-50%, -50%);
        animation: trail-fade 0.7s ease-out forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 800);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [color]);
  return null;
}
