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
- Alertas por email configurables
