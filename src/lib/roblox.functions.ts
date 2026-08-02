import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Resolves a Roblox profile URL to the user's headshot image URL.
 * Runs server-side because Roblox's APIs don't allow browser CORS calls.
 */
export const getRobloxAvatar = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ url: z.string().min(4) }).parse(data))
  .handler(async ({ data }) => {
    const match = data.url.match(/users\/(\d+)/);
    let userId = match?.[1] ?? null;

    if (!userId) {
      const nameMatch = data.url.match(/(?:profile\/|users\/profile\/)?@?([A-Za-z0-9_]{3,20})\/?$/);
      const name = nameMatch?.[1];
      if (!name) return { ok: false as const, error: "Could not read a Roblox user from that URL" };
      const res = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ usernames: [name], excludeBannedUsers: true }),
      });
      if (!res.ok) return { ok: false as const, error: "Roblox lookup failed" };
      const json = (await res.json()) as { data?: { id: number; name: string }[] };
      const id = json.data?.[0]?.id;
      if (!id) return { ok: false as const, error: "No Roblox user with that name" };
      userId = String(id);
    }

    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`,
    );
    if (!thumbRes.ok) return { ok: false as const, error: "Roblox avatar lookup failed" };
    const thumb = (await thumbRes.json()) as { data?: { imageUrl?: string; state?: string }[] };
    const imageUrl = thumb.data?.[0]?.imageUrl;
    if (!imageUrl) return { ok: false as const, error: "Roblox avatar not ready yet" };

    return { ok: true as const, userId, imageUrl };
  });
