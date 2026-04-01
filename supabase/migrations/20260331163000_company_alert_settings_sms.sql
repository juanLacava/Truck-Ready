alter table public.company_alert_settings
  add column if not exists sms_enabled boolean not null default false,
  add column if not exists recipient_phone text,
  add column if not exists sms_only_urgent boolean not null default true,
  add column if not exists last_sms_sent_at timestamptz;
