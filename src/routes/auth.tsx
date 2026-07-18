import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { consumeAuthNext, ensureUserProfile, rememberAuthNext } from "@/lib/auth-flow";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — aurora.lol" },
      {
        name: "description",
        content:
          "Sign in to aurora.lol with Google to build your neon glassmorphic profile page.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Sign in — aurora.lol" },
      {
        property: "og:description",
        content:
          "Sign in to aurora.lol with Google to build your neon glassmorphic profile page.",
      },
      { property: "og:url", content: "https://www.auroras.lol/auth" },
    ],
    links: [{ rel: "canonical", href: "https://www.auroras.lol/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;

      try {
        await ensureUserProfile(data.user);
        if (active) {
          window.location.assign(consumeAuthNext());
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not finish sign in."
          );
        }
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const signIn = async () => {
    setError(null);
    setLoading(true);

    rememberAuthNext("/dashboard");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-strong rounded-2xl p-10 max-w-md w-full text-center animate-fade-in-up">
        <Link to="/" className="font-mono text-aurora text-sm">
          ← aurora.lol
        </Link>

        <h1 className="text-3xl font-bold mt-6">
          Sign in
        </h1>

        <p className="text-sm text-muted-foreground mt-2">
          Google only. We just need your name and avatar to build your profile.
        </p>

        {error && (
          <p className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          onClick={signIn}
          disabled={loading}
          className="mt-8 w-full rounded-lg py-3 font-medium animate-pulse-glow"
          style={{
            background: "var(--grad-aurora)",
            color: "white",
          }}
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
