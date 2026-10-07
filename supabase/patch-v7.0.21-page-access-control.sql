-- Seeker Of SoundZ v7.0.21 — centralized page visibility/access rules
create table if not exists public.site_page_access (
  page_slug text primary key,
  access_mode text not null default 'public' check (access_mode in ('public','members','vip','collaboration','admin','hidden')),
  updated_at timestamptz not null default now(),
  updated_by uuid null
);
alter table public.site_page_access enable row level security;
drop policy if exists "public can read page access" on public.site_page_access;
create policy "public can read page access" on public.site_page_access for select using (true);
drop policy if exists "authenticated can manage page access" on public.site_page_access;
create policy "authenticated can manage page access" on public.site_page_access for all to authenticated using (true) with check (true);
grant select on public.site_page_access to anon, authenticated;
grant insert, update, delete on public.site_page_access to authenticated;
