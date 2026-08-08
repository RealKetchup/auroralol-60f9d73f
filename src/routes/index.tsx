import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rememberAuthNext } from "@/lib/auth-flow";
import { badgeIcon, tierRing, TIER_LABEL, type Badge } from "@/lib/badges";
import {
  ArrowRight, Music, Sparkles, MessageCircle, Gamepad2, Link as LinkIcon, Wand2,
  Type, Palette, Image as ImageIcon, Shield,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "aurora.lol — your link-in-bio, with badges" },
      { name: "description", content: "Claim aurora.lol/you: neon glass profile, custom colors and fonts, panel backgrounds, music, live Discord status, a guestbook, and 30+ badges to collect. Free." },
      { property: "og:title", content: "aurora.lol — your link-in-bio, with badges" },
      { property: "og:description", content: "Neon glass profiles with music, Discord status, a guestbook and 30+ collectible badges. Free forever." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://auroralol.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "aurora.lol — your link-in-bio, with badges" },
      { name: "twitter:description", content: "Neon glass profiles with music, Discord status, a guestbook and 30+ collectible badges." },
    ],
    links: [{ rel: "canonical", href: "https://auroralol.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "aurora.lol",
          url: "https://auroralol.lovable.app/",
          description: "Neon glass link-in-bio profiles with music, Discord status, guestbook and collectible badges.",
        }),
      },
    ],
  }),
  component: Landing,
});

const PALETTES = [
  { id: "aurora", label: "aurora", accent: "#a855f7", second: "#22c55e" },
  { id: "ember", label: "ember", accent: "#f97316", second: "#ef4444" },
  { id: "cyber", label: "cyber", accent: "#22d3ee", second: "#a855f7" },
  { id: "matrix", label: "matrix", accent: "#22c55e", second: "#16a34a" },
  { id: "bubblegum", label: "bubblegum", accent: "#ec4899", second: "#f472b6" },
  { id: "royal", label: "royal", accent: "#eab308", second: "#7c3aed" },
];

const FEATURES = [
  { icon: ImageIcon, t: "Panel backgrounds", d: "Drop an image behind your name panel and dial in the opacity." },
  { icon: Sparkles, t: "Animated aurora", d: "Aurora, ribbons, beams or glow — recolored by your own palette." },
  { icon: Type, t: "Fonts, your way", d: "Twelve presets or paste any Google Fonts URL." },
  { icon: Music, t: "Background music", d: "Upload an MP3, paste a link, or use the free library." },
  { icon: Gamepad2, t: "Roblox avatar sync", d: "Link your Roblox profile and your headshot becomes your picture." },
  { icon: MessageCircle, t: "Live Discord", d: "Real-time presence through Lanyard, right on your page." },
  { icon: LinkIcon, t: "Auto link icons", d: "Roblox, YouTube, TikTok, Discord and more detected for you." },
  { icon: Wand2, t: "Click & cursor FX", d: "Bursts, ripples, sparkles, hearts, trails, gradient cursors." },
  { icon: Palette, t: "Total theme control", d: "Colors, blur, opacity, glow, tilt, avatar shape, animations." },
];

const STEPS = [
  { n: "01", t: "Sign in with Google", d: "One tap. No passwords, no email confirmation dance." },
  { n: "02", t: "Claim your username", d: "aurora.lol/you — yours the second you save it." },
  { n: "03", t: "Make it yours", d: "Colors, fonts, music, panel background, effects. All free." },
  { n: "04", t: "Collect badges", d: "Every feature you use unlocks something. Equip your favorites." },
];

function Landing() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  const [pi, setPi] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [taken, setTaken] = useState<string[]>([]);
  const [claim, setClaim] = useState("");
  const p = PALETTES[pi];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    supabase.from("badges").select("*").order("sort").then(({ data }) => setBadges((data || []) as Badge[]));
    supabase.from("profiles").select("username").eq("banned", false).limit(24)
      .then(({ data }) => setTaken((data || []).map(d => d.username)));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPi(i => (i + 1) % PALETTES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const start = async () => {
    if (signedIn) return navigate({ to: "/dashboard" });
    rememberAuthNext("/dashboard");
    navigate({ to: "/auth" });
  };

  const marquee = (taken.length ? taken : ["nova", "kira", "echo", "void", "lumi", "zed", "aster", "nyx"])
    .concat(taken.length ? taken : ["nova", "kira", "echo", "void", "lumi", "zed", "aster", "nyx"]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* side rail */}
      <div aria-hidden className="pointer-events-none fixed left-0 top-0 bottom-0 w-[3px] -z-0"
           style={{ background: `linear-gradient(to bottom, ${p.accent}, ${p.second})`, transition: "background 900ms" }} />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10"
           style={{
             background: `radial-gradient(1200px 600px at -10% -10%, ${p.accent}22, transparent 70%),
                          radial-gradient(900px 500px at 110% 20%, ${p.second}1f, transparent 70%)`,
             transition: "background 900ms",
           }} />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06]"
           style={{
             backgroundImage: `linear-gradient(${p.accent} 1px, transparent 1px), linear-gradient(90deg, ${p.accent} 1px, transparent 1px)`,
             backgroundSize: "72px 72px",
           }} />

      {/* header */}
      <header className="relative z-10 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center gap-4">
          <Link to="/" className="font-mono text-sm font-bold tracking-tight">
            aurora<span style={{ color: p.accent }}>.lol</span>
          </Link>
          <span className="hidden sm:inline text-[11px] font-mono text-muted-foreground">/ profiles that glow</span>
          <nav className="ml-auto flex items-center gap-2 text-sm">
            <a href="#badges" className="hidden sm:inline px-3 py-1.5 text-muted-foreground hover:text-foreground">Badges</a>
            <a href="#features" className="hidden sm:inline px-3 py-1.5 text-muted-foreground hover:text-foreground">Features</a>
            {signedIn ? (
              <Link to="/dashboard" className="rounded-md px-4 py-2 font-medium"
                    style={{ border: `1px solid ${p.accent}66`, background: `${p.accent}14` }}>
                Dashboard
              </Link>
            ) : (
              <button onClick={start} className="rounded-md px-4 py-2 font-medium"
                      style={{ border: `1px solid ${p.accent}66`, background: `${p.accent}14` }}>
                Sign in
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* hero — asymmetric split */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 pt-16 pb-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono px-3 py-1.5 rounded-full"
               style={{ border: `1px solid ${p.second}55`, color: p.second }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: p.second }} />
            {badges.length || 34} badges to collect · free forever
          </div>

          <h1 className="mt-6 text-[13vw] leading-[0.86] sm:text-7xl lg:text-8xl font-bold tracking-tighter">
            <span className="block">One link.</span>
            <span className="block" style={{ color: p.accent, textShadow: `0 0 60px ${p.accent}55`, transition: "color 900ms" }}>
              ion what to put here.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            aurora.lol is a profile page you actually own the look of — your palette, your font,
            your panel background, your music, your badges. Nothing locked behind a paywall.
          </p>

          {/* claim bar */}
          <form onSubmit={e => { e.preventDefault(); start(); }}
                className="mt-8 flex flex-col sm:flex-row gap-2 max-w-lg">
            <div className="flex items-stretch flex-1 rounded-lg overflow-hidden"
                 style={{ border: `1px solid ${p.accent}55`, background: "oklch(0.16 0.02 280 / 0.6)" }}>
              <span className="px-3 flex items-center text-xs font-mono text-muted-foreground">aurora.lol/</span>
              <input value={claim} onChange={e => setClaim(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24))}
                     placeholder="yourname" aria-label="Choose your username"
                     className="flex-1 bg-transparent px-1 py-3 text-sm font-mono focus:outline-none" />
            </div>
            <button type="submit" className="rounded-lg px-6 py-3 font-medium inline-flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(120deg, ${p.accent}, ${p.second})`, color: "oklch(0.14 0.02 280)", boxShadow: `0 18px 50px -22px ${p.accent}` }}>
              Claim it <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* palettes */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground mr-1">palette:</span>
            {PALETTES.map((t, i) => (
              <button key={t.id} onClick={() => setPi(i)} aria-label={`Preview ${t.label}`}
                      className={`rounded-full px-2 py-1 flex items-center gap-1.5 text-[11px] font-mono transition-all ${i === pi ? "" : "opacity-55 hover:opacity-100"}`}
                      style={{ border: `1px solid ${i === pi ? t.accent : "var(--border)"}` }}>
                <span className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
                <span className="w-3 h-3 rounded-full -ml-2" style={{ background: t.second }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* live mock */}
        <div className="relative">
          <div className="rounded-3xl overflow-hidden relative"
               style={{ border: `1px solid ${p.accent}55`, background: "oklch(0.14 0.02 280 / 0.65)", backdropFilter: "blur(18px)", boxShadow: `0 40px 120px -50px ${p.accent}`, transition: "all 900ms" }}>
            <div className="h-28 relative"
                 style={{ background: `linear-gradient(120deg, ${p.accent}55, ${p.second}44)` }}>
              <div aria-hidden className="absolute inset-0 animate-aurora-veil opacity-70"
                   style={{ background: `radial-gradient(ellipse 60% 120% at 30% 10%, ${p.accent}, transparent 60%)`, backgroundSize: "200% 200%" }} />
            </div>
            <div className="px-6 pb-6 -mt-10 relative">
              <div className="w-20 h-20 rounded-2xl p-[3px]" style={{ background: `linear-gradient(135deg, ${p.accent}, ${p.second})` }}>
                <div className="w-full h-full rounded-2xl bg-background grid place-items-center text-2xl">✦</div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xl font-bold">your name</span>
                <span className="inline-flex items-center gap-1">
                  {(badges.length ? badges.slice(0, 4) : []).map(b => {
                    const Icon = badgeIcon(b.icon);
                    return (
                      <span key={b.key} title={b.name} aria-label={b.name}
                            className="grid place-items-center rounded-full w-[22px] h-[22px]"
                            style={{ ...tierRing(b.tier, b.color), background: `${b.color}1a`, color: b.color }}>
                        <Icon className="w-3 h-3" />
                      </span>
                    );
                  })}
                </span>
              </div>
              <div className="font-mono text-xs text-muted-foreground">aurora.lol/you</div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[["1.2k", "guests"], ["48", "messages"], ["5.0", "rating"]].map(([v, l]) => (
                  <div key={l} className="rounded-xl py-2" style={{ border: `1px solid ${p.accent}33` }}>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs"
                   style={{ border: `1px solid ${p.second}44`, background: `${p.second}12`, color: p.second }}>
                <Music className="w-3.5 h-3.5" /> now playing — your track
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* marquee */}
      <div className="relative z-10 border-y border-border/40 py-3 overflow-hidden">
        <div className="flex gap-8 whitespace-nowrap animate-marquee font-mono text-xs text-muted-foreground">
          {marquee.map((u, i) => (
            <span key={`${u}-${i}`} className="flex items-center gap-8">
              aurora.lol/{u}
              <span style={{ color: p.accent }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* badges */}
      <section id="badges" className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-10">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Badges you earn</h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Nobody hands these to you. Use a feature, hit a milestone, unlock the badge —
              then choose which ones sit on your profile.
            </p>
          </div>
          <div className="sm:ml-auto text-right font-mono text-xs text-muted-foreground">
            {badges.length || 34} total · equip as many as you like
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {(badges.length ? badges : []).map(b => {
            const Icon = badgeIcon(b.icon);
            return (
              <div key={b.key} className="rounded-xl px-3.5 py-3 flex items-start gap-2.5 transition-transform hover:-translate-y-0.5"
                   style={{ ...tierRing(b.tier, b.color), background: `${b.color}12` }}>
                <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: b.color }} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">{b.name}</span>
                    <span className="text-[9px] font-mono uppercase tracking-wider opacity-60">{TIER_LABEL[b.tier] ?? b.tier}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{b.description}</p>
                </div>
              </div>
            );
          })}
          {badges.length === 0 && (
            <p className="font-mono text-sm text-muted-foreground col-span-full">loading badges...</p>
          )}
        </div>
      </section>

      {/* features bento */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pb-20">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-10">Everything included</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map(({ icon: Icon, t, d }, i) => (
            <div key={t}
                 className={`rounded-2xl p-6 relative overflow-hidden ${i === 0 ? "sm:col-span-2" : ""}`}
                 style={{ border: `1px solid ${p.accent}2e`, background: "oklch(0.15 0.02 280 / 0.5)" }}>
              <Icon className="w-5 h-5 mb-3" style={{ color: i % 2 ? p.second : p.accent }} />
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* steps */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map(s => (
            <div key={s.n} className="rounded-2xl p-6" style={{ border: `1px solid ${p.accent}22` }}>
              <div className="font-mono text-3xl font-bold opacity-25">{s.n}</div>
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div className="rounded-3xl px-8 py-14 text-center relative overflow-hidden"
             style={{ border: `1px solid ${p.accent}55`, background: `linear-gradient(120deg, ${p.accent}1f, ${p.second}1a)` }}>
          <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter">aurora.lol/<span style={{ color: p.accent }}>{claim || "you"}</span></h2>
          <p className="mt-4 text-muted-foreground">Still available. Probably not for long.</p>
          <button onClick={start} className="mt-8 rounded-lg px-8 py-3.5 font-medium inline-flex items-center gap-2"
                  style={{ background: `linear-gradient(120deg, ${p.accent}, ${p.second})`, color: "oklch(0.14 0.02 280)", boxShadow: `0 22px 60px -22px ${p.accent}` }}>
            {signedIn ? "Open my dashboard" : "Start with Google"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
          <span>aurora.lol ✦</span>
          <Link to="/status" className="hover:text-foreground">status</Link>
          <Link to="/admin" className="ml-auto inline-flex items-center gap-1.5 hover:text-foreground">
            <Shield className="w-3.5 h-3.5" /> admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
