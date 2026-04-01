# Predeploy Status 2026-04-01

## Estado general
Truck Ready quedo en estado `MVP avanzado / predeploy serio`.
Compila, build ea y ya tiene una base funcional fuerte, pero todavia no debe marcarse como `deploy limpio`.

## Tandas revisadas

### 1. DB + security
Estado: `pasa con observaciones`

Que quedo resuelto:
- Se aplicaron migraciones pendientes al proyecto remoto con `supabase db push`.
- `company_alert_settings` y `companies` quedaron con escritura restringida a `owner/admin`.
- Las tablas operativas quedaron alineadas a un modelo de lectura para miembros y escritura para managers.
- `supabase/schema.sql` quedo corregido y alineado con la nueva migracion `20260401113000_operational_tables_manager_write.sql`.

Observaciones:
- Falta verificacion final de `pg_policies` en remoto para cerrar la comprobacion con evidencia explicita.
- Se expuso un `SUPABASE_ACCESS_TOKEN` durante la prueba y debe rotarse.

### 2. Alerts + env
Estado: `pasa con observaciones`

Que quedo resuelto:
- `.env.example` ya incluye el contrato completo para email y SMS.
- El endpoint `src/app/api/alerts/email/route.ts` ahora falla con respuesta JSON controlada si faltan credenciales base de Supabase.
- `upcoming_window_days` quedo alineado entre dashboard, documentos, mantenimiento y envio externo.
- `sms_only_urgent` filtra solo alertas vencidas/urgentes en SMS.

Observaciones:
- Falta dry run real con secreto valido.
- Falta al menos un envio real por cada canal habilitado para deploy.
- Debe definirse si SMS entra o no al primer despliegue.

### 3. Multiempresa + permisos
Estado: `pasa con observaciones`

Que quedo resuelto:
- Empresa activa centralizada en `src/lib/company-membership.ts`.
- Selector de empresa activa agregado al layout.
- Las pantallas principales ya cargan por membresia activa en vez de usar seleccion arbitraria.
- La UI bloquea escritura para `operator` y RLS fue endurecido para acompañar esa decision.

Observaciones:
- Falta prueba manual real con usuario perteneciente a dos empresas.
- Falta verificar en navegacion real que no queden residuos visuales al cambiar empresa con paginas ya abiertas.

## Donde estamos
Se completo la parte estructural y de seguridad suficiente para seguir a validacion funcional.
El proyecto ya no necesita expansion inmediata de features; necesita cierre, orden y prueba manual.

## Que sigue

### 4. Smoke test manual
Ejecutar una corrida corta end-to-end con evidencia minima:
- login owner/admin
- alta o edicion de unidad
- carga de documento
- carga de vencimiento
- plan de mantenimiento por fecha y odometro
- registro de servicio
- revision de dashboard, alerts, documents y maintenance
- apertura de reporte PDF
- prueba de landing + founder lead
- repetir con usuario `operator`

### 5. Cierre y deploy
Despues del smoke test:
- correr `npm run typecheck`
- correr `npm run build`
- sincronizar `README.md`, `STATUS.md` y `docs/BACKLOG.md`
- definir que queda fuera del deploy inicial
- configurar variables en el proveedor
- hacer deploy a preview
- repetir smoke test minimo en preview
- recien entonces promover a produccion

## Decision actual
No marcar como listo para deploy limpio todavia.
La recomendacion correcta es avanzar ahora con `4. Smoke test manual` y usar esa salida para decidir el cierre final.
