create table if not exists public.company_alert_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  email_enabled boolean not null default false,
  recipient_email text,
  include_overdue boolean not null default true,
  include_upcoming boolean not null default true,
  upcoming_window_days integer not null default 15,
  last_sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint company_alert_settings_window_check check (upcoming_window_days between 1 and 30)
);

create index if not exists idx_company_alert_settings_email_enabled
on public.company_alert_settings(email_enabled);

drop trigger if exists company_alert_settings_set_updated_at on public.company_alert_settings;
create trigger company_alert_settings_set_updated_at
before update on public.company_alert_settings
for each row execute function public.set_updated_at();

alter table public.company_alert_settings enable row level security;

drop policy if exists "company_alert_settings_all_member_company" on public.company_alert_settings;
create policy "company_alert_settings_all_member_company"
on public.company_alert_settings
for all
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));
