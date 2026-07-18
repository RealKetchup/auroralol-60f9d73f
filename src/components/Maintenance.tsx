import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';

// ─── Particles ───
const Particles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w: number, h: number;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = [];
    const COUNT = 80;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill();
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export const Maintenance: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  // ─── Mouse parallax ───
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = (e.clientX - cx) / rect.width;
      const y = (e.clientY - cy) / rect.height;
      setRotateX(-y * 6);
      setRotateY(x * 6);
    };
    const handleMouseLeave = () => {
      setRotateX(0);
      setRotateY(0);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // ─── Audio handling ───
  const playAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // If currently muted, unmute and play
    if (isMuted) {
      audio.volume = 0.3;
      audio.play().catch(err => {
        // Autoplay may be blocked; ignore the error
        console.warn('Audio play failed:', err);
      });
      setIsMuted(false);
    }
  };

  // On mount, set volume but do not autoplay (user gesture required)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
    }

    // Add a one-time click listener to the document to unmute and play audio
    const handleFirstInteraction = () => {
      playAudio();
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  // ─── Toggle mute manually ───
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      // Unmute: try to play
      audio.volume = 0.3;
      audio.play().catch(err => {
        console.warn('Audio play failed:', err);
      });
      setIsMuted(false);
    } else {
      // Mute: pause
      audio.pause();
      setIsMuted(true);
    }
  };

  // ─── Handle refresh on link click ───
  const handleRefreshLink = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    e.preventDefault();
    window.location.href = to;
  };

  return (
    <>
      <style>{`
        @keyframes auroraShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes auroraFloat1 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(80px,-60px) scale(1.15); }
        }
        @keyframes auroraFloat2 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(-70px,50px) scale(1.2); }
        }
        @keyframes auroraFloat3 {
          0% { transform: translate(-50%,-50%) scale(1); }
          100% { transform: translate(-50%,-50%) translate(40px,-30px) scale(1.1); }
        }
        @keyframes auroraFloat4 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(-50px,40px) scale(1.25); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .aurora-text {
          background: linear-gradient(90deg, #8b5cf6, #22d3ee, #f472b6, #8b5cf6);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: auroraShift 6s ease-in-out infinite alternate;
        }
        .btn-aurora {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(139,92,246,0.3);
          transition: all 0.25s ease;
        }
        .btn-aurora:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(34,211,238,0.5);
          box-shadow: 0 0 30px rgba(139,92,246,0.15);
          transform: scale(1.03);
        }
        .badge-aurora {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(139,92,246,0.2);
        }
        .card-enter {
          animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .card-3d {
          transition: transform 0.1s ease-out;
          transform-style: preserve-3d;
        }
      `}</style>

      <div className="min-h-screen w-full bg-[#09090B] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute w-[700px] h-[700px] rounded-full bg-purple-500/25 blur-[140px] -top-[100px] -left-[100px] animate-[auroraFloat1_16s_ease-in-out_infinite_alternate]" />
          <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-400/25 blur-[140px] -bottom-[100px] -right-[100px] animate-[auroraFloat2_20s_ease-in-out_infinite_alternate]" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-pink-500/25 blur-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[auroraFloat3_24s_ease-in-out_infinite_alternate]" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-amber-400/25 blur-[140px] top-[20%] right-[10%] animate-[auroraFloat4_18s_ease-in-out_infinite_alternate]" />
        </div>

        <Particles />

        <div
          ref={cardRef}
          className="card-enter card-3d relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl shadow-black/30"
          style={{ transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}
        >
          {/* Audio toggle button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleMute}
              className="text-white/30 hover:text-white/60 transition-colors text-xl"
              aria-label={isMuted ? 'Unmute music' : 'Mute music'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <span className="aurora-text text-3xl font-bold">Aurora.lol</span>
          </div>

          <div className="flex justify-center mb-8">
            <span className="badge-aurora px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider text-white/70">
              Maintenance in progress
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight leading-[1.15] text-white">
            We'll be back soon.
          </h1>

          <p className="mt-4 text-center text-white/60 text-base md:text-lg max-w-sm mx-auto leading-relaxed">
            We're currently upgrading Aurora to make everything faster, smoother and more reliable. Thanks for your patience—we'll be online again shortly.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://discord.gg/wyz2Zk4xmH"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleRefreshLink(e, 'https://discord.gg/wyz2Zk4xmH')}
              className="btn-aurora rounded-full px-6 py-3 text-sm font-medium text-white/80 transition-all"
            >
              Discord
            </a>
            <Link
              to="/status"
              onClick={() => window.location.href = '/status'}
              className="btn-aurora rounded-full px-6 py-3 text-sm font-medium text-white/80 transition-all"
            >
              Status Page
            </Link>
          </div>

          <div className="mt-10 text-center text-white/30 text-sm border-t border-white/5 pt-6">
            © 2026 <span className="aurora-text">Aurora.lol</span>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} src="/music.mp3" loop />
      </div>
    </>
  );
};

export default Maintenance;
