create table if not exists public.site_payment_settings (
  id integer primary key default 1 check (id = 1),
  stripe_enabled boolean not null default false,
  paypal_enabled boolean not null default false,
  preferred_provider text not null default 'stripe' check (preferred_provider in ('stripe','paypal')),
  mode text not null default 'test' check (mode in ('test','live')),
  stripe_publishable_key text not null default '',
  paypal_client_id text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.site_payment_settings enable row level security;
-- Admin writes are performed by authenticated site admins. Existing role enforcement remains in the Admin Hub.
drop policy if exists "authenticated can read payment settings" on public.site_payment_settings;
create policy "authenticated can read payment settings" on public.site_payment_settings for select to authenticated using (true);
drop policy if exists "authenticated can write payment settings" on public.site_payment_settings;
create policy "authenticated can write payment settings" on public.site_payment_settings for all to authenticated using (true) with check (true);
insert into public.site_payment_settings(id) values (1) on conflict (id) do nothing;
