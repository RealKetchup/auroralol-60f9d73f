import { useEffect } from "react";

export type FontPreset = { id: string; label: string; stack: string };

export const FONT_PRESETS: FontPreset[] = [
  { id: "space-grotesk", label: "Grotesk", stack: '"Space Grotesk Variable", ui-sans-serif, system-ui, sans-serif' },
  { id: "mono", label: "Mono", stack: '"JetBrains Mono", ui-monospace, monospace' },
  { id: "serif", label: "Serif", stack: '"Iowan Old Style", Palatino, Georgia, serif' },
  { id: "system", label: "System", stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' },
  { id: "orbitron", label: "Orbitron", stack: '"Orbitron", ui-sans-serif, sans-serif' },
  { id: "poppins", label: "Poppins", stack: '"Poppins", ui-sans-serif, sans-serif' },
  { id: "sora", label: "Sora", stack: '"Sora", ui-sans-serif, sans-serif' },
  { id: "rubik", label: "Rubik", stack: '"Rubik", ui-sans-serif, sans-serif' },
  { id: "playfair", label: "Playfair", stack: '"Playfair Display", Georgia, serif' },
  { id: "bebas", label: "Bebas", stack: '"Bebas Neue", Impact, sans-serif' },
  { id: "vibes", label: "Script", stack: '"Great Vibes", cursive' },
  { id: "pixel", label: "Pixel", stack: '"Press Start 2P", ui-monospace, monospace' },
];

/** Resolve the CSS font-family for a profile's font settings. */
export function fontStackFor(fontFamily: string, customFontName?: string | null): string {
  if (fontFamily === "custom" && customFontName) {
    return `"${customFontName.replace(/"/g, "")}", ui-sans-serif, system-ui, sans-serif`;
  }
  return FONT_PRESETS.find(f => f.id === fontFamily)?.stack ?? FONT_PRESETS[0].stack;
}

/** Injects a remote stylesheet (e.g. a Google Fonts URL) once, client-side. */
export function useRemoteFont(url?: string | null) {
  useEffect(() => {
    if (!url || !/^https:\/\//.test(url)) return;
    if (document.querySelector(`link[data-aurora-font="${url}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.dataset.auroraFont = url;
    document.head.appendChild(link);
  }, [url]);
}
