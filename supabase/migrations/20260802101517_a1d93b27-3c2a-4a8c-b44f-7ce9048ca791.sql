ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS panel_video_url text,
  ADD COLUMN IF NOT EXISTS background_video_url text,
  ADD COLUMN IF NOT EXISTS video_opacity numeric NOT NULL DEFAULT 0.35,
  ADD COLUMN IF NOT EXISTS custom_font_url text,
  ADD COLUMN IF NOT EXISTS custom_font_name text,
  ADD COLUMN IF NOT EXISTS auto_roblox_avatar boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS roblox_avatar_url text,
  ADD COLUMN IF NOT EXISTS aurora_preset text NOT NULL DEFAULT 'aurora',
  ADD COLUMN IF NOT EXISTS aurora_intensity numeric NOT NULL DEFAULT 0.6;