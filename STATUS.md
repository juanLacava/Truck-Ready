# Truck Ready

Estado general: MVP base funcionando con Supabase
Ultima actualizacion: 2026-04-01 11:10 -03

## Nota de corte
- Revision documentada del trabajo aplicado hasta 2026-04-01: docs/IMPLEMENTATION_REVIEW_2026-04-01.md
- Importante: este corte incluye cambios manuales en app, alertas, roles y schema, pero no reemplaza la revision formal por tandas sugerida para DB + security, alerts + env y docs + finalizacion

## Resumen
Truck Ready es un micro-SaaS para control de mantenimiento preventivo y vencimientos, con foco inicial en transportistas pequenos y posibilidad de extenderlo a talleres y lubricentros.
Truck Ready mantiene foco comercial en empresas hispanas en Estados Unidos.

## Objetivo
Construir un MVP simple y vendible que permita:

- Registrar unidades
- Controlar vencimientos
- Programar mantenimientos por fecha o kilometraje
- Registrar servicios realizados
- Consultar historial por unidad
- Visualizar alertas y pendientes en un dashboard

## Mercado objetivo inicial
- Estados Unidos
- Segmento inicial: empresas hispanas con 5 a 30 unidades
- Estados prioritarios: Florida, California y Nueva York

## Propuesta de valor
Evita vencimientos, reduce paros y lleva el historial de cada unidad en un solo lugar.

## Propuesta de valor reforzada
- Reduce multas, vencimientos y friccion con inspecciones
- Ayuda a duenos hispanos a operar mejor en un entorno regulatorio en ingles
- Convierte mantenimiento y documentacion en defensa operativa ante DOT y aseguradoras

## Enfoque comercial actual
- Producto en espanol para mercado hispano en EE. UU.
- Venta inicial a negocios pequenos con operacion de vehiculos
- Nichos sugeridos: transportistas pequenos, contratistas, delivery local, field services, talleres y lubricentros
- Buyer mas prometedor: owner-operator y micro-flota de 1 a 10 unidades
- Diferenciador: compliance bilingue + documentacion + menos miedo operativo

## MVP definido
- Login y gestion basica de empresa
- Unidades
- Vencimientos
- Planes de mantenimiento preventivo
- Registro de servicios
- Historial por unidad
- Reporte exportable por unidad
- Dashboard
- Alertas basicas
- Configuracion base de alertas por email
- Checklists DOT bilingues
- Landing comercial con captura de leads

## Stack propuesto
- Next.js
- Supabase
- Tailwind CSS
- Vercel
- Resend

## Estado actual del MVP
- Landing base operativa
- Registro de usuario operativo
- Login operativo
- Onboarding de empresa operativo
- Dashboard operativo con datos reales basicos
- Dashboard operativo con centro de alertas unificado
- Modulo de alertas operativo con configuracion de resumen diario por email
- Endpoint de alertas compatible con disparo manual y Vercel Cron
- Modulo de compliance operativo con checklist DOT bilingue imprimible
- Modulo de unidades operativo con alta y listado real
- Modulo de vencimientos operativo con alta y listado real
- Modulo de mantenimiento operativo con alta y listado real
- Modulo de servicios operativo con alta y listado real
- Modulo de documentos operativo con alta y listado real
- Historial por unidad operativo con vista consolidada
- Reporte exportable por unidad operativo para PDF/seguros
- Landing comercial operativa con lenguaje visual "industrial" de alto contraste
- Estrategia del producto ajustada a ROI inmediato y operabilidad bajo presion
- Dashboard y modulos operativos rediseñados para maxima legibilidad (High Contrast UI)

## Arquitectura del MVP
### Frontend
- Aplicacion web con Next.js App Router
- UI administrativa simple para escritorio y uso correcto en movil
- Modulos principales: dashboard, unidades, documentos, vencimientos, mantenimiento, historial
- Rutas de auth y panel movidas a comportamiento dinamico para evitar errores de prerender innecesarios

### Backend
- Supabase como backend principal
- PostgreSQL para persistencia
- Supabase Auth para autenticacion
- API y server actions desde Next.js para operaciones del negocio
- Integracion actual resuelta mayormente desde cliente para simplificar el MVP y evitar complejidad temprana de SSR con cookies

### Notificaciones
- Alertas dentro del sistema en la V1 mediante centro de alertas en dashboard
- Email opcional preparado con configuracion por empresa y endpoint server-side
- Cron diario definido para despliegue en Vercel

### Despliegue
- Frontend en Vercel
- Base de datos y auth en Supabase

## Flujo principal del producto
1. La empresa crea su cuenta
2. Registra sus unidades
3. Carga vencimientos por unidad
4. Define planes de mantenimiento por fecha o kilometraje
5. Consulta pendientes en el dashboard
6. Registra servicios realizados
7. Revisa historial por unidad

## Modulos del MVP
### 1. Autenticacion y empresa
- Registro e inicio de sesion
- Perfil basico de empresa

### 2. Unidades
- Alta, edicion y listado de unidades
- Datos base: placa, codigo interno, marca, modelo, anio, kilometraje actual, estado

### 3. Vencimientos
- Alta y seguimiento de vencimientos por unidad
- Tipos iniciales: seguro, verificacion, licencia, permiso, documento personalizado

### 4. Mantenimiento preventivo
- Planes por kilometraje o fecha
- Ejemplos: aceite, filtros, frenos, llantas, alineacion

### 5. Servicios realizados
- Registro de mantenimiento ejecutado
- Fecha, kilometraje, tipo, notas y costo opcional

### 6. Historial por unidad
- Vista cronologica de servicios y vencimientos
- Resumen consolidado de documentos, mantenimientos y pendientes por unidad
- Reporte imprimible en ingles para exportar a PDF desde navegador

### 7. Dashboard
- Proximos vencimientos
- Mantenimientos proximos
- Pendientes vencidos
- Alertas unificadas de documentos, vencimientos y mantenimiento
- Resumen por estado operativo

### 8. Alertas externas
- Configuracion de resumen diario por email
- Endpoint listo para disparo desde cron
- Base preparada para Resend

### 9. Compliance
- Checklist DOT bilingue listo para pantalla e impresion
- Paquete sugerido de respaldo para inspeccion

### 10. Landing y captura comercial
- Landing orientada a owner-operators hispanos
- Formulario de Operadores Fundadores conectado a Supabase

## Roadmap estrategico sugerido
### Prioridad comercial inmediata
- Vencimientos y alertas
- Boveda de documentos por unidad y chofer
- Mantenimiento preventivo
- Historial exportable

### Diferenciadores tempranos
- Checklists DOT bilingues
- Reportes PDF en ingles para inspecciones y aseguradoras
- Alertas de compliance federal y estatal

### Enfoque regional
- Florida: idioma, seguros y riesgo de multas
- California: CARB y compliance local
- New York: historial de mantenimiento como defensa operativa

## Modelo de datos inicial
### Tablas principales
- `companies`
- `profiles`
- `company_members`
- `vehicles`
- `expiration_items`
- `maintenance_plans`
- `service_records`
- `vehicle_documents`
- `company_alert_settings`
- `founder_leads`

### Tablas sugeridas y campos clave
#### `companies`
- `id`
- `name`
- `country`
- `created_at`

#### `profiles`
- `id`
- `email`
- `full_name`
- `created_at`

#### `company_members`
- `id`
- `company_id`
- `profile_id`
- `role`
- `created_at`

#### `vehicles`
- `id`
- `company_id`
- `internal_code`
- `plate`
- `brand`
- `model`
- `year`
- `current_odometer`
- `status`
- `notes`
- `created_at`

#### `expiration_items`
- `id`
- `company_id`
- `vehicle_id`
- `type`
- `title`
- `due_date`
- `alert_days_before`
- `status`
- `notes`
- `created_at`

#### `maintenance_plans`
- `id`
- `company_id`
- `vehicle_id`
- `title`
- `trigger_type`  // `date` o `odometer`
- `interval_days`
- `interval_km`
- `last_service_date`
- `last_service_odometer`
- `next_due_date`
- `next_due_odometer`
- `status`
- `created_at`

#### `service_records`
- `id`
- `company_id`
- `vehicle_id`
- `maintenance_plan_id`
- `service_date`
- `odometer`
- `service_type`
- `cost`
- `notes`
- `created_at`

## Relaciones principales
- Una `company` tiene muchos `vehicles`
- Una `company` tiene muchos `company_members`
- Un `vehicle` tiene muchos `expiration_items`
- Un `vehicle` tiene muchos `maintenance_plans`
- Un `vehicle` tiene muchos `service_records`
- Un `maintenance_plan` puede tener muchos `service_records`

## Reglas de negocio iniciales
- Cada unidad pertenece a una sola empresa
- Los usuarios solo pueden ver datos de su empresa
- Un vencimiento se considera proximo si entra en la ventana de alerta configurada
- Un mantenimiento queda vencido si supera su fecha objetivo o kilometraje objetivo
- Registrar un servicio puede actualizar el ultimo y proximo mantenimiento del plan asociado
- Un documento se considera proximo si vence dentro de 30 dias
- El dashboard prioriza alertas vencidas por encima de alertas proximas
- El resumen diario por email se configura a nivel empresa

## Vistas o calculos utiles
- Unidades con alertas activas
- Vencimientos en los proximos 7, 15 o 30 dias
- Mantenimientos vencidos
- Documentos proximos o vencidos
- Proximo mantenimiento por unidad
- Ultimos servicios registrados
- Ultimo envio de alertas por empresa

## Fases de construccion sugeridas
### Fase 1
- Base del proyecto
- Auth
- Empresa
- Unidades

### Fase 2
- Vencimientos
- Planes de mantenimiento
- Reglas de calculo

### Fase 3
- Registro de servicios
- Historial por unidad
- Documentos por unidad
- Dashboard

### Fase 4
- Alertas
- Datos demo
- Deploy inicial
- Email opcional

## Estado por area
### Producto
- Posicionamiento inicial definido
- Nicho inicial definido
- MVP inicial definido
- Mercado ajustado a hispanos en Florida, California y New York
- Tesis comercial reforzada: confianza, cumplimiento y reduccion de miedo

### Comercial
- Validacion sugerida, aun no iniciada
- Pricing inicial propuesto
- Mensaje comercial orientado a mercado hispano en EE. UU.
- Pricing a validar: USD 15 a 25 por vehiculo por mes
- Canal sugerido: grupos de Facebook, asociaciones y alianzas con aseguranzas

### Tecnico
- Arquitectura inicial definida
- Modelo de datos inicial definido
- Estructura base del proyecto creada
- Schema inicial SQL creado para Supabase
- Dependencias instaladas
- Rutas iniciales creadas
- Build local verificado
- Supabase configurado con proyecto real
- Registro, login y onboarding conectados
- Modulo de unidades conectado para alta y listado
- Modulo de vencimientos conectado con calculo de estados
- Modulo de mantenimiento conectado con calculo de proximos servicios
- Modulo de documentos conectado con vencimiento por fecha
- Dashboard consolidado con alertas de documentos, vencimientos y mantenimiento
- Modulo de alertas por email con preferencias por empresa y endpoint inicial
- Compatibilidad agregada para `GET/POST` autenticado por secret y cron diario
- Historial por unidad consolidado
- Variables de entorno corregidas para cliente Next.js
- Politicas RLS corregidas para alta inicial de empresa
- Funcion `is_company_member` corregida con `security definer`
- Build y typecheck verificados despues de los fixes
- La siguiente fase tecnica prioritaria pasa a ser `alertas externas + compliance`

## Proximos pasos
1. Cargar env vars reales en Vercel y probar envio real con Resend
2. Profundizar compliance con vencimientos regulatorios y checklists por tipo de operacion
3. Mejorar exportacion e historial profesional para seguros
4. Revisar UX de formularios, estados vacios y datos demo
5. Preparar deploy inicial y validacion con Operadores Fundadores

## Backlog inicial
- [x] Definir entidades y relaciones
- [ ] Diseñar flujo principal del usuario
- [ ] Especificar pantallas del MVP
- [x] Crear proyecto base
- [x] Implementar autenticacion
- [x] Implementar modulo de unidades
- [x] Implementar modulo de vencimientos
- [x] Implementar boveda de documentos
- [x] Implementar modulo de mantenimiento preventivo
- [x] Implementar dashboard
- [x] Implementar historial por unidad
- [x] Implementar reporte exportable por unidad
- [x] Implementar landing comercial
- [x] Preparar alertas por email
- [ ] Cargar datos demo

## Decisiones tecnicas tomadas
- Mercado objetivo inicial: hispanos en EE. UU.
- Estados prioritarios: Florida, California y New York
- Integracion inicial de Supabase desde cliente para reducir friccion tecnica
- Multiempresa resuelta desde `companies` + `company_members`
- Separacion de datos por empresa mediante RLS
- Alta inicial de empresa resuelta con campo `created_by`
- El producto se diferencia por compliance y defensa documental, no por amplitud funcional
- La siguiente capa funcional prioritaria es `alertas externas + compliance`

## Insights de mercado incorporados
- Las suites enterprise son demasiado complejas y caras para micro-flotas hispanas
- Florida concentra presion por idioma, seguros y multas
- California agrega carga regulatoria diferencial por emisiones y formalizacion
- New York aumenta el valor del historial de mantenimiento ante inspecciones y reclamos
- El riesgo de usar seguro personal en vehiculos de trabajo es una oportunidad de posicionamiento consultivo

## Mensaje comercial sugerido
- Espanol primero
- Compliance simple
- Documentos listos para inspeccion
- Historial listo para defender tu operacion

## Canales de venta sugeridos
- Grupos de Facebook de transportistas hispanos
- Asociaciones locales de owner-operators
- Agencias de seguros comerciales para hispanos
- Servicios de compliance y gestores del rubro

## Ajustes aplicados en Supabase
- Se creo un proyecto nuevo de Supabase para evitar residuos del intento anterior
- Se aplico el schema base
- Se ajustaron triggers para que el schema sea reejecutable
- Se ajustaron policies para que tambien sean reejecutables
- Se agrego `created_by` en `companies`
- Se corrigio la policy de insercion y lectura de `companies`
- Se corrigio `is_company_member()` con `security definer`

## Flujo probado
1. Registro de usuario
2. Login
3. Onboarding de empresa
4. Acceso a dashboard
5. Alta de unidades

## Archivos clave ya creados
- `STATUS.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/BACKLOG.md`
- `supabase/schema.sql`
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/vehicles/page.tsx`
- `src/components/auth-form.tsx`
- `src/components/onboarding-form.tsx`
- `src/components/vehicle-form.tsx`
- `src/components/dashboard-layout.tsx`
- `src/lib/database.types.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`

## Notas
- No ampliar alcance antes de validar interes comercial.
- Evitar integraciones complejas en la V1.
- Mantener foco en transportistas pequenos antes de abrir el producto a talleres y lubricentros.
- Pendiente del usuario solo cuando haya que crear cuentas de Supabase, Vercel o servicios externos.
- La siguiente etapa ya no requiere cambios manuales en Supabase salvo nuevas tablas o policies del proximo modulo.

## Avance reciente
- Se creo la carpeta base del proyecto
- Se documento arquitectura y backlog tecnico
- Se agrego schema inicial para Supabase
- Se creo estructura inicial Next.js con Tailwind
- Se agregaron pantallas base: landing, dashboard, unidades, vencimientos, mantenimiento, login y registro
- Se verifico `npm run build` correctamente
- Se conecto Supabase real
- Se implemento registro, login y onboarding
- Se conecto el modulo de unidades con alta y listado real
- Se corrigieron errores de entorno, prerender y RLS
- Se confirmo acceso correcto al dashboard

## Proximo bloqueo real del usuario
- No hay bloqueo inmediato. El siguiente trabajo puede continuar directo sobre vencimientos.
