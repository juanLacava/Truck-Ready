# Flota al Dia

Micro-SaaS para control de mantenimiento preventivo y vencimientos de flotillas pequenas, orientado al mercado hispano en Estados Unidos.

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
5. Levantar el proyecto con `npm run dev`

## Variables de entorno
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
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
