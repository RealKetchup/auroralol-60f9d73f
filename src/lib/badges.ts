import {
  Sparkles, User, BookOpen, Image as ImageIcon, Music, Link as LinkIcon, Network, Users,
  MessageCircle, Gamepad2, Palette, Type, Wand2, Square, Zap, MousePointer2, RotateCw,
  LayoutPanelTop, TrendingUp, Flame, Crown, MessageSquare, Heart, Star, Pencil, Check,
  Shield, Clock, PenTool, Wallpaper, Wind, Gem, Trophy, Medal, BadgeCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Badge = {
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  color: string;
  admin_only: boolean;
  sort: number;
};

export type UserBadge = { badge_key: string; equipped: boolean; awarded_at: string };

export const BADGE_ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  user: User,
  bookopen: BookOpen,
  image: ImageIcon,
  music: Music,
  link: LinkIcon,
  network: Network,
  users: Users,
  messagecircle: MessageCircle,
  gamepad: Gamepad2,
  palette: Palette,
  type: Type,
  wand: Wand2,
  square: Square,
  zap: Zap,
  mousepointer: MousePointer2,
  rotate: RotateCw,
  layout: LayoutPanelTop,
  trendingup: TrendingUp,
  flame: Flame,
  crown: Crown,
  messagesquare: MessageSquare,
  heart: Heart,
  star: Star,
  pencil: Pencil,
  check: Check,
  shield: Shield,
  clock: Clock,
  pentool: PenTool,
  wallpaper: Wallpaper,
  wind: Wind,
  gem: Gem,
  trophy: Trophy,
  medal: Medal,
  badgecheck: BadgeCheck,
};

const ICON_ALIASES: Record<string, string> = {
  book: "bookopen",
  bookmark: "bookopen",
  picture: "image",
  photo: "image",
  avatar: "image",
  song: "music",
  audio: "music",
  headphones: "music",
  chain: "link",
  links: "link",
  discord: "messagecircle",
  message: "messagecircle",
  chat: "messagecircle",
  roblox: "gamepad",
  gamepad2: "gamepad",
  game: "gamepad",
  controller: "gamepad",
  color: "palette",
  colors: "palette",
  font: "type",
  text: "type",
  wand2: "wand",
  magic: "wand",
  aurora: "wand",
  pen: "pentool",
  background: "wallpaper",
  panel: "layout",
  cursor: "mousepointer",
  mousepointer2: "mousepointer",
  trail: "wind",
  trending: "trendingup",
  fire: "flame",
  views: "trendingup",
  guestbook: "messagesquare",
  love: "heart",
  diamond: "gem",
  award: "medal",
  rating: "medal",
  cup: "trophy",
  verified: "badgecheck",
  admin: "shield",
  staff: "shield",
  owner: "crown",
  king: "crown",
  time: "clock",
  early: "clock",
  og: "clock",
  done: "check",
  complete: "check",
  write: "pencil",
  edit: "pencil",
  sparkle: "sparkles",
  new: "sparkles",
  refresh: "rotate",
  people: "users",
  profile: "user",
  bolt: "zap",
};

export function badgeIcon(name?: string | null): LucideIcon {
  const key = (name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return BADGE_ICONS[key] ?? BADGE_ICONS[ICON_ALIASES[key] ?? ""] ?? Star;
}

export const TIER_LABEL: Record<string, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function tierRing(tier: string, color: string) {
  switch (tier) {
    case "legendary":
      return { border: `1px solid ${color}`, boxShadow: `0 0 22px -4px ${color}, 0 0 0 1px ${color}55 inset` };
    case "epic":
      return { border: `1px solid ${color}bb`, boxShadow: `0 0 16px -6px ${color}` };
    case "rare":
      return { border: `1px solid ${color}88` };
    default:
      return { border: `1px solid ${color}55` };
  }
}
