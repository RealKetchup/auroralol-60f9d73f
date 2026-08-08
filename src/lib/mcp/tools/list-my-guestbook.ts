import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { ok, requireUser } from "../supabase";

export default defineTool({
  name: "list_my_guestbook",
  title: "List my guestbook",
  description: "Read the guestbook entries left on the signed-in user's aurora.lol profile, newest first.",
  inputSchema: {
    limit: z.number().int().describe("How many entries to return (default 25).").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const { supabase, userId } = requireUser(ctx);
    const take = Math.min(Math.max(limit ?? 25, 1), 100);
    const { data, error } = await supabase
      .from("reviews")
      .select("id,author_name,content,rating,created_at")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(take);
    if (error) throw new ToolError(error.message);
    return ok(JSON.stringify(data ?? [], null, 2), { entries: data ?? [] });
  },
});
