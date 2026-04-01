# Predeploy Checklist

Estado objetivo: `deploy limpio`, sin drift conocido entre base de datos, app y entorno.

## Orden recomendado
1. DB + security
2. Alerts + env
3. Multiempresa + permisos
4. Smoke test manual
5. Cierre y deploy

## 1. DB + security
Objetivo: confirmar que `supabase/schema.sql` y las migraciones dejan la misma base final, sin drift ni politicas inconsistentes.

- [ ] Listar las migraciones reales aplicadas y compararlas contra [`supabase/schema.sql`](/tmp/truckready/supabase/schema.sql).
- [ ] Verificar que existan y coincidan estas migraciones clave:
  - `20260330153000_founder_leads.sql`
  - `20260330174000_company_alert_settings.sql`
  - `20260331100000_security_hardening.sql`
  - `20260331163000_company_alert_settings_sms.sql`
  - `20260401083000_alert_settings_and_company_admin_policies.sql`
- [ ] Confirmar que `company_alert_settings` tenga columnas y defaults esperados:
  - `email_enabled`
  - `recipient_email`
  - `sms_enabled`
  - `recipient_phone`
  - `sms_only_urgent`
  - `include_overdue`
  - `include_upcoming`
  - `upcoming_window_days`
  - `last_sent_at`
  - `last_sms_sent_at`
- [ ] Confirmar que `companies` y `company_alert_settings` solo permitan `update` a `owner/admin`.
- [ ] Revisar politicas RLS de tablas operativas y decidir si `operator` puede escribir o solo leer:
  - `vehicles`
  - `vehicle_documents`
  - `expiration_items`
  - `maintenance_plans`
  - `service_records`
- [ ] Validar que `company_members` no permita elevacion lateral de privilegios entre empresas.
- [ ] Ejecutar una prueba real en Supabase con usuarios de roles distintos y anotar resultado por tabla.

Pasa si:
- no hay drift relevante entre migraciones y schema final
- las politicas reflejan el modelo de permisos esperado
- no existe escalada de privilegios entre roles o empresas

## 2. Alerts + env
Objetivo: dejar alertas por email/SMS listas para ambiente real o explicitamente desactivadas de forma segura.

- [ ] Confirmar variables requeridas en entorno local y deploy:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ALERTS_CRON_SECRET`
  - `RESEND_API_KEY`
  - `ALERTS_FROM_EMAIL`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER`
- [ ] Verificar que no queden secretos en archivos no ignorados como `truck`.
- [ ] Confirmar que [`src/app/api/alerts/email/route.ts`](/tmp/truckready/src/app/api/alerts/email/route.ts) falla de forma segura si faltan credenciales.
- [ ] Probar envio real de email con una empresa de test.
- [ ] Probar envio real de SMS con una empresa de test si SMS queda habilitado para deploy.
- [ ] Confirmar que `upcoming_window_days` impacta igual en dashboard, documentos, mantenimiento y envio externo.
- [ ] Verificar que `sms_only_urgent` realmente filtre proximos y deje solo vencidos/urgentes.
- [ ] Definir decision de lanzamiento:
  - email activo o no
  - SMS activo o no
  - cron activo o no

Pasa si:
- el entorno esta completo y consistente
- las rutas fallan en modo seguro sin secretos
- hubo al menos un envio real exitoso por cada canal habilitado

## 3. Multiempresa + permisos
Objetivo: asegurar que la empresa activa, la vista de datos y la capacidad de editar sean coherentes para cada rol.

- [ ] Verificar selector y persistencia de empresa activa en [`src/lib/company-membership.ts`](/tmp/truckready/src/lib/company-membership.ts) y [`src/components/dashboard-layout.tsx`](/tmp/truckready/src/components/dashboard-layout.tsx).
- [ ] Probar un usuario con 2 empresas y confirmar que no cambia de contexto al recargar.
- [ ] Probar un `owner/admin` con capacidad de edicion en:
  - dashboard/alerts
  - vehicles
  - documents
  - expirations
  - maintenance
  - services
- [ ] Probar un `operator` y confirmar que la UI bloquea alta/edicion donde corresponde.
- [ ] Verificar que el bloqueo de UI coincide con RLS real en base.
- [ ] Revisar vistas por unidad y reportes para confirmar que usan la empresa activa correcta.

Pasa si:
- la empresa activa es estable
- no hay mezcla de datos entre empresas
- UI y RLS responden igual al mismo modelo de permisos

## 4. Smoke test manual
Objetivo: hacer una corrida end-to-end corta, realista y repetible.

### Flujo recomendado
- [ ] Login con usuario `owner/admin`.
- [ ] Crear o editar una unidad.
- [ ] Cargar un documento con vencimiento proximo.
- [ ] Crear un vencimiento manual.
- [ ] Crear un plan de mantenimiento por fecha y otro por odometro.
- [ ] Registrar un servicio y confirmar recalculo del plan.
- [ ] Revisar dashboard, documents, maintenance y alerts para validar estados.
- [ ] Abrir reporte PDF por unidad y validar que renderiza.
- [ ] Probar landing y envio del formulario `founder_leads`.
- [ ] Repetir acceso con usuario `operator` y confirmar restricciones.

### Evidencia minima a guardar
- [ ] 4 capturas: dashboard, alerts, vehicles, report PDF.
- [ ] 1 registro de envio de lead.
- [ ] 1 registro de email/SMS de alerta si quedan activos.
- [ ] 1 nota corta con bugs detectados y severidad.

Pasa si:
- los flujos principales funcionan sin errores bloqueantes
- no aparecen datos cruzados ni permisos incorrectos
- los estados de alerta coinciden con lo esperado

## 5. Cierre y deploy
Objetivo: salir a deploy con repo, docs y entorno alineados.

- [ ] Ejecutar `npm run typecheck`.
- [ ] Ejecutar `npm run build`.
- [ ] Dejar `README.md`, `STATUS.md` y [`docs/BACKLOG.md`](/tmp/truckready/docs/BACKLOG.md) sincronizados con el estado real.
- [ ] Documentar que queda fuera del deploy inicial:
  - Inspection Mode mobile
  - onboarding de choferes
  - PDF pro final
  - iconografia heavy stroke propia
- [ ] Confirmar dominio, proyecto de deploy y variables configuradas en el proveedor.
- [ ] Hacer deploy a preview.
- [ ] Repetir smoke test minimo en preview.
- [ ] Recién entonces promover a produccion.

## Criterio final
No marcar como `listo para deploy limpio` hasta que estos 4 puntos sean verdaderos al mismo tiempo:

- base de datos sin drift material
- secretos y alertas verificados en entorno real
- permisos multiempresa consistentes entre UI y RLS
- smoke test manual completo sin bugs bloqueantes
