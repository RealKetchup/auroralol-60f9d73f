import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { ok, requireUser } from "../supabase";

export default defineTool({
  name: "get_profile",
  title: "Look up a profile",
  description:
    "Look up any public aurora.lol profile by username and get its display name, bio, links, equipped badges and view count.",
  inputSchema: { username: z.string().describe("The handle, without the aurora.lol/ prefix.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ username }, ctx) => {
    const { supabase } = requireUser(ctx);
    const handle = username.trim().replace(/^\/+/, "").toLowerCase();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id,username,display_name,bio,avatar_url,roblox_avatar_url,discord_id,roblox_url,music_title,view_count,created_at,banned")
      .eq("username", handle)
      .maybeSingle();
    if (error) throw new ToolError(error.message);
    if (!profile) throw new ToolError(`No profile at aurora.lol/${handle}.`);
    if (profile.banned) throw new ToolError(`aurora.lol/${handle} is suspended.`);

    const [links, badges] = await Promise.all([
      supabase.from("links").select("label,url").eq("profile_id", profile.id).order("position"),
      supabase.from("user_badges").select("badge_key,equipped").eq("user_id", profile.id).eq("equipped", true),
    ]);

    const result = {
      url: `https://www.auroras.lol/${profile.username}`,
      username: profile.username,
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.roblox_avatar_url ?? profile.avatar_url,
      discord_id: profile.discord_id,
      roblox_url: profile.roblox_url,
      music_title: profile.music_title,
      view_count: profile.view_count,
      joined: profile.created_at,
      links: links.data ?? [],
      badges: (badges.data ?? []).map((b) => b.badge_key),
    };

    return ok(JSON.stringify(result, null, 2), { profile: result });
  },
});
