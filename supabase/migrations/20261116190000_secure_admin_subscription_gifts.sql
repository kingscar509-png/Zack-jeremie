-- Secure, auditable administrator-granted business subscriptions.
create table if not exists public.subscription_grants (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  subscription_id uuid not null references public.business_subscriptions(id) on delete cascade,
  granted_by uuid not null references auth.users(id) on delete restrict,
  days integer not null check (days between 1 and 365),
  reason text not null check (char_length(btrim(reason)) between 3 and 500),
  created_at timestamptz not null default now()
);
alter table public.subscription_grants enable row level security;
drop policy if exists "Admins and business managers can read subscription grants" on public.subscription_grants;
create policy "Admins and business managers can read subscription grants"
on public.subscription_grants for select to authenticated
using (
  exists (select 1 from public.admin_roles ar where ar.user_id = (select auth.uid()) and ar.role = 'main_admin')
  or public.is_business_manager(business_id)
);
create or replace function public.admin_grant_subscription(p_business uuid,p_plan uuid,p_days integer,p_reason text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_plan public.subscription_plans;
  v_subscription uuid;
  v_grant uuid;
begin
  if v_uid is null or not exists (select 1 from public.admin_roles ar where ar.user_id=v_uid and ar.role='main_admin') then
    raise exception 'Only the principal Zack administrator can grant subscriptions' using errcode='42501';
  end if;
  if p_days is null or p_days not between 1 and 365 then raise exception 'Grant duration must be between 1 and 365 days' using errcode='22023'; end if;
  if p_reason is null or char_length(btrim(p_reason)) not between 3 and 500 then raise exception 'A reason between 3 and 500 characters is required' using errcode='22023'; end if;
  perform 1 from public.businesses b where b.id=p_business for update;
  if not found then raise exception 'Business not found' using errcode='22023'; end if;
  select * into v_plan from public.subscription_plans where id=p_plan;
  if v_plan.id is null or v_plan.code='gratuit' then raise exception 'A paid subscription plan must be selected' using errcode='22023'; end if;
  update public.business_subscriptions set status='expired',ends_at=least(coalesce(ends_at,now()),now()) where business_id=p_business and status='active';
  update public.business_subscriptions set status='cancelled' where business_id=p_business and status='queued';
  insert into public.business_subscriptions(business_id,plan_id,status,starts_at,ends_at,created_by,plan_snapshot)
  values(p_business,p_plan,'active',now(),now()+make_interval(days=>p_days),v_uid,to_jsonb(v_plan))
  returning id into v_subscription;
  insert into public.subscription_grants(business_id,plan_id,subscription_id,granted_by,days,reason)
  values(p_business,p_plan,v_subscription,v_uid,p_days,btrim(p_reason))
  returning id into v_grant;
  return v_grant;
end;
$$;
revoke all on function public.admin_grant_subscription(uuid,uuid,integer,text) from public,anon;
grant execute on function public.admin_grant_subscription(uuid,uuid,integer,text) to authenticated;
