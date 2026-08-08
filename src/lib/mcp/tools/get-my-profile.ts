import { defineTool, ToolError } from "@lovable.dev/mcp-js";

import { ok, requireUser } from "../supabase";

export default defineTool({
  name: "get_my_profile",
  title: "Get my profile",
  description:
    "Read the signed-in user's full aurora.lol profile: username, display name, bio, avatar, linked accounts, theme settings and view count.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const { supabase, userId } = requireUser(ctx);
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw new ToolError(error.message);
    if (!data) throw new ToolError("No aurora.lol profile exists for this account yet. Sign in on the site once to create it.");
    return ok(JSON.stringify(data, null, 2), { profile: data });
  },
});
