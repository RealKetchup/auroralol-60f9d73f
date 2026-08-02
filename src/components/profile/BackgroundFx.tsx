import { useMemo, useEffect, useRef } from "react";

export function Particles({ count = 40, color }: { count?: number; color?: string }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 8 + Math.random() * 14,
      delay: Math.random() * 12,
      drift: (Math.random() - 0.5) * 80,
    })),
  [count]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: color || "oklch(0.85 0.28 145)",
            boxShadow: `0 0 ${p.size * 4}px ${color || "oklch(0.85 0.28 145)"}`,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            ["--drift" as never]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

export function AuroraBg({ accent, secondary }: { accent: string; secondary: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 animate-aurora" style={{
        background: `radial-gradient(ellipse 60% 50% at 20% 10%, ${accent}55, transparent 60%),
                     radial-gradient(ellipse 50% 60% at 90% 80%, ${secondary}55, transparent 60%),
                     radial-gradient(ellipse 70% 40% at 50% 110%, ${accent}33, transparent 60%)`,
        backgroundSize: "200% 200%",
      }} />
    </div>
  );
}

export function Stars({ count = 120 }: { count?: number }) {
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
    })), [count]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {stars.map(s => (
        <span key={s.id} className="absolute rounded-full bg-white" style={{
          top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size,
          opacity: 0.7,
          animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

export function Grid({ color }: { color: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{
      backgroundImage: `linear-gradient(${color}22 1px, transparent 1px),
                        linear-gradient(90deg, ${color}22 1px, transparent 1px)`,
      backgroundSize: "44px 44px",
      maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
    }} />
  );
}

export function Matrix({ color }: { color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const chars = "01アイウエオカキクケコサシスセソタチツテト";
    const fontSize = 14;
    let cols = Math.floor(w / fontSize);
    let drops = Array(cols).fill(1);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.floor(w / fontSize);
      drops = Array(cols).fill(1);
    };
    window.addEventListener("resize", onResize);
    const id = setInterval(() => {
      ctx.fillStyle = "rgba(10, 8, 20, 0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);
        if (y * fontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 60);
    return () => { clearInterval(id); window.removeEventListener("resize", onResize); };
  }, [color]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-50" />;
}

export function GradientMesh({ accent, secondary }: { accent: string; secondary: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -inset-32 blur-3xl opacity-60 animate-aurora" style={{
        background: `conic-gradient(from 0deg at 50% 50%, ${accent}, ${secondary}, ${accent})`,
      }} />
    </div>
  );
}

export function ImageBg({ url, opacity }: { url: string; opacity: number }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{
      backgroundImage: `url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      opacity,
    }} />
  );
}

/** Fullscreen looping background video (file URL or direct mp4/webm link). */
export function VideoBg({ url, opacity }: { url: string; opacity: number }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        style={{ opacity }}
      />
    </div>
  );
}

/**
 * Animated aurora veil that always tints the page with the active theme colors.
 * Intensity 0 → invisible, 1 → very saturated.
 */
export function AuroraVeil({
  accent,
  secondary,
  intensity = 0.6,
  preset = "aurora",
}: { accent: string; secondary: string; intensity?: number; preset?: string }) {
  const a = Math.max(0, Math.min(1, intensity));
  const layers: Record<string, string> = {
    aurora: `radial-gradient(ellipse 70% 45% at 15% 0%, ${accent}, transparent 62%),
             radial-gradient(ellipse 60% 55% at 88% 12%, ${secondary}, transparent 64%),
             radial-gradient(ellipse 80% 45% at 50% 105%, ${accent}, transparent 64%)`,
    ribbons: `conic-gradient(from 180deg at 30% 20%, ${accent}, transparent 35%),
              conic-gradient(from 20deg at 80% 70%, ${secondary}, transparent 40%)`,
    beams: `linear-gradient(115deg, transparent 20%, ${accent} 38%, transparent 46%),
            linear-gradient(65deg, transparent 45%, ${secondary} 62%, transparent 70%)`,
    glow: `radial-gradient(circle at 50% 50%, ${accent}, transparent 55%),
           radial-gradient(circle at 20% 80%, ${secondary}, transparent 55%)`,
  };
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -inset-24 animate-aurora-veil blur-3xl"
        style={{ background: layers[preset] ?? layers.aurora, opacity: a * 0.85, backgroundSize: "220% 220%" }}
      />
    </div>
  );
}
