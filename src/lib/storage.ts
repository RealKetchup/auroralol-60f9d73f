import { supabase } from "@/integrations/supabase/client";

const SIGNED_TTL = 60 * 60 * 24 * 7; // 7 days
const CACHE_PREFIX = "aurora:url:";
const CACHE_MS = 1000 * 60 * 60 * 24 * 6; // re-use a signed URL for 6 days

const memory = new Map<string, string>();

function readCache(key: string): string | null {
  const hit = memory.get(key);
  if (hit) return hit;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { url, at } = JSON.parse(raw) as { url: string; at: number };
    if (!url || Date.now() - at > CACHE_MS) return null;
    memory.set(key, url);
    return url;
  } catch {
    return null;
  }
}

function writeCache(key: string, url: string) {
  memory.set(key, url);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ url, at: Date.now() }));
  } catch {
    /* storage full or blocked — memory cache is enough */
  }
}

/** Drop cached URLs for a stored path (call after re-uploading to the same path). */
export function invalidateStorageUrl(bucket: string, path?: string | null) {
  if (!path) return;
  const key = `${bucket}/${path}`;
  memory.delete(key);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    /* ignore */
  }
}

/**
 * Resolves a stored path to a usable URL.
 * Host-agnostic (Vercel, Netlify, anywhere): the buckets are private, so we
 * sign first and fall back to the public URL. Signed URLs are cached so the
 * browser can reuse its HTTP cache instead of re-downloading every visit.
 */
export async function resolveStorageUrl(
  bucket: "avatars" | "music",
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;

  const key = `${bucket}/${path}`;
  const cached = readCache(key);
  if (cached) return cached;

  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_TTL);
    if (!error && data?.signedUrl) {
      writeCache(key, data.signedUrl);
      return data.signedUrl;
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    if (pub?.publicUrl) writeCache(key, pub.publicUrl);
    return pub?.publicUrl ?? null;
  } catch {
    return null;
  }
}
