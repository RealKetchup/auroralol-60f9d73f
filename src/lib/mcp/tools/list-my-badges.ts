import { defineTool, ToolError } from "@lovable.dev/mcp-js";

import { ok, requireUser } from "../supabase";

export default defineTool({
  name: "list_my_badges",
  title: "List my badges",
  description:
    "List every aurora.lol badge, marking which ones the signed-in user has earned and which are currently equipped on their profile. Also re-checks for newly earned badges.",
  inputSchema: {},
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const { supabase, userId } = requireUser(ctx);
    await supabase.rpc("claim_badges");

    const [all, mine] = await Promise.all([
      supabase.from("badges").select("key,name,description,tier,admin_only,sort").order("sort"),
      supabase.from("user_badges").select("badge_key,equipped,awarded_at").eq("user_id", userId),
    ]);
    if (all.error) throw new ToolError(all.error.message);
    if (mine.error) throw new ToolError(mine.error.message);

    const owned = new Map((mine.data ?? []).map((r) => [r.badge_key, r]));
    const badges = (all.data ?? []).map((b) => ({
      ...b,
      earned: owned.has(b.key),
      equipped: owned.get(b.key)?.equipped ?? false,
      awarded_at: owned.get(b.key)?.awarded_at ?? null,
    }));

    const earned = badges.filter((b) => b.earned).length;
    return ok(`${earned}/${badges.length} badges earned.\n${JSON.stringify(badges, null, 2)}`, { badges });
  },
});
