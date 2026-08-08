import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { ok, requireUser } from "../supabase";

export default defineTool({
  name: "add_link",
  title: "Add a link",
  description:
    "Add a link to the signed-in user's aurora.lol profile. The site auto-detects the icon for known services (Roblox, YouTube, TikTok, Discord and more).",
  inputSchema: {
    label: z.string().describe("Text shown on the link."),
    url: z.string().describe("Destination URL, including https://"),
    position: z.number().int().describe("Sort position; defaults to the end of the list.").optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ label, url, position }, ctx) => {
    const { supabase, userId } = requireUser(ctx);

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
    try {
      new URL(target);
    } catch {
      throw new ToolError(`"${url}" is not a valid URL.`);
    }

    let pos = position;
    if (pos === undefined) {
      const { count } = await supabase
        .from("links")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", userId);
      pos = count ?? 0;
    }

    const { data, error } = await supabase
      .from("links")
      .insert({ profile_id: userId, label: label.trim(), url: target, position: pos })
      .select("id,label,url,position")
      .single();

    if (error) throw new ToolError(error.message);
    await supabase.rpc("claim_badges");
    return ok(`Added link "${data.label}".`, { link: data });
  },
});
