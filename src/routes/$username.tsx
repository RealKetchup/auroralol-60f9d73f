import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Crown, Pencil, Link2, Calendar, Star, Users, MessageSquare, BookOpen, User as UserIcon, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { resolveStorageUrl } from "@/lib/storage";
import { MusicPlayer } from "@/components/profile/MusicPlayer";
import { Particles, AuroraBg, Stars, Grid, Matrix, GradientMesh, AuroraVeil } from "@/components/profile/BackgroundFx";
import { ProfileBackground } from "@/components/profile/ProfileBackground";
import { ClickEffect, CustomCursor, CursorTrail } from "@/components/profile/Effects";
import { LanyardCard } from "@/components/profile/LanyardCard";
import { Guestbook } from "@/components/profile/Guestbook";
import { detectIcon, IconFor, ICON_COLOR } from "@/lib/link-icons";
import { fontStackFor, useRemoteFont } from "@/lib/fonts";
import { badgeIcon, tierRing, type Badge, type UserBadge } from "@/lib/badges";

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
  panel_background_url: string | null;
  panel_background_opacity: number;
  banned: boolean;
  custom_font_url: string | null;
  custom_font_name: string | null;
  auto_roblox_avatar: boolean;
  roblox_avatar_url: string | null;
  aurora_preset: string;
  aurora_intensity: number;
  view_count: number;
  created_at: string;
};
type Lnk = { id: string; label: string; url: string; icon: string | null; position: number };

export const Route = createFileRoute("/$username")({
  loader: async ({ params }) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", params.username.toLowerCase())
      .maybeSingle();
    if (error || !profile || (profile as { banned?: boolean }).banned) throw notFound();
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

type Review = { id: string; author_name: string; rating: number | null; created_at: string };

function ProfilePage() {
  const { profile, links } = Route.useLoaderData();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [panelBgUrl, setPanelBgUrl] = useState<string | null>(null);
  const [badges, setBadges] = useState<(Badge & UserBadge)[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<"profile" | "guestbook" | "reviews" | "links">("profile");

  useRemoteFont(profile.custom_font_url);

  useEffect(() => {
    resolveStorageUrl("avatars", profile.avatar_url).then(setAvatarUrl);
    resolveStorageUrl("music", profile.music_url).then(setMusicUrl);
    resolveStorageUrl("avatars", profile.background_image_url).then(setBgImageUrl);
    resolveStorageUrl("avatars", profile.panel_background_url).then(setPanelBgUrl);
    supabase
      .from("user_badges")
      .select("badge_key,equipped,awarded_at,badges(key,name,description,icon,tier,color,admin_only,sort)")
      .eq("user_id", profile.id)
      .eq("equipped", true)
      .then(({ data }) => {
        const rows = (data || []) as unknown as (UserBadge & { badges: Badge | null })[];
        setBadges(
          rows
            .filter(r => r.badges)
            .map(r => ({ ...(r.badges as Badge), badge_key: r.badge_key, equipped: r.equipped, awarded_at: r.awarded_at }))
            .sort((a, b) => a.sort - b.sort),
        );
      });
    supabase.auth.getUser().then(({ data }) => setIsOwner(data.user?.id === profile.id));
    supabase
      .from("reviews")
      .select("id,author_name,rating,created_at")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setReviews((data || []) as Review[]));
  }, [profile.id, profile.avatar_url, profile.music_url, profile.background_image_url, profile.panel_background_url]);

  const accent = profile.accent_color;
  const green = profile.secondary_color;
  const speedStyle = {
    ["--anim-speed" as never]: profile.animation_speed,
    fontFamily: fontStackFor(profile.font_family, profile.custom_font_name),
  } as React.CSSProperties;
  const isSiteOwner = profile.username.toLowerCase() === "owner";
  const name = profile.display_name || profile.username;
  const shownAvatar = (profile.auto_roblox_avatar && profile.roblox_avatar_url) || avatarUrl;

  const rated = reviews.filter(r => typeof r.rating === "number");
  const avgRating = rated.length
    ? (rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length)
    : 0;
  const joined = new Date(profile.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  const panelList = normalizePanels(profile.panels);
  const customCss = profile.custom_code_enabled ? sanitizeCss(profile.custom_css) : "";
  const customHtml = profile.custom_code_enabled ? sanitizeHtml(profile.custom_html) : "";

  const panelAnchor = (type: PanelConfig["type"]) =>
    type === "guestbook" ? "guestbook" : type === "reviews" ? "reviews" : type === "links" ? "links" : undefined;

  const renderPanelBody = (p: PanelConfig): React.ReactNode => {
    switch (p.type) {
      case "guestbook":
        return <Guestbook profileId={profile.id} isOwner={isOwner} />;
      case "about":
        return profile.bio
          ? <p className="px-5 pb-5 text-sm opacity-90 whitespace-pre-wrap">{profile.bio}</p>
          : null;
      case "reviews":
        return (
          <div className="px-5 pb-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-3xl font-bold flex items-center gap-1">
                {rated.length ? avgRating.toFixed(1) : "—"}
                <Star className="w-4 h-4" style={{ color: green }} fill={green} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{rated.length} review{rated.length === 1 ? "" : "s"}</div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} className="w-4 h-4" style={{ color: green, opacity: n <= Math.round(avgRating) ? 1 : 0.25 }}
                      fill={n <= Math.round(avgRating) ? green : "none"} />
              ))}
            </div>
          </div>
        );
      case "discord":
        return profile.discord_id
          ? <div className="px-3 pb-3"><LanyardCard discordId={profile.discord_id} /></div>
          : null;
      case "music":
        return profile.music_title || musicUrl
          ? (
            <div className="px-5 pb-5 flex items-center gap-3 text-sm">
              <span className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
                    style={{ background: `${accent}22`, color: accent }}>
                <Music className="w-4 h-4" />
              </span>
              <span className="truncate">{profile.music_title || "Background track"}</span>
            </div>
          )
          : null;
      case "guests":
        return (
          <ul className="px-5 pb-5 space-y-3">
            {reviews.slice(0, 4).map(r => (
              <li key={r.id} className="flex items-center gap-3 text-sm">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{ background: `${accent}22`, color: accent }}>
                  {(r.author_name || "?")[0]?.toUpperCase()}
                </span>
                <span className="truncate">{r.author_name}</span>
                <span className="ml-auto text-[11px] text-muted-foreground shrink-0">
                  {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: green, boxShadow: `0 0 6px ${green}` }} />
              </li>
            ))}
            {reviews.length === 0 && <li className="text-sm text-muted-foreground opacity-70">No guests yet ✦</li>}
          </ul>
        );
      case "links":
        return links.length
          ? (
            <div className="px-4 pb-4 grid gap-2">
              {links.map((l: Lnk) => {
                const kind = detectIcon(l.url);
                const color = ICON_COLOR[kind];
                return (
                  <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
                     className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-foreground/[0.07] bg-foreground/[0.03] hover:bg-foreground/[0.07] transition-colors duration-200 group">
                    <span className="flex items-center justify-center w-8 h-8 rounded-md shrink-0"
                          style={{ background: `${color}1f`, color }}>
                      <IconFor kind={kind} className="w-4 h-4" />
                    </span>
                    <span className="truncate font-medium">{l.label}</span>
                    <span className="ml-auto opacity-30 group-hover:opacity-80 transition-opacity">→</span>
                  </a>
                );
              })}
            </div>
          )
          : null;
      case "custom":
        return p.html
          ? <div className="px-5 pb-5 text-sm aurora-custom" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.html) }} />
          : null;
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen relative text-[14px] sm:text-[15px]" style={speedStyle}>
      {bgImageUrl && <ProfileBackground url={bgImageUrl} opacity={profile.background_opacity} />}
      {profile.aurora_preset !== "none" && (
        <AuroraVeil accent={accent} secondary={green} intensity={profile.aurora_intensity} preset={profile.aurora_preset} />
      )}
      {profile.background_effect === "particles" && <Particles color={accent} />}
      {profile.background_effect === "aurora" && <AuroraBg accent={accent} secondary={green} />}
      {profile.background_effect === "stars" && <Stars />}
      {profile.background_effect === "grid" && <Grid color={accent} />}
      {profile.background_effect === "matrix" && <Matrix color={accent} />}
      {profile.background_effect === "mesh" && <GradientMesh accent={accent} secondary={green} />}
      {profile.click_effect && <ClickEffect color={accent} style={profile.click_effect_style} />}
      {profile.custom_cursor && <CustomCursor accent={accent} secondary={green} />}
      {profile.cursor_trail && <CursorTrail color={accent} />}

      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl" style={{ background: "oklch(0.12 0.03 280 / 0.72)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-5 h-5" style={{ color: accent }} />
            <span className="font-bold text-lg tracking-tight">aurora.lol</span>
          </Link>

          <nav className="mx-auto hidden md:flex items-center gap-1 text-sm">
            {([
              ["profile", "Profile"],
              ["guestbook", "Guestbook"],
              ["reviews", "Reviews"],
              ["links", "Links"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="px-4 py-1.5 rounded-full transition-colors"
                style={tab === key
                  ? { border: `1px solid ${accent}88`, background: `${accent}18`, color: "inherit", boxShadow: `0 0 18px -6px ${accent}` }
                  : { color: "var(--muted-foreground)" }}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {isOwner && (
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                style={{ border: `1px solid ${accent}66`, background: `${accent}14` }}
              >
                <Pencil className="w-3.5 h-3.5" /> Customize
              </Link>
            )}
            <div className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1" style={{ border: `1px solid ${accent}44`, background: "oklch(0.16 0.03 280 / 0.7)" }}>
              <Avatar url={shownAvatar} name={name} shape={profile.avatar_shape} accent={accent} green={green} size="sm" />
              <span className="text-sm truncate max-w-[140px]">{name}</span>
              {isSiteOwner && <Crown className="w-3.5 h-3.5" style={{ color: "oklch(0.85 0.18 80)" }} />}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero */}
        <section id="profile" className="animate-fade-in-up rounded-2xl overflow-hidden relative"
                 style={{
                   border: `1px solid oklch(1 0 0 / 0.08)`,
                   background: `oklch(0.15 0.02 280 / ${clamp(profile.card_opacity)})`,
                   backdropFilter: `blur(${profile.card_blur}px)`,
                   boxShadow: profile.border_glow
                     ? `0 28px 70px -36px oklch(0 0 0 / 0.9), 0 0 0 1px ${accent}1f inset`
                     : "0 24px 60px -38px oklch(0 0 0 / 0.85)",
                 }}>
          {/* panel background image */}
          {panelBgUrl && (
            <div aria-hidden className="absolute inset-0 pointer-events-none"
                 style={{
                   backgroundImage: `url("${panelBgUrl}")`,
                   backgroundSize: "cover",
                   backgroundPosition: "center",
                   opacity: profile.panel_background_opacity ?? 0.5,
                 }} />
          )}
          {/* soft accent wash */}
          <div aria-hidden className="absolute inset-0 pointer-events-none"
               style={{
                 background: `radial-gradient(ellipse 55% 120% at 85% 0%, ${accent}33, transparent 62%),
                              linear-gradient(to bottom, oklch(0.11 0.02 280 / 0.15), oklch(0.11 0.02 280 / 0.45))`,
               }} />
          <div className="relative p-6 sm:p-9 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-7">
            <Avatar url={shownAvatar} name={name} shape={profile.avatar_shape} accent={accent} green={green} size="lg" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
                <h1 className="text-[26px] sm:text-4xl font-semibold tracking-[-0.02em] truncate">{name}</h1>
                {isSiteOwner && <Crown className="w-5 h-5 shrink-0" style={{ color: "oklch(0.85 0.15 80)" }} />}
                {badges.length > 0 && (
                  <span className="inline-flex items-center gap-1 pl-1">
                    {badges.map(b => {
                      const Icon = badgeIcon(b.icon);
                      return (
                        <span key={b.key} aria-label={b.name} tabIndex={0}
                              className="group relative grid place-items-center rounded-full w-[26px] h-[26px] outline-none transition-transform duration-200 ease-out hover:scale-[1.35] focus-visible:scale-[1.35] hover:z-20"
                              style={{ ...tierRing(b.tier, b.color), background: `${b.color}1a`, color: b.color }}>
                          <Icon className="w-3.5 h-3.5" />
                          <span role="tooltip"
                                className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-[210px] -translate-x-1/2 translate-y-1 scale-95 rounded-lg px-2.5 py-1.5 text-left opacity-0 transition-all duration-150 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                                style={{ background: "oklch(0.14 0.02 280 / 0.96)", border: "1px solid oklch(1 0 0 / 0.1)", boxShadow: "0 10px 30px -12px oklch(0 0 0 / 0.8)" }}>
                            <span className="block text-[11px] font-medium text-foreground whitespace-nowrap">{b.name}</span>
                            <span className="block text-[10px] leading-snug text-muted-foreground whitespace-normal">{b.description}</span>
                          </span>
                        </span>
                      );
                    })}
                  </span>
                )}

              </div>

              <div className="mt-1 text-muted-foreground">@{profile.username}</div>
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" /> Joined {joined}
                </span>
              </div>
              {profile.bio && <p className="mt-4 text-sm sm:text-base opacity-90 whitespace-pre-wrap">{profile.bio}</p>}
            </div>
            <span className="absolute top-5 right-5 flex items-center gap-2 rounded-full px-3 py-1 text-xs"
                  style={{ background: "oklch(0.16 0.03 280 / 0.8)", border: `1px solid ${green}55` }}>
              <span className="w-2 h-2 rounded-full" style={{ background: green, boxShadow: `0 0 8px ${green}` }} /> Online
            </span>
          </div>

          {/* Stats bar */}
          <div className="relative border-t px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center gap-6"
               style={{ borderColor: "oklch(1 0 0 / 0.07)", background: "oklch(0.11 0.02 280 / 0.45)" }}>
            <div className="flex items-center gap-8 sm:gap-12">
              <Stat label="Guests" value={String(profile.view_count ?? 0)} icon={<Users className="w-3.5 h-3.5" />} />
              <div className="w-px h-10" style={{ background: "oklch(1 0 0 / 0.08)" }} />
              <Stat label="Messages" value={String(reviews.length)} icon={<MessageSquare className="w-3.5 h-3.5" />} />
              <div className="w-px h-10" style={{ background: "oklch(1 0 0 / 0.08)" }} />
              <Stat label="Rating" value={rated.length ? avgRating.toFixed(1) : "—"} icon={<Star className="w-3.5 h-3.5" />} accent={green} />
            </div>
            <div className="sm:ml-auto flex items-center gap-2.5">
              {links.slice(0, 5).map((l: Lnk) => {
                const kind = detectIcon(l.url);
                const color = ICON_COLOR[kind];
                return (
                  <a key={l.id} href={l.url} target="_blank" rel="noreferrer" aria-label={l.label} title={l.label}
                     className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 hover:bg-foreground/[0.08]"
                     style={{ border: "1px solid oklch(1 0 0 / 0.08)", background: "oklch(1 0 0 / 0.04)", color }}>
                    <IconFor kind={kind} className="w-[18px] h-[18px]" />
                  </a>
                );
              })}
              {profile.roblox_url && (
                <a href={profile.roblox_url} target="_blank" rel="noreferrer" aria-label="Roblox profile"
                   className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 hover:bg-foreground/[0.08]"
                   style={{ border: "1px solid oklch(1 0 0 / 0.08)", background: "oklch(1 0 0 / 0.04)", color: accent }}>
                  <Link2 className="w-[18px] h-[18px]" />
                </a>
              )}
            </div>
          </div>

        </section>

        {/* Panels — layout comes from the owner's editor */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {panelList.filter(p => !p.hidden).map(p => {
            const title = p.title || PANEL_LABELS[p.type];
            const body = renderPanelBody(p);
            if (!body) return null;
            return (
              <div key={p.id} className="panel-cell col-span-12" style={{ ["--pw" as never]: p.w }}>
                <Panel id={panelAnchor(p.type)} profile={profile} accent={accent} green={green}
                       title={title} icon={PANEL_ICONS[p.type]} titleColor={p.type === "reviews" ? green : accent}
                       minHeight={p.h || undefined}>
                  {body}
                </Panel>
              </div>
            );
          })}
        </div>


        <footer className="text-center text-xs text-muted-foreground py-8">
          © {new Date().getFullYear()} <Link to="/" className="hover:text-foreground">aurora.lol</Link> ✦
        </footer>
      </main>

      {musicUrl && <MusicPlayer src={musicUrl} title={profile.music_title} />}
    </div>
  );
}

function clamp(n: number) {
  return Math.max(0.05, Math.min(0.95, n));
}

function Stat({ label, value, icon, accent }: { label: string; value: string; icon?: React.ReactNode; accent?: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-[28px] font-semibold tracking-tight" style={accent ? { color: accent } : undefined}>{value}</div>
      <div className="mt-0.5 flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
    </div>
  );
}

function Avatar({ url, name, shape, accent, green, size }: {
  url: string | null; name: string; shape: string; accent: string; green: string; size: "sm" | "lg";
}) {
  const radius = shape === "square" ? "rounded-2xl" : shape === "hex" ? "rounded-[30%]" : "rounded-full";
  const dim = size === "lg" ? "w-24 h-24 sm:w-32 sm:h-32" : "w-7 h-7";
  return (
    <div
      className={`${dim} ${radius} shrink-0 p-[2px]`}
      style={{
        background: `linear-gradient(150deg, ${accent}cc, ${green}66)`,
        boxShadow: size === "lg" ? "0 14px 34px -18px oklch(0 0 0 / 0.9)" : undefined,
      }}
    >
      {url ? (
        <img
          src={url}
          alt={`${name}'s avatar`}
          loading={size === "lg" ? "eager" : "lazy"}
          decoding="async"
          className={`w-full h-full ${radius} object-cover bg-background`}
        />
      ) : (
        <div className={`w-full h-full ${radius} bg-background flex items-center justify-center font-semibold ${size === "lg" ? "text-3xl sm:text-4xl" : "text-xs"}`}>
          {name[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}

function Panel({ id, title, icon, titleColor, right, profile, accent, children }: {
  id?: string; title: string; icon?: React.ReactNode; titleColor?: string; right?: React.ReactNode;
  profile: Profile; accent: string; green: string; children: React.ReactNode;
}) {
  return (
    <section id={id}
             className={`rounded-2xl overflow-hidden animate-fade-in-up ${profile.tilt_cards ? "tilt-card" : ""}`}
             style={{
               border: `1px solid oklch(1 0 0 / 0.07)`,
               background: `oklch(0.15 0.02 280 / ${clamp(profile.card_opacity)})`,
               backdropFilter: `blur(${profile.card_blur}px)`,
               boxShadow: profile.border_glow
                 ? `0 24px 60px -34px oklch(0 0 0 / 0.9), 0 0 0 1px ${accent}1a inset`
                 : "0 20px 50px -34px oklch(0 0 0 / 0.85)",
             }}>
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <span className="opacity-90" style={{ color: titleColor || accent }}>{icon}</span>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground/85">{title}</h2>
        {right && <span className="ml-auto">{right}</span>}
      </div>
      {children}
    </section>
  );
}

