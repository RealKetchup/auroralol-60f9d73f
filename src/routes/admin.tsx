import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { badgeIcon, tierRing, type Badge } from "@/lib/badges";
import { Ban, Check, Search, Shield, Trash2, RefreshCw, LogOut, ExternalLink, Download, Copy, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — aurora.lol" },
      { name: "description", content: "Staff-only control panel for aurora.lol: moderate profiles, hand out badges, manage roles." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin — aurora.lol" },
      { property: "og:description", content: "Staff-only control panel for aurora.lol." },
    ],
  }),
  component: AdminPage,
});

type Row = {
  id: string;
  username: string;
  display_name: string | null;
  banned: boolean;
  ban_reason: string | null;
  view_count: number;
  created_at: string;
};

function AdminPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"loading" | "signin" | "gate" | "in">("loading");
  const [pass, setPass] = useState("");
  const [checking, setChecking] = useState(false);

  const detect = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setStage("signin");
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    setStage(data ? "in" : "gate");
  }, []);

  useEffect(() => { detect(); }, [detect]);

  const unlock = async () => {
    setChecking(true);
    const { data, error } = await supabase.rpc("redeem_admin_code", { _code: pass });
    setChecking(false);
    setPass("");
    if (error) return toast.error(error.message);
    if (!data) return toast.error("Wrong password");
    toast.success("Welcome, admin");
    setStage("in");
  };

  if (stage === "loading") {
    return <div className="min-h-screen grid place-items-center font-mono text-muted-foreground">checking access...</div>;
  }

  if (stage === "signin") {
    return (
      <Shell>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground mt-2">Sign in first, then enter the admin password.</p>
        <button onClick={() => navigate({ to: "/auth" })}
                className="mt-6 w-full rounded-lg py-3 font-medium" style={{ background: "var(--grad-aurora)", color: "white" }}>
          Go to sign in
        </button>
      </Shell>
    );
  }

  if (stage === "gate") {
    return (
      <Shell>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Admin access</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Enter the admin password to unlock the control panel.</p>
        <form onSubmit={e => { e.preventDefault(); unlock(); }} className="mt-6 space-y-3">
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password"
                 placeholder="Admin password"
                 className="w-full bg-input rounded-md px-3 py-2.5 text-sm border border-border font-mono" />
          <button type="submit" disabled={checking || !pass}
                  className="w-full rounded-lg py-3 font-medium disabled:opacity-50"
                  style={{ background: "var(--grad-aurora)", color: "white" }}>
            {checking ? "Checking..." : "Unlock"}
          </button>
        </form>
        <Link to="/" className="block mt-4 text-center text-xs text-muted-foreground hover:text-foreground">← back to aurora.lol</Link>
      </Shell>
    );
  }

  return <AdminPanel />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="glass-strong rounded-2xl p-8 w-full max-w-sm animate-fade-in-up">{children}</div>
    </div>
  );
}

function AdminPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const [owned, setOwned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [savingCode, setSavingCode] = useState(false);
  const [sort, setSort] = useState<"new" | "views" | "name">("new");
  const [only, setOnly] = useState<"all" | "banned" | "quiet">("all");
  const [edit, setEdit] = useState({ username: "", display_name: "", bio: "" });
  const [badgeQ, setBadgeQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [busy, setBusy] = useState("");


  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: profiles }, { data: bs }, ownerCheck] = await Promise.all([
      supabase.from("profiles").select("id,username,display_name,banned,ban_reason,view_count,created_at")
        .order("created_at", { ascending: false }).limit(300),
      supabase.from("badges").select("*").order("sort"),
      supabase.rpc("is_site_owner"),
    ]);
    setRows((profiles || []) as Row[]);
    setBadges((bs || []) as Badge[]);
    setIsOwner(ownerCheck.data === true);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pick = async (r: Row) => {
    setSelected(r);
    setEdit({ username: r.username, display_name: r.display_name || "", bio: "" });
    const { data } = await supabase.from("user_badges").select("badge_key").eq("user_id", r.id);
    setOwned((data || []).map(d => d.badge_key));
  };

  const setBan = async (r: Row, banned: boolean) => {
    const reason = banned ? (window.prompt("Ban reason?") || "Violated the rules") : "";
    const { error } = await supabase.rpc("admin_set_ban", { _user_id: r.id, _banned: banned, _reason: reason });
    if (error) return toast.error(error.message);
    setRows(rs => rs.map(x => x.id === r.id ? { ...x, banned, ban_reason: reason || null } : x));
    if (selected?.id === r.id) setSelected(s => s ? { ...s, banned, ban_reason: reason || null } : s);
    toast.success(banned ? "Profile banned" : "Ban lifted");
  };

  const toggleBadge = async (key: string) => {
    if (!selected) return;
    const has = owned.includes(key);
    const { error } = await supabase.rpc(has ? "admin_revoke_badge" : "admin_grant_badge",
      { _user_id: selected.id, _badge_key: key });
    if (error) return toast.error(error.message);
    setOwned(o => has ? o.filter(k => k !== key) : [...o, key]);
    toast.success(has ? "Badge removed" : "Badge granted");
  };

  const grantAll = async (grant: boolean) => {
    if (!selected) return;
    const keys = grant ? badges.map(b => b.key).filter(k => !owned.includes(k)) : owned;
    if (keys.length === 0) return;
    for (const key of keys) {
      await supabase.rpc(grant ? "admin_grant_badge" : "admin_revoke_badge",
        { _user_id: selected.id, _badge_key: key });
    }
    setOwned(grant ? badges.map(b => b.key) : []);
    toast.success(grant ? "All badges granted" : "All badges revoked");
  };

  const makeAdmin = async (r: Row, enabled: boolean) => {
    const { error } = await supabase.rpc("admin_set_role", { _user_id: r.id, _role: "admin", _enabled: enabled });
    if (error) return toast.error(error.message);
    toast.success(enabled ? `${r.username} is now an admin` : `Removed admin from ${r.username}`);
  };

  const wipeReviews = async (r: Row) => {
    if (!window.confirm(`Delete every guestbook entry on @${r.username}?`)) return;
    const { error } = await supabase.from("reviews").delete().eq("profile_id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Guestbook cleared");
  };

  const patchProfile = async (r: Row, patch: Record<string, unknown>, msg: string) => {
    const { error } = await supabase.from("profiles").update(patch as never).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(msg);
    load();
  };

  const saveIdentity = async () => {
    if (!selected) return;
    const username = edit.username.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24);
    if (username.length < 2) return toast.error("Username is too short");
    await patchProfile(selected, { username, display_name: edit.display_name || null }, "Profile details saved");
    setSelected(s => s ? { ...s, username, display_name: edit.display_name || null } : s);
  };

  const changeCode = async () => {
    if (newCode.trim().length < 6) return toast.error("Use at least 6 characters");
    setSavingCode(true);
    const { data, error } = await supabase.rpc("admin_set_code", { _new_code: newCode.trim() });
    setSavingCode(false);
    setNewCode("");
    if (error) return toast.error(error.message);
    if (!data) return toast.error("Only the owner account can change the admin password");
    toast.success("Admin password updated");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  const filtered = rows
    .filter(r => !q || r.username.includes(q.toLowerCase()) || (r.display_name || "").toLowerCase().includes(q.toLowerCase()))
    .filter(r => only === "all" ? true : only === "banned" ? r.banned : (r.view_count || 0) === 0)
    .sort((a, b) =>
      sort === "views" ? (b.view_count || 0) - (a.view_count || 0)
        : sort === "name" ? a.username.localeCompare(b.username)
          : +new Date(b.created_at) - +new Date(a.created_at));

  const toggleSel = (id: string) =>
    setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selRows = rows.filter(r => sel.includes(r.id));

  const bulkBan = async (banned: boolean) => {
    if (selRows.length === 0) return;
    const reason = banned ? (window.prompt(`Ban reason for ${selRows.length} profiles?`) || "Violated the rules") : "";
    setBusy(banned ? "Banning..." : "Unbanning...");
    for (const r of selRows) {
      await supabase.rpc("admin_set_ban", { _user_id: r.id, _banned: banned, _reason: reason });
    }
    setBusy("");
    setRows(rs => rs.map(x => sel.includes(x.id) ? { ...x, banned, ban_reason: reason || null } : x));
    toast.success(`${selRows.length} profiles updated`);
  };

  const bulkBadge = async (grant: boolean) => {
    if (selRows.length === 0) return;
    const key = window.prompt(`Badge key to ${grant ? "grant" : "revoke"}? (${badges.slice(0, 6).map(b => b.key).join(", ")}...)`);
    if (!key) return;
    if (!badges.some(b => b.key === key)) return toast.error("Unknown badge key");
    setBusy("Updating badges...");
    for (const r of selRows) {
      await supabase.rpc(grant ? "admin_grant_badge" : "admin_revoke_badge", { _user_id: r.id, _badge_key: key });
    }
    setBusy("");
    toast.success(`Badge ${grant ? "granted to" : "revoked from"} ${selRows.length} profiles`);
  };

  const bulkResetViews = async () => {
    if (selRows.length === 0) return;
    setBusy("Resetting views...");
    const { error } = await supabase.from("profiles").update({ view_count: 0 } as never).in("id", sel);
    setBusy("");
    if (error) return toast.error(error.message);
    toast.success("Views reset");
    load();
  };

  const exportCsv = () => {
    const head = "username,display_name,banned,ban_reason,views,created_at";
    const body = filtered.map(r =>
      [r.username, r.display_name || "", r.banned, (r.ban_reason || "").replace(/[",\n]/g, " "), r.view_count, r.created_at]
        .map(v => `"${String(v)}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`${head}\n${body}`], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `aurora-profiles-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLink = async (r: Row) => {
    await navigator.clipboard.writeText(`${window.location.origin}/${r.username}`);
    toast.success("Link copied");
  };

  const shownBadges = badges.filter(b =>
    !badgeQ || b.name.toLowerCase().includes(badgeQ.toLowerCase()) || b.key.includes(badgeQ.toLowerCase()));




  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="font-mono font-bold text-aurora">aurora.lol</Link>
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-mono border border-primary/60 text-primary">ADMIN</span>
          <div className="ml-auto flex items-center gap-2">
            {busy && <span className="text-xs font-mono text-muted-foreground">{busy}</span>}
            <button onClick={exportCsv} className="glass-strong px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button onClick={load} className="glass-strong px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={signOut} className="glass-strong px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Profiles" value={rows.length} />
          <Stat label="Banned" value={rows.filter(r => r.banned).length} />
          <Stat label="Badges" value={badges.length} />
          <Stat label="Total views" value={rows.reduce((s, r) => s + (r.view_count || 0), 0)} />
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
          <section className="glass p-5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search username or display name"
                     className="flex-1 bg-input rounded-md px-3 py-2 text-sm border border-border" />
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
              {([["new", "Newest"], ["views", "Most viewed"], ["name", "A–Z"]] as const).map(([k, label]) => (
                <button key={k} onClick={() => setSort(k)}
                        className={`rounded-md px-2.5 py-1.5 border ${sort === k ? "border-primary/60 text-primary" : "border-border text-muted-foreground"}`}>
                  {label}
                </button>
              ))}
              <span className="w-px bg-border mx-1" />
              {([["all", "All"], ["banned", "Banned"], ["quiet", "No views"]] as const).map(([k, label]) => (
                <button key={k} onClick={() => setOnly(k)}
                        className={`rounded-md px-2.5 py-1.5 border ${only === k ? "border-primary/60 text-primary" : "border-border text-muted-foreground"}`}>
                  {label}
                </button>
              ))}
              <span className="ml-auto self-center font-mono text-muted-foreground">{filtered.length} shown</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[11px]">
              <button onClick={() => setSel(filtered.map(r => r.id))} className="rounded-md px-2.5 py-1.5 border border-border text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Select all shown
              </button>
              <button onClick={() => setSel([])} className="rounded-md px-2.5 py-1.5 border border-border text-muted-foreground">Clear</button>
              {sel.length > 0 && (
                <>
                  <span className="font-mono text-primary px-1">{sel.length} selected</span>
                  <button onClick={() => bulkBan(true)} className="rounded-md px-2.5 py-1.5 border border-destructive/40 text-destructive">Ban</button>
                  <button onClick={() => bulkBan(false)} className="rounded-md px-2.5 py-1.5 border border-border text-muted-foreground">Unban</button>
                  <button onClick={() => bulkBadge(true)} className="rounded-md px-2.5 py-1.5 border border-border text-muted-foreground">Grant badge</button>
                  <button onClick={() => bulkBadge(false)} className="rounded-md px-2.5 py-1.5 border border-border text-muted-foreground">Revoke badge</button>
                  <button onClick={bulkResetViews} className="rounded-md px-2.5 py-1.5 border border-border text-muted-foreground">Reset views</button>
                </>
              )}
            </div>

            {loading ? (
              <p className="font-mono text-sm text-muted-foreground">loading profiles...</p>
            ) : (
              <ul className="divide-y divide-border/40 max-h-[560px] overflow-auto">
                {filtered.map(r => (
                  <li key={r.id} className="py-2.5 flex items-center gap-3">
                    <input type="checkbox" checked={sel.includes(r.id)} onChange={() => toggleSel(r.id)}
                           aria-label={`Select @${r.username}`} className="accent-primary w-3.5 h-3.5" />
                    <button onClick={() => pick(r)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{r.display_name || r.username}</span>
                        {r.banned && <span className="text-[10px] font-mono text-destructive">BANNED</span>}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground truncate">
                        @{r.username} · {r.view_count} views
                      </div>
                    </button>
                    <button onClick={() => copyLink(r)} title="Copy profile link"
                            className="p-2 rounded-md hover:bg-muted/40 text-muted-foreground">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a href={`/${r.username}`} target="_blank" rel="noreferrer" aria-label={`Open @${r.username}`}
                       className="p-2 rounded-md hover:bg-muted/40 text-muted-foreground">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => setBan(r, !r.banned)} title={r.banned ? "Unban" : "Ban"}
                            className={`p-2 rounded-md hover:bg-muted/40 ${r.banned ? "text-secondary" : "text-destructive"}`}>
                      {r.banned ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && <li className="py-3 text-sm text-muted-foreground">No profiles match.</li>}

              </ul>
            )}
          </section>

          <section className="glass p-5 space-y-4 lg:sticky lg:top-6">
            {!selected ? (
              <p className="text-sm text-muted-foreground">Pick a profile on the left to manage badges, roles and moderation.</p>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold">{selected.display_name || selected.username}</h2>
                  <p className="text-xs font-mono text-muted-foreground">@{selected.username}</p>
                  {selected.banned && (
                    <p className="mt-2 text-xs text-destructive">Banned — {selected.ban_reason || "no reason given"}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setBan(selected, !selected.banned)}
                          className="glass-strong rounded-md px-3 py-2 text-xs">
                    {selected.banned ? "Unban profile" : "Ban profile"}
                  </button>
                  <button onClick={() => makeAdmin(selected, true)} className="glass-strong rounded-md px-3 py-2 text-xs">
                    Make admin
                  </button>
                  <button onClick={() => makeAdmin(selected, false)} className="glass-strong rounded-md px-3 py-2 text-xs">
                    Remove admin
                  </button>
                  <button onClick={() => wipeReviews(selected)}
                          className="rounded-md px-3 py-2 text-xs text-destructive border border-destructive/40 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Clear guestbook
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest opacity-70">Profile details</h3>
                  <input value={edit.username} onChange={e => setEdit(s => ({ ...s, username: e.target.value }))}
                         placeholder="username" aria-label="Username"
                         className="w-full bg-input rounded-md px-3 py-2 text-sm border border-border font-mono" />
                  <input value={edit.display_name} onChange={e => setEdit(s => ({ ...s, display_name: e.target.value }))}
                         placeholder="Display name" aria-label="Display name"
                         className="w-full bg-input rounded-md px-3 py-2 text-sm border border-border" />
                  <button onClick={saveIdentity} className="glass-strong rounded-md px-3 py-2 text-xs">Save details</button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest opacity-70">Content resets</h3>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => patchProfile(selected, { bio: null }, "Bio cleared")} className="glass-strong rounded-md px-3 py-2 text-xs">Clear bio</button>
                    <button onClick={() => patchProfile(selected, { avatar_url: null, roblox_avatar_url: null, auto_roblox_avatar: false }, "Avatar cleared")} className="glass-strong rounded-md px-3 py-2 text-xs">Clear avatar</button>
                    <button onClick={() => patchProfile(selected, { music_url: null, music_title: null }, "Music removed")} className="glass-strong rounded-md px-3 py-2 text-xs">Remove music</button>
                    <button onClick={() => patchProfile(selected, { background_image_url: null }, "Background cleared")} className="glass-strong rounded-md px-3 py-2 text-xs">Clear background</button>
                    <button onClick={() => patchProfile(selected, { panel_background_url: null }, "Panel background cleared")} className="glass-strong rounded-md px-3 py-2 text-xs">Clear panel art</button>
                    <button onClick={() => patchProfile(selected, { discord_id: null, roblox_url: null }, "Linked accounts cleared")} className="glass-strong rounded-md px-3 py-2 text-xs">Unlink accounts</button>
                    <button onClick={() => patchProfile(selected, { view_count: 0 }, "View count reset")} className="glass-strong rounded-md px-3 py-2 text-xs">Reset views</button>
                    <button onClick={() => patchProfile(selected, {
                              accent_color: "#a855f7", secondary_color: "#22c55e", font_family: "space-grotesk",
                              custom_font_url: null, custom_font_name: null, aurora_preset: "aurora",
                              background_effect: "particles", click_effect_style: "burst", profile_style: "code",
                              layout_style: "classic", card_opacity: 0.55, card_blur: 20, border_glow: true,
                              cursor_trail: false, tilt_cards: false, avatar_shape: "circle", animation_speed: 1.0,
                            }, "Theme reset to defaults")}
                            className="rounded-md px-3 py-2 text-xs border border-border">Reset theme</button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-widest opacity-70">
                      Badges · {owned.length}/{badges.length}
                    </h3>
                    <button onClick={() => grantAll(true)} className="ml-auto text-[11px] text-muted-foreground hover:text-foreground">grant all</button>
                    <button onClick={() => grantAll(false)} className="text-[11px] text-muted-foreground hover:text-foreground">revoke all</button>
                  </div>
                  <input value={badgeQ} onChange={e => setBadgeQ(e.target.value)} placeholder="Filter badges"
                         aria-label="Filter badges"
                         className="w-full mb-2 bg-input rounded-md px-3 py-1.5 text-xs border border-border" />
                  <div className="grid grid-cols-2 gap-1.5 max-h-[420px] overflow-auto pr-1">
                    {shownBadges.map(b => {

                      const Icon = badgeIcon(b.icon);
                      const has = owned.includes(b.key);
                      return (
                        <button key={b.key} onClick={() => toggleBadge(b.key)} title={b.description}
                                className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-left transition-all ${has ? "" : "opacity-45"}`}
                                style={{ ...tierRing(b.tier, has ? b.color : "#6b7280"), background: has ? `${b.color}1f` : "transparent" }}>
                          <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: has ? b.color : undefined }} />
                          <span className="text-[11px] truncate">{b.name}</span>
                        </button>
                      );
                    })}

                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        <section className="glass p-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-widest opacity-80">Admin password</h2>
          </div>
          {isOwner ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Only the <span className="font-mono">owner</span> account can change this. It replaces the password used to unlock /admin.
              </p>
              <form onSubmit={e => { e.preventDefault(); changeCode(); }} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-lg">
                <input type="password" value={newCode} onChange={e => setNewCode(e.target.value)}
                       autoComplete="new-password" placeholder="New admin password (6+ characters)" aria-label="New admin password"
                       className="flex-1 bg-input rounded-md px-3 py-2.5 text-sm border border-border font-mono" />
                <button type="submit" disabled={savingCode || newCode.trim().length < 6}
                        className="rounded-md px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                        style={{ background: "var(--grad-aurora)", color: "white" }}>
                  {savingCode ? "Saving..." : "Update"}
                </button>
              </form>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Only the owner account can change the admin password.
            </p>
          )}
        </section>
      </main>

    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
