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
- **Alert Cards:**
  - Border-radius: 24px.
  - Border-left: 8px solid [Color Estado].
  - Acción: Botón "Resolver Ahora" con altura mínima de 48px.

### B. Vehicle ID Card
- **Estructura:**
  - Contenedor con borde de 3px Steel Gray.
  - Placa destacada como título principal.
  - Odómetro con controles táctiles grandes.
- **Interacción:** Al tocar, abre la "Bóveda de Documentos" de esa unidad.

### C. Inspection Mode (Bilingual)
- **Idioma:** Inglés como idioma primario (70% tamaño), Español como secundario (30% tamaño, itálica).
- **Layout:** Vertical, optimizado para móviles.
- **Elementos:** Status badges tipo "Stamp" (Sello) para dar sensación de documento oficial.

## 3. Guía de UX para el Desarrollador
- **Touch Targets:** Ningún elemento interactivo debe medir menos de 48x48px.
- **Sunlight Mode:** El contraste entre texto y fondo debe ser superior a 7:1.
- **Input Methods:** Preferir selectores y botones de incremento sobre teclado numérico donde sea posible.
