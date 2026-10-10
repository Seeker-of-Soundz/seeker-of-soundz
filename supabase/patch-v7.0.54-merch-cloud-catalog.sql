-- Run after v7.0.48. Safe to re-run; preserves existing rows.
create table if not exists public.sos_merch_products (id text primary key, product jsonb not null, updated_at timestamptz not null default now(), updated_by uuid);
alter table public.sos_merch_products enable row level security;
drop policy if exists "SOS merch public read" on public.sos_merch_products;
drop policy if exists "SOS merch admin insert" on public.sos_merch_products;
drop policy if exists "SOS merch admin update" on public.sos_merch_products;
drop policy if exists "SOS merch admin delete" on public.sos_merch_products;
create policy "SOS merch public read" on public.sos_merch_products for select to anon,authenticated using(true);
create policy "SOS merch admin insert" on public.sos_merch_products for insert to authenticated with check(public.sos_can_edit_site_content());
create policy "SOS merch admin update" on public.sos_merch_products for update to authenticated using(public.sos_can_edit_site_content()) with check(public.sos_can_edit_site_content());
create policy "SOS merch admin delete" on public.sos_merch_products for delete to authenticated using(public.sos_can_edit_site_content());
grant select on public.sos_merch_products to anon,authenticated;
grant insert,update,delete on public.sos_merch_products to authenticated;
