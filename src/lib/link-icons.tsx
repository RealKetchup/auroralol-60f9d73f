import { Github, Youtube, Twitter, Twitch, Instagram, Music, Globe, Send, MessageCircle, Link as LinkIcon } from "lucide-react";

export type IconKind =
  | "roblox" | "youtube" | "github" | "twitter" | "twitch"
  | "instagram" | "tiktok" | "spotify" | "discord" | "telegram" | "website";

export function detectIcon(url: string): IconKind {
  const u = url.toLowerCase();
  if (/(^|\/\/)([a-z0-9-]+\.)*roblox\.com/.test(u)) return "roblox";
  if (/(youtube\.com|youtu\.be)/.test(u)) return "youtube";
  if (/github\.com/.test(u)) return "github";
  if (/(twitter\.com|x\.com)/.test(u)) return "twitter";
  if (/twitch\.tv/.test(u)) return "twitch";
  if (/instagram\.com/.test(u)) return "instagram";
  if (/tiktok\.com/.test(u)) return "tiktok";
  if (/(open\.)?spotify\.com/.test(u)) return "spotify";
  if (/discord\.(gg|com)/.test(u)) return "discord";
  if (/(t\.me|telegram)/.test(u)) return "telegram";
  return "website";
}

// Inline SVGs where lucide lacks a brand mark
function RobloxMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M4.2 3.4 3.4 4.2 20 20.6l.8-.8L4.2 3.4Zm4.7 6.4 6 1.6-1.6 6-6-1.6 1.6-6Z" />
    </svg>
  );
}
function TikTokMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16 3v3.2a5 5 0 0 0 3 1V10a8 8 0 0 1-3-.7v5.4a5.3 5.3 0 1 1-5.3-5.3v3.2a2.1 2.1 0 1 0 2.1 2.1V3H16Z" />
    </svg>
  );
}
function SpotifyMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.6 14.4a.7.7 0 0 1-1 .3c-2.7-1.7-6.2-2-10.3-1.1a.7.7 0 1 1-.3-1.4c4.4-1 8.2-.6 11.2 1.2a.7.7 0 0 1 .4.9Zm1.2-2.6a.9.9 0 0 1-1.2.3c-3.1-1.9-7.8-2.5-11.5-1.4a.9.9 0 1 1-.5-1.7c4.2-1.2 9.4-.6 13 1.6a.9.9 0 0 1 .3 1.2Zm.1-2.8c-3.7-2.2-9.9-2.4-13.4-1.3a1.1 1.1 0 1 1-.6-2c4-1.2 10.8-1 15 1.5a1.1 1.1 0 1 1-1.1 1.9Z" />
    </svg>
  );
}
function DiscordMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20 5.3A17 17 0 0 0 15.7 4l-.2.4a15 15 0 0 0-6.9 0L8.3 4A17 17 0 0 0 4 5.3C1.3 9.3.6 13.2 1 17a17 17 0 0 0 5.1 2.6l.4-.6a12 12 0 0 1-1.9-.9l.5-.4a12 12 0 0 0 10 0l.5.4a12 12 0 0 1-1.9.9l.4.6A17 17 0 0 0 23 17c.4-4-.4-7.9-3-11.7ZM9 15c-1 0-1.8-1-1.8-2.1S8 10.8 9 10.8 10.8 11.8 10.8 13 10 15 9 15Zm6 0c-1 0-1.8-1-1.8-2.1S14 10.8 15 10.8s1.8 1 1.8 2.2S16 15 15 15Z"/>
    </svg>
  );
}

export function IconFor({ kind, className = "w-4 h-4" }: { kind: IconKind; className?: string }) {
  switch (kind) {
    case "roblox": return <RobloxMark className={className} />;
    case "youtube": return <Youtube className={className} />;
    case "github": return <Github className={className} />;
    case "twitter": return <Twitter className={className} />;
    case "twitch": return <Twitch className={className} />;
    case "instagram": return <Instagram className={className} />;
    case "tiktok": return <TikTokMark className={className} />;
    case "spotify": return <SpotifyMark className={className} />;
    case "discord": return <DiscordMark className={className} />;
    case "telegram": return <Send className={className} />;
    default: return <Globe className={className} />;
  }
}

export const ICON_COLOR: Record<IconKind, string> = {
  roblox: "#ef4444",
  youtube: "#ff0033",
  github: "#f5f5f5",
  twitter: "#1da1f2",
  twitch: "#9146ff",
  instagram: "#e1306c",
  tiktok: "#25f4ee",
  spotify: "#1db954",
  discord: "#5865f2",
  telegram: "#26a5e4",
  website: "#a3a3a3",
};

// unused imports guard
void Music; void MessageCircle; void LinkIcon;
