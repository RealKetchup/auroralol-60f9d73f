import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { ok, requireUser } from "../supabase";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #a855f7");

export default defineTool({
  name: "update_my_profile",
  title: "Update my profile",
  description:
    "Change any part of the signed-in user's aurora.lol profile. Every field is optional — only the ones you pass are written. Covers identity (username, display name, bio, avatar), linked accounts (Discord, Roblox), music, and the full theme/effects configuration.",
  inputSchema: {
    username: z.string().describe("New handle, lowercase letters/numbers/_/- only. Must be unique.").optional(),
    display_name: z.string().optional(),
    bio: z.string().optional(),
    avatar_url: z.string().optional(),
    discord_id: z.string().describe("Discord user ID for live presence via Lanyard.").optional(),
    roblox_url: z.string().describe("Full Roblox profile URL.").optional(),
    auto_roblox_avatar: z.boolean().describe("Use the Roblox headshot as the profile picture.").optional(),
    music_url: z.string().optional(),
    music_title: z.string().optional(),
    accent_color: hex.optional(),
    secondary_color: hex.optional(),
    font_family: z.string().describe("Font preset id, e.g. space-grotesk, jetbrains-mono, inter.").optional(),
    custom_font_url: z.string().describe("Google Fonts stylesheet URL.").optional(),
    custom_font_name: z.string().optional(),
    profile_style: z.enum(["code", "card"]).describe("code = editor-style page, card = minimal card.").optional(),
    layout_style: z.string().optional(),
    background_effect: z.enum(["particles", "stars", "grid", "matrix", "gradient", "none"]).optional(),
    background_image_url: z.string().optional(),
    background_opacity: z.number().optional(),
    panel_background_url: z.string().optional(),
    panel_background_opacity: z.number().optional(),
    aurora_preset: z.string().describe("aurora, ribbons, beams or glow.").optional(),
    aurora_intensity: z.number().optional(),
    card_opacity: z.number().optional(),
    card_blur: z.number().optional(),
    border_glow: z.boolean().optional(),
    tilt_cards: z.boolean().optional(),
    click_effect: z.boolean().optional(),
    click_effect_style: z.enum(["burst", "ripple", "sparkle", "hearts"]).optional(),
    custom_cursor: z.boolean().optional(),
    cursor_trail: z.boolean().optional(),
    entry_animation: z.string().optional(),
    avatar_shape: z.enum(["circle", "squircle", "square"]).optional(),
    animation_speed: z.number().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    const { supabase, userId } = requireUser(ctx);

    const patch = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined),
    ) as Record<string, unknown>;

    if (Object.keys(patch).length === 0) throw new ToolError("Pass at least one field to change.");

    if (typeof patch['username'] === "string") {
      const username = patch['username'].toLowerCase().trim();
      if (!/^[a-z0-9_-]{2,24}$/.test(username)) {
        throw new ToolError("Username must be 2-24 characters, using only a-z, 0-9, _ and -.");
      }
      const taken = await supabase.from("profiles").select("id").eq("username", username).neq("id", userId).maybeSingle();
      if (taken.data) throw new ToolError(`aurora.lol/${username} is already taken.`);
      patch['username'] = username;
    }

    const { data, error } = await supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(patch as any)
      .eq("id", userId)
      .select("*")
      .maybeSingle();

    if (error) throw new ToolError(error.message);
    if (!data) throw new ToolError("Profile not found for this account.");

    await supabase.rpc("claim_badges");

    return ok(`Updated: ${Object.keys(patch).join(", ")}`, { profile: data });
  },
});
