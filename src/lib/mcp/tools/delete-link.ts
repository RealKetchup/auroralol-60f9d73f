import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { ok, requireUser } from "../supabase";

export default defineTool({
  name: "delete_link",
  title: "Delete a link",
  description: "Remove one of the signed-in user's profile links by its id (use list_my_links first).",
  inputSchema: { id: z.string().describe("Link id.") },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    const { supabase, userId } = requireUser(ctx);
    const { data, error } = await supabase
      .from("links")
      .delete()
      .eq("id", id)
      .eq("profile_id", userId)
      .select("id,label");
    if (error) throw new ToolError(error.message);
    if (!data || data.length === 0) throw new ToolError("No link with that id on your profile.");
    return ok(`Deleted link "${data[0]!.label}".`, { deleted: data[0] });
  },
});
