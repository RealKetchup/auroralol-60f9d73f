import React, { useEffect, useRef, useState } from 'react';

export const Maintenance: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.25;
    audio.loop = true;
    audio.play().catch(() => setIsMuted(true));

    const onInteract = () => {
      if (audio.paused) {
        audio.play().then(() => setIsMuted(false)).catch(() => {});
      }
      document.removeEventListener('click', onInteract);
    };
    document.addEventListener('click', onInteract);
    return () => document.removeEventListener('click', onInteract);
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsMuted(false)).catch(() => {});
    } else {
      audio.pause();
      setIsMuted(true);
    }
  };

  return (
    <>
      <style>{`
        @keyframes mDrift {
          0%   { transform: translate3d(0,0,0) scale(1); }
          100% { transform: translate3d(6%, -6%, 0) scale(1.12); }
        }
        @keyframes mRise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mSweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(320%); }
        }
        .m-rise { animation: mRise .7s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <main className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0C] text-white flex items-center justify-center px-6">
        {/* soft aurora wash */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-40 -left-32 h-[560px] w-[560px] rounded-full blur-[160px]"
            style={{ background: 'rgba(139,92,246,0.20)', animation: 'mDrift 26s ease-in-out infinite alternate' }}
          />
          <div
            className="absolute -bottom-48 -right-24 h-[520px] w-[520px] rounded-full blur-[170px]"
            style={{ background: 'rgba(88,60,190,0.18)', animation: 'mDrift 34s ease-in-out infinite alternate-reverse' }}
          />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 72%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 72%)',
            }}
          />
        </div>

        <section className="m-rise relative z-10 w-full max-w-xl">
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-9 sm:p-12 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <header className="flex items-center justify-between">
              <span className="font-mono text-sm tracking-tight text-white/80">aurora.lol</span>
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Play music' : 'Pause music'}
                className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:border-white/25 hover:text-white/80"
              >
                {isMuted ? 'sound off' : 'sound on'}
              </button>
            </header>

            <div className="mt-10 flex items-center gap-2.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                Scheduled maintenance
              </span>
            </div>

            <h1 className="mt-5 text-[2.5rem] leading-[1.08] font-semibold tracking-tight sm:text-5xl">
              We&apos;re making things
              <br />
              <span className="text-violet-300">a little better.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/50">
              Profiles are briefly offline while we ship an update. Nothing is lost — everything
              will be exactly where you left it.
            </p>

            {/* indeterminate progress */}
            <div className="mt-9 h-px w-full overflow-hidden bg-white/10">
              <div
                className="h-px w-1/3 bg-gradient-to-r from-transparent via-violet-400 to-transparent"
                style={{ animation: 'mSweep 2.4s linear infinite' }}
              />
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="/status"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-85"
              >
                Status page
              </a>
              <a
                href="https://discord.gg/wyz2Zk4xmH"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white"
              >
                Discord
              </a>
            </div>

            <footer className="mt-10 border-t border-white/[0.06] pt-5 font-mono text-[11px] text-white/25">
              © 2026 aurora.lol
            </footer>
          </div>
        </section>

        <audio ref={audioRef} src="/music.mp3" loop />
      </main>
    </>
  );
};

export default Maintenance;
