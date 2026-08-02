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

const THEMES = [
  { id: "aurora", label: "Aurora", accent: "#a855f7", secondary: "#22c55e" },
  { id: "sunset", label: "Sunset", accent: "#f97316", secondary: "#ec4899" },
  { id: "cyber", label: "Cyber", accent: "#22d3ee", secondary: "#a855f7" },
  { id: "matrix", label: "Matrix", accent: "#22c55e", secondary: "#16a34a" },
  { id: "bubblegum", label: "Bubblegum", accent: "#ec4899", secondary: "#f472b6" },
  { id: "royal", label: "Royal", accent: "#eab308", secondary: "#7c3aed" },
];

const EXAMPLES = [
  { username: "nova", display: "✦ nova", tag: "@nova", tags: ["video bg", "music", "aurora"] },
  { username: "kira", display: "kira.exe", tag: "@kira", tags: ["discord", "custom font", "links"] },
  { username: "echo", display: "echo//", tag: "@echo", tags: ["roblox pfp", "guestbook", "cursor"] },
];

function Landing() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = THEMES[themeIdx];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setThemeIdx(i => (i + 1) % THEMES.length), 4200);
    return () => clearInterval(t);
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
      {/* Live aurora that recolors with the selected theme */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -inset-32 blur-3xl animate-aurora-veil transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse 65% 45% at 12% 0%, ${theme.accent}, transparent 62%),
                         radial-gradient(ellipse 55% 50% at 90% 15%, ${theme.secondary}, transparent 64%),
                         radial-gradient(ellipse 80% 45% at 50% 105%, ${theme.accent}, transparent 66%)`,
            backgroundSize: "220% 220%",
            opacity: 0.5,
          }}
        />
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
              onClick={signIn}
              className="rounded-md glass-strong px-4 py-2 text-sm font-medium hover:glow-purple transition-shadow"
            >
              Sign in
            </button>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-14 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-mono mb-6 animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.secondary }} />
          now with video backgrounds, custom fonts & auto Roblox avatars
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <span className="text-aurora animate-aurora">aurora</span>
          <span className="text-foreground">.lol</span>
          <span className="sr-only"> — make your profile glow</span>
        </h1>
        <p className="mt-6 mx-auto max-w-xl text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "140ms" }}>
          A link-in-bio with <span className="text-foreground font-mono">style</span>.
          Your own video, your own font, your own colors — plus music, live Discord status
          and a guestbook your friends can sign.
        </p>

        {/* Theme switcher */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          {THEMES.map((t, i) => (
            <button key={t.id} onClick={() => setThemeIdx(i)} aria-label={`Preview ${t.label} theme`}
                    className={`rounded-full pl-1.5 pr-3 py-1.5 text-xs font-mono flex items-center gap-2 border transition-all ${
                      i === themeIdx ? "border-primary" : "border-border/60 opacity-70 hover:opacity-100"}`}
                    style={i === themeIdx ? { boxShadow: `0 0 20px -6px ${t.accent}` } : undefined}>
              <span className="flex">
                <span className="w-4 h-4 rounded-full" style={{ background: t.accent }} />
                <span className="w-4 h-4 rounded-full -ml-1.5" style={{ background: t.secondary }} />
              </span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "220ms" }}>
          {signedIn ? (
            <Link to="/dashboard" className="group rounded-lg px-7 py-3.5 font-medium relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, color: "white", boxShadow: `0 20px 60px -20px ${theme.accent}` }}>
              Open dashboard →
            </Link>
          ) : (
            <button
              onClick={signIn}
              className="group rounded-lg px-7 py-3.5 font-medium relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`, color: "white", boxShadow: `0 20px 60px -20px ${theme.accent}` }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <GoogleMark />
                Sign in with Google
              </span>
            </button>
          )}
          <a href="#examples" aria-label="Scroll down to example profiles" className="rounded-lg px-6 py-3.5 font-medium glass hover:glow-magenta transition-shadow">
            See examples ↓
          </a>
        </div>
      </section>

      {/* Mock profile preview */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-2xl overflow-hidden animate-fade-in-up"
             style={{ border: `1px solid ${theme.accent}55`, background: "oklch(0.14 0.02 280 / 0.6)", backdropFilter: "blur(18px)", boxShadow: `0 30px 90px -40px ${theme.accent}` }}>
          <div className="relative p-8 flex flex-col sm:flex-row items-center gap-6">
            <div aria-hidden className="absolute inset-0 pointer-events-none"
                 style={{ background: `radial-gradient(ellipse 60% 120% at 80% 10%, ${theme.accent}44, transparent 65%), radial-gradient(ellipse 70% 90% at 95% 85%, ${theme.secondary}33, transparent 65%)` }} />
            <div className="relative w-24 h-24 rounded-full p-[3px] animate-float"
                 style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})` }}>
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-3xl font-bold">✦</div>
            </div>
            <div className="relative flex-1 text-center sm:text-left">
              <div className="text-2xl font-bold">your name here</div>
              <div className="text-sm text-muted-foreground font-mono">aurora.lol/you</div>
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2 text-[11px] font-mono">
                {["aurora veil", "video panel", "custom font", "guestbook"].map(x => (
                  <span key={x} className="rounded-full px-2.5 py-1" style={{ border: `1px solid ${theme.accent}55`, color: theme.accent }}>{x}</span>
                ))}
              </div>
            </div>
            <div className="relative w-full sm:w-56 aspect-video rounded-xl flex items-center justify-center text-xs font-mono"
                 style={{ border: `1px solid ${theme.secondary}66`, background: `${theme.secondary}12`, color: theme.secondary }}>
              ▶ your video plays here
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-3xl font-bold mb-8 text-center">Everything, free</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Video, t: "Video anywhere", d: "Play a video inside your name panel and another one as your full-page background." },
            { icon: Sparkles, t: "Animated aurora presets", d: "Aurora, ribbons, beams or glow — they recolor themselves with your theme." },
            { icon: Type, t: "Custom fonts", d: "Twelve presets, or paste any Google Fonts URL and use your own." },
            { icon: Gamepad2, t: "Auto Roblox avatar", d: "Link your Roblox profile and your headshot becomes your picture." },
            { icon: Music, t: "Background music", d: "Upload an MP3, paste a URL, or pick from the free song library." },
            { icon: MessageCircle, t: "Live Discord + guestbook", d: "Lanyard status, visitor reviews, ratings — you moderate." },
            { icon: LinkIcon, t: "Smart link icons", d: "Roblox, YouTube, Discord, TikTok and more are detected automatically." },
            { icon: Wand2, t: "Click & cursor FX", d: "Bursts, ripples, sparkles, hearts, trails and gradient cursors." },
            { icon: Palette, t: "Full theme control", d: "Colors, blur, opacity, glow, tilt, avatar shape, entry animation." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="glass p-6 group transition-all hover:-translate-y-0.5"
                 style={{ boxShadow: `0 20px 60px -50px ${theme.accent}` }}>
              <Icon className="w-6 h-6 mb-3" style={{ color: theme.secondary }} />
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
                 style={{ boxShadow: `0 24px 70px -44px ${theme.accent}` }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-2xl text-white"
                   style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})` }}>
                {ex.display[0]}
              </div>
              <div className="font-semibold">{ex.display}</div>
              <div className="font-mono text-xs text-muted-foreground">{ex.tag}</div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                {ex.tags.map(t => <span key={t} className="px-2 py-1 rounded glass-strong">{t}</span>)}
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
