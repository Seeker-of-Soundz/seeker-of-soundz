-- Run once in Supabase SQL Editor. Requires public.is_admin() from the existing site.
create table if not exists public.sos_bug_reports (
 id bigint generated always as identity primary key,
 subject text not null check (char_length(subject) between 3 and 160),
 page_name text not null check (char_length(page_name) between 1 and 100),
 description text not null check (char_length(description) between 10 and 5000),
 status text not null default 'not_started' check(status in ('not_started','pending','in_progress','finished')),
 hidden boolean not null default false,
 admin_note text not null default '',
 screenshots text[] not null default '{}',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 finished_at timestamptz
);
create index if not exists sos_bug_reports_date_idx on public.sos_bug_reports(created_at desc);
alter table public.sos_bug_reports enable row level security;
drop policy if exists "bug reports public visible" on public.sos_bug_reports;
drop policy if exists "bug reports guest insert" on public.sos_bug_reports;
drop policy if exists "bug reports admin update" on public.sos_bug_reports;
drop policy if exists "bug reports admin delete" on public.sos_bug_reports;
create policy "bug reports public visible" on public.sos_bug_reports for select to anon,authenticated using (not hidden or public.is_admin());
create policy "bug reports guest insert" on public.sos_bug_reports for insert to anon,authenticated with check (status='not_started' and not hidden and admin_note='' and finished_at is null );
create policy "bug reports admin update" on public.sos_bug_reports for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "bug reports admin delete" on public.sos_bug_reports for delete to authenticated using (public.is_admin());
grant select,insert on public.sos_bug_reports to anon,authenticated;
grant update,delete on public.sos_bug_reports to authenticated;
-- The guest identity is a sequential public ticket number: #guest1, #guest2, ...
-- No fake Auth accounts are created; this avoids requiring email/password for guest reports.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('sos-bug-screenshots','sos-bug-screenshots',true,5242880,array['image/png','image/jpeg','image/webp'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "bug screenshots public view" on storage.objects;
drop policy if exists "bug screenshots guest upload" on storage.objects;
create policy "bug screenshots public view" on storage.objects for select to anon,authenticated using(bucket_id='sos-bug-screenshots');
create policy "bug screenshots guest upload" on storage.objects for insert to anon,authenticated with check(bucket_id='sos-bug-screenshots' and (storage.foldername(name))[1]='reports');
