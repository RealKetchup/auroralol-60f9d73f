import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { ok, requireUser } from "../supabase";

export default defineTool({
  name: "equip_badge",
  title: "Equip or unequip a badge",
  description: "Show or hide one of the signed-in user's earned badges on their public profile.",
  inputSchema: {
    badge_key: z.string().describe("Badge key from list_my_badges."),
    equipped: z.boolean().describe("true to show it on the profile, false to hide it."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ badge_key, equipped }, ctx) => {
    const { supabase, userId } = requireUser(ctx);
    const { data, error } = await supabase
      .from("user_badges")
      .update({ equipped })
      .eq("user_id", userId)
      .eq("badge_key", badge_key)
      .select("badge_key,equipped");
    if (error) throw new ToolError(error.message);
    if (!data || data.length === 0) throw new ToolError(`You have not earned the "${badge_key}" badge yet.`);
    return ok(`${badge_key} is now ${equipped ? "equipped" : "unequipped"}.`, { badge: data[0] });
  },
});
