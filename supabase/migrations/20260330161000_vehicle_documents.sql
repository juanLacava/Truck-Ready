create table if not exists public.vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  title text not null,
  document_type text not null default 'custom',
  language text not null default 'bilingual',
  file_url text,
  expires_at date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint vehicle_documents_language_check check (language in ('es', 'en', 'bilingual')),
  constraint vehicle_documents_status_check check (status in ('active', 'archived'))
);

create index if not exists idx_vehicle_documents_company_id on public.vehicle_documents(company_id);
create index if not exists idx_vehicle_documents_vehicle_id on public.vehicle_documents(vehicle_id);
create index if not exists idx_vehicle_documents_expires_at on public.vehicle_documents(expires_at);

drop trigger if exists vehicle_documents_set_updated_at on public.vehicle_documents;
create trigger vehicle_documents_set_updated_at
before update on public.vehicle_documents
for each row execute function public.set_updated_at();

alter table public.vehicle_documents enable row level security;

drop policy if exists "vehicle_documents_all_member_company" on public.vehicle_documents;
create policy "vehicle_documents_all_member_company"
on public.vehicle_documents
for all
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));
