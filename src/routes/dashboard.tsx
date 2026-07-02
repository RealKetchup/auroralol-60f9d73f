import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { resolveStorageUrl } from "@/lib/storage";
import { Plus, Trash2, LogOut, ExternalLink, Upload } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: Dashboard,
});

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

const STYLE_OPTIONS = [
  { id: "code", label: "Code editor" },
  { id: "minimal", label: "Minimal card" },
];

const BG_OPTIONS = [
  { id: "particles", label: "Particles" },
  { id: "aurora", label: "Aurora" },
  { id: "stars", label: "Stars" },
  { id: "grid", label: "Grid" },
  { id: "matrix", label: "Matrix" },
  { id: "mesh", label: "Mesh" },
  { id: "none", label: "None" },
];
const FONT_OPTIONS = [
  { id: "space-grotesk", label: "Grotesk" },
  { id: "mono", label: "Mono" },
  { id: "serif", label: "Serif" },
  { id: "system", label: "System" },
];
const LAYOUT_OPTIONS = [
  { id: "classic", label: "Classic" },
  { id: "wide", label: "Wide" },
  { id: "grid", label: "Grid links" },
];
const CLICK_OPTIONS = [
  { id: "burst", label: "Burst" },
  { id: "ripple", label: "Ripple" },
  { id: "sparkle", label: "Sparkle" },
  { id: "heart", label: "Heart" },
];
const ANIM_OPTIONS = [
  { id: "fade-up", label: "Fade up" },
  { id: "fade-down", label: "Fade down" },
  { id: "zoom", label: "Zoom" },
  { id: "blur", label: "Blur" },
  { id: "none", label: "None" },
];
const AVATAR_OPTIONS = [
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "hex", label: "Hex" },
];

const THEME_PRESETS: { id: string; label: string; accent: string; secondary: string; bg: string; font: string; click: string }[] = [
  { id: "aurora",   label: "Aurora",     accent: "#a855f7", secondary: "#22c55e", bg: "aurora",    font: "space-grotesk", click: "burst" },
  { id: "sunset",   label: "Sunset",     accent: "#f97316", secondary: "#ec4899", bg: "mesh",      font: "space-grotesk", click: "sparkle" },
  { id: "cyber",    label: "Cyberpunk",  accent: "#22d3ee", secondary: "#a855f7", bg: "grid",      font: "mono",          click: "burst" },
  { id: "matrix",   label: "Matrix",     accent: "#22c55e", secondary: "#16a34a", bg: "matrix",    font: "mono",          click: "sparkle" },
  { id: "midnight", label: "Midnight",   accent: "#6366f1", secondary: "#8b5cf6", bg: "stars",     font: "space-grotesk", click: "ripple" },
  { id: "bubblegum",label: "Bubblegum",  accent: "#ec4899", secondary: "#f472b6", bg: "particles", font: "space-grotesk", click: "heart" },
  { id: "vapor",    label: "Vaporwave",  accent: "#f0abfc", secondary: "#67e8f9", bg: "mesh",      font: "serif",         click: "sparkle" },
  { id: "ember",    label: "Ember",      accent: "#ef4444", secondary: "#f59e0b", bg: "particles", font: "space-grotesk", click: "burst" },
  { id: "mint",     label: "Mint",       accent: "#10b981", secondary: "#06b6d4", bg: "aurora",    font: "space-grotesk", click: "ripple" },
  { id: "royal",    label: "Royal",      accent: "#eab308", secondary: "#7c3aed", bg: "stars",     font: "serif",         click: "sparkle" },
  { id: "mono",     label: "Monochrome", accent: "#e5e5e5", secondary: "#737373", bg: "grid",      font: "mono",          click: "ripple" },
  { id: "blood",    label: "Blood Moon", accent: "#dc2626", secondary: "#450a0a", bg: "matrix",    font: "mono",          click: "burst" },
];

const SONG_LIBRARY: { title: string; mood: string; url: string }[] = [
  { title: "Lofi Rain",       mood: "chill · lofi",     url: "https://cdn.pixabay.com/audio/2022/10/25/audio_946bc7a4b6.mp3" },
  { title: "Neon Nights",     mood: "synthwave",        url: "https://cdn.pixabay.com/audio/2023/08/29/audio_1f16a9e35a.mp3" },
  { title: "Deep Space",      mood: "ambient",          url: "https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3" },
  { title: "Cyberpunk Ride",  mood: "electronic",       url: "https://cdn.pixabay.com/audio/2024/03/07/audio_2c8bcae13d.mp3" },
  { title: "Midnight Drive",  mood: "synthwave",        url: "https://cdn.pixabay.com/audio/2023/06/14/audio_39956d2f6d.mp3" },
  { title: "Retro Wave",      mood: "80s vibes",        url: "https://cdn.pixabay.com/audio/2022/10/16/audio_2d10f6b330.mp3" },
];


function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Lnk[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [musicPath, setMusicPath] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate({ to: "/auth" }); return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (!p) { toast.error("Profile not found"); setLoading(false); return; }
      const { data: ls } = await supabase.from("links").select("*").eq("profile_id", user.id).order("position");
      setProfile(p as Profile);
      setLinks((ls || []) as Lnk[]);
      setMusicPath(p.music_url || "");
      resolveStorageUrl("avatars", p.avatar_url).then(setAvatarPreview);
      setLoading(false);
    })();
  }, [navigate]);

  const patch = (p: Partial<Profile>) => setProfile(prev => prev ? { ...prev, ...p } : prev);

  const save = async () => {
    if (!profile) return;
    const uname = profile.username.trim().toLowerCase();
    if (!/^[a-z0-9_-]{2,24}$/.test(uname)) return toast.error("Username must be 2–24 chars · a-z 0-9 _ -");
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      username: uname,
      display_name: profile.display_name,
      bio: profile.bio,
      discord_id: profile.discord_id,
      roblox_url: profile.roblox_url,
      music_url: musicPath || null,
      music_title: profile.music_title,
      accent_color: profile.accent_color,
      secondary_color: profile.secondary_color,
      background_effect: profile.background_effect,
      click_effect: profile.click_effect,
      custom_cursor: profile.custom_cursor,
      font_family: profile.font_family,
      layout_style: profile.layout_style,
      card_opacity: profile.card_opacity,
      card_blur: profile.card_blur,
      border_glow: profile.border_glow,
      cursor_trail: profile.cursor_trail,
      tilt_cards: profile.tilt_cards,
      click_effect_style: profile.click_effect_style,
      background_image_url: profile.background_image_url,
      background_opacity: profile.background_opacity,
      entry_animation: profile.entry_animation,
      avatar_shape: profile.avatar_shape,
      animation_speed: profile.animation_speed,
      profile_style: profile.profile_style,
    }).eq("id", profile.id);
    setSaving(false);
    if (error) {
      if (error.code === "23505" || /duplicate|unique/i.test(error.message)) return toast.error("That username is already taken");
      return toast.error(error.message);
    }
    toast.success("Saved");
  };


  const uploadAvatar = async (file: File) => {
    if (!profile) return;
    if (file.size > 4 * 1024 * 1024) return toast.error("Max 4MB");
    const ext = file.name.split(".").pop() || "png";
    const path = `${profile.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) return toast.error(error.message);
    await supabase.from("profiles").update({ avatar_url: path }).eq("id", profile.id);
    patch({ avatar_url: path });
    resolveStorageUrl("avatars", path).then(setAvatarPreview);
    toast.success("Avatar updated");
  };

  const uploadBackground = async (file: File) => {
    if (!profile) return;
    if (file.size > 6 * 1024 * 1024) return toast.error("Max 6MB");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${profile.id}/background.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) return toast.error(error.message);
    patch({ background_image_url: path });
    toast.success("Background uploaded — hit save");
  };

  const uploadMusic = async (file: File) => {
    if (!profile) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("Max 10MB");
    const ext = file.name.split(".").pop() || "mp3";
    const path = `${profile.id}/track.${ext}`;
    const { error } = await supabase.storage.from("music").upload(path, file, { upsert: true, contentType: file.type });
    if (error) return toast.error(error.message);
    setMusicPath(path);
    if (profile && !profile.music_title) patch({ music_title: file.name.replace(/\.[^.]+$/, "") });
    toast.success("Music uploaded — hit save");
  };

  const addLink = async () => {
    if (!profile) return;
    const { data, error } = await supabase.from("links").insert({
      profile_id: profile.id, label: "New link", url: "https://", position: links.length,
    }).select().single();
    if (error) return toast.error(error.message);
    setLinks([...links, data as Lnk]);
  };
  const updateLink = async (id: string, p: Partial<Lnk>) => {
    setLinks(ls => ls.map(l => l.id === id ? { ...l, ...p } : l));
  };
  const flushLink = async (l: Lnk) => {
    await supabase.from("links").update({ label: l.label, url: l.url }).eq("id", l.id);
  };
  const removeLink = async (id: string) => {
    await supabase.from("links").delete().eq("id", id);
    setLinks(ls => ls.filter(l => l.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-muted-foreground">loading...</div>;
  }
  if (!profile) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-mono font-bold text-aurora">aurora.lol</Link>
          <div className="flex items-center gap-2">
            <Link to="/$username" params={{ username: profile.username }} target="_blank"
                  className="glass-strong px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 hover:glow-purple transition-shadow">
              View <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button onClick={signOut} className="glass-strong px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          {/* Themes */}
          <Section title="// THEME PRESETS · one-click">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_PRESETS.map(t => {
                const active = profile.accent_color === t.accent && profile.secondary_color === t.secondary && profile.background_effect === t.bg;
                return (
                  <button key={t.id} onClick={() => patch({
                    accent_color: t.accent, secondary_color: t.secondary,
                    background_effect: t.bg, font_family: t.font, click_effect_style: t.click,
                  })}
                    className={`relative rounded-lg p-3 text-left border transition-all hover:-translate-y-0.5 ${active ? "border-primary glow-purple" : "border-border"}`}
                    style={{ background: `linear-gradient(135deg, ${t.accent}22, ${t.secondary}22)` }}>
                    <div className="flex gap-1 mb-2">
                      <span className="w-4 h-4 rounded-full" style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }} />
                      <span className="w-4 h-4 rounded-full" style={{ background: t.secondary, boxShadow: `0 0 8px ${t.secondary}` }} />
                    </div>
                    <div className="text-xs font-mono font-semibold">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{t.bg}</div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Identity */}
          <Section title="// IDENTITY">

            <div className="flex gap-4">
              <label className="shrink-0 cursor-pointer group">
                <div className="w-20 h-20 rounded-full p-0.5"
                     style={{ background: `linear-gradient(135deg, ${profile.accent_color}, ${profile.secondary_color})` }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} className="w-full h-full rounded-full object-cover bg-background" alt="" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-bold">
                      {profile.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden"
                       onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
                <div className="text-[10px] text-center mt-1 font-mono text-muted-foreground group-hover:text-foreground">change</div>
              </label>
              <div className="flex-1 space-y-2">
                <Field label="Username · your public URL /[username]">
                  <div className="flex items-stretch gap-0 rounded-md border border-border overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                    <span className="px-3 flex items-center bg-input/40 text-xs text-muted-foreground font-mono border-r border-border">aurora.lol/</span>
                    <input value={profile.username}
                           onChange={e => patch({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24) })}
                           className="flex-1 bg-input px-3 py-2 text-sm font-mono focus:outline-none" />
                  </div>
                </Field>

                <Field label="Display name">
                  <input value={profile.display_name ?? ""} onChange={e => patch({ display_name: e.target.value })}
                         className="w-full bg-input rounded-md px-3 py-2 text-sm border border-border" />
                </Field>
              </div>
            </div>
            <Field label="Bio">
              <textarea value={profile.bio ?? ""} onChange={e => patch({ bio: e.target.value })} rows={3} maxLength={300}
                        className="w-full bg-input rounded-md px-3 py-2 text-sm border border-border resize-none" />
            </Field>
          </Section>

          {/* Integrations */}
          <Section title="// INTEGRATIONS">
            <Field label="Discord ID (for Lanyard live status)">
              <input value={profile.discord_id ?? ""} onChange={e => patch({ discord_id: e.target.value })}
                     placeholder="e.g. 156114103033790464"
                     className="w-full bg-input rounded-md px-3 py-2 text-sm border border-border font-mono" />
              <p className="text-xs text-muted-foreground mt-1">Join discord.gg/lanyard for live status to work.</p>
            </Field>
            <Field label="Roblox profile URL">
              <input value={profile.roblox_url ?? ""} onChange={e => patch({ roblox_url: e.target.value })}
                     placeholder="https://roblox.com/users/123/profile"
                     className="w-full bg-input rounded-md px-3 py-2 text-sm border border-border" />
            </Field>
          </Section>

          {/* Music */}
          <Section title="// MUSIC">
            <Field label="Track title">
              <input value={profile.music_title ?? ""} onChange={e => patch({ music_title: e.target.value })}
                     className="w-full bg-input rounded-md px-3 py-2 text-sm border border-border" />
            </Field>
            <Field label="Audio URL or upload">
              <input value={musicPath} onChange={e => setMusicPath(e.target.value)}
                     placeholder="https://... or upload below"
                     className="w-full bg-input rounded-md px-3 py-2 text-sm border border-border font-mono text-xs" />
            </Field>
            <label className="inline-flex items-center gap-2 glass-strong rounded-md px-3 py-2 text-sm cursor-pointer hover:glow-purple transition-shadow">
              <Upload className="w-4 h-4" /> Upload MP3
              <input type="file" accept="audio/*" className="hidden"
                     onChange={e => e.target.files?.[0] && uploadMusic(e.target.files[0])} />
            </label>
            <div className="pt-2">
              <div className="text-xs font-mono text-muted-foreground mb-2">// free song library — click to use</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {SONG_LIBRARY.map(s => (
                  <button key={s.url} onClick={() => { setMusicPath(s.url); patch({ music_title: s.title }); }}
                          className={`text-left rounded-md px-3 py-2 border text-xs transition-all hover:-translate-y-0.5 ${musicPath === s.url ? "border-primary glow-purple" : "border-border bg-input/40"}`}>
                    <div className="font-medium truncate">♪ {s.title}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{s.mood}</div>
                  </button>
                ))}
              </div>
            </div>
          </Section>


          {/* Links */}
          <Section title="// LINKS">
            <div className="space-y-2">
              {links.map((l) => (
                <div key={l.id} className="flex gap-2">
                  <input value={l.label} onChange={e => updateLink(l.id, { label: e.target.value })} onBlur={() => flushLink(l)}
                         placeholder="Label"
                         className="w-1/3 bg-input rounded-md px-3 py-2 text-sm border border-border" />
                  <input value={l.url} onChange={e => updateLink(l.id, { url: e.target.value })} onBlur={() => flushLink(l)}
                         placeholder="https://"
                         className="flex-1 bg-input rounded-md px-3 py-2 text-sm border border-border font-mono text-xs" />
                  <button onClick={() => removeLink(l.id)} className="text-destructive px-2 hover:bg-destructive/10 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={addLink}
                      className="w-full glass-strong rounded-md py-2 text-sm flex items-center justify-center gap-1.5 hover:glow-purple transition-shadow">
                <Plus className="w-4 h-4" /> Add link
              </button>
            </div>
          </Section>
        </div>

        {/* Customization sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Section title="// COLORS">
            <Field label="Accent color">
              <ColorRow value={profile.accent_color} onChange={c => patch({ accent_color: c })} />
            </Field>
            <Field label="Secondary color">
              <ColorRow value={profile.secondary_color} onChange={c => patch({ secondary_color: c })} />
            </Field>
          </Section>

          <Section title="// LAYOUT & TYPE">
            <Field label="Font">
              <Pills options={FONT_OPTIONS} value={profile.font_family} onChange={v => patch({ font_family: v })} />
            </Field>
            <Field label="Layout">
              <Pills options={LAYOUT_OPTIONS} value={profile.layout_style} onChange={v => patch({ layout_style: v })} />
            </Field>
            <Field label="Avatar shape">
              <Pills options={AVATAR_OPTIONS} value={profile.avatar_shape} onChange={v => patch({ avatar_shape: v })} />
            </Field>
            <Field label="Entry animation">
              <Pills options={ANIM_OPTIONS} value={profile.entry_animation} onChange={v => patch({ entry_animation: v })} />
            </Field>
          </Section>

          <Section title="// CARDS">
            <Slider label={`Opacity · ${profile.card_opacity.toFixed(2)}`} min={0.1} max={0.95} step={0.05}
                    value={profile.card_opacity} onChange={v => patch({ card_opacity: v })} />
            <Slider label={`Blur · ${profile.card_blur}px`} min={0} max={40} step={2}
                    value={profile.card_blur} onChange={v => patch({ card_blur: v })} />
            <Toggle label="Glowing border" checked={profile.border_glow} onChange={v => patch({ border_glow: v })} />
            <Toggle label="Tilt on hover" checked={profile.tilt_cards} onChange={v => patch({ tilt_cards: v })} />
          </Section>

          <Section title="// BACKGROUND">
            <Field label="Effect">
              <Pills options={BG_OPTIONS} value={profile.background_effect} onChange={v => patch({ background_effect: v })} />
            </Field>
            <label className="inline-flex items-center gap-2 glass-strong rounded-md px-3 py-2 text-sm cursor-pointer hover:glow-purple transition-shadow">
              <Upload className="w-4 h-4" /> Upload image
              <input type="file" accept="image/*" className="hidden"
                     onChange={e => e.target.files?.[0] && uploadBackground(e.target.files[0])} />
            </label>
            {profile.background_image_url && (
              <>
                <Slider label={`Image opacity · ${profile.background_opacity.toFixed(2)}`} min={0.05} max={1} step={0.05}
                        value={profile.background_opacity} onChange={v => patch({ background_opacity: v })} />
                <button onClick={() => patch({ background_image_url: null })}
                        className="text-xs text-destructive hover:underline">Remove image</button>
              </>
            )}
          </Section>

          <Section title="// EFFECTS">
            <Toggle label="Click burst" checked={profile.click_effect} onChange={v => patch({ click_effect: v })} />
            {profile.click_effect && (
              <Field label="Click style">
                <Pills options={CLICK_OPTIONS} value={profile.click_effect_style} onChange={v => patch({ click_effect_style: v })} />
              </Field>
            )}
            <Toggle label="Custom cursor" checked={profile.custom_cursor} onChange={v => patch({ custom_cursor: v })} />
            <Toggle label="Cursor trail" checked={profile.cursor_trail} onChange={v => patch({ cursor_trail: v })} />
          </Section>

          <button onClick={save} disabled={saving}
                  className="w-full rounded-lg py-3 font-medium animate-pulse-glow"
                  style={{ background: "var(--grad-aurora)", color: "white" }}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </aside>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass p-5 space-y-3">
      <h2 className="font-mono text-xs tracking-wider opacity-70">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-mono text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="w-full flex items-center justify-between text-sm py-1">
      <span>{label}</span>
      <span className={`w-9 h-5 rounded-full p-0.5 transition-all ${checked ? "" : "bg-muted"}`}
            style={checked ? { background: "var(--grad-aurora)" } : undefined}>
        <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}
function Pills({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-mono border transition-all ${
                  value === o.id ? "border-primary glow-purple" : "border-border bg-input"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
function Slider({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  return (
    <label className="block">
      <div className="text-xs font-mono text-muted-foreground mb-1">{label}</div>
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={e => onChange(parseFloat(e.target.value))}
             className="w-full accent-primary" />
    </label>
  );
}
function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const PRESETS = ["#a855f7", "#22c55e", "#ec4899", "#06b6d4", "#f59e0b", "#ef4444"];
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={hexFromAny(value)} onChange={e => onChange(e.target.value)}
             className="w-10 h-9 rounded cursor-pointer bg-transparent border border-border" />
      <div className="flex gap-1 flex-1">
        {PRESETS.map(p => (
          <button key={p} onClick={() => onChange(p)}
                  className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform"
                  style={{ background: p }} aria-label={p} />
        ))}
      </div>
    </div>
  );
}
function hexFromAny(v: string) {
  if (v.startsWith("#")) return v;
  return "#a855f7";
}
