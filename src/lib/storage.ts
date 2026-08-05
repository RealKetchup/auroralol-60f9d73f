import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves a stored path to a usable URL.
 * Host-agnostic (Vercel, Netlify, anywhere): signed URL first because the
 * buckets are private, falling back to the public URL if the bucket is public.
 */
export async function resolveStorageUrl(
  bucket: "avatars" | "music",
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;

  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
    if (!error && data?.signedUrl) return data.signedUrl;
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    return pub?.publicUrl ?? null;
  } catch {
    return null;
  }
}
