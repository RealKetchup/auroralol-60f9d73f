import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — aurora.lol" },
      { name: "description", content: "Sign in to aurora.lol with Google to build your neon glassmorphic profile page." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Sign in — aurora.lol" },
      { property: "og:description", content: "Sign in to aurora.lol with Google to build your neon glassmorphic profile page." },
      { property: "og:url", content: "https://auroralol.lovable.app/auth" },
    ],
    links: [{ rel: "canonical", href: "https://auroralol.lovable.app/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const signIn = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (res.error) { console.error(res.error); setLoading(false); return; }
    if (res.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-strong rounded-2xl p-10 max-w-md w-full text-center animate-fade-in-up">
        <Link to="/" className="font-mono text-aurora text-sm">← aurora.lol</Link>
        <h1 className="text-3xl font-bold mt-6">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-2">Google only. We just need your name and avatar to build your profile.</p>
        <button
          onClick={signIn}
          disabled={loading}
          className="mt-8 w-full rounded-lg py-3 font-medium animate-pulse-glow"
          style={{ background: "var(--grad-aurora)", color: "white" }}
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
