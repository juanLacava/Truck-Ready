drop policy if exists "vehicles_all_member_company" on public.vehicles;
drop policy if exists "vehicles_select_member_company" on public.vehicles;
create policy "vehicles_select_member_company"
on public.vehicles
for select
using (public.is_company_member(company_id));

drop policy if exists "vehicles_insert_manager_company" on public.vehicles;
create policy "vehicles_insert_manager_company"
on public.vehicles
for insert
with check (public.is_company_manager(company_id));

drop policy if exists "vehicles_update_manager_company" on public.vehicles;
create policy "vehicles_update_manager_company"
on public.vehicles
for update
using (public.is_company_manager(company_id))
with check (public.is_company_manager(company_id));

drop policy if exists "vehicles_delete_manager_company" on public.vehicles;
create policy "vehicles_delete_manager_company"
on public.vehicles
for delete
using (public.is_company_manager(company_id));

drop policy if exists "vehicle_documents_all_member_company" on public.vehicle_documents;
drop policy if exists "vehicle_documents_select_member_company" on public.vehicle_documents;
create policy "vehicle_documents_select_member_company"
on public.vehicle_documents
for select
using (public.is_company_member(company_id));

drop policy if exists "vehicle_documents_insert_manager_company" on public.vehicle_documents;
create policy "vehicle_documents_insert_manager_company"
on public.vehicle_documents
for insert
with check (public.is_company_manager(company_id));

drop policy if exists "vehicle_documents_update_manager_company" on public.vehicle_documents;
create policy "vehicle_documents_update_manager_company"
on public.vehicle_documents
for update
using (public.is_company_manager(company_id))
with check (public.is_company_manager(company_id));

drop policy if exists "vehicle_documents_delete_manager_company" on public.vehicle_documents;
create policy "vehicle_documents_delete_manager_company"
on public.vehicle_documents
for delete
using (public.is_company_manager(company_id));

drop policy if exists "expiration_items_all_member_company" on public.expiration_items;
drop policy if exists "expiration_items_select_member_company" on public.expiration_items;
create policy "expiration_items_select_member_company"
on public.expiration_items
for select
using (public.is_company_member(company_id));

drop policy if exists "expiration_items_insert_manager_company" on public.expiration_items;
create policy "expiration_items_insert_manager_company"
on public.expiration_items
for insert
with check (public.is_company_manager(company_id));

drop policy if exists "expiration_items_update_manager_company" on public.expiration_items;
create policy "expiration_items_update_manager_company"
on public.expiration_items
for update
using (public.is_company_manager(company_id))
with check (public.is_company_manager(company_id));

drop policy if exists "expiration_items_delete_manager_company" on public.expiration_items;
create policy "expiration_items_delete_manager_company"
on public.expiration_items
for delete
using (public.is_company_manager(company_id));

drop policy if exists "maintenance_plans_all_member_company" on public.maintenance_plans;
drop policy if exists "maintenance_plans_select_member_company" on public.maintenance_plans;
create policy "maintenance_plans_select_member_company"
on public.maintenance_plans
for select
using (public.is_company_member(company_id));

drop policy if exists "maintenance_plans_insert_manager_company" on public.maintenance_plans;
create policy "maintenance_plans_insert_manager_company"
on public.maintenance_plans
for insert
with check (public.is_company_manager(company_id));

drop policy if exists "maintenance_plans_update_manager_company" on public.maintenance_plans;
create policy "maintenance_plans_update_manager_company"
on public.maintenance_plans
for update
using (public.is_company_manager(company_id))
with check (public.is_company_manager(company_id));

drop policy if exists "maintenance_plans_delete_manager_company" on public.maintenance_plans;
create policy "maintenance_plans_delete_manager_company"
on public.maintenance_plans
for delete
using (public.is_company_manager(company_id));

drop policy if exists "service_records_all_member_company" on public.service_records;
drop policy if exists "service_records_select_member_company" on public.service_records;
create policy "service_records_select_member_company"
on public.service_records
for select
using (public.is_company_member(company_id));

drop policy if exists "service_records_insert_manager_company" on public.service_records;
create policy "service_records_insert_manager_company"
on public.service_records
for insert
with check (public.is_company_manager(company_id));

drop policy if exists "service_records_update_manager_company" on public.service_records;
create policy "service_records_update_manager_company"
on public.service_records
for update
using (public.is_company_manager(company_id))
with check (public.is_company_manager(company_id));

drop policy if exists "service_records_delete_manager_company" on public.service_records;
create policy "service_records_delete_manager_company"
on public.service_records
for delete
using (public.is_company_manager(company_id));
