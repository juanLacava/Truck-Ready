alter table public.vehicles
  drop constraint if exists vehicles_company_id_id_unique;

alter table public.vehicles
  add constraint vehicles_company_id_id_unique unique (company_id, id);

alter table public.vehicle_documents
  drop constraint if exists vehicle_documents_company_vehicle_fk;

alter table public.vehicle_documents
  add constraint vehicle_documents_company_vehicle_fk
  foreign key (company_id, vehicle_id)
  references public.vehicles(company_id, id)
  on delete cascade;

alter table public.expiration_items
  drop constraint if exists expiration_items_company_vehicle_fk;

alter table public.expiration_items
  add constraint expiration_items_company_vehicle_fk
  foreign key (company_id, vehicle_id)
  references public.vehicles(company_id, id)
  on delete cascade;

alter table public.maintenance_plans
  drop constraint if exists maintenance_plans_company_vehicle_fk;

alter table public.maintenance_plans
  add constraint maintenance_plans_company_vehicle_fk
  foreign key (company_id, vehicle_id)
  references public.vehicles(company_id, id)
  on delete cascade;

alter table public.service_records
  drop constraint if exists service_records_company_vehicle_fk;

alter table public.service_records
  add constraint service_records_company_vehicle_fk
  foreign key (company_id, vehicle_id)
  references public.vehicles(company_id, id)
  on delete cascade;

create or replace function public.is_company_manager(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.profile_id = auth.uid()
      and cm.role in ('owner', 'admin')
  );
$$;

create or replace function public.create_company_with_owner(
  company_name text,
  company_country text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.companies (name, country, created_by)
  values (trim(company_name), nullif(trim(coalesce(company_country, '')), ''), current_user_id)
  returning id into new_company_id;

  insert into public.company_members (company_id, profile_id, role)
  values (new_company_id, current_user_id, 'owner');

  return new_company_id;
end;
$$;

drop policy if exists "company_members_insert_own_membership" on public.company_members;
drop policy if exists "company_members_insert_manager_company" on public.company_members;
drop policy if exists "company_members_update_manager_company" on public.company_members;
drop policy if exists "company_members_delete_manager_company" on public.company_members;

create policy "company_members_insert_manager_company"
on public.company_members
for insert
with check (
  public.is_company_manager(company_id)
  and (
    role <> 'owner'
    or exists (
      select 1
      from public.company_members cm
      where cm.company_id = company_members.company_id
        and cm.profile_id = auth.uid()
        and cm.role = 'owner'
    )
  )
);

create policy "company_members_update_manager_company"
on public.company_members
for update
using (
  public.is_company_manager(company_id)
  and (
    role <> 'owner'
    or exists (
      select 1
      from public.company_members cm
      where cm.company_id = company_members.company_id
        and cm.profile_id = auth.uid()
        and cm.role = 'owner'
    )
  )
)
with check (
  public.is_company_manager(company_id)
  and (
    role <> 'owner'
    or exists (
      select 1
      from public.company_members cm
      where cm.company_id = company_members.company_id
        and cm.profile_id = auth.uid()
        and cm.role = 'owner'
    )
  )
);

create policy "company_members_delete_manager_company"
on public.company_members
for delete
using (
  public.is_company_manager(company_id)
  and (
    role <> 'owner'
    or exists (
      select 1
      from public.company_members cm
      where cm.company_id = company_members.company_id
        and cm.profile_id = auth.uid()
        and cm.role = 'owner'
    )
  )
);
