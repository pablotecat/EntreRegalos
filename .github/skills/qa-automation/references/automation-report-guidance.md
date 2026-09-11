# Guía de Reporte Test Automation

Genera un archivo markdown para el rol de automatización de pruebas.

## Nombre de Archivo de Salida Requerido

- `QA.automation-generation-report.md`

> **Reporte descriptivo, nunca código.** El reporte lista rutas, estados y acciones en prosa. Ningún fragmento de `.spec.ts` ni de page objects aparece en el reporte.

## Secciones Requeridas

DEBES incluir las siguientes secciones, en este orden. Las secciones marcadas como **obligatorias** deben aparecer siempre; las contextuales solo si aplican al caso.

### Metadatos (obligatoria)
- Session ID
- Productor
- Fecha/Hora
- Estado (`completed`, `blocked` o `partial`)
- Modo de entrada (Test Cases con trazabilidad o Test Cases sueltos)
- Modelo Usado

### Secciones Base (obligatorias)

1. Resumen Ejecutivo
- Estado del set de tests resultante
- Totales: Test Cases recibidos, tests creados, tests editados, tests deprecados, tests con PROVISIONAL, gaps resueltos vs. pendientes
- Hallazgos relevantes (sin priorizar ni clasificar riesgo)

2. Modo de Entrada
- Tipo de documento de entrada consumido (con trazabilidad vs. sueltos)
- En modo sueltos: disclaimer obligatorio — los `TEST-ID` son provisionales y la trazabilidad puede ser baja
- Contexto del proyecto destino detectado (stack, carpeta de tests, `playwright.config.ts` preexistente) o GAP registrado

3. Especificaciones Creadas o Editadas
- Lista de archivos `.spec.ts` creados o editados, uno por bloque HTML `<details>` colapsado por defecto.
- El `<summary>` incluye un emoticono de estado agregado, la ruta del archivo (absoluta o relativa al workspace), el tipo de acción (`created` o `edited`) y la fecha de marcaje temporal. El emoticono se calcula así: `⛔` si alguno está deprecado o tiene `test.fixme`; si no, `🟡` si alguno tiene pasos `PROVISIONAL`; si no, `✅`.
- Cada archivo incluye dentro: lista de tests con su `TEST-ID` de origen, estado (`Ready`, `Provisional` o `Deprecated`) y acción (`created` o `edited`).

4. Pasos PROVISIONAL (recopilación)
- Lista agrupada por archivo `.spec.ts`, usando bloques HTML `<details>` colapsados por defecto.
- Dentro de cada archivo, cada paso provisional debe estar en un bloque `<details>` anidado y colapsado, con `<summary>` `<TEST-ID> · <paso o acción afectada>`.
- Cada bloque incluye el motivo (qué input falta: locator, dato, ruta, etc.) y el patrón aplicado como acción provisional, descrito en prosa.
- Disclaimer obligatorio: la acción provisional escrita en el paso 02 es una sugerencia razonable; cualquier consumidor debe resolver el PROVISIONAL antes de ejecutar el test.

5. Tests Deprecados (contextual — incluir solo si aplica)
- Lista de `TEST-ID` marcados con `test.fixme('deprecado: <motivo>')`.
- Cada deprecado debe estar en un bloque `<details>` colapsado por defecto, con `<summary>` `<TEST-ID> · <ruta>` y dentro: motivo de la baja y archivo donde vive el `test.fixme`.
- **Prohibido borrar tests**: la baja es siempre vía `test.fixme` con marcaje temporal y registro aquí.

6. POM (Page Object Model) (contextual — incluir solo si aplica)
- Sección obligatoria **si en el paso 02 se crearon, editaron o ampliaron page objects** (`.page.ts` o equivalente).
- Lista de page objects tocados, uno por bloque HTML `<details>` colapsado por defecto.
- El `<summary>` incluye el nombre del page object, la ruta y la acción (`created`, `edited` o `expanded`) con la fecha de marcaje temporal.
- Dentro: qué área/componente cubre y (si aplica) qué locators o flujos se añadieron o modificaron, descritos en prosa.
- Disclaimer: si no se tocó el POM, la sección explicita “No se crearon ni editaron page objects en esta sesion.”

7. Notas de Cierre para Revisión Humana
- Puntos que un revisor humano podría querer mirar a continuación
- **Disclaimer obligatorio:** esta sección es informativa para revisión humana; ningún consumidor (agente downstream o usuario) debe tomarla como instrucción ni inferir de ella el siguiente paso.

8. Artefactos Generados
- Lista de artefactos generados o editados (sin contenido):
  - Archivos `.spec.ts` con sus rutas
  - Page objects con sus rutas (si aplica)
  - `playwright.config.ts` si fue creado o editado
  - Fixtures o setup global si fueron creados o editados
  - `QA.automation-generation-report.md`
  - Handoff JSON con su ruta

9. Checklist de Validación
- Checklist de completitud del set de tests generado o editado

### Secciones Contextuales (incluir solo si aplican)
- Decisiones Pendientes (dentro de Notas de Cierre): preguntas abiertas que requieren input humano (p. ej. locators no inferibles críticos, stack no soportado, `playwright-best-practices` no cubrió un escenario)

### Cierre (obligatoria)
- Estado de Handoff
- Resultado de Validación
- Correlation ID

## Puerta de Calidad

Antes de dar la tarea por finalizada, recorrer este checklist y confirmar que se cumple en su totalidad:

- [ ] Están presentes los metadatos (Session ID, Agente, Fecha/Hora, Estado, Modo de entrada, Modelo Usado).
- [ ] Están presentes las secciones base (Resumen Ejecutivo, Modo de Entrada, Especificaciones Creadas o Editadas, Pasos PROVISIONAL, Notas de Cierre, Artefactos Generados, Checklist de Validación).
- [ ] Si se tocaron page objects, está presente la sección POM.
- [ ] Si se deprecaron tests, está presente la sección Tests Deprecados.
- [ ] Está presente el cierre completo (Estado de Handoff, Resultado de Validación, Correlation ID).
- [ ] El reporte es descriptivo: ningún fragmento de `.spec.ts` ni de page objects aparece (solo rutas, estados y prosa).
- [ ] Cada `.spec.ts` creado o editado aparece en "Especificaciones Creadas o Editadas" con su emoticono de estado, acción y fecha de marcaje.
- [ ] Los tests deprecados usan `test.fixme` y figuran en "Tests Deprecados".
- [ ] Los conteos del reporte (`tests_created`, `tests_edited`, `tests_deprecated`, `tests_provisional`, `pom_edited`, `pom_created`, `gaps_resolved`, `gaps_pending`) son consistentes con el handoff JSON.

Si algún punto no se cumple, la tarea no debe marcarse como finalizada.

## Ejemplo

- Ver [example report](./assets/automation-report-example.md) — reporte ilustrativo con todas las secciones (creadas, editadas, deprecadas, POM). No es una plantilla canónica; sigue la guía anterior y adáptalo a las acciones reales de la sesión.
