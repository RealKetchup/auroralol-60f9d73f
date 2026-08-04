-- 1. profiles: panel background + ban, drop video
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS panel_background_url text,
  ADD COLUMN IF NOT EXISTS panel_background_opacity numeric NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason text,
  DROP COLUMN IF EXISTS panel_video_url,
  DROP COLUMN IF EXISTS background_video_url,
  DROP COLUMN IF EXISTS video_opacity;

-- 2. roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_roles_self_read ON public.user_roles;
CREATE POLICY user_roles_self_read ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 3. badge catalog
CREATE TABLE IF NOT EXISTS public.badges (
  key text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'star',
  tier text NOT NULL DEFAULT 'common',
  color text NOT NULL DEFAULT '#a855f7',
  admin_only boolean NOT NULL DEFAULT false,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badges TO anon;
GRANT SELECT ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS badges_public_read ON public.badges;
CREATE POLICY badges_public_read ON public.badges FOR SELECT USING (true);
DROP POLICY IF EXISTS badges_admin_write ON public.badges;
CREATE POLICY badges_admin_write ON public.badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. earned badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_key text NOT NULL REFERENCES public.badges(key) ON DELETE CASCADE,
  equipped boolean NOT NULL DEFAULT true,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_key)
);
GRANT SELECT ON public.user_badges TO anon;
GRANT SELECT, UPDATE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_badges_public_read ON public.user_badges;
CREATE POLICY user_badges_public_read ON public.user_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS user_badges_owner_equip ON public.user_badges;
CREATE POLICY user_badges_owner_equip ON public.user_badges FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS user_badges_admin_all ON public.user_badges;
CREATE POLICY user_badges_admin_all ON public.user_badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. admins can moderate profiles
DROP POLICY IF EXISTS profiles_admin_update ON public.profiles;
CREATE POLICY profiles_admin_update ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS profiles_admin_delete ON public.profiles;
CREATE POLICY profiles_admin_delete ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS reviews_admin_delete ON public.reviews;
CREATE POLICY reviews_admin_delete ON public.reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. seed catalog
INSERT INTO public.badges (key, name, description, icon, tier, color, admin_only, sort) VALUES
  ('rookie','Rookie','Created an aurora.lol profile.','sparkles','common','#a855f7',false,1),
  ('named','Identified','Set a display name.','user','common','#a855f7',false,2),
  ('storyteller','Storyteller','Wrote a bio of 50+ characters.','bookopen','common','#22c55e',false,3),
  ('face','Face Reveal','Uploaded a profile picture.','image','common','#22d3ee',false,4),
  ('dj','Resident DJ','Added background music.','music','common','#ec4899',false,5),
  ('linked','Linked','Added your first link.','link','common','#22c55e',false,6),
  ('networker','Networker','Added 5 links.','network','rare','#22d3ee',false,7),
  ('socialite','Socialite','Added 10 links.','users','epic','#f97316',false,8),
  ('discordian','Discordian','Connected a Discord ID.','messagecircle','common','#5865F2',false,9),
  ('blockhead','Blockhead','Linked your Roblox account.','gamepad','common','#e2231a',false,10),
  ('artist','Colorist','Chose your own accent color.','palette','common','#ec4899',false,11),
  ('typographer','Typographer','Picked a custom font.','type','rare','#eab308',false,12),
  ('fontsmith','Fontsmith','Loaded your own font from a URL.','type','epic','#eab308',false,13),
  ('auroramancer','Auroramancer','Changed your aurora preset.','wand','rare','#a855f7',false,14),
  ('minimalist','Minimalist','Switched to the minimal layout.','square','rare','#94a3b8',false,15),
  ('wallpaper','Wallpaper','Set a background image.','image','rare','#22d3ee',false,16),
  ('glowup','Glow Up','Turned on border glow.','zap','common','#a855f7',false,17),
  ('trickster','Trickster','Changed your click effect.','mousepointer','rare','#f472b6',false,18),
  ('cursed','Cursed Cursor','Enabled the custom cursor.','mousepointer','common','#a855f7',false,19),
  ('comet','Comet','Enabled the cursor trail.','sparkles','rare','#22d3ee',false,20),
  ('tilted','Tilted','Enabled tilting cards.','rotate','common','#94a3b8',false,21),
  ('panelist','Panelist','Set a panel background.','layout','rare','#22c55e',false,22),
  ('popular','Popular','Reached 100 profile views.','trendingup','rare','#22c55e',false,23),
  ('viral','Viral','Reached 1,000 profile views.','flame','epic','#f97316',false,24),
  ('legend','Legend','Reached 10,000 profile views.','crown','legendary','#eab308',false,25),
  ('welcomed','Welcomed','Received your first guestbook entry.','messagesquare','common','#22c55e',false,26),
  ('beloved','Beloved','Received 10 guestbook entries.','heart','rare','#ec4899',false,27),
  ('adored','Adored','Received 50 guestbook entries.','heart','epic','#ec4899',false,28),
  ('fivestar','Five Star','Perfect 5.0 rating with 3+ reviews.','star','epic','#eab308',false,29),
  ('critic','Critic','Signed 5 other guestbooks.','pencil','rare','#22d3ee',false,30),
  ('complete','Completionist','Filled out every part of your profile.','check','legendary','#a855f7',false,31),
  ('staff','Staff','Part of the aurora.lol team.','shield','legendary','#22d3ee',true,32),
  ('owner','Owner','Runs aurora.lol.','crown','legendary','#eab308',true,33),
  ('og','OG','Was here before it was cool.','clock','legendary','#f97316',true,34),
  ('supporter','Supporter','Supported aurora.lol.','heart','legendary','#ec4899',true,35)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon,
  tier = EXCLUDED.tier, color = EXCLUDED.color, admin_only = EXCLUDED.admin_only, sort = EXCLUDED.sort;

-- 7. automatic badge awarding
CREATE OR REPLACE FUNCTION public.award_badges(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p public.profiles;
  n_links int;
  n_reviews int;
  avg_rating numeric;
  n_written int;
  earned text[] := ARRAY[]::text[];
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = _user_id;
  IF p.id IS NULL THEN RETURN; END IF;

  SELECT count(*) INTO n_links FROM public.links WHERE profile_id = _user_id;
  SELECT count(*), coalesce(avg(rating), 0) INTO n_reviews, avg_rating FROM public.reviews WHERE profile_id = _user_id;
  SELECT count(*) INTO n_written FROM public.reviews WHERE author_id = _user_id;

  earned := earned || 'rookie';
  IF coalesce(p.display_name, '') <> '' THEN earned := earned || 'named'; END IF;
  IF char_length(coalesce(p.bio, '')) >= 50 THEN earned := earned || 'storyteller'; END IF;
  IF coalesce(p.avatar_url, '') <> '' OR coalesce(p.roblox_avatar_url, '') <> '' THEN earned := earned || 'face'; END IF;
  IF coalesce(p.music_url, '') <> '' THEN earned := earned || 'dj'; END IF;
  IF n_links >= 1 THEN earned := earned || 'linked'; END IF;
  IF n_links >= 5 THEN earned := earned || 'networker'; END IF;
  IF n_links >= 10 THEN earned := earned || 'socialite'; END IF;
  IF coalesce(p.discord_id, '') <> '' THEN earned := earned || 'discordian'; END IF;
  IF coalesce(p.roblox_url, '') <> '' THEN earned := earned || 'blockhead'; END IF;
  IF coalesce(p.accent_color, '#a855f7') <> '#a855f7' THEN earned := earned || 'artist'; END IF;
  IF coalesce(p.font_family, 'space-grotesk') <> 'space-grotesk' THEN earned := earned || 'typographer'; END IF;
  IF coalesce(p.custom_font_url, '') <> '' THEN earned := earned || 'fontsmith'; END IF;
  IF coalesce(p.aurora_preset, 'aurora') <> 'aurora' THEN earned := earned || 'auroramancer'; END IF;
  IF coalesce(p.layout_style, 'classic') <> 'classic' OR coalesce(p.profile_style,'code') <> 'code' THEN earned := earned || 'minimalist'; END IF;
  IF coalesce(p.background_image_url, '') <> '' THEN earned := earned || 'wallpaper'; END IF;
  IF p.border_glow THEN earned := earned || 'glowup'; END IF;
  IF coalesce(p.click_effect_style, 'burst') <> 'burst' THEN earned := earned || 'trickster'; END IF;
  IF p.custom_cursor THEN earned := earned || 'cursed'; END IF;
  IF p.cursor_trail THEN earned := earned || 'comet'; END IF;
  IF p.tilt_cards THEN earned := earned || 'tilted'; END IF;
  IF coalesce(p.panel_background_url, '') <> '' THEN earned := earned || 'panelist'; END IF;
  IF coalesce(p.view_count, 0) >= 100 THEN earned := earned || 'popular'; END IF;
  IF coalesce(p.view_count, 0) >= 1000 THEN earned := earned || 'viral'; END IF;
  IF coalesce(p.view_count, 0) >= 10000 THEN earned := earned || 'legend'; END IF;
  IF n_reviews >= 1 THEN earned := earned || 'welcomed'; END IF;
  IF n_reviews >= 10 THEN earned := earned || 'beloved'; END IF;
  IF n_reviews >= 50 THEN earned := earned || 'adored'; END IF;
  IF n_reviews >= 3 AND avg_rating >= 4.95 THEN earned := earned || 'fivestar'; END IF;
  IF n_written >= 5 THEN earned := earned || 'critic'; END IF;
  IF coalesce(p.avatar_url, '') <> '' AND char_length(coalesce(p.bio, '')) >= 50
     AND coalesce(p.music_url, '') <> '' AND n_links >= 3 AND coalesce(p.discord_id, '') <> ''
  THEN earned := earned || 'complete'; END IF;

  INSERT INTO public.user_badges (user_id, badge_key, equipped)
  SELECT _user_id, k, true FROM unnest(earned) AS k
  ON CONFLICT (user_id, badge_key) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.award_badges(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_badges(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_badges(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_badges()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT public.award_badges(auth.uid());
$$;
REVOKE ALL ON FUNCTION public.claim_badges() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_badges() TO authenticated;