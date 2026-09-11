# Paso 2: Implementación con playwright-best-practices

## Objetivo del Paso

Generar código Playwright ejecutable `.spec.ts` para cada Test Case del paso 01, **delegando** las decisiones técnicas de implementación a la skill `playwright-best-practices`.

## Enfoque Exclusivo

Durante este paso tu único objetivo es generar código Playwright a partir de los Test Cases analizados. No rediseñes Test Cases, ni replantees gaps del paso 01, ni redactes el reporte final (eso es el paso 03).

## Resolución de output

Esta skill resuelve el directorio de salida del código (`code_output_dir`) así:

1. **Path explícito en la invocación**: si la invocación indica un destino (patrones como `to <path>`, `save [to] <path>`, `en <path>`), úsalo como `code_output_dir`.
2. **Default**: en caso contrario, si el proyecto destino tiene carpeta de tests Playwright identificable (`./tests/`, `./e2e/`, `./tests/e2e/`), úsala como `code_output_dir`.
3. **Fallback**: si no hay carpeta de tests identificable, `code_output_dir` = `./tests/e2e/`.
4. El reporte y el handoff NO viven aquí: se persisten en la carpeta de sesión QA (ver paso 03).

## Invocación de playwright-best-practices

**OBLIGATORIO**: antes de escribir cualquier línea de código, ejecuta la skill `.agents/skills/playwright-best-practices/SKILL.md` y consulta sus referencias para cada actividad de implementación. NO tomes decisiones de diseño de Playwright por tu cuenta: si `playwright-best-practices` cubre el caso, síguelo; si no, registra una decisión pendiente y aplica el patrón más próximo documentado.

Mapa de referencias clave (no exhaustivo) según la actividad. Todas viven dentro de `playwright-best-practices/`:

| Actividad del Test Case | Referencia a consultar |
|--------------------------|------------------------|
| Estructura del test `.spec.ts` | `playwright-best-practices/references/core/test-suite-structure.md` |
| Locators estables | `playwright-best-practices/references/core/locators.md` |
| Aserciones y auto-waiting | `playwright-best-practices/references/core/assertions-waiting.md` |
| Fixtures y hooks | `playwright-best-practices/references/core/fixtures-hooks.md` |
| POM vs fixtures inline | `playwright-best-practices/references/architecture/pom-vs-fixtures.md` |
| Autenticación (si los prerrequisitos la requieren) | `playwright-best-practices/references/advanced/authentication.md` |
| Datos de prueba | `playwright-best-practices/references/core/test-data.md` |
| Framework específico (React/Vue/Next.js/Angular) | `playwright-best-practices/references/frameworks/<framework>.md` |
| Bugs flaky / aislamiento | `playwright-best-practices/references/debugging/flaky-tests.md` |

## Marcaje temporal de archivos (obligatorio)

Todo `.spec.ts` que crees o editas lleva un marcaje temporal. Obten la fecha ejecutando `node scripts/current-time.mjs` (campo `local_date` en formato `YYYY-MM-DD`); si el workspace no tiene ese script, usa la fecha del sistema en el mismo formato.

- **Creación de archivo nuevo**: `// @qa-automation generated: <fecha>` como primera línea del archivo, seguida del resto del contenido (imports, `TEST-ID`, test).
- **Edición de archivo existente**: antepone `// @qa-automation edited: <fecha>` justo después de la línea `generated` original (conserva la línea `generated` sin tocar). Si el archivo no tiene línea `generated` (archivo heredado ajeno a QA.automation), antepone solo `edited` al inicio.
- **Edición de un test dentro de un archivo compartido**: actualiza o añade la línea `edited` del archivo; no dupliques líneas `edited` en la misma fecha (reemplaza la del día si ya existe).
- El marcaje se aplica también a archivos del POM (`*.page.ts` o equivalente) que se creen o editen.

## Secuencia

1. Ejecuta la skill `playwright-best-practices/SKILL.md` para cargar su índice de actividad.
2. Para cada Test Case del paso 01, decide el destino:
   - **Crear nuevo test** si no existe `.spec.ts` para ese `TEST-ID`.
   - **Editar test existente** si el `TEST-ID` ya vive en un `.spec.ts` previo: actualiza pasos, locators y aserciones; antepone la línea `edited` correspondiente; no duplicues el `test()`.
   - **Deprecar test existente** si el Test Case de origen ha sido retirado del input: NO borres el `test()`. Reemplaza su cuerpo por `test.fixme('deprecado: <motivo>')` y conserva la línea `TEST-ID` y el marcaje `generated`; antepone `// @qa-automation edited: <fecha>`. Registra la baja en el reporte del paso 03 (sección “Tests Deprecados”).
3. Para cada test creado o editado:
   - Identifica la actividad de implementación (nuevo test E2E, autenticación, multipage, etc.) y consulta las referencias correspondientes de `playwright-best-practices`.
   - Cabecera del test `.spec.ts`:
     - Marcaje temporal (ver sección anterior).
     - Comentario `// TEST-ID: <id>` que enlaza al Test Case original (trazabilidad).
     - Imports y `test()` o `test.describe()` según estructura decidida (un `test()` por Test Case, o `test.describe()` si el archivo agrupa varios de la misma suite).
   - Pasos Given/When/Then mapeados a acciones de Playwright.
   - Aserciones basadas en `expect()` con auto-waiting (no uses `waitForTimeout` ni esperas implícitas).
   - Locators estables: prefiere rol, texto accesible o `data-testid` (sigue `playwright-best-practices/references/core/locators.md`).
   - **Para cada GAP del paso 01**: inserta un comentario `// 🟡 PROVISIONAL/NO DEFINIDO: <motivo>` en el lugar afectado y aplica un patrón razonable del que dispongas, sin inventar datos sensibles.
   - Persiste el archivo `.spec.ts` en `code_output_dir`.
4. **POM**: Decide por `playwright-best-practices/references/architecture/pom-vs-fixtures.md` y `playwright-best-practices/references/core/page-object-model.md`. Si se opta por POM o ya existe POM en el proyecto:
   - **Amplía o edita** page objects existentes para reflejar nuevos locators o flujos; NO dupliques page objects para el mismo área.
   - Si creas un page object nuevo, aplica el marcaje temporal en su archivo (`*.page.ts`).
   - Registra en el reporte del paso 03 (sección “POM”) qué archivos se crearon, editaron o ampliaron, con sus rutas absolutas o relativas al workspace.
5. Si el proyecto destino no tiene `playwright.config.ts`, genera uno mínimo siguiendo `playwright-best-practices/references/core/configuration.md` y `playwright-best-practices/references/core/projects-dependencies.md` y aplica marcaje temporal al inicio.
6. Si los prerrequisitos de los Test Cases requieren fixtures globales o setup, créalos siguiendo `playwright-best-practices/references/core/global-setup.md` y `playwright-best-practices/references/core/fixtures-hooks.md` y aplica marcaje temporal.

## Bloqueos por gaps de implementación

- Cuando un gap del paso 01 impida escribir una aserción o acción concreta, marca el paso correspondiente como `PROVISIONAL` con su comentario, aplica un patrón razonable y continúa con el resto del Test Case y los siguientes.
- Cuando un gap impida la totalidad de un Test Case (p. ej., la aplicación no está accesible en este entorno), NO omitas el archivo: crea el `.spec.ts` con la estructura base y marca el test como `test.fixme('pendiente de entorno accesible: <motivo>')`, registrándolo en el reporte del paso 03 (sección “Tests Deprecados” con motivo `pendiente de entorno accesible`).

## Guardarrailes de calidad

🛑 **Prohibido `page.waitForTimeout`**: usa aserciones de auto-waiting (`expect().toBeVisible()`, `expect().toHaveURL()`, etc.).
🛑 **Prohibido borrar tests o `.spec.ts`**: la baja es siempre vía `test.fixme('deprecado: <motivo>')` con marcaje temporal y registro en el reporte.
🛑 **Prohibido omitir marcaje temporal**: todo archivo creado o editado debe llevar su línea `generated` y/o `edited`.
🛑 **Prohibido selectores XPath absolutos o `nth-child`** salvo sin alternativa documentada.
🛑 **Prohibido inventar credenciales, tokens ni datos sensibles**: si faltan, marca `PROVISIONAL` y usa `process.env` o fixtures con valores placeholder.
🛑 **Toda decisión técnica de Playwright proviene de `playwright-best-practices`**: no improvises patrones.

## Checklist de completitud

- [ ] Se ejecutó la skill `playwright-best-practices/SKILL.md` antes de escribir código.
- [ ] Cada Test Case del paso 01 se resolvió como creado, editado o deprecado.
- [ ] Cada `.spec.ts` creado o editado tiene marcaje temporal (`generated` y/o `edited`) con fecha.
- [ ] Cada test lleva el comentario `// TEST-ID: <id>` de trazabilidad.
- [ ] Los tests deprecados usan `test.fixme('deprecado: <motivo>')` y no se borraron.
- [ ] No se usó `page.waitForTimeout` ni esperas arbitrarias.
- [ ] Los locators siguen `playwright-best-practices/references/core/locators.md` (role, text, `data-testid`).
- [ ] Los gaps del paso 01 se materializaron como comentarios `PROVISIONAL` en el código.
- [ ] El POM existente se amplió/editó (si aplica) sin duplicar page objects.
- [ ] Los archivos `.spec.ts` (y page objects/`playwright.config.ts` si se tocaron) se persistieron en `code_output_dir`.
