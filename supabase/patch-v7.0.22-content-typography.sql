-- Seeker Of SoundZ v7.0.22: per-content typography controls
alter table public.site_content_overrides
  add column if not exists style_json jsonb not null default '{}'::jsonb;
