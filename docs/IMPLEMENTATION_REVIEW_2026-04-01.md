# Revision de implementacion 2026-04-01

## Objetivo
Documentar lo aplicado hasta este punto, separar cambios reales de cambios pendientes y dejar claro que aun no se ejecuto el flujo por tandas sugerido por Juan.

## Estado del corte
- Fecha del corte: 2026-04-01
- Estado tecnico: compila y hace build
- Estado de proceso: hubo cambios manuales directos en repo sin seguir todavia la secuencia formal DB + security -> alerts + env -> docs + finalizacion

## Cambios aplicados

### 1. Multiempresa y empresa activa
- Se agrego src/lib/company-membership.ts para resolver membresias, empresa activa y persistencia en localStorage.
- Se reemplazo el patron fragil de limit(1) en vistas principales por resolucion estable de membresia activa.
- Se agrego selector de empresa activa en src/components/dashboard-layout.tsx cuando el usuario pertenece a mas de una empresa.

### 2. Alertas y consistencia de umbrales
- Se centralizo logica compartida en src/lib/alerts.ts.
- upcoming_window_days ahora se usa en dashboard, documentos y mantenimiento para evitar drift entre UI y backend.
- La ruta src/app/api/alerts/email/route.ts aplica filtros y orden unificados para vencimientos, documentos y mantenimiento.

### 3. Alertas externas por email y SMS
- La configuracion de alertas en src/app/alerts/page.tsx ya contempla email, SMS, telefono destino, SMS solo para urgentes, ventana de proximidad, ultimo envio email y ultimo envio SMS.
- El backend de alertas soporta envio con Resend y Twilio.
- Se valido formato E.164 para telefono destino.

### 4. Seguridad y politicas iniciales
- Se agregaron y/o consolidaron cambios de seguridad en supabase/migrations/20260331100000_security_hardening.sql y supabase/migrations/20260401083000_alert_settings_and_company_admin_policies.sql.
- En supabase/schema.sql quedaron reflejadas estas decisiones:
- company_alert_settings con lectura para miembros y escritura restringida a managers
- companies update restringido a managers
- FK compuestas reforzadas para aislar datos por company_id

### 5. Restricciones por rol en UI
- Se agrego bloqueo de creacion desde UI para operator en unidades, documentos, vencimientos, mantenimiento y servicios.
- El bloqueo se propaga desde las paginas a los formularios mediante canEdit.
- Esto mejora UX y reduce intentos fallidos, pero no reemplaza el control real de RLS.

## Archivos clave tocados en esta etapa

### App
- src/app/alerts/page.tsx
- src/app/api/alerts/email/route.ts
- src/app/dashboard/page.tsx
- src/app/documents/page.tsx
- src/app/expirations/page.tsx
- src/app/maintenance/page.tsx
- src/app/services/page.tsx
- src/app/vehicles/page.tsx
- src/app/vehicles/[vehicleId]/page.tsx
- src/app/vehicles/[vehicleId]/report/page.tsx

### Componentes
- src/components/dashboard-layout.tsx
- src/components/vehicle-form.tsx
- src/components/document-form.tsx
- src/components/expiration-form.tsx
- src/components/maintenance-plan-form.tsx
- src/components/service-record-form.tsx

### Librerias y schema
- src/lib/alerts.ts
- src/lib/company-membership.ts
- src/lib/database.types.ts
- supabase/schema.sql

## Verificacion realizada
- npm run typecheck: pasa
- npm run build: pasa
- npm run lint: sigue sin estar operativo como control real porque next lint intenta abrir configuracion interactiva

## Riesgos y pendientes

### 1. Proceso no alineado todavia con las tandas
- Falta ejecutar y revisar formalmente la tanda DB + security como salida separada.
- No conviene mezclar mas cambios hasta cerrar esa revision.

### 2. Seguridad aun parcial
- La UI ya bloquea operator en varios formularios.
- Falta confirmar si las tablas operativas tambien deben quedar con escritura restringida a managers, o si algunas deben seguir abiertas a operadores.
- Ese criterio debe definirse antes de endurecer mas politicas.

### 3. Multiempresa funcional pero basica
- La empresa activa se persiste en cliente.
- Aun no existe un selector o estado de empresa mas formal en backend o perfil de usuario.

### 4. Documentacion general
- README.md y STATUS.md no reflejaban por completo este corte antes de esta nota.

## Recomendacion para seguir
1. Congelar cambios nuevos.
2. Revisar esta nota junto con diff real de DB + security.
3. Decidir si la tanda 1 pasa o no pasa.
4. Solo despues avanzar con alerts + env.
