
function PanelVideo({ url, accent, glow }: { url: string; accent: string; glow: boolean }) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const ref = useRef<HTMLVideoElement>(null);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  return (
    <div className="w-full sm:w-64 shrink-0 rounded-xl overflow-hidden relative group"
         style={{
           border: `1px solid ${accent}66`,
           boxShadow: glow ? `0 14px 40px -18px ${accent}` : undefined,
         }}>
      <video
        ref={ref}
        src={url}
        autoPlay
        muted={muted}
        loop
        playsInline
        className="w-full aspect-video object-cover bg-black/40"
      />
      <div className="absolute bottom-0 inset-x-0 flex items-center gap-2 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
           style={{ background: "oklch(0.1 0.02 280 / 0.7)" }}>
        <button onClick={toggle} aria-label={playing ? "Pause video" : "Play video"}
                className="rounded-md px-2 py-1 text-xs" style={{ border: `1px solid ${accent}55`, color: accent }}>
          {playing ? "❚❚" : "▶"}
        </button>
        <button onClick={() => setMuted(m => !m)} aria-label={muted ? "Unmute video" : "Mute video"}
                className="rounded-md px-2 py-1 text-xs" style={{ border: `1px solid ${accent}55`, color: accent }}>
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
}
