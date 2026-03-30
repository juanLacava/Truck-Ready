create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.founder_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  fleet_size integer,
  primary_concern text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint company_members_role_check check (role in ('owner', 'admin', 'operator')),
  constraint company_members_company_profile_unique unique (company_id, profile_id)
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  internal_code text,
  plate text not null,
  brand text,
  model text,
  year integer,
  current_odometer integer not null default 0,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint vehicles_status_check check (status in ('active', 'maintenance', 'inactive'))
);

create table if not exists public.expiration_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  type text not null,
  title text not null,
  due_date date not null,
  alert_days_before integer not null default 15,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint expiration_items_status_check check (status in ('active', 'completed', 'archived'))
);

create table if not exists public.maintenance_plans (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  title text not null,
  trigger_type text not null,
  interval_days integer,
  interval_km integer,
  last_service_date date,
  last_service_odometer integer,
  next_due_date date,
  next_due_odometer integer,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint maintenance_plans_trigger_type_check check (trigger_type in ('date', 'odometer')),
  constraint maintenance_plans_status_check check (status in ('active', 'paused', 'archived')),
  constraint maintenance_plans_interval_check check (
    (trigger_type = 'date' and interval_days is not null and interval_days > 0)
    or
    (trigger_type = 'odometer' and interval_km is not null and interval_km > 0)
  )
);

create table if not exists public.service_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  maintenance_plan_id uuid references public.maintenance_plans(id) on delete set null,
  service_date date not null,
  odometer integer,
  service_type text not null,
  cost numeric(12,2),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_company_members_profile_id on public.company_members(profile_id);
create index if not exists idx_vehicles_company_id on public.vehicles(company_id);
create index if not exists idx_expiration_items_company_id on public.expiration_items(company_id);
create index if not exists idx_expiration_items_vehicle_id on public.expiration_items(vehicle_id);
create index if not exists idx_expiration_items_due_date on public.expiration_items(due_date);
create index if not exists idx_maintenance_plans_company_id on public.maintenance_plans(company_id);
create index if not exists idx_maintenance_plans_vehicle_id on public.maintenance_plans(vehicle_id);
create index if not exists idx_service_records_company_id on public.service_records(company_id);
create index if not exists idx_service_records_vehicle_id on public.service_records(vehicle_id);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists founder_leads_set_updated_at on public.founder_leads;
create trigger founder_leads_set_updated_at
before update on public.founder_leads
for each row execute function public.set_updated_at();

drop trigger if exists company_members_set_updated_at on public.company_members;
create trigger company_members_set_updated_at
before update on public.company_members
for each row execute function public.set_updated_at();

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists expiration_items_set_updated_at on public.expiration_items;
create trigger expiration_items_set_updated_at
before update on public.expiration_items
for each row execute function public.set_updated_at();

drop trigger if exists maintenance_plans_set_updated_at on public.maintenance_plans;
create trigger maintenance_plans_set_updated_at
before update on public.maintenance_plans
for each row execute function public.set_updated_at();

drop trigger if exists service_records_set_updated_at on public.service_records;
create trigger service_records_set_updated_at
before update on public.service_records
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.founder_leads enable row level security;
alter table public.company_members enable row level security;
alter table public.vehicles enable row level security;
alter table public.expiration_items enable row level security;
alter table public.maintenance_plans enable row level security;
alter table public.service_records enable row level security;

create or replace function public.is_company_member(target_company_id uuid)
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
  );
$$;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid());

drop policy if exists "founder_leads_insert_public" on public.founder_leads;
create policy "founder_leads_insert_public"
on public.founder_leads
for insert
with check (true);

drop policy if exists "company_members_select_member_company" on public.company_members;
create policy "company_members_select_member_company"
on public.company_members
for select
using (public.is_company_member(company_id));

drop policy if exists "company_members_insert_own_membership" on public.company_members;
create policy "company_members_insert_own_membership"
on public.company_members
for insert
with check (profile_id = auth.uid());

drop policy if exists "companies_select_member_company" on public.companies;
create policy "companies_select_member_company"
on public.companies
for select
using (public.is_company_member(id) or created_by = auth.uid());

drop policy if exists "companies_insert_authenticated" on public.companies;
create policy "companies_insert_authenticated"
on public.companies
for insert
with check (auth.uid() is not null and created_by = auth.uid());

drop policy if exists "companies_update_member_company" on public.companies;
create policy "companies_update_member_company"
on public.companies
for update
using (public.is_company_member(id))
with check (public.is_company_member(id));

drop policy if exists "vehicles_all_member_company" on public.vehicles;
create policy "vehicles_all_member_company"
on public.vehicles
for all
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));

drop policy if exists "expiration_items_all_member_company" on public.expiration_items;
create policy "expiration_items_all_member_company"
on public.expiration_items
for all
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));

drop policy if exists "maintenance_plans_all_member_company" on public.maintenance_plans;
create policy "maintenance_plans_all_member_company"
on public.maintenance_plans
for all
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));

drop policy if exists "service_records_all_member_company" on public.service_records;
create policy "service_records_all_member_company"
on public.service_records
for all
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));
