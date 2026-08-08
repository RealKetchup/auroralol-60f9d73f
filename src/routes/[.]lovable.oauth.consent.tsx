import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { rememberAuthNext } from "@/lib/auth-flow";

type AuthorizationDetails = {
  client?: { name?: string | null; client_uri?: string | null } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      rememberAuthNext(next);
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <Shell>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn&apos;t load this authorization request: {String((error as Error)?.message ?? error)}
      </p>
    </Shell>
  ),
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl p-8"
           style={{ background: "oklch(0.15 0.02 280 / 0.7)", border: "1px solid oklch(1 0 0 / 0.08)" }}>
        {children}
      </div>
    </main>
  );
}

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "This app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);

    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect was returned. Try starting the connection again.");
      return;
    }
    window.location.href = target;
  }

  return (
    <Shell>
      <p className="font-mono text-xs text-muted-foreground">aurora.lol</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Connect {clientName}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {clientName} will be able to read and edit your aurora.lol profile, links, guestbook and badges — as you.
        Nothing else on your account is shared.
      </p>

      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex gap-3">
        <button onClick={() => decide(true)} disabled={busy}
                className="flex-1 rounded-lg py-3 text-sm font-medium disabled:opacity-50"
                style={{ background: "var(--grad-aurora)", color: "white" }}>
          {busy ? "Working..." : "Allow access"}
        </button>
        <button onClick={() => decide(false)} disabled={busy}
                className="rounded-lg px-5 py-3 text-sm disabled:opacity-50"
                style={{ border: "1px solid oklch(1 0 0 / 0.12)" }}>
          Deny
        </button>
      </div>
    </Shell>
  );
}
