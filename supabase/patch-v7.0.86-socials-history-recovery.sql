-- Seeker Of SoundZ 7.0.86 — run in the SAME Supabase project used by the deployed site.
-- Non-destructive: does not delete or overwrite any existing social links.
-- Install patch-v4.19.7-socials-manager.sql first if the original table/functions are missing.
create table if not exists public.site_social_link_history (
 id bigint generated always as identity primary key,
 platform_key text not null,
 action text not null,
 previous jsonb,
 current jsonb,
 changed_by uuid,
 changed_at timestamptz not null default now()
);
alter table public.site_social_link_history enable row level security;
revoke all on public.site_social_link_history from anon, authenticated;
-- Take a baseline snapshot of each current row once (rerunning does not duplicate baselines).
insert into public.site_social_link_history(platform_key,action,current)
select s.platform_key,'baseline',to_jsonb(s) from public.site_social_links s
where not exists(select 1 from public.site_social_link_history h where h.platform_key=s.platform_key and h.action='baseline');
create or replace function public.sos_social_audit_trigger() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_op='INSERT' then
  insert into public.site_social_link_history(platform_key,action,current,changed_by) values(new.platform_key,'created',to_jsonb(new),auth.uid());return new;
 elsif tg_op='UPDATE' then
  insert into public.site_social_link_history(platform_key,action,previous,current,changed_by) values(new.platform_key,'updated',to_jsonb(old),to_jsonb(new),auth.uid());return new;
 else
  insert into public.site_social_link_history(platform_key,action,previous,changed_by) values(old.platform_key,'deleted',to_jsonb(old),auth.uid());return old;
 end if;
end $$;
drop trigger if exists sos_social_history_changes on public.site_social_links;
create trigger sos_social_history_changes after insert or update or delete on public.site_social_links for each row execute function public.sos_social_audit_trigger();
create or replace function public.admin_social_link_history() returns jsonb language sql stable security definer set search_path=public as $$
 select case when public.is_admin(auth.uid()) then coalesce((select jsonb_agg(jsonb_build_object('id',id,'platform_key',platform_key,'action',action,'previous',previous,'current',current,'changed_at',changed_at) order by changed_at desc,id desc) from (select * from public.site_social_link_history order by id desc limit 250) h),'[]'::jsonb) else '[]'::jsonb end;
$$;
revoke all on function public.admin_social_link_history() from public;
grant execute on function public.admin_social_link_history() to authenticated;
create or replace function public.admin_restore_site_social_link(p_history_id bigint) returns boolean language plpgsql security definer set search_path=public as $$
declare h public.site_social_link_history; snap jsonb;
begin
 if not public.is_admin(auth.uid()) then raise exception 'Administrator access required';end if;
 select * into h from public.site_social_link_history where id=p_history_id;
 if not found then raise exception 'History record not found';end if;
 snap:=coalesce(h.previous,h.current);
 if snap is null then raise exception 'No restorable snapshot';end if;
 insert into public.site_social_links(platform_key,platform_name,category_label,description,icon,profile_url,sort_order,is_featured,is_visible,updated_by,updated_at)
 values(snap->>'platform_key',snap->>'platform_name',coalesce(snap->>'category_label','Connect'),coalesce(snap->>'description',''),coalesce(snap->>'icon','↗'),coalesce(snap->>'profile_url',''),coalesce((snap->>'sort_order')::integer,0),coalesce((snap->>'is_featured')::boolean,false),coalesce((snap->>'is_visible')::boolean,true),auth.uid(),now())
 on conflict(platform_key) do update set platform_name=excluded.platform_name,category_label=excluded.category_label,description=excluded.description,icon=excluded.icon,profile_url=excluded.profile_url,sort_order=excluded.sort_order,is_featured=excluded.is_featured,is_visible=excluded.is_visible,updated_by=auth.uid(),updated_at=now();
 return true;
end $$;
revoke all on function public.admin_restore_site_social_link(bigint) from public;
grant execute on function public.admin_restore_site_social_link(bigint) to authenticated;
-- Diagnostic query (run manually):
-- select platform_key,platform_name,profile_url,is_visible,updated_at from public.site_social_links order by sort_order;
-- select platform_key,action,changed_at,previous->>'profile_url' as old_url,current->>'profile_url' as new_url from public.site_social_link_history order by id desc limit 100;
