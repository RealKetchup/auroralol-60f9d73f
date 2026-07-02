import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";

type Review = {
  id: string;
  author_name: string;
  content: string;
  rating: number | null;
  created_at: string;
};

export function Guestbook({ profileId, isOwner }: { profileId: string; isOwner: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id,author_name,content,rating,created_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50);
    setReviews(data || []);
  };

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      const meta = data.user?.user_metadata as { full_name?: string; name?: string } | undefined;
      if (data.user && !name) setName(meta?.full_name || meta?.name || data.user.email?.split("@")[0] || "");
    });
  }, [profileId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return toast.error("Sign in to leave a review");
    const n = name.trim();
    const c = content.trim();
    if (n.length < 1 || n.length > 40) return toast.error("Name must be 1–40 chars");
    if (c.length < 1 || c.length > 500) return toast.error("Message must be 1–500 chars");
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      profile_id: profileId,
      author_id: userId,
      author_name: n,
      content: c,
      rating,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") return toast.error("You already left a review for this profile");
      return toast.error(error.message);
    }
    setContent(""); setRating(5);
    toast.success("Thanks for signing!");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setReviews(r => r.filter(x => x.id !== id));
  };

  return (
    <section className="glass p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold font-mono text-sm tracking-wider opacity-80">// GUESTBOOK</h3>
        <span className="text-xs text-muted-foreground">{reviews.length} {reviews.length === 1 ? "entry" : "entries"}</span>
      </div>
      <form onSubmit={submit} className="space-y-2">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="your name"
                 className="bg-input rounded-md px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
          <div className="flex items-center gap-0.5 px-2 glass-strong rounded-md">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className="w-4 h-4" fill={n <= rating ? "oklch(0.85 0.28 145)" : "none"}
                      stroke={n <= rating ? "oklch(0.85 0.28 145)" : "currentColor"} />
              </button>
            ))}
          </div>
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="leave a message..." rows={2} maxLength={500}
                  className="w-full bg-input rounded-md px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        <button disabled={submitting} className="w-full rounded-md py-2 font-medium text-sm"
                style={{ background: "var(--grad-aurora)", color: "white" }}>
          {submitting ? "Signing..." : "Sign guestbook"}
        </button>
      </form>
      <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {reviews.map(r => (
          <li key={r.id} className="glass-strong rounded-lg p-3 text-sm group">
            <div className="flex items-start justify-between gap-2">
              <div className="font-mono text-xs text-[oklch(0.85_0.28_145)]">{r.author_name}</div>
              <div className="flex items-center gap-2">
                {r.rating && (
                  <div className="flex">{Array.from({length: r.rating}).map((_,i) => (
                    <Star key={i} className="w-3 h-3" fill="oklch(0.85 0.28 145)" stroke="none" />
                  ))}</div>
                )}
                {isOwner && (
                  <button onClick={() => remove(r.id)} className="opacity-0 group-hover:opacity-100 text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-1 whitespace-pre-wrap break-words">{r.content}</div>
            <div className="mt-1 text-[10px] text-muted-foreground font-mono">{new Date(r.created_at).toLocaleString()}</div>
          </li>
        ))}
        {reviews.length === 0 && <li className="text-sm text-muted-foreground text-center py-6 font-mono opacity-60">be the first to sign ✦</li>}
      </ul>
    </section>
  );
}
