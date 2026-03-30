create table if not exists public.founder_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  fleet_size integer,
  primary_concern text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists founder_leads_set_updated_at on public.founder_leads;
create trigger founder_leads_set_updated_at
before update on public.founder_leads
for each row execute function public.set_updated_at();

alter table public.founder_leads enable row level security;

drop policy if exists "founder_leads_insert_public" on public.founder_leads;
create policy "founder_leads_insert_public"
on public.founder_leads
for insert
with check (true);
