# Truck Ready - Design System (Heavy Duty UI)

Este documento contiene las especificaciones para el equipo de desarrollo.

## 1. Fundamentos Visuales
- **Tipografía:**
  - Títulos: Inter Black (900), Uppercase.
  - Datos: JetBrains Mono Bold (700).
  - Cuerpo: Inter Medium (500).
- **Colores:**
  - `Industrial Black`: #0F172A
  - `Emergency Red`: #B91C1C
  - `Warning Yellow`: #FACC15
  - `Compliance Green`: #059669
  - `Steel Gray`: #F1F5F9

## 2. Componentes Definidos

### A. Dashboard "Mission Control"
- **Safety Dial:** Indicador circular de salud de flota (0-100).
  - Stroke: 20px. 
  - Central Text: JetBrains Mono 48pt.
- **Alert Cards:**
  - Border-radius: 24px.
  - Border-left: 8px solid [Color Estado].
  - Acción: Botón "Resolver Ahora" con altura mínima de 48px.

### B. Vehicle ID Card
- **Estructura:**
  - Proporción 3:2, borde de 3px Steel Gray.
  - Placa destacada como título principal en fondo oscuro.
  - Odómetro: Display central con botones [-] y [+] de 64px a los lados.
- **Interacción:** Al tocar, abre la "Bóveda de Documentos" de esa unidad.

### C. Inspection Mode (Bilingual)
- **Idioma:** Inglés como idioma primario (70% tamaño), Español como secundario (30% tamaño, itálica).
- **Layout:** Fondo blanco puro, textos en Industrial Black.
- **Elementos:** Status badges tipo "Stamp" (Sello) para dar sensación de documento oficial.

## 3. Flujo: Onboarding de Choferes (Driver Self-Service)
Este flujo está diseñado para dispositivos móviles y captura rápida de datos.

### Pasos del Flujo (UX Map):
1. **Landing de Acceso:** Input de código de 6 dígitos. Botones gigantes.
2. **Carga de CDL:** Interfaz de cámara con guía de encuadre.
3. **Carga de Medical Card:** Repetición del patrón de cámara.
4. **Validación de Unidad:** Muestra foto del camión asignado y pide confirmación de odómetro.

### Reglas de Diseño para Choferes:
- **No Keyboard:** Evitar el uso del teclado. Usar cámara, botones de incremento y selectores.
- **Feedback Visual:** Vibración suave (haptic feedback) al completar cada carga exitosa.
- **Idioma:** Interfaz 100% en Español por defecto, con opción de cambiar a Inglés.

## 4. Reportes Profesionales (PDF Output)
El diseño del PDF debe imitar un formulario oficial gubernamental para proyectar autoridad.

### Elementos del Reporte:
- **Header:** Título "MAINTENANCE COMPLIANCE CERTIFICATE" en Inter Black.
- **Stamps:** Sellos circulares de "PASSED" o "CERTIFIED" para validaciones visuales rápidas.
- **Grid:** Tablas con bordes de 2px Industrial Black. Sin colores de fondo innecesarios (ahorro de tinta y sobriedad).

## 5. Estrategia de Landing Page (UX & Copy)
La landing debe sentirse como un sitio de logística, no como una app de Silicon Valley.

### Jerarquía de la Landing:
1. **Hero:** Contraste extremo (Negro/Amarillo). Enfoque en el beneficio legal/económico.
2. **Social Proof:** Logos de marcas de camiones ( Freightliner, Kenworth, etc.) como fondo sutil para contextualizar.
3. **Formulario:** El formulario del "Programa Fundador" debe sentirse selectivo y sobrio, sin lenguaje de beta ni promesas de app en prueba.

## 6. Iconografía "Heavy Stroke"
Reglas para el set de iconos personalizados:
- **Stroke Width:** 2.5px.
- **Corner Radius:** 4px.
- **Categorías:** 
  - *Vehículos:* Camión, Tráiler, Van.
  - *Alertas:* Escudo, Exclamación, Calendario, Llave inglesa.

## 7. Guía de UX para el Desarrollador
... (rest of the file)
