import { auth, defineMcp } from "@lovable.dev/mcp-js";

import addLink from "./tools/add-link";
import browseProfiles from "./tools/browse-profiles";
import deleteGuestbookEntry from "./tools/delete-guestbook-entry";
import deleteLink from "./tools/delete-link";
import equipBadge from "./tools/equip-badge";
import getMyProfile from "./tools/get-my-profile";
import getProfile from "./tools/get-profile";
import listMyBadges from "./tools/list-my-badges";
import listMyGuestbook from "./tools/list-my-guestbook";
import listMyLinks from "./tools/list-my-links";
import updateMyProfile from "./tools/update-my-profile";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "aurora-lol",
  title: "aurora.lol",
  version: "1.0.0",
  instructions:
    "Tools for aurora.lol, a link-in-bio profile builder. Callers sign in with their own aurora.lol account and act only as themselves. Use get_my_profile and update_my_profile to read and configure the signed-in user's page (identity, linked Discord/Roblox accounts, music, colors, fonts, backgrounds, effects). Use the link tools to manage their links, the guestbook tools to read and moderate messages left on their page, and the badge tools to see progress and choose which badges are shown. get_profile and browse_profiles read other people's public pages.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getMyProfile,
    updateMyProfile,
    listMyLinks,
    addLink,
    deleteLink,
    listMyGuestbook,
    deleteGuestbookEntry,
    listMyBadges,
    equipBadge,
    getProfile,
    browseProfiles,
  ],
});
