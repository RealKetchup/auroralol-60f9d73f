import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { badgeIcon, tierRing, type Badge } from "@/lib/badges";
import { Ban, Check, Search, Shield, Trash2, RefreshCw, LogOut, ExternalLink } from "lucide-react";

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

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: profiles }, { data: bs }] = await Promise.all([
      supabase.from("profiles").select("id,username,display_name,banned,ban_reason,view_count,created_at")
        .order("created_at", { ascending: false }).limit(300),
      supabase.from("badges").select("*").order("sort"),
    ]);
    setRows((profiles || []) as Row[]);
    setBadges((bs || []) as Badge[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const pick = async (r: Row) => {
    setSelected(r);
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

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  const filtered = rows.filter(r =>
    !q || r.username.includes(q.toLowerCase()) || (r.display_name || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="font-mono font-bold text-aurora">aurora.lol</Link>
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-mono border border-primary/60 text-primary">ADMIN</span>
          <div className="ml-auto flex items-center gap-2">
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
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search username or display name"
                     className="flex-1 bg-input rounded-md px-3 py-2 text-sm border border-border" />
            </div>
            {loading ? (
              <p className="font-mono text-sm text-muted-foreground">loading profiles...</p>
            ) : (
              <ul className="divide-y divide-border/40 max-h-[560px] overflow-auto">
                {filtered.map(r => (
                  <li key={r.id} className="py-2.5 flex items-center gap-3">
                    <button onClick={() => pick(r)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{r.display_name || r.username}</span>
                        {r.banned && <span className="text-[10px] font-mono text-destructive">BANNED</span>}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground truncate">
                        @{r.username} · {r.view_count} views
                      </div>
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

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">
                    Badges · {owned.length}/{badges.length}
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 max-h-[420px] overflow-auto pr-1">
                    {badges.map(b => {
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
