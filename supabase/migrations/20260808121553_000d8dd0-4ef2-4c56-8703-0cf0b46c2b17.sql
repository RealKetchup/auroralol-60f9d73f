-- 1. drop pointless badges
DELETE FROM public.user_badges WHERE badge_key IN ('named','glowup','cursed','tilted','minimalist','supporter');
DELETE FROM public.badges WHERE key IN ('named','glowup','cursed','tilted','minimalist','supporter');

-- 2. rename the rest to plain language
UPDATE public.badges SET name='Newcomer',      description='Made an aurora.lol profile.',                 sort=1  WHERE key='rookie';
UPDATE public.badges SET name='Bio Written',   description='Wrote a bio of at least 50 characters.',      sort=2  WHERE key='storyteller';
UPDATE public.badges SET name='Picture Set',   description='Uploaded or synced a profile picture.',       sort=3  WHERE key='face';
UPDATE public.badges SET name='Music On',      description='Added background music to your page.',        sort=4  WHERE key='dj';
UPDATE public.badges SET name='First Link',    description='Added your first link.',                      sort=5  WHERE key='linked';
UPDATE public.badges SET name='Five Links',    description='Added five links.',                           sort=6  WHERE key='networker';
UPDATE public.badges SET name='Ten Links',     description='Added ten links.',                            sort=7  WHERE key='socialite';
UPDATE public.badges SET name='Discord',       description='Connected a Discord account.',                sort=8  WHERE key='discordian';
UPDATE public.badges SET name='Roblox',        description='Linked a Roblox profile.',                    sort=9  WHERE key='blockhead';
UPDATE public.badges SET name='Own Colors',    description='Changed the accent color from the default.',  sort=10 WHERE key='artist';
UPDATE public.badges SET name='Own Font',      description='Picked a font preset.',                       sort=11 WHERE key='typographer';
UPDATE public.badges SET name='Font Imported', description='Loaded a custom font from a URL.',            sort=12 WHERE key='fontsmith';
UPDATE public.badges SET name='Aurora Tuned',  description='Switched to a different aurora preset.',      sort=13 WHERE key='auroramancer';
UPDATE public.badges SET name='Wallpaper',     description='Set a page background.',                      sort=14 WHERE key='wallpaper';
UPDATE public.badges SET name='Panel Art',     description='Set a background behind your name panel.',    sort=15 WHERE key='panelist';
UPDATE public.badges SET name='Click Effects', description='Changed the click effect style.',             sort=16 WHERE key='trickster';
UPDATE public.badges SET name='Cursor Trail',  description='Turned on the cursor trail.',                 sort=17 WHERE key='comet';
UPDATE public.badges SET name='100 Views',     description='Your page was viewed 100 times.',             sort=18 WHERE key='popular';
UPDATE public.badges SET name='1K Views',      description='Your page was viewed 1,000 times.',           sort=19 WHERE key='viral';
UPDATE public.badges SET name='10K Views',     description='Your page was viewed 10,000 times.',          sort=20 WHERE key='legend';
UPDATE public.badges SET name='First Guest',   description='Someone signed your guestbook.',              sort=21 WHERE key='welcomed';
UPDATE public.badges SET name='Ten Guests',    description='Ten people signed your guestbook.',           sort=22 WHERE key='beloved';
UPDATE public.badges SET name='Fifty Guests',  description='Fifty people signed your guestbook.',         sort=23 WHERE key='adored';
UPDATE public.badges SET name='Top Rated',     description='A perfect 5.0 rating from three or more people.', sort=24 WHERE key='fivestar';
UPDATE public.badges SET name='Guest Signer',  description='Signed five other guestbooks.',               sort=25 WHERE key='critic';
UPDATE public.badges SET name='Fully Set Up',  description='Filled in every part of your profile.',       sort=26 WHERE key='complete';
UPDATE public.badges SET name='Staff',         description='Works on aurora.lol.',                        sort=27 WHERE key='staff';
UPDATE public.badges SET name='Owner',         description='Runs aurora.lol.',                            sort=28 WHERE key='owner';
UPDATE public.badges SET name='Early User',    description='Was here early.',                             sort=29 WHERE key='og';

-- 3. award_badges without the removed keys
CREATE OR REPLACE FUNCTION public.award_badges(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  IF coalesce(p.background_image_url, '') <> '' THEN earned := earned || 'wallpaper'; END IF;
  IF coalesce(p.panel_background_url, '') <> '' THEN earned := earned || 'panelist'; END IF;
  IF coalesce(p.click_effect_style, 'burst') <> 'burst' THEN earned := earned || 'trickster'; END IF;
  IF p.cursor_trail THEN earned := earned || 'comet'; END IF;
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

-- 4. owner-only admin password rotation
CREATE OR REPLACE FUNCTION public.admin_set_code(_new_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  uname text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT username INTO uname FROM public.profiles WHERE id = auth.uid();
  IF lower(coalesce(uname, '')) <> 'owner' THEN RETURN false; END IF;
  IF char_length(coalesce(_new_code, '')) < 6 THEN RETURN false; END IF;

  DELETE FROM public.admin_codes;
  INSERT INTO public.admin_codes (code_hash) VALUES (extensions.crypt(_new_code, extensions.gen_salt('bf')));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_site_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND lower(username) = 'owner')
$$;