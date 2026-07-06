import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const NEXT_PATH_KEY = "aurora.auth.next";

function normalizeNextPath(value: string | null | undefined, fallback = "/dashboard") {
  if (typeof window === "undefined" || !value) return fallback;

  try {
    const url = value.startsWith("/")
      ? new URL(value, window.location.origin)
      : new URL(value);

    if (url.origin !== window.location.origin) return fallback;
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/auth")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}

export function rememberAuthNext(next = "/dashboard") {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(NEXT_PATH_KEY, normalizeNextPath(next));
}

export function consumeAuthNext(fallback = "/dashboard") {
  if (typeof window === "undefined") return fallback;

  const searchNext = new URLSearchParams(window.location.search).get("next");
  const storedNext = window.sessionStorage.getItem(NEXT_PATH_KEY);
  window.sessionStorage.removeItem(NEXT_PATH_KEY);

  return normalizeNextPath(searchNext || storedNext, fallback);
}

function usernameBase(user: User) {
  const metadata = user.user_metadata ?? {};
  const raw =
    String(metadata.preferred_username ?? metadata.user_name ?? metadata.name ?? "") ||
    user.email?.split("@")[0] ||
    `user${user.id.slice(0, 6)}`;

  const clean = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 16);
  return clean.length >= 2 ? clean : `user${user.id.slice(0, 6)}`;
}

export async function ensureUserProfile(user: User): Promise<Profile> {
  const existing = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const metadata = user.user_metadata ?? {};
  const base = usernameBase(user);
  const displayName = String(metadata.full_name ?? metadata.name ?? base);
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  const candidates = [base, `${base}${user.id.slice(0, 4)}`, `${base}${Math.floor(Math.random() * 9000) + 1000}`];

  for (const username of candidates) {
    const created = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: username.slice(0, 24),
        display_name: displayName,
        avatar_url: avatarUrl,
      })
      .select("*")
      .single();

    if (!created.error && created.data) return created.data;
    if (created.error && created.error.code !== "23505") throw created.error;
  }

  const retry = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (retry.error) throw retry.error;
  if (retry.data) return retry.data;
  throw new Error("Could not create your profile. Please try signing in again.");
}