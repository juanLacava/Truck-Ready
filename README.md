# Truck Ready

Truck Ready es un micro-SaaS para control de mantenimiento preventivo y vencimientos, orientado a transportistas y pequenas flotas en Estados Unidos.

## Estado actual
- Definicion de producto cerrada para la V1
- Arquitectura inicial documentada
- Esquema SQL inicial listo para Supabase
- Estructura base de proyecto creada
- Dependencias pendientes de instalar

## Documentacion
- Estado del proyecto: `STATUS.md`
- Arquitectura: `docs/ARCHITECTURE.md`
- Backlog tecnico: `docs/BACKLOG.md`
- Schema inicial: `supabase/schema.sql`

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## Primeros pasos
1. Instalar dependencias con `npm install`
2. Copiar `.env.example` a `.env.local`
3. Completar credenciales de Supabase
4. Aplicar `supabase/schema.sql`
5. Si ya tienes una base creada, aplicar tambien las migraciones nuevas de `supabase/migrations/`
6. Levantar el proyecto con `npm run dev`

## Migraciones recientes
- `supabase/migrations/20260330153000_founder_leads.sql`: crea la tabla `founder_leads` para capturar interesados de la landing `Operadores Fundadores`
- `supabase/migrations/20260330161000_vehicle_documents.sql`: crea la tabla `vehicle_documents` para la boveda documental por unidad
- `supabase/migrations/20260330174000_company_alert_settings.sql`: crea la tabla `company_alert_settings` para configurar alertas diarias por email

## Variables de entorno
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ALERTS_CRON_SECRET=
RESEND_API_KEY=
ALERTS_FROM_EMAIL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

## Alertas por email y SMS
1. Configura las preferencias desde `/alerts`
2. Define `ALERTS_CRON_SECRET` tambien en Vercel como `CRON_SECRET` si vas a usar Vercel Cron
3. Sube `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` y `ALERTS_FROM_EMAIL`
4. Si vas a usar SMS, agrega `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_FROM_NUMBER`
5. Usa telefono destino en formato E.164, por ejemplo `+13055550149`
6. El cron diario queda definido en `vercel.json` hacia `/api/alerts/email`

### Prueba manual en dry run
```bash
curl -X POST http://localhost:3000/api/alerts/email \
  -H "x-alerts-secret: TU_SECRET" \
  -H "content-type: application/json" \
  -d '{"dryRun":true}'
```

### Disparo manual real
```bash
curl -X POST https://tu-dominio.com/api/alerts/email \
  -H "x-alerts-secret: TU_SECRET" \
  -H "content-type: application/json" \
  -d '{}'
```

## Alcance V1
- Autenticacion
- Empresas
- Unidades
- Vencimientos
- Planes de mantenimiento
- Servicios realizados
- Historial
- Dashboard
- Alertas por email y SMS configurables
