import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { ok, requireUser } from "../supabase";

export default defineTool({
  name: "delete_guestbook_entry",
  title: "Delete a guestbook entry",
  description: "Delete a guestbook entry from the signed-in user's own profile by its id.",
  inputSchema: { id: z.string().describe("Guestbook entry id.") },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    const { supabase, userId } = requireUser(ctx);
    const { data, error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id)
      .eq("profile_id", userId)
      .select("id,author_name");
    if (error) throw new ToolError(error.message);
    if (!data || data.length === 0) throw new ToolError("No guestbook entry with that id on your profile.");
    return ok(`Deleted the entry from ${data[0]!.author_name}.`, { deleted: data[0] });
  },
});
