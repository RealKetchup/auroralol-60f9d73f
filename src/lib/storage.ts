import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves a stored path to a usable URL.
 * Works on any host (Vercel, Netlify, Lovable) and for signed-out visitors:
 * public URL first, signed URL only as a fallback for private buckets.
 */
export async function resolveStorageUrl(
  bucket: "avatars" | "music",
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;

  try {
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    if (pub?.publicUrl) {
      const ok = await headOk(pub.publicUrl);
      if (ok) return pub.publicUrl;
    }
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
    if (error) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

async function headOk(url: string) {
  if (typeof fetch === "undefined") return false;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}
