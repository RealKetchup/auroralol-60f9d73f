import {
  Sparkles, User, BookOpen, Image as ImageIcon, Music, Link as LinkIcon, Network, Users,
  MessageCircle, Gamepad2, Palette, Type, Wand2, Square, Zap, MousePointer2, RotateCw,
  LayoutPanelTop, TrendingUp, Flame, Crown, MessageSquare, Heart, Star, Pencil, Check,
  Shield, Clock,
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
};

export function badgeIcon(name: string): LucideIcon {
  return BADGE_ICONS[name] ?? Star;
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
