# Backlog Tecnico

## Fase 1. Base del producto
- [x] Inicializar proyecto Next.js con TypeScript y Tailwind
- [x] Configurar Supabase en entorno local y remoto
- [x] Definir variables de entorno
- [x] Implementar layout general
- [x] Implementar autenticacion
- [ ] Crear guard de rutas autenticadas
- [x] Crear pantalla inicial del dashboard vacio

## Fase 2. Nucleo operativo
- [x] Implementar tabla y CRUD de unidades
- [x] Implementar tabla y CRUD base de vencimientos
- [x] Implementar tabla y CRUD base de documentos
- [x] Implementar tabla y CRUD base de planes de mantenimiento
- [x] Implementar calculos de proximos vencimientos
- [x] Implementar calculos de proximos mantenimientos
- [x] Implementar estados: al dia, proximo, vencido

## Fase 3. Historial y seguimiento
- [x] Implementar tabla y CRUD base de servicios realizados
- [x] Relacionar servicios con planes de mantenimiento
- [x] Actualizar planes tras registrar un servicio
- [x] Implementar historial por unidad
- [x] Mostrar resumen por unidad

## Fase 4. Dashboard y alertas
- [x] Implementar dashboard con tarjetas resumen
- [x] Implementar listados de pendientes
- [x] Implementar alertas dentro del sistema
- [x] Implementar envio de email opcional
- [x] Implementar alertas de compliance

## Fase 5. Calidad y salida
- [ ] Cargar datos demo
- [ ] Revisar UX de formularios y tablas
- [ ] Revisar estados vacios
- [ ] Deploy inicial
- [x] Landing simple
- [x] Definir mensaje comercial para owner-operators hispanos
- [x] Implementar reporte exportable por unidad

## Fase UI: Heavy Duty (Handoff de Diseño)
- [ ] **Dashboard Mission Control:**
  - [x] Implementar el `Safety Dial` (SVG/Canvas) con colores dinamicos (0-100%).
  - [x] Refactorizar alertas con el nuevo estilo de `Alert Cards` (Borde izquierdo de 8px).
  - [x] Anadir boton de acceso rapido al "Modo Inspeccion".
- [ ] **Vehicle ID Cards:**
  - [x] Sustituir tablas de vehiculos por el layout de tarjetas 3:2 (Tipo Licencia).
  - [x] Implementar botones tactiles `[-]` y `[+]` de 64px para el odometro.
- [ ] **Inspection Mode:**
  - [ ] Crear la vista bilingüe optimizada para móviles (Banner, QR, Stamps de estatus).
- [ ] **Onboarding de Choferes:**
  - [ ] Crear flujo `truckready.com/go` con acceso por código de 6 dígitos.
  - [ ] Implementar captura de cámara para CDL y Medical Card con guías de encuadre.
- [ ] **Reporte PDF Pro:**
  - [ ] Ajustar el generador de PDF para que use el estilo oficial (Bordes 2px, Sellos de validación).

## Pendientes de copy comercial
- [x] Sustituir lenguaje de beta por un tono de autoridad operativa en la landing y el formulario principal.
- [ ] Definir version final del naming comercial: Programa Fundador, Charter Members o equivalente.
- [ ] Validar claims regulatorios/comerciales para evitar mensajes que no puedan sostenerse.

## Bloqueos posibles del usuario
- Cuenta de Supabase
- Cuenta de Vercel
- Dominio
- Cuenta de Resend si se activa email
