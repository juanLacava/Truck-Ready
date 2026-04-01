drop policy if exists "company_alert_settings_all_member_company" on public.company_alert_settings;
drop policy if exists "company_alert_settings_select_member_company" on public.company_alert_settings;
create policy "company_alert_settings_select_member_company"
on public.company_alert_settings
for select
using (public.is_company_member(company_id));

drop policy if exists "company_alert_settings_write_manager_company" on public.company_alert_settings;
create policy "company_alert_settings_write_manager_company"
on public.company_alert_settings
for insert
with check (public.is_company_manager(company_id));

drop policy if exists "company_alert_settings_update_manager_company" on public.company_alert_settings;
create policy "company_alert_settings_update_manager_company"
on public.company_alert_settings
for update
using (public.is_company_manager(company_id))
with check (public.is_company_manager(company_id));

drop policy if exists "company_alert_settings_delete_manager_company" on public.company_alert_settings;
create policy "company_alert_settings_delete_manager_company"
on public.company_alert_settings
for delete
using (public.is_company_manager(company_id));

drop policy if exists "companies_update_member_company" on public.companies;
drop policy if exists "companies_update_manager_company" on public.companies;
create policy "companies_update_manager_company"
on public.companies
for update
using (public.is_company_manager(id))
with check (public.is_company_manager(id));
