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
  head: ({ params, loaderData }) => {
    const url = `https://auroralol.lovable.app/${params.username}`;
    if (!loaderData) {
      return {
        meta: [
          { title: "Profile not found — aurora.lol" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const p = loaderData.profile;
    const name = p.display_name || `@${p.username}`;
    const desc = p.bio && p.bio.length >= 50
      ? p.bio
      : (p.bio
          ? `${p.bio} — ${name}'s neon glassmorphic profile on aurora.lol with links, music, and live Discord status.`
          : `${name}'s neon glassmorphic profile on aurora.lol — links, music, live Discord status, and a guestbook.`);
    const title = `${name} (@${p.username}) — aurora.lol`;
    const image = p.avatar_url && /^https?:\/\//.test(p.avatar_url) ? p.avatar_url : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        { property: "profile:username", content: p.username },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url,
            mainEntity: {
              "@type": "Person",
              name,
              alternateName: p.username,
              description: p.bio || undefined,
              image: image,
              url,
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass p-10 text-center max-w-sm">
        <h1 className="text-4xl font-bold text-aurora">404</h1>
        <p className="mt-2 text-muted-foreground">No profile with that name — yet.</p>
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
    <div className="min-h-screen relative text-[14px] sm:text-[15px]" style={speedStyle}>
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

      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-border/40" style={{ background: "oklch(0.14 0.03 280 / 0.7)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: green, boxShadow: `0 0 8px ${green}` }} />
            <span className="truncate font-medium" style={{ color: accent }}>@{profile.username}</span>
          </div>
          <nav className="hidden sm:flex items-center gap-5 opacity-70">
            {profile.discord_id && <a href="#discord" className="hover:opacity-100">Discord</a>}
            {links.length > 0 && <a href="#links" className="hover:opacity-100">Links</a>}
            <a href="#guestbook" className="hover:opacity-100">Guestbook</a>
          </nav>
          {isOwner && (
            <Link to="/dashboard" className="glass-strong px-2.5 py-1 rounded-md text-[11px] hover:glow-purple transition-shadow">
              Edit profile
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-14 sm:py-20 space-y-10">
        {/* Identity */}
        <Card accent={accent} green={green} profile={profile} title={`@${profile.username}`} status={isSiteOwner ? "OWNER" : undefined}>
          <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-4">
            <div className={`w-28 h-28 sm:w-32 sm:h-32 ${avatarShape(profile.avatar_shape)} p-[3px] animate-pulse-glow`}
                 style={{ background: `linear-gradient(135deg, ${accent}, ${green})` }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={`${profile.display_name || profile.username}'s avatar`} className={`w-full h-full ${avatarShape(profile.avatar_shape)} object-cover bg-background`} />
              ) : (
                <div className={`w-full h-full ${avatarShape(profile.avatar_shape)} bg-background flex items-center justify-center text-3xl font-bold`}>
                  {(profile.display_name || profile.username)[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{profile.display_name || profile.username}</h1>
              <div className="text-sm opacity-60">@{profile.username}{isSiteOwner && <span className="ml-2">👑</span>}</div>
            </div>
            {profile.bio && <p className="max-w-md text-sm sm:text-base opacity-85 whitespace-pre-wrap">{profile.bio}</p>}
            {profile.roblox_url && <RobloxBadge url={profile.roblox_url} accent={accent} green={green} />}
          </div>
        </Card>

        {profile.discord_id && (
          <SectionBlock id="discord" title="Discord">
            <Card accent={accent} green={green} profile={profile} title="Live status" status="LIVE" statusColor={green}>
              <div className="p-3"><LanyardCard discordId={profile.discord_id} /></div>
            </Card>
          </SectionBlock>
        )}

        {links.length > 0 && (
          <SectionBlock id="links" title="Links">
            <Card accent={accent} green={green} profile={profile} title="Links">
              <div className={`p-4 grid gap-2 ${profile.layout_style === "grid" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {links.map((l: Lnk) => {
                  const kind = detectIcon(l.url);
                  const color = ICON_COLOR[kind];
                  return (
                    <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
                       className="flex items-center gap-3 rounded-md px-3 py-2.5 border border-border/50 bg-background/30 hover:-translate-y-0.5 transition-all group">
                      <span className="flex items-center justify-center w-8 h-8 rounded-md shrink-0"
                            style={{ background: `${color}22`, color, boxShadow: `0 0 12px ${color}44` }}>
                        <IconFor kind={kind} className="w-4 h-4" />
                      </span>
                      <span className="truncate font-medium">{l.label}</span>
                      <span className="ml-auto opacity-30 group-hover:opacity-80 transition-opacity">→</span>
                    </a>
                  );
                })}
              </div>
            </Card>
          </SectionBlock>
        )}

        <SectionBlock id="guestbook" title="Guestbook">
          <Card accent={accent} green={green} profile={profile} title="Guestbook">
            <Guestbook profileId={profile.id} isOwner={isOwner} />
          </Card>
        </SectionBlock>

        <footer className="text-center text-[11px] text-muted-foreground pt-8">
          <Link to="/" className="hover:text-foreground">made with aurora.lol ✦</Link>
        </footer>
      </main>

      {musicUrl && <MusicPlayer src={musicUrl} title={profile.music_title} />}
    </div>
  );
}

function RobloxBadge({ url, accent, green }: { url: string; accent: string; green: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer"
       className="inline-flex items-center gap-2 glass-strong rounded-full pl-2 pr-4 py-1.5 hover:glow-magenta transition-shadow">
      <span className="w-6 h-6 rounded-full flex items-center justify-center animate-spin-slow"
            style={{ background: `radial-gradient(circle, ${accent}, ${green})`, boxShadow: `0 0 16px ${accent}` }}>
        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="white"><path d="M3 3l16 4-4 16L3 3zm5.5 5.5l3 8 5-3-8-5z"/></svg>
      </span>
      <span className="text-[11px]">Roblox profile</span>
    </a>
  );
}

function avatarShape(s: string) {
  return s === "square" ? "rounded-2xl" : s === "hex" ? "rounded-[30%]" : "rounded-full";
}

function SectionBlock({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-3 animate-fade-in-up">
      <h2 className="text-lg sm:text-xl font-semibold tracking-tight opacity-90">{title}</h2>
      {children}
    </section>
  );
}

function Card({ title, accent, green, status, statusColor, profile, children }: {
  title: string; accent: string; green: string; status?: string; statusColor?: string;
  profile: Profile; children: React.ReactNode;
}) {
  const alpha = Math.max(0.05, Math.min(0.95, profile.card_opacity));
  const blur = `${profile.card_blur}px`;
  const glow = profile.border_glow
    ? `0 12px 40px -12px ${accent}66, 0 0 24px -6px ${green}44, 0 0 1px ${accent}88 inset`
    : `0 8px 24px -12px rgba(0,0,0,0.4)`;
  const tilt = profile.tilt_cards ? "tilt-card" : "";
  return (
    <div className={`rounded-xl overflow-hidden border ${tilt}`}
         style={{
           borderColor: profile.border_glow ? `${accent}55` : `${accent}22`,
           background: `oklch(0.14 0.02 280 / ${alpha})`,
           backdropFilter: `blur(${blur})`,
           WebkitBackdropFilter: `blur(${blur})`,
           boxShadow: glow,
         }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 text-[11px]" style={{ background: "oklch(0.11 0.02 280 / 0.6)" }}>
        <span className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.27_25)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.85_0.18_80)]" />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: green }} />
        </span>
        <span className="opacity-70 truncate">{title}</span>
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
