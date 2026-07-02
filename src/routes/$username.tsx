import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveStorageUrl } from "@/lib/storage";
import { MusicPlayer } from "@/components/profile/MusicPlayer";
import { Particles, AuroraBg, Stars, Grid, Matrix, GradientMesh, ImageBg } from "@/components/profile/BackgroundFx";
import { ClickEffect, CustomCursor, CursorTrail } from "@/components/profile/Effects";
import { LanyardCard } from "@/components/profile/LanyardCard";
import { Guestbook } from "@/components/profile/Guestbook";
import { detectIcon, IconFor, ICON_COLOR } from "@/lib/link-icons";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  discord_id: string | null;
  roblox_url: string | null;
  music_url: string | null;
  music_title: string | null;
  accent_color: string;
  secondary_color: string;
  background_effect: string;
  click_effect: boolean;
  custom_cursor: boolean;
  font_family: string;
  layout_style: string;
  card_opacity: number;
  card_blur: number;
  border_glow: boolean;
  cursor_trail: boolean;
  tilt_cards: boolean;
  click_effect_style: string;
  background_image_url: string | null;
  background_opacity: number;
  entry_animation: string;
  avatar_shape: string;
  animation_speed: number;
  profile_style: string;
};
type Lnk = { id: string; label: string; url: string; icon: string | null; position: number };

export const Route = createFileRoute("/$username")({
  loader: async ({ params }) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", params.username.toLowerCase())
      .maybeSingle();
    if (error || !profile) throw notFound();
    const { data: links } = await supabase
      .from("links")
      .select("id,label,url,icon,position")
      .eq("profile_id", profile.id)
      .order("position");
    return { profile: profile as Profile, links: (links || []) as Lnk[] };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.profile.username}/main — aurora.lol` },
      { name: "description", content: loaderData.profile.bio || `${loaderData.profile.display_name || loaderData.profile.username} on aurora.lol` },
      { property: "og:title", content: `@${loaderData.profile.username} — aurora.lol` },
      { property: "og:description", content: loaderData.profile.bio || "made with aurora.lol" },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center px-4 font-mono">
      <div className="glass p-10 text-center max-w-sm">
        <h1 className="text-4xl font-bold text-aurora">404</h1>
        <p className="mt-2 text-muted-foreground">ModuleNotFoundError: no profile with that name</p>
        <Link to="/" className="mt-6 inline-block glass-strong px-4 py-2 rounded-md text-sm hover:glow-purple transition-shadow">
          Claim this username →
        </Link>
      </div>
    </div>
  ),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, links } = Route.useLoaderData();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    resolveStorageUrl("avatars", profile.avatar_url).then(setAvatarUrl);
    resolveStorageUrl("music", profile.music_url).then(setMusicUrl);
    resolveStorageUrl("avatars", profile.background_image_url).then(setBgImageUrl);
    supabase.auth.getUser().then(({ data }) => setIsOwner(data.user?.id === profile.id));
  }, [profile.id, profile.avatar_url, profile.music_url, profile.background_image_url]);

  const accent = profile.accent_color;
  const green = profile.secondary_color;
  const speedStyle = { ["--anim-speed" as never]: profile.animation_speed } as React.CSSProperties;
  const isSiteOwner = profile.username.toLowerCase() === "owner";

  return (
    <div className="min-h-screen relative font-mono text-[13px] sm:text-sm" style={speedStyle}>
      {bgImageUrl && <ImageBg url={bgImageUrl} opacity={profile.background_opacity} />}
      {profile.background_effect === "particles" && <Particles color={accent} />}
      {profile.background_effect === "aurora" && <AuroraBg accent={accent} secondary={green} />}
      {profile.background_effect === "stars" && <Stars />}
      {profile.background_effect === "grid" && <Grid color={accent} />}
      {profile.background_effect === "matrix" && <Matrix color={accent} />}
      {profile.background_effect === "mesh" && <GradientMesh accent={accent} secondary={green} />}
      {profile.click_effect && <ClickEffect color={accent} style={profile.click_effect_style} />}
      {profile.custom_cursor && <CustomCursor accent={accent} secondary={green} />}
      {profile.cursor_trail && <CursorTrail color={accent} />}

      {/* Editor top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-border/40" style={{ background: "oklch(0.14 0.03 280 / 0.7)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-4 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: green, boxShadow: `0 0 8px ${green}` }} />
            <span className="truncate"><span style={{ color: accent }}>{profile.username}</span> <span className="opacity-40">/</span> <span style={{ color: green }} className="italic">main</span></span>
          </div>
          <nav className="hidden sm:flex items-center gap-5 opacity-70">
            {profile.discord_id && <a href="#discord" style={{ color: green }} className="hover:opacity-100">discord.live</a>}
            <a href="#reviews" style={{ color: green }} className="hover:opacity-100">reviews.db</a>
            {links.length > 0 && <a href="#links" style={{ color: green }} className="hover:opacity-100">links.py</a>}
          </nav>
          <div className="opacity-50 hidden sm:block whitespace-nowrap">Python 3.12 · UTF-8</div>
          {isOwner && (
            <Link to="/dashboard" className="glass-strong px-2.5 py-1 rounded-md text-[10px] hover:glow-purple transition-shadow">
              edit
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-20">
        {/* [00] class profile — identity */}
        <Section index="00" keyword="class" name={`${profile.username}:`} comment={`# profile — ${profile.display_name || profile.username}${isSiteOwner ? " · SITE OWNER 👑" : ""}`} accent={accent} green={green}>
          <CodeWindow filename={`${profile.username}.py`} accent={accent} green={green} status={isSiteOwner ? "OWNER" : undefined}>
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start">
              <div className="shrink-0 relative">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 ${avatarShape(profile.avatar_shape)} p-[3px] animate-pulse-glow`}
                     style={{ background: `linear-gradient(135deg, ${accent}, ${green})` }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className={`w-full h-full ${avatarShape(profile.avatar_shape)} object-cover bg-background`} />
                  ) : (
                    <div className={`w-full h-full ${avatarShape(profile.avatar_shape)} bg-background flex items-center justify-center text-3xl font-bold`}>
                      {(profile.display_name || profile.username)[0].toUpperCase()}
                    </div>
                  )}
                </div>
                {isSiteOwner && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: `linear-gradient(135deg, ${accent}, ${green})`, color: "white", boxShadow: `0 0 12px ${accent}88` }}>
                    👑 OWNER
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                <div>
                  <span className="opacity-50">display_name</span> <span style={{ color: accent }}>=</span>{" "}
                  <span style={{ color: green }}>&quot;{profile.display_name || profile.username}&quot;</span>
                </div>
                <div>
                  <span className="opacity-50">username</span> <span style={{ color: accent }}>=</span>{" "}
                  <span style={{ color: green }}>&quot;@{profile.username}&quot;</span>
                </div>
                {profile.bio && (
                  <div className="pt-1">
                    <span className="opacity-50">bio</span> <span style={{ color: accent }}>=</span>{" "}
                    <span style={{ color: green }}>&quot;&quot;&quot;</span>
                    <div style={{ color: green }} className="whitespace-pre-wrap opacity-90 pl-4">{profile.bio}</div>
                    <span style={{ color: green }}>&quot;&quot;&quot;</span>
                  </div>
                )}
                {profile.roblox_url && (
                  <div className="pt-2">
                    <a href={profile.roblox_url} target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-2 glass-strong rounded-full pl-2 pr-4 py-1.5 hover:glow-magenta transition-shadow">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center animate-spin-slow"
                            style={{ background: `radial-gradient(circle, ${accent}, ${green})`, boxShadow: `0 0 16px ${accent}` }}>
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="white"><path d="M3 3l16 4-4 16L3 3zm5.5 5.5l3 8 5-3-8-5z"/></svg>
                      </span>
                      <span className="text-[11px]">roblox.profile()</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CodeWindow>
        </Section>

        {/* [01] discord */}
        {profile.discord_id && (
          <Section id="discord" index="01" keyword="import" name="discord_presence.live" accent={accent} green={green}
                   comment="# streaming live from Discord via Lanyard — updates every 15s">
            <CodeWindow filename="discord_presence.live" accent={accent} green={green} status="LIVE" statusColor={green}>
              <div className="p-3">
                <LanyardCard discordId={profile.discord_id} />
              </div>
            </CodeWindow>
          </Section>
        )}

        {/* [02] links */}
        {links.length > 0 && (
          <Section id="links" index="02" keyword="from" name="links.py" method=" import *" accent={accent} green={green}
                   comment="# quick jumps — socials, portfolio, whatever">
            <CodeWindow filename="links.py" accent={accent} green={green}>
              <div className={`p-4 grid gap-2 ${profile.layout_style === "grid" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {links.map((l: Lnk, i: number) => (
                  <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
                     className="flex items-center gap-2 rounded-md px-3 py-2 border border-border/50 bg-background/30 hover:-translate-y-0.5 transition-all group">
                    <span className="opacity-40 text-[11px]">[{String(i).padStart(2, "0")}]</span>
                    <span style={{ color: accent }}>open</span>
                    <span className="opacity-60">(</span>
                    <span style={{ color: green }} className="truncate">&quot;{l.label}&quot;</span>
                    <span className="opacity-60">)</span>
                    <span className="ml-auto opacity-30 group-hover:opacity-80 transition-opacity">→</span>
                  </a>
                ))}
              </div>
            </CodeWindow>
          </Section>
        )}

        {/* [03] reviews */}
        <Section id="reviews" index={profile.discord_id ? (links.length ? "03" : "02") : "01"}
                 keyword="import" name="reviews.db" accent={accent} green={green}
                 comment="# leave a note in the guestbook — no signup, just your name and a rating">
          <div className="grid md:grid-cols-2 gap-4">
            <CodeWindow filename="leave_review.py" accent={accent} green={green}>
              <Guestbook profileId={profile.id} isOwner={isOwner} />
            </CodeWindow>
            <CodeWindow filename="reviews.json" accent={accent} green={green} status="4 entries">
              <div className="p-4 text-xs opacity-60 italic">// entries render on the left · owner can delete on hover</div>
            </CodeWindow>
          </div>
        </Section>

        <footer className="text-center text-[11px] text-muted-foreground pt-8">
          <span className="opacity-40"># </span>
          <Link to="/" className="hover:text-foreground">made with aurora.lol ✦</Link>
        </footer>
      </main>

      {musicUrl && <MusicPlayer src={musicUrl} title={profile.music_title} />}
    </div>
  );
}

function avatarShape(s: string) {
  return s === "square" ? "rounded-2xl" : s === "hex" ? "rounded-[30%]" : "rounded-full";
}

function Section({ id, index, keyword, name, method, comment, accent, green, children }: {
  id?: string; index: string; keyword: string; name: string; method?: string; comment?: string;
  accent: string; green: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-3 animate-fade-in-up">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="opacity-40 text-[11px]">[{index}]</span>
        <span style={{ color: accent }} className="font-bold text-base sm:text-lg">{keyword}</span>
        <span className="text-base sm:text-lg font-semibold">{name}</span>
        {method && <span style={{ color: accent }} className="text-base sm:text-lg">{method}</span>}
      </div>
      {comment && <div style={{ color: green }} className="opacity-70 text-xs sm:text-[13px] pl-6">{comment}</div>}
      {children}
    </section>
  );
}

function CodeWindow({ filename, accent, green, status, statusColor, children }: {
  filename: string; accent: string; green: string; status?: string; statusColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden border backdrop-blur-xl"
         style={{ borderColor: `${accent}33`, background: "oklch(0.14 0.02 280 / 0.55)", boxShadow: `0 12px 40px -12px ${accent}44, 0 0 1px ${accent}55 inset` }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 text-[11px]" style={{ background: "oklch(0.11 0.02 280 / 0.6)" }}>
        <span className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.27_25)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.85_0.18_80)]" />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: green }} />
        </span>
        <span className="opacity-70 truncate">{filename}</span>
        {status && (
          <span className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-wider" style={{ color: statusColor || accent }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusColor || accent }} /> {status}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
