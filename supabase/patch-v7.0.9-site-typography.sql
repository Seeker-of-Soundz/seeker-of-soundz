-- Seeker Of SoundZ v7.0.9 — public typography settings + Admin Hub editor
create table if not exists public.site_typography_settings (
  singleton boolean primary key default true check (singleton),
  settings jsonb not null default '{"display":"sphere","heading":"sphere","card":"sphere","body":"system"}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.site_typography_settings enable row level security;
drop policy if exists site_typography_public_read on public.site_typography_settings;
create policy site_typography_public_read on public.site_typography_settings for select to anon,authenticated using (true);
drop policy if exists site_typography_admin_manage on public.site_typography_settings;
create policy site_typography_admin_manage on public.site_typography_settings for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
grant select on public.site_typography_settings to anon,authenticated;
grant insert,update on public.site_typography_settings to authenticated;
insert into public.site_typography_settings(singleton) values(true) on conflict(singleton) do nothing;
create or replace function public.get_site_typography() returns jsonb language sql stable security definer set search_path=public as $$ select settings from public.site_typography_settings where singleton=true $$;
grant execute on function public.get_site_typography() to anon,authenticated;
create or replace function public.admin_get_site_typography() returns jsonb language plpgsql stable security definer set search_path=public as $$ begin if not public.is_admin(auth.uid()) then raise exception 'Administrator access is required.'; end if; return (select settings from public.site_typography_settings where singleton=true); end; $$;
grant execute on function public.admin_get_site_typography() to authenticated;
create or replace function public.admin_save_site_typography(p_settings jsonb) returns jsonb language plpgsql security definer set search_path=public as $$ declare clean jsonb; begin if not public.is_admin(auth.uid()) then raise exception 'Administrator access is required.'; end if; clean=jsonb_build_object('display',coalesce(p_settings->>'display','sphere'),'heading',coalesce(p_settings->>'heading','sphere'),'card',coalesce(p_settings->>'card','sphere'),'body',coalesce(p_settings->>'body','system')); insert into public.site_typography_settings(singleton,settings,updated_by,updated_at) values(true,clean,auth.uid(),now()) on conflict(singleton) do update set settings=excluded.settings,updated_by=auth.uid(),updated_at=now(); return clean; end; $$;
grant execute on function public.admin_save_site_typography(jsonb) to authenticated;
