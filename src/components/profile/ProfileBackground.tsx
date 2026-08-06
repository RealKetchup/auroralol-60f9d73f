import { useEffect, useRef, useState } from "react";
import { isVideoSource } from "@/lib/upload";

/**
 * Full-page profile background.
 *
 * - Covers the entire viewport on desktop, tablet and mobile (no `background-attachment: fixed`,
 *   which is broken on iOS — a fixed layer with `object-fit: cover` instead).
 * - Never stretches: media keeps its aspect ratio and is centre-cropped.
 * - Always keeps text readable with a dark scrim (25–40%).
 * - Images and videos fade in once decoded, so there is no flash or layout shift.
 */
export function ProfileBackground({
  url,
  /** 0.05–1 from the editor: how visible the media is. */
  opacity = 1,
  /** Focal point for the crop, e.g. "50% 40%". */
  position = "50% 45%",
}: {
  url: string;
  opacity?: number;
  position?: string;
}) {
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = isVideoSource(url);

  // Preload + decode images off the render path so the fade-in is smooth.
  useEffect(() => {
    if (video) return;
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    const done = () => !cancelled && setReady(true);
    if (img.complete) done();
    else {
      img.onload = done;
      img.onerror = done;
    }
    return () => {
      cancelled = true;
    };
  }, [url, video]);

  // Respect reduced-motion and pause offscreen video to keep things smooth.
  useEffect(() => {
    if (!video) return;
    const el = videoRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) el.pause();
    const onVisibility = () => {
      if (document.hidden) el.pause();
      else if (!reduce) void el.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [video, url]);

  const media = Math.max(0.05, Math.min(1, opacity));
  // 25% → 40% scrim: heavier when the media itself is more visible.
  const scrim = 0.25 + media * 0.15;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      {video ? (
        <video
          ref={videoRef}
          src={url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out"
          style={{ objectPosition: position, opacity: ready ? media : 0 }}
        />
      ) : (
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            backgroundImage: `url("${url}")`,
            backgroundSize: "cover",
            backgroundPosition: position,
            backgroundRepeat: "no-repeat",
            opacity: ready ? media : 0,
            transform: "translateZ(0)",
          }}
        />
      )}

      {/* Readability scrim: flat base + soft vignette so long pages stay legible. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            oklch(0.11 0.02 280 / ${(scrim + 0.08).toFixed(3)}) 0%,
            oklch(0.11 0.02 280 / ${scrim.toFixed(3)}) 38%,
            oklch(0.11 0.02 280 / ${(scrim + 0.12).toFixed(3)}) 100%)`,
        }}
      />
    </div>
  );
}
