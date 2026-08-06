import { supabase } from "@/integrations/supabase/client";
import { invalidateStorageUrl } from "@/lib/storage";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mp4",
};

export function isVideoFile(file: File | string) {
  const t = typeof file === "string" ? file : file.type;
  return VIDEO_TYPES.includes(t) || /\.(mp4|webm|mov)(\?|$)/i.test(String(t));
}

/** Is this stored path / URL a video background? */
export function isVideoSource(src: string | null | undefined) {
  return !!src && /\.(mp4|webm|mov)(\?|$)/i.test(src);
}

export function extFor(file: File) {
  return EXT_BY_TYPE[file.type] || (file.name.split(".").pop() || "bin").toLowerCase();
}

export type UploadOptions = {
  bucket: "avatars" | "music";
  /** Path without extension — the real extension is derived from the file type. */
  basePath: string;
  file: File;
  accept: string[];
  maxBytes: number;
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
};

export class UploadError extends Error {}

/**
 * Uploads a file straight to Storage with real progress events.
 * Uses the Storage REST endpoint via XHR because supabase-js has no progress API.
 */
export async function uploadWithProgress({
  bucket,
  basePath,
  file,
  accept,
  maxBytes,
  onProgress,
  signal,
}: UploadOptions): Promise<string> {
  if (!accept.includes(file.type)) {
    throw new UploadError(
      `Unsupported file type${file.type ? ` (${file.type})` : ""}. Allowed: ${accept
        .map(t => t.split("/")[1].toUpperCase())
        .join(", ")}.`,
    );
  }
  if (file.size > maxBytes) {
    throw new UploadError(`File is ${(file.size / 1048576).toFixed(1)}MB — the limit is ${Math.round(maxBytes / 1048576)}MB.`);
  }

  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  const apiUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  const path = `${basePath}.${extFor(file)}`;

  if (!token || !apiUrl || !apiKey) {
    // Fallback: no progress, but still uploads.
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "31536000" });
    if (error) throw new UploadError(error.message);
    invalidateStorageUrl(bucket, path);
    onProgress?.(100);
    return path;
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiUrl}/storage/v1/object/${bucket}/${encodeURI(path)}`);
    xhr.setRequestHeader("authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", apiKey);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    if (file.type) xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `Upload failed (${xhr.status})`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = body.message || body.error || message;
      } catch {
        /* keep default */
      }
      reject(new UploadError(message));
    };
    xhr.onerror = () => reject(new UploadError("Network error while uploading. Check your connection and try again."));
    xhr.onabort = () => reject(new UploadError("Upload cancelled."));
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(file);
  });

  invalidateStorageUrl(bucket, path);
  onProgress?.(100);
  return path;
}
