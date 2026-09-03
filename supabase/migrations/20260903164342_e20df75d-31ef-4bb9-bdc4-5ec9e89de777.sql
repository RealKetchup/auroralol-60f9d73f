ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS panels jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_html text,
  ADD COLUMN IF NOT EXISTS custom_css text,
  ADD COLUMN IF NOT EXISTS custom_code_enabled boolean NOT NULL DEFAULT false;

CREATE TEMP TABLE new_badges (key text, name text, description text, icon text, tier text, color text, admin_only boolean, sort int) ON COMMIT DROP;

INSERT INTO new_badges VALUES
  ('rookie','Newcomer','Created an aurora.lol profile.','sparkles','common','#94a3b8',false,1),
  ('named','Signed','Set a display name.','user','common','#94a3b8',false,2),
  ('face','Face Reveal','Uploaded a profile picture.','image','common','#22d3ee',false,3),
  ('bio_written','Bio Written','Wrote a bio of 50+ characters.','bookopen','common','#22d3ee',false,4),
  ('essayist','Essayist','Wrote a bio of 200+ characters.','pencil','rare','#22d3ee',false,5),
  ('novelist','Novelist','Wrote a bio of 500+ characters.','bookopen','epic','#22d3ee',false,6),
  ('dj','On Air','Added profile music.','music','common','#ec4899',false,7),
  ('tracklist','Track Titled','Named your profile track.','music','common','#ec4899',false,8),
  ('discordian','Discord Linked','Connected Discord presence.','messagecircle','common','#5865f2',false,9),
  ('blockhead','Roblox Linked','Linked a Roblox profile.','gamepad','common','#e2231a',false,10),
  ('roblox_sync','Avatar Sync','Synced your Roblox headshot.','rotate','rare','#e2231a',false,11),
  ('first_link','First Link','Added your first link.','link','common','#94a3b8',false,12),
  ('three_links','Three Links','Added three links.','link','common','#94a3b8',false,13),
  ('five_links','Five Links','Added five links.','network','rare','#22c55e',false,14),
  ('ten_links','Ten Links','Added ten links.','network','epic','#22c55e',false,15),
  ('twenty_links','Twenty Links','Added twenty links.','network','legendary','#22c55e',false,16),
  ('colorist','Colorist','Chose your own accent color.','palette','common','#ec4899',false,17),
  ('duotone','Duotone','Changed your secondary color too.','palette','rare','#ec4899',false,18),
  ('typeface','Typeface','Picked a different font.','type','common','#eab308',false,19),
  ('fontsmith','Fontsmith','Loaded a font from a URL.','pentool','epic','#eab308',false,20),
  ('auroramancer','Aurora Tuned','Changed your aurora preset.','wand','rare','#a855f7',false,21),
  ('aurora_max','Full Aurora','Pushed aurora intensity past 1.5.','wand','rare','#a855f7',false,22),
  ('aurora_off','Lights Out','Turned the aurora off completely.','moon','rare','#64748b',false,23),
  ('wallpaper','Wallpaper','Set a page background.','wallpaper','rare','#22d3ee',false,24),
  ('cinema','Cinematic','Used a video background.','film','epic','#22d3ee',false,25),
  ('panelist','Panel Art','Set a header panel background.','layout','rare','#22c55e',false,26),
  ('frosted','Frosted','Turned card blur past 20.','wind','rare','#22d3ee',false,27),
  ('translucent','Translucent','Tuned card opacity.','square','common','#94a3b8',false,28),
  ('glow_edge','Glow Edge','Enabled border glow.','zap','common','#a855f7',false,29),
  ('tilted','Tilted','Enabled tilting cards.','rotate','common','#94a3b8',false,30),
  ('clicky','Clicky','Enabled click effects.','mousepointer','common','#f472b6',false,31),
  ('ripples','Ripples','Switched to the ripple click effect.','droplet','rare','#22d3ee',false,32),
  ('stardust','Stardust','Switched to the sparkle click effect.','sparkles','rare','#eab308',false,33),
  ('lovestruck','Lovestruck','Switched to the heart click effect.','heart','rare','#ec4899',false,34),
  ('own_cursor','Own Cursor','Enabled the custom cursor.','mousepointer','common','#a855f7',false,35),
  ('comet','Comet','Enabled the cursor trail.','wind','rare','#22d3ee',false,36),
  ('grand_entrance','Grand Entrance','Changed your entry animation.','rocket','common','#f97316',false,37),
  ('rounded','Squircle','Switched to a squircle avatar.','square','common','#94a3b8',false,38),
  ('boxed','Boxed','Switched to a square avatar.','square','common','#94a3b8',false,39),
  ('fast_forward','Fast Forward','Sped animations past 1.5x.','zap','rare','#f97316',false,40),
  ('slow_motion','Slow Motion','Slowed animations below 0.6x.','clock','rare','#64748b',false,41),
  ('card_mode','Card Mode','Switched to the minimal card style.','layout','rare','#94a3b8',false,42),
  ('stars_bg','Starfield','Chose the stars background effect.','star','common','#eab308',false,43),
  ('matrix_bg','Rainfall','Chose the matrix background effect.','terminal','rare','#22c55e',false,44),
  ('grid_bg','Blueprint','Chose the grid background effect.','grid','common','#22d3ee',false,45),
  ('clean_bg','Clean Slate','Turned background effects off.','square','rare','#64748b',false,46),
  ('layout_editor','Layout Editor','Rearranged your panels.','layout','rare','#a855f7',false,47),
  ('architect','Architect','Laid out six or more panels.','layout','epic','#a855f7',false,48),
  ('curator','Curator','Hid a panel you did not need.','eye','rare','#64748b',false,49),
  ('minimalist','Minimalist','Hid three or more panels.','eye','epic','#64748b',false,50),
  ('panel_maker','Panel Maker','Created a custom panel.','box','rare','#22c55e',false,51),
  ('panel_factory','Panel Factory','Created three custom panels.','box','epic','#22c55e',false,52),
  ('panel_empire','Panel Empire','Created six custom panels.','box','legendary','#22c55e',false,53),
  ('resizer','Resizer','Resized a panel by hand.','compass','rare','#94a3b8',false,54),
  ('hand_coded','Hand Coded','Wrote custom HTML for your page.','code','epic','#a855f7',false,55),
  ('stylesheet','Stylesheet','Wrote custom CSS for your page.','brush','epic','#ec4899',false,56),
  ('full_stack','Full Stack','Wrote both custom HTML and CSS.','cpu','legendary','#a855f7',false,57),
  ('code_heavy','Code Heavy','Shipped 1000+ characters of custom code.','terminal','legendary','#22c55e',false,58),
  ('ten_views','First Visitors','Reached 10 profile views.','eye','common','#22c55e',false,59),
  ('fifty_views','Getting Around','Reached 50 profile views.','eye','common','#22c55e',false,60),
  ('hundred_views','Hundred Club','Reached 100 profile views.','trendingup','rare','#22c55e',false,61),
  ('five_hundred_views','Five Hundred','Reached 500 profile views.','trendingup','rare','#22c55e',false,62),
  ('thousand_views','Thousand Strong','Reached 1,000 profile views.','flame','epic','#f97316',false,63),
  ('five_k_views','Five Thousand','Reached 5,000 profile views.','flame','epic','#f97316',false,64),
  ('ten_k_views','Ten Thousand','Reached 10,000 profile views.','crown','legendary','#eab308',false,65),
  ('fifty_k_views','Landmark','Reached 50,000 profile views.','trophy','legendary','#eab308',false,66),
  ('first_guest','First Guest','Got your first guestbook entry.','messagesquare','common','#22c55e',false,67),
  ('five_guests','Five Guests','Got five guestbook entries.','messagesquare','common','#22c55e',false,68),
  ('ten_guests','Ten Guests','Got ten guestbook entries.','heart','rare','#ec4899',false,69),
  ('twentyfive_guests','Busy Guestbook','Got 25 guestbook entries.','heart','epic','#ec4899',false,70),
  ('fifty_guests','Full House','Got 50 guestbook entries.','heart','epic','#ec4899',false,71),
  ('hundred_guests','Guestbook Legend','Got 100 guestbook entries.','gem','legendary','#ec4899',false,72),
  ('first_signature','First Signature','Signed someone elses guestbook.','pencil','common','#22d3ee',false,73),
  ('five_signatures','Regular','Signed five guestbooks.','pencil','rare','#22d3ee',false,74),
  ('ten_signatures','Frequent Visitor','Signed ten guestbooks.','pencil','epic','#22d3ee',false,75),
  ('twentyfive_signatures','Community Pillar','Signed 25 guestbooks.','users','legendary','#22d3ee',false,76),
  ('well_liked','Well Liked','Averaged 4.0+ over three reviews.','star','rare','#eab308',false,77),
  ('top_rated','Top Rated','Perfect 5.0 across three reviews.','star','epic','#eab308',false,78),
  ('flawless','Flawless','Perfect 5.0 across ten reviews.','medal','legendary','#eab308',false,79),
  ('reviewed','Reviewed','Collected 20 rated reviews.','medal','epic','#eab308',false,80),
  ('day_one','Day One','Kept your profile for a day.','clock','common','#64748b',false,81),
  ('one_week','One Week','Kept your profile for a week.','clock','common','#64748b',false,82),
  ('one_month','One Month','Kept your profile for a month.','clock','rare','#64748b',false,83),
  ('three_months','Three Months','Kept your profile for 90 days.','clock','rare','#64748b',false,84),
  ('half_year','Half a Year','Kept your profile for 180 days.','clock','epic','#64748b',false,85),
  ('one_year','One Year','Kept your profile for a year.','trophy','legendary','#eab308',false,86),
  ('short_handle','Short Handle','Claimed a handle of three characters or less.','key','epic','#a855f7',false,87),
  ('set_up','Set Up','Filled in name, avatar, and bio.','check','rare','#22c55e',false,88),
  ('dialed_in','Dialed In','Music, links, and Discord all set.','check','epic','#22c55e',false,89),
  ('completionist','Completionist','Finished every part of your profile.','badgecheck','legendary','#a855f7',false,90),
  ('staff','Staff','On the aurora.lol team.','shield','legendary','#22d3ee',true,91),
  ('owner','Owner','Runs aurora.lol.','crown','legendary','#eab308',true,92),
  ('og','OG','Here before it was cool.','clock','legendary','#f97316',true,93),
  ('supporter','Supporter','Supported aurora.lol.','heart','legendary','#ec4899',true,94),
  ('verified','Verified','Identity confirmed by staff.','badgecheck','legendary','#22d3ee',true,95),
  ('moderator','Moderator','Keeps the guestbooks clean.','shield','epic','#a855f7',true,96),
  ('bug_hunter','Bug Hunter','Reported a real bug.','target','epic','#f97316',true,97),
  ('designer','Design Feature','Profile featured for its design.','brush','legendary','#ec4899',true,98),
  ('contest_winner','Contest Winner','Won an aurora.lol contest.','trophy','legendary','#eab308',true,99),
  ('hall_of_fame','Hall of Fame','Permanent aurora.lol legend.','gem','legendary','#a855f7',true,100);

DELETE FROM public.user_badges WHERE badge_key NOT IN (SELECT key FROM new_badges);
DELETE FROM public.badges WHERE key NOT IN (SELECT key FROM new_badges);

INSERT INTO public.badges (key,name,description,icon,tier,color,admin_only,sort)
SELECT key,name,description,icon,tier,color,admin_only,sort FROM new_badges
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon,
  tier = EXCLUDED.tier, color = EXCLUDED.color, admin_only = EXCLUDED.admin_only, sort = EXCLUDED.sort;

CREATE OR REPLACE FUNCTION public.award_badges(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  p public.profiles;
  n_links int; n_reviews int; n_rated int; avg_rating numeric; n_written int;
  n_panels int := 0; n_custom int := 0; n_hidden int := 0; n_resized int := 0;
  age_days numeric := 0;
  earned text[] := ARRAY[]::text[];
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = _user_id;
  IF p.id IS NULL THEN RETURN; END IF;

  SELECT count(*) INTO n_links FROM public.links WHERE profile_id = _user_id;
  SELECT count(*) INTO n_reviews FROM public.reviews WHERE profile_id = _user_id;
  SELECT count(*), coalesce(avg(rating),0) INTO n_rated, avg_rating
    FROM public.reviews WHERE profile_id = _user_id AND rating IS NOT NULL;
  SELECT count(*) INTO n_written FROM public.reviews WHERE author_id = _user_id;
  age_days := EXTRACT(EPOCH FROM (now() - p.created_at)) / 86400.0;

  IF jsonb_typeof(coalesce(p.panels, '[]'::jsonb)) = 'array' THEN
    SELECT count(*),
           count(*) FILTER (WHERE e->>'type' = 'custom'),
           count(*) FILTER (WHERE coalesce((e->>'hidden')::boolean, false)),
           count(*) FILTER (WHERE coalesce((e->>'w')::numeric, 12) <> 12)
      INTO n_panels, n_custom, n_hidden, n_resized
      FROM jsonb_array_elements(coalesce(p.panels, '[]'::jsonb)) AS e;
  END IF;

  earned := earned || 'rookie';
  IF coalesce(p.display_name,'') <> '' THEN earned := earned || 'named'; END IF;
  IF coalesce(p.avatar_url,'') <> '' OR coalesce(p.roblox_avatar_url,'') <> '' THEN earned := earned || 'face'; END IF;
  IF char_length(coalesce(p.bio,'')) >= 50 THEN earned := earned || 'bio_written'; END IF;
  IF char_length(coalesce(p.bio,'')) >= 200 THEN earned := earned || 'essayist'; END IF;
  IF char_length(coalesce(p.bio,'')) >= 500 THEN earned := earned || 'novelist'; END IF;
  IF coalesce(p.music_url,'') <> '' THEN earned := earned || 'dj'; END IF;
  IF coalesce(p.music_title,'') <> '' THEN earned := earned || 'tracklist'; END IF;
  IF coalesce(p.discord_id,'') <> '' THEN earned := earned || 'discordian'; END IF;
  IF coalesce(p.roblox_url,'') <> '' THEN earned := earned || 'blockhead'; END IF;
  IF p.auto_roblox_avatar THEN earned := earned || 'roblox_sync'; END IF;
  IF n_links >= 1 THEN earned := earned || 'first_link'; END IF;
  IF n_links >= 3 THEN earned := earned || 'three_links'; END IF;
  IF n_links >= 5 THEN earned := earned || 'five_links'; END IF;
  IF n_links >= 10 THEN earned := earned || 'ten_links'; END IF;
  IF n_links >= 20 THEN earned := earned || 'twenty_links'; END IF;
  IF coalesce(p.accent_color,'#a855f7') <> '#a855f7' THEN earned := earned || 'colorist'; END IF;
  IF coalesce(p.secondary_color,'#22c55e') <> '#22c55e' THEN earned := earned || 'duotone'; END IF;
  IF coalesce(p.font_family,'space-grotesk') <> 'space-grotesk' THEN earned := earned || 'typeface'; END IF;
  IF coalesce(p.custom_font_url,'') <> '' THEN earned := earned || 'fontsmith'; END IF;
  IF coalesce(p.aurora_preset,'aurora') <> 'aurora' THEN earned := earned || 'auroramancer'; END IF;
  IF coalesce(p.aurora_intensity,1) >= 1.5 THEN earned := earned || 'aurora_max'; END IF;
  IF coalesce(p.aurora_preset,'aurora') = 'none' THEN earned := earned || 'aurora_off'; END IF;
  IF coalesce(p.background_image_url,'') <> '' THEN earned := earned || 'wallpaper'; END IF;
  IF coalesce(p.background_image_url,'') ~* '\.(mp4|webm)' THEN earned := earned || 'cinema'; END IF;
  IF coalesce(p.panel_background_url,'') <> '' THEN earned := earned || 'panelist'; END IF;
  IF coalesce(p.card_blur,12) >= 20 THEN earned := earned || 'frosted'; END IF;
  IF coalesce(p.card_opacity,0.6) <> 0.6 THEN earned := earned || 'translucent'; END IF;
  IF p.border_glow THEN earned := earned || 'glow_edge'; END IF;
  IF p.tilt_cards THEN earned := earned || 'tilted'; END IF;
  IF p.click_effect THEN earned := earned || 'clicky'; END IF;
  IF coalesce(p.click_effect_style,'burst') = 'ripple' THEN earned := earned || 'ripples'; END IF;
  IF coalesce(p.click_effect_style,'burst') = 'sparkle' THEN earned := earned || 'stardust'; END IF;
  IF coalesce(p.click_effect_style,'burst') in ('heart','hearts') THEN earned := earned || 'lovestruck'; END IF;
  IF p.custom_cursor THEN earned := earned || 'own_cursor'; END IF;
  IF p.cursor_trail THEN earned := earned || 'comet'; END IF;
  IF coalesce(p.entry_animation,'fade-up') <> 'fade-up' THEN earned := earned || 'grand_entrance'; END IF;
  IF coalesce(p.avatar_shape,'circle') = 'squircle' THEN earned := earned || 'rounded'; END IF;
  IF coalesce(p.avatar_shape,'circle') = 'square' THEN earned := earned || 'boxed'; END IF;
  IF coalesce(p.animation_speed,1) >= 1.5 THEN earned := earned || 'fast_forward'; END IF;
  IF coalesce(p.animation_speed,1) <= 0.6 THEN earned := earned || 'slow_motion'; END IF;
  IF coalesce(p.profile_style,'code') <> 'code' THEN earned := earned || 'card_mode'; END IF;
  IF coalesce(p.background_effect,'particles') = 'stars' THEN earned := earned || 'stars_bg'; END IF;
  IF coalesce(p.background_effect,'particles') = 'matrix' THEN earned := earned || 'matrix_bg'; END IF;
  IF coalesce(p.background_effect,'particles') = 'grid' THEN earned := earned || 'grid_bg'; END IF;
  IF coalesce(p.background_effect,'particles') = 'none' THEN earned := earned || 'clean_bg'; END IF;
  IF n_panels >= 1 THEN earned := earned || 'layout_editor'; END IF;
  IF n_panels >= 6 THEN earned := earned || 'architect'; END IF;
  IF n_hidden >= 1 THEN earned := earned || 'curator'; END IF;
  IF n_hidden >= 3 THEN earned := earned || 'minimalist'; END IF;
  IF n_custom >= 1 THEN earned := earned || 'panel_maker'; END IF;
  IF n_custom >= 3 THEN earned := earned || 'panel_factory'; END IF;
  IF n_custom >= 6 THEN earned := earned || 'panel_empire'; END IF;
  IF n_resized >= 1 THEN earned := earned || 'resizer'; END IF;
  IF char_length(coalesce(p.custom_html,'')) > 0 THEN earned := earned || 'hand_coded'; END IF;
  IF char_length(coalesce(p.custom_css,'')) > 0 THEN earned := earned || 'stylesheet'; END IF;
  IF char_length(coalesce(p.custom_html,'')) > 0 AND char_length(coalesce(p.custom_css,'')) > 0 THEN earned := earned || 'full_stack'; END IF;
  IF char_length(coalesce(p.custom_html,'')) + char_length(coalesce(p.custom_css,'')) >= 1000 THEN earned := earned || 'code_heavy'; END IF;
  IF coalesce(p.view_count,0) >= 10 THEN earned := earned || 'ten_views'; END IF;
  IF coalesce(p.view_count,0) >= 50 THEN earned := earned || 'fifty_views'; END IF;
  IF coalesce(p.view_count,0) >= 100 THEN earned := earned || 'hundred_views'; END IF;
  IF coalesce(p.view_count,0) >= 500 THEN earned := earned || 'five_hundred_views'; END IF;
  IF coalesce(p.view_count,0) >= 1000 THEN earned := earned || 'thousand_views'; END IF;
  IF coalesce(p.view_count,0) >= 5000 THEN earned := earned || 'five_k_views'; END IF;
  IF coalesce(p.view_count,0) >= 10000 THEN earned := earned || 'ten_k_views'; END IF;
  IF coalesce(p.view_count,0) >= 50000 THEN earned := earned || 'fifty_k_views'; END IF;
  IF n_reviews >= 1 THEN earned := earned || 'first_guest'; END IF;
  IF n_reviews >= 5 THEN earned := earned || 'five_guests'; END IF;
  IF n_reviews >= 10 THEN earned := earned || 'ten_guests'; END IF;
  IF n_reviews >= 25 THEN earned := earned || 'twentyfive_guests'; END IF;
  IF n_reviews >= 50 THEN earned := earned || 'fifty_guests'; END IF;
  IF n_reviews >= 100 THEN earned := earned || 'hundred_guests'; END IF;
  IF n_written >= 1 THEN earned := earned || 'first_signature'; END IF;
  IF n_written >= 5 THEN earned := earned || 'five_signatures'; END IF;
  IF n_written >= 10 THEN earned := earned || 'ten_signatures'; END IF;
  IF n_written >= 25 THEN earned := earned || 'twentyfive_signatures'; END IF;
  IF n_rated >= 3 AND avg_rating >= 4 THEN earned := earned || 'well_liked'; END IF;
  IF n_rated >= 3 AND avg_rating >= 4.95 THEN earned := earned || 'top_rated'; END IF;
  IF n_rated >= 10 AND avg_rating >= 4.95 THEN earned := earned || 'flawless'; END IF;
  IF n_rated >= 20 THEN earned := earned || 'reviewed'; END IF;
  IF age_days >= 1 THEN earned := earned || 'day_one'; END IF;
  IF age_days >= 7 THEN earned := earned || 'one_week'; END IF;
  IF age_days >= 30 THEN earned := earned || 'one_month'; END IF;
  IF age_days >= 90 THEN earned := earned || 'three_months'; END IF;
  IF age_days >= 180 THEN earned := earned || 'half_year'; END IF;
  IF age_days >= 365 THEN earned := earned || 'one_year'; END IF;
  IF char_length(p.username) <= 3 THEN earned := earned || 'short_handle'; END IF;
  IF coalesce(p.display_name,'') <> '' AND coalesce(p.avatar_url,'') <> '' AND char_length(coalesce(p.bio,'')) >= 20 THEN earned := earned || 'set_up'; END IF;
  IF coalesce(p.music_url,'') <> '' AND n_links >= 3 AND coalesce(p.discord_id,'') <> '' THEN earned := earned || 'dialed_in'; END IF;
  IF coalesce(p.avatar_url,'') <> '' AND char_length(coalesce(p.bio,'')) >= 50 AND coalesce(p.music_url,'') <> ''
     AND n_links >= 5 AND coalesce(p.discord_id,'') <> '' AND coalesce(p.background_image_url,'') <> '' AND n_panels >= 1
  THEN earned := earned || 'completionist'; END IF;

  INSERT INTO public.user_badges (user_id, badge_key, equipped)
  SELECT _user_id, k, true FROM unnest(earned) AS k
  ON CONFLICT (user_id, badge_key) DO NOTHING;
END;
$fn$;