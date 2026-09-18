-- Create RPC to securely search users (including email) for admins
CREATE OR REPLACE FUNCTION public.admin_search_users(search_term text)
RETURNS TABLE (id uuid, display_name text, email text)
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.display_name, u.email::text
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE (p.display_name ILIKE '%' || search_term || '%' OR u.email ILIKE '%' || search_term || '%')
  AND public.has_role(auth.uid(), 'admin') = true
  LIMIT 10;
$$;
