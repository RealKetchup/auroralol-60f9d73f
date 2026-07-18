import React, { useEffect, useRef, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

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
    const COUNT = 60;

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
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
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
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
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

export const Route = createFileRoute('/status')({
  component: StatusPage,
});

function StatusPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = (e.clientX - cx) / rect.width;
      const y = (e.clientY - cy) / rect.height;
      setRotateX(-y * 4);
      setRotateY(x * 4);
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

  const services = [
    { label: 'API', status: 'operational' },
    { label: 'Database', status: 'operational' },
    { label: 'Storage', status: 'operational' },
    { label: 'Web App', status: 'maintenance' },
    { label: 'CDN', status: 'operational' },
  ];

  const statusColors = {
    operational: 'bg-emerald-400 shadow-emerald-400/40',
    degraded: 'bg-amber-400 shadow-amber-400/40',
    outage: 'bg-red-400 shadow-red-400/40',
    maintenance: 'bg-blue-400 shadow-blue-400/40',
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
          100% { transform: translate(70px,-50px) scale(1.1); }
        }
        @keyframes auroraFloat2 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(-60px,40px) scale(1.15); }
        }
        @keyframes auroraFloat3 {
          0% { transform: translate(-50%,-50%) scale(1); }
          100% { transform: translate(-50%,-50%) translate(30px,-20px) scale(1.05); }
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
          <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-[140px] -top-[80px] -left-[80px] animate-[auroraFloat1_16s_ease-in-out_infinite_alternate]" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[140px] -bottom-[80px] -right-[80px] animate-[auroraFloat2_20s_ease-in-out_infinite_alternate]" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-pink-500/20 blur-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[auroraFloat3_24s_ease-in-out_infinite_alternate]" />
        </div>

        <Particles />

        <div
          ref={cardRef}
          className="card-enter card-3d relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl shadow-black/30"
          style={{ transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}
        >
          <div className="flex items-center justify-between mb-6">
            <span className="aurora-text text-2xl font-bold">Aurora.lol</span>
            <span className="badge-aurora px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider text-white/70">
              Status
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center mb-6">
            <div className="text-xl font-semibold text-white">All Systems Operational</div>
            <div className="text-white/30 text-sm mt-1">Last updated: July 18, 2026 — 14:32 UTC</div>
          </div>

          <div className="divide-y divide-white/10">
            {services.map((svc) => (
              <div key={svc.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-white/70 text-sm font-medium">{svc.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusColors[svc.status as keyof typeof statusColors]} shadow-lg`} />
                  <span className="text-white/80 text-sm font-medium capitalize">{svc.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="btn-aurora rounded-full px-6 py-2.5 text-sm font-medium text-white/80"
            >
              ← Back to Aurora
            </Link>
          </div>

          <div className="mt-6 text-center text-white/30 text-xs border-t border-white/5 pt-4">
            © 2026 <span className="aurora-text">Aurora.lol</span>
          </div>
        </div>
      </div>
    </>
  );
}
