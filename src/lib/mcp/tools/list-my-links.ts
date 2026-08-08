import { defineTool, ToolError } from "@lovable.dev/mcp-js";

import { ok, requireUser } from "../supabase";

export default defineTool({
  name: "list_my_links",
  title: "List my links",
  description: "List the links shown on the signed-in user's aurora.lol profile, in display order.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const { supabase, userId } = requireUser(ctx);
    const { data, error } = await supabase
      .from("links")
      .select("id,label,url,icon,position")
      .eq("profile_id", userId)
      .order("position");
    if (error) throw new ToolError(error.message);
    return ok(JSON.stringify(data ?? [], null, 2), { links: data ?? [] });
  },
});
