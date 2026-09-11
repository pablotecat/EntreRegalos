# Paso 1: Análisis de Test Cases

## Objetivo del Paso

Leer y comprender de forma exhaustiva el documento de entrada, identificando si los Test Cases tienen trazabilidad formal (`TEST-ID`, prerrequisitos) o si son Test Cases sueltos (caso alternativo, con baja trazabilidad). Extraer los Test Cases, sus pasos Given/When/Then, sus prerrequisitos y cualquier GAP que afecte la implementación.

## Enfoque Exclusivo

Durante este paso tu único objetivo es leer y entender. No escribas código `.spec.ts` todavía, ni elijas locators, ni diseñes fixtures. Asimila cada Test Case con sus pasos y prerrequisitos, y registra los gaps que afectarán la implementación.

## Secuencia

1. Detecta el modo de entrada:
   - **Modo con trazabilidad** (preferido): el documento contiene Test Cases con `TEST-ID`, título, Estado, Traza, Prerrequisitos y pasos numerados Given/When/Then.
   - **Modo Test Cases sueltos** (alternativo): el documento contiene Test Cases con pasos Given/When/Then pero sin `TEST-ID` ni trazabilidad formal. En este modo, generas identificadores provisionales y lo registras en el reporte del paso 03.
2. Lee el documento de entrada completo.
3. Extrae, para cada Test Case:
   - `TEST-ID` (o identificador provisional si no existe).
   - `Title`.
   - Prerrequisitos (estado inicial, datos, configuración).
   - Pasos Given/When/Then (sin inventar pasos que no estén explícitos).
   - Expected Result nuclear del último Then.
4. Identifica y registra gaps que afectarán la implementación de Playwright:
   - Locators no inferibles (sin `data-testid`, sin texto estable, sin rol semántico identificable).
   - Datos de prueba no proveídos (credenciales, valores de formularios, fixtures).
   - Rutas de la aplicación no documentadas.
   - Dependencias entre Test Cases (datos compartidos, estado acumulado).
5. Recopila el contexto del proyecto destino (si está disponible):
   - Stack/frontend (React, Vue, Next.js, Angular) para invocar las referencias adecuadas de `playwright-best-practices/references/frameworks/`.
   - Estructura de tests existente (`playwright.config.ts`, carpeta `tests/` o `e2e/`).
   - Si el proyecto no usa Playwright, registra el GAP y deja que el usuario decida.

## Manejo de bloqueos por documentación insuficiente

Recopila ambigüedades o faltantes detectados (locators sin definir, rutas faltantes, prerrequisitos sin datos) como **GAP de implementación** y continúa sin detenerte. Cada gap se materializará en el paso 02 como un paso `PROVISIONAL` dentro del código.

## Checklist de completitud

- [ ] Se identificó el modo de entrada (generator vs Test Cases sueltos).
- [ ] Se leyó el documento de entrada completo.
- [ ] Se extrajeron los Test Cases con `TEST-ID`, título, prerrequisitos, pasos Given/When/Then y Expected Result.
- [ ] Se identificaron los gaps de implementación (locators, datos, rutas).
- [ ] Se registró el contexto del proyecto destino (o se registró como GAP si no hay).
