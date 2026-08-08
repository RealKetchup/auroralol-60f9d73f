REVOKE EXECUTE ON FUNCTION public.admin_set_code(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_site_owner() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_set_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_site_owner() TO authenticated;