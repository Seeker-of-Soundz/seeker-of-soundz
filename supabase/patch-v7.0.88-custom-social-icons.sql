-- Run in Supabase SQL Editor AFTER the existing Socials Manager migration.
-- Replaces only the admin save function to permit custom icon image URLs.
-- Does not modify or delete existing social links.
create or replace function public.admin_save_site_social_link(
  p_platform_key text,
  p_platform_name text,
  p_category_label text,
  p_description text,
  p_icon text,
  p_profile_url text,
  p_sort_order integer default 0,
  p_is_featured boolean default false,
  p_is_visible boolean default true
)
returns public.site_social_links
language plpgsql
security definer
set search_path = public
as $$
declare
  saved public.site_social_links;
  clean_key text;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Administrator access is required.';
  end if;

  clean_key := lower(regexp_replace(trim(coalesce(p_platform_key,'')), '[^a-zA-Z0-9_-]+', '-', 'g'));
  if clean_key = '' then raise exception 'Platform key is required.'; end if;
  if trim(coalesce(p_platform_name,'')) = '' then raise exception 'Platform name is required.'; end if;

  insert into public.site_social_links (
    platform_key, platform_name, category_label, description, icon,
    profile_url, sort_order, is_featured, is_visible, updated_by, updated_at
  )
  values (
    clean_key,
    trim(p_platform_name),
    trim(coalesce(p_category_label,'Connect')),
    trim(coalesce(p_description,'')),
    left(coalesce(nullif(trim(p_icon),''),'↗'),512),
    trim(coalesce(p_profile_url,'')),
    coalesce(p_sort_order,0),
    coalesce(p_is_featured,false),
    coalesce(p_is_visible,true),
    auth.uid(),
    now()
  )
  on conflict (platform_key) do update set
    platform_name = excluded.platform_name,
    category_label = excluded.category_label,
    description = excluded.description,
    icon = excluded.icon,
    profile_url = excluded.profile_url,
    sort_order = excluded.sort_order,
    is_featured = excluded.is_featured,
    is_visible = excluded.is_visible,
    updated_by = auth.uid(),
    updated_at = now()
  returning * into saved;

  return saved;
end;
$$;

grant execute on function public.admin_save_site_social_link(
  text,text,text,text,text,text,integer,boolean,boolean
) to authenticated;

