-- private admin code store
CREATE TABLE IF NOT EXISTS public.admin_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.admin_codes FROM anon, authenticated;
GRANT ALL ON public.admin_codes TO service_role;
ALTER TABLE public.admin_codes ENABLE ROW LEVEL SECURITY;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

INSERT INTO public.admin_codes (code_hash)
SELECT extensions.crypt('Amiin1234', extensions.gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM public.admin_codes);

CREATE OR REPLACE FUNCTION public.redeem_admin_code(_code text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE ok boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT EXISTS (SELECT 1 FROM public.admin_codes c WHERE c.code_hash = extensions.crypt(_code, c.code_hash)) INTO ok;
  IF NOT ok THEN
    PERFORM pg_sleep(0.4);
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.redeem_admin_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_admin_code(text) TO authenticated;

-- admin listing view helper (admins only, enforced inside)
CREATE OR REPLACE FUNCTION public.admin_set_ban(_user_id uuid, _banned boolean, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.profiles SET banned = _banned, ban_reason = _reason WHERE id = _user_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_ban(uuid, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_ban(uuid, boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_grant_badge(_user_id uuid, _badge_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO public.user_badges (user_id, badge_key, equipped) VALUES (_user_id, _badge_key, true)
  ON CONFLICT (user_id, badge_key) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_grant_badge(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_grant_badge(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_revoke_badge(_user_id uuid, _badge_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  DELETE FROM public.user_badges WHERE user_id = _user_id AND badge_key = _badge_key;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_revoke_badge(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_revoke_badge(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_role(_user_id uuid, _role public.app_role, _enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _enabled THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role) ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_role(uuid, public.app_role, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, public.app_role, boolean) TO authenticated;

-- admins can read all roles
DROP POLICY IF EXISTS user_roles_admin_read ON public.user_roles;
CREATE POLICY user_roles_admin_read ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- tighten helper function execution
REVOKE ALL ON FUNCTION public.award_badges(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.claim_badges() FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;