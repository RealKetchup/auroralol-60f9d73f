import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { ok, requireUser } from "../supabase";

export default defineTool({
  name: "browse_profiles",
  title: "Browse profiles",
  description:
    "Browse aurora.lol profiles. Optionally search by username or display name, and sort by newest or most viewed.",
  inputSchema: {
    search: z.string().describe("Text to match against username or display name.").optional(),
    sort: z.enum(["newest", "views"]).describe("Ordering, defaults to newest.").optional(),
    limit: z.number().int().describe("How many profiles to return (default 20).").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, sort, limit }, ctx) => {
    const { supabase } = requireUser(ctx);
    const take = Math.min(Math.max(limit ?? 20, 1), 50);

    let query = supabase
      .from("profiles")
      .select("username,display_name,bio,view_count,created_at")
      .eq("banned", false);

    if (search?.trim()) {
      const term = search.trim().replace(/[%,]/g, "");
      query = query.or(`username.ilike.%${term}%,display_name.ilike.%${term}%`);
    }

    const { data, error } = await query
      .order(sort === "views" ? "view_count" : "created_at", { ascending: false })
      .limit(take);

    if (error) throw new ToolError(error.message);

    const profiles = (data ?? []).map((p) => ({ ...p, url: `https://www.auroras.lol/${p.username}` }));
    return ok(JSON.stringify(profiles, null, 2), { profiles });
  },
});
