import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveStorageUrl } from "@/lib/storage";
import { MusicPlayer } from "@/components/profile/MusicPlayer";
import { Particles, AuroraBg, Stars, Grid, Matrix, GradientMesh, ImageBg } from "@/components/profile/BackgroundFx";
import { ClickEffect, CustomCursor, CursorTrail } from "@/components/profile/Effects";
import { LanyardCard } from "@/components/profile/LanyardCard";
import { Guestbook } from "@/components/profile/Guestbook";
import { ExternalLink } from "lucide-react";

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
      { title: `@${loaderData.profile.username} — aurora.lol` },
      { name: "description", content: loaderData.profile.bio || `${loaderData.profile.display_name || loaderData.profile.username} on aurora.lol` },
      { property: "og:title", content: `@${loaderData.profile.username} — aurora.lol` },
      { property: "og:description", content: loaderData.profile.bio || "made with aurora.lol" },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass p-10 text-center max-w-sm">
        <h1 className="text-4xl font-bold text-aurora font-mono">404</h1>
        <p className="mt-2 text-muted-foreground">No profile with that username.</p>
        <Link to="/" className="mt-6 inline-block glass-strong px-4 py-2 rounded-md text-sm hover:glow-purple transition-shadow">
          Claim this username →
        </Link>
      </div>
    </div>
  ),
  component: ProfilePage,
});

const ANIM_CLASS: Record<string, string> = {
  "fade-up": "animate-fade-in-up",
  "fade-down": "animate-fade-in-down",
  "zoom": "animate-zoom-in",
  "blur": "animate-blur-in",
  "none": "",
};

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

  const anim = ANIM_CLASS[profile.entry_animation] ?? "animate-fade-in-up";
  const cardStyle = {
    background: `oklch(0.18 0.03 280 / ${profile.card_opacity})`,
    backdropFilter: `blur(${profile.card_blur}px) saturate(140%)`,
    borderRadius: "var(--radius)",
    border: `1px solid ${profile.border_glow ? profile.accent_color + "55" : "oklch(0.5 0.15 300 / 0.25)"}`,
    boxShadow: profile.border_glow ? `0 0 24px ${profile.accent_color}33` : undefined,
  } as React.CSSProperties;
  const tilt = profile.tilt_cards ? "tilt-card" : "";
  const fontClass = `font-preset-${profile.font_family}`;
  const speedStyle = { ["--anim-speed" as never]: profile.animation_speed } as React.CSSProperties;
  const avatarRadius = profile.avatar_shape === "square" ? "rounded-2xl"
                     : profile.avatar_shape === "hex" ? "rounded-[30%]"
                     : "rounded-full";

  return (
    <div className={`min-h-screen relative ${fontClass}`} style={speedStyle}>
      {bgImageUrl && <ImageBg url={bgImageUrl} opacity={profile.background_opacity} />}
      {profile.background_effect === "particles" && <Particles color={profile.accent_color} />}
      {profile.background_effect === "aurora" && <AuroraBg accent={profile.accent_color} secondary={profile.secondary_color} />}
      {profile.background_effect === "stars" && <Stars />}
      {profile.background_effect === "grid" && <Grid color={profile.accent_color} />}
      {profile.background_effect === "matrix" && <Matrix color={profile.accent_color} />}
      {profile.background_effect === "mesh" && <GradientMesh accent={profile.accent_color} secondary={profile.secondary_color} />}
      {profile.click_effect && <ClickEffect color={profile.accent_color} style={profile.click_effect_style} />}
      {profile.custom_cursor && <CustomCursor accent={profile.accent_color} secondary={profile.secondary_color} />}
      {profile.cursor_trail && <CursorTrail color={profile.accent_color} />}

      {isOwner && (
        <Link to="/dashboard" className="fixed top-4 left-4 z-40 glass-strong px-3 py-1.5 rounded-md text-xs font-mono hover:glow-purple transition-shadow">
          edit profile
        </Link>
      )}

      <main className={`${profile.layout_style === "wide" ? "max-w-4xl" : "max-w-2xl"} mx-auto px-4 py-12 sm:py-20 space-y-6`}>
        {/* Hero card */}
        <div className={`rounded-2xl p-8 text-center relative overflow-hidden ${anim} ${tilt}`} style={cardStyle}>
          <div aria-hidden className="absolute inset-0 opacity-30 pointer-events-none"
               style={{ background: `radial-gradient(ellipse at top, ${profile.accent_color}55, transparent 70%)` }} />
          <div className="relative">
            <div className={`w-28 h-28 mx-auto ${avatarRadius} p-1 animate-pulse-glow`}
                 style={{ background: `linear-gradient(135deg, ${profile.accent_color}, ${profile.secondary_color})` }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className={`w-full h-full ${avatarRadius} object-cover bg-background`} />
              ) : (
                <div className={`w-full h-full ${avatarRadius} bg-background flex items-center justify-center text-3xl font-bold`}>
                  {(profile.display_name || profile.username)[0].toUpperCase()}
                </div>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-bold flex items-center justify-center gap-2">
              {profile.display_name || profile.username}
              {profile.username.toLowerCase() === "owner" && (
                <span title="Site Owner" className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${profile.accent_color}, ${profile.secondary_color})`,
                               boxShadow: `0 0 16px ${profile.accent_color}88`, color: "white" }}>
                  👑 OWNER
                </span>
              )}
            </h1>
            <div className="font-mono text-sm text-muted-foreground">@{profile.username}</div>

            {profile.bio && <p className="mt-4 text-sm text-foreground/90 whitespace-pre-wrap max-w-md mx-auto">{profile.bio}</p>}
            {profile.roblox_url && (
              <a href={profile.roblox_url} target="_blank" rel="noreferrer"
                 className="mt-5 inline-flex items-center gap-2 glass-strong rounded-full pl-2 pr-4 py-1.5 hover:glow-magenta transition-shadow">
                <span className="w-7 h-7 rounded-full flex items-center justify-center animate-spin-slow"
                      style={{ background: `radial-gradient(circle, ${profile.accent_color}, ${profile.secondary_color})`,
                               boxShadow: `0 0 20px ${profile.accent_color}` }}>
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="white"><path d="M3 3l16 4-4 16L3 3zm5.5 5.5l3 8 5-3-8-5z"/></svg>
                </span>
                <span className="text-xs font-mono">roblox</span>
              </a>
            )}
          </div>
        </div>

        {profile.discord_id && (
          <div className={`${anim} ${tilt}`} style={{ animationDelay: "80ms" }}>
            <LanyardCard discordId={profile.discord_id} />
          </div>
        )}

        {links.length > 0 && (
          <div className={`grid gap-2 ${profile.layout_style === "grid" ? "grid-cols-2" : "grid-cols-1"} ${anim}`} style={{ animationDelay: "120ms" }}>
            {links.map((l: Lnk) => (
              <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
                 className={`flex items-center justify-between px-4 py-3 transition-all hover:-translate-y-0.5 group ${tilt}`}
                 style={cardStyle}>
                <span className="font-medium">{l.label}</span>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        )}

        <div className={anim} style={{ animationDelay: "160ms" }}>
          <Guestbook profileId={profile.id} isOwner={isOwner} />
        </div>

        <footer className="text-center text-xs text-muted-foreground font-mono pt-6">
          <Link to="/" className="hover:text-foreground">made with aurora.lol ✦</Link>
        </footer>
      </main>

      {musicUrl && <MusicPlayer src={musicUrl} title={profile.music_title} />}
    </div>
  );
}
