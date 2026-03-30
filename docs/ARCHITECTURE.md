# Arquitectura MVP

## Objetivo
Construir Truck Ready como un SaaS web simple para control de mantenimiento preventivo y vencimientos de unidades, orientado a empresas hispanas con pequenas flotas en Estados Unidos.
El objetivo comercial ya no es solo orden operativo: es reducir friccion de compliance, documentacion y riesgo ante inspecciones y aseguradoras.

## Principios
- Mantener la V1 chica y vendible
- Priorizar simplicidad operativa sobre complejidad funcional
- Diseñar multiempresa desde el inicio
- Evitar integraciones pesadas antes de validar interes comercial
- Priorizar ROI inmediato: evitar multas, vencimientos y friccion documental
- Construir en espanol primero, con salida documental en ingles cuando haga falta

## Stack
- Next.js con App Router
- TypeScript
- Supabase
- PostgreSQL
- Tailwind CSS
- Vercel
- Resend para email en una fase posterior

## Componentes
### Frontend
- Aplicacion administrativa web
- Rutas protegidas por autenticacion
- Layout principal con navegacion lateral
- Formularios CRUD para las entidades centrales

### Backend
- Supabase Auth para usuarios
- PostgreSQL para persistencia
- Row Level Security para separar empresas
- Server actions o route handlers de Next.js para orquestar operaciones

## Dominios principales
### Cuenta y empresa
- Registro e inicio de sesion
- Perfil de empresa
- Membresias por empresa

### Operacion
- Unidades
- Documentos por unidad
- Vencimientos
- Planes de mantenimiento
- Servicios realizados
- Historial
- Documentos por unidad y chofer
- Checklists bilingues

### Visibilidad
- Dashboard
- Listados con filtros
- Estados proximos, vencidos y al dia
- Centro de alertas con prioridad por severidad

## Seguridad
- Todo registro operativo pertenece a una empresa
- Todo acceso se filtra por empresa mediante RLS
- Los usuarios solo pueden consultar y editar datos de empresas a las que pertenecen

## Evolucion prevista
### V1
- Web app
- Alertas en el panel para vencimientos, mantenimiento y documentos
- Email opcional simple con configuracion por empresa y trigger server-side
- Boveda de documentos
- Enfoque en owner-operators y micro-flotas

### V2
- Roles mas finos
- Ordenes de trabajo
- Costos y reportes
- Seguimiento para talleres y lubricentros
- Exportacion PDF
- Checklists DOT bilingues
- Vencimientos de compliance federal y estatal

### V3
- WhatsApp
- Integraciones externas
- Version movil o PWA
