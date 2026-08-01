import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserProfile, rememberAuthNext } from "@/lib/auth-flow";
import { Music, Sparkles, MessageCircle, Gamepad2, Link as LinkIcon, Wand2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "aurora.lol peak" },
      { name: "description", content: "Build your own neon glassmorphic profile. Music, links, Discord status, guestbook. Free, with Google sign-in." },
      { property: "og:title", content: "aurora.lol — peak" },
      { property: "og:description", content: "Your link-in-bio, but it actually slaps. Neon, glass, music, and a guestbook." },
      { property: "og:url", content: "https://auroralol.lovable.app/" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0b763b86-af56-4e30-a0ef-b9ff91bc2052/id-preview-a03f8ef1--5b2184d9-6ede-44a5-b12d-13a64dfede41.lovable.app-1782406309922.png" },
      { name: "twitter:title", content: "aurora.lol peak" },
      { name: "twitter:description", content: "Your link-in-bio, but it actually slaps. Neon, glass, music, and a guestbook." },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0b763b86-af56-4e30-a0ef-b9ff91bc2052/id-preview-a03f8ef1--5b2184d9-6ede-44a5-b12d-13a64dfede41.lovable.app-1782406309922.png" },
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
          description: "Neon glassmorphic link-in-bio profiles with music, Discord status, and guestbook.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "aurora.lol",
          url: "https://auroralol.lovable.app/",
        }),
      },
    ],
  }),
  component: Landing,
});

const EXAMPLES = [
  { username: "nova", display: "✦ nova", tag: "@nova", glow: "var(--glow-purple)", accent: "oklch(0.72 0.27 305)" },
  { username: "kira", display: "kira.exe", tag: "@kira", glow: "var(--glow-magenta)", accent: "oklch(0.72 0.32 340)" },
  { username: "echo", display: "echo//", tag: "@echo", glow: "var(--glow-green)", accent: "oklch(0.85 0.28 145)" },
];

function Landing() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

  const signIn = async () => {
    rememberAuthNext("/dashboard");
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (res.error) console.error(res.error);
    if (res.redirected) return;
    const { data } = await supabase.auth.getUser();
    if (data.user) await ensureUserProfile(data.user);
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="relative overflow-hidden">
      {/* Decorative orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl"
             style={{ background: "radial-gradient(circle, oklch(0.72 0.27 305 / 0.9), transparent 70%)" }} />
        <div className="absolute top-40 -right-24 w-[480px] h-[480px] rounded-full opacity-40 blur-3xl"
             style={{ background: "radial-gradient(circle, oklch(0.85 0.28 145 / 0.7), transparent 70%)" }} />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link to="/" className="font-mono text-lg font-bold tracking-tight text-aurora">aurora.lol</Link>
        <nav className="flex items-center gap-3">
          {signedIn ? (
            <Link to="/dashboard" className="rounded-md glass-strong px-4 py-2 text-sm font-medium hover:glow-purple transition-shadow">
              My dashboard
            </Link>
          ) : (
        <button
          onClick={() => navigate({ to: "/auth" })}
          className="rounded-md glass-strong px-4 py-2 text-sm font-medium hover:glow-purple transition-shadow"
        >
          Sign in
        </button>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-mono mb-6 animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.85_0.28_145)] animate-pulse" />
          Aurora.Lol
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <span className="text-aurora animate-aurora">aurora</span>
          <span className="text-foreground">.lol</span>
          <span className="sr-only"> — make your profile glow</span>
        </h1>
        <p className="mt-6 mx-auto max-w-xl text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "140ms" }}>
          A link-in-bio with <span className="text-foreground font-mono">style</span>.
          Music, particles, live Discord status, a guestbook your friends can sign,
          and click effects that actually pop.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "220ms" }}>
          {signedIn ? (
            <Link to="/dashboard" className="group rounded-lg px-7 py-3.5 font-medium relative overflow-hidden"
                  style={{ background: "var(--grad-aurora)", color: "white", boxShadow: "var(--glow-purple)" }}>
              Open dashboard →
            </Link>
          ) : (
            <button onClick={signIn} className="group rounded-lg px-7 py-3.5 font-medium relative overflow-hidden animate-pulse-glow"
                    style={{ background: "var(--grad-aurora)", color: "white" }}>
              <span className="relative z-10 flex items-center gap-2">
                <GoogleMark /> Sign in with Google
              </span>
            </button>
          )}
          <a href="#examples" aria-label="Scroll down to example profiles" className="rounded-lg px-6 py-3.5 font-medium glass hover:glow-magenta transition-shadow">
            See examples ↓
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Sparkles, t: "Particles + aurora", d: "Pick your vibe: particles, animated gradients, or pure dark." },
            { icon: Music, t: "Background music", d: "Upload an MP3 or paste a URL. EQ visualizer included." },
            { icon: Gamepad2, t: "Live Discord status", d: "Lanyard integration. Shows your game, Spotify track, online state." },
            { icon: LinkIcon, t: "Custom links", d: "Drop your socials, your Roblox, your shop — anything." },
            { icon: MessageCircle, t: "Guestbook", d: "Visitors leave reviews. You moderate." },
            { icon: Wand2, t: "Click effects", d: "Glowing bursts, custom cursors, accent colors. All yours." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="glass p-6 group hover:glow-purple transition-shadow">
              <Icon className="w-6 h-6 mb-3" style={{ color: "oklch(0.85 0.28 145)" }} />
              <h3 className="font-semibold mb-1">{t}</h3>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <h2 className="text-3xl font-bold mb-2 text-center">Example profiles</h2>
        <p className="text-muted-foreground text-center mb-10 font-mono text-sm">aurora.lol/[username]</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {EXAMPLES.map((ex) => (
            <div key={ex.username} className="glass p-8 text-center transition-transform hover:-translate-y-1"
                 style={{ boxShadow: ex.glow }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-2xl text-white"
                   style={{ background: `linear-gradient(135deg, ${ex.accent}, oklch(0.72 0.32 340))` }}>
                {ex.display[0]}
              </div>
              <div className="font-semibold">{ex.display}</div>
              <div className="font-mono text-xs text-muted-foreground">{ex.tag}</div>
              <div className="mt-4 flex justify-center gap-2 text-xs">
                <span className="px-2 py-1 rounded glass-strong">music</span>
                <span className="px-2 py-1 rounded glass-strong">discord</span>
                <span className="px-2 py-1 rounded glass-strong">links</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/40 py-8 text-center text-xs text-muted-foreground font-mono">
        aurora.lol ✦
      </footer>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8L6.2 33C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.9 35 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
