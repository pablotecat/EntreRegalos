# Paso 3: Generación de Reporte

## Objetivo del Paso

Generar el documento markdown `QA.automation-generation-report.md`, persistirlo correctamente y emitir el handoff JSON mínimo. Este paso solo persiste lo ya implementado en el paso 02; no redacta nuevos tests, ni resuelve PROVISIONAL, ni replantea decisiones.

## Enfoque Exclusivo

Durante este paso tu ÚNICO objetivo es ensamblar, validar y persistir el entregable final y el handoff. No redactes nuevos tests ni marques nuevos PROVISIONAL.

## Resolución de output

Esta skill resuelve el directorio de salida del reporte (`report_output_dir`) así:

1. **Path explícito en la invocación**: si la invocación indica un destino (patrones como `to <path>`, `save [to] <path>`, `en <path>`) usado para el reporte, úsalo como `report_output_dir`.
2. **Default**: en caso contrario o error, `report_output_dir` = `./tests/Documentation/sessions/session_{N}_{id}/QA-automation-agent/` (siguiendo la estructura canónica de sesión del resto de agentes).
3. El código `.spec.ts` NO se persiste aquí (vive en `code_output_dir` del paso 02). Solo el reporte, el handoff y el work-log.
4. Si el usuario pide explícitamente no generar el reporte, en lugar de generarlo escríbelo en el chat.

## Secuencia

1. Genera `QA.automation-generation-report.md` siguiendo la guía `references/automation-report-guidance.md` de esta skill.
2. Revisa la consistencia interna del reporte sobre estos ejes:
   - `every_test_case_resolved`: cada Test Case del paso 01 se resolvió como creado, editado o deprecado.
   - `every_spec_has_test_id`: cada test creado o editado lleva el comentario `// TEST-ID: <id>`.
   - `every_touched_file_timestamped`: todo `.spec.ts` (y page objects, `playwright.config.ts`, fixtures) creado o editado en esta sesión lleva marcaje `generated` y/o `edited` con fecha.
   - `no_wait_for_timeout`, `locators_stable_or_provisional`, `provisional_marked_with_motivo`.
   - `no_code_in_report`: el reporte no incluye el contenido de ningún `.spec.ts` ni de page objects.
   - `deprecated_tests_use_fixme`: todo test deprecado usa `test.fixme('deprecado: <motivo>')`.
   - Conteos: `test_cases_total`, `tests_created`, `tests_edited`, `tests_deprecated`, `tests_provisional`, `pom_edited`, `pom_created`, `gaps_resolved`, `gaps_pending`.
3. Construye el handoff JSON mínimo siguiendo la skill `.agents/skills/qa-handoff-creation/SKILL.md`:
   - `agent`: `QA.automation`.
   - `summary_md`: ruta a `QA.automation-generation-report.md`.
   - `work_log_md`: ruta al work-log (construido durante los pasos 01–03 vía `qa-worklog`).
   - `checks` y `counts` con hechos objetivos, no interpretaciones (ver `references/automation-report-guidance.md` para las claves recomendadas).
4. Persiste el reporte y el handoff en `report_output_dir`.
5. Actualiza `./tests/Documentation/HANDOFF_Summary.md` con la entrada del handoff generado.

## Claves objetivas recomendadas en el handoff

- `checks`: `every_test_case_resolved`, `every_spec_has_test_id`, `every_touched_file_timestamped`, `no_code_in_report`, `no_wait_for_timeout`, `locators_stable_or_provisional`, `deprecated_tests_use_fixme`, `playwright_best_practices_consulted`.
- `counts`: `test_cases_total`, `tests_created`, `tests_edited`, `tests_deprecated`, `tests_provisional`, `pom_edited`, `pom_created`, `gaps_resolved`, `gaps_pending`.

## Registro de bloqueos por documentación insuficiente

- Documenta el bloqueo en el reporte `QA.automation-generation-report.md`, sección "Notas de Cierre para Revisión Humana → Decisiones Pendientes", indicando que el estado del resultado es `blocked` o `partial`.
- Especifica en esa misma sección qué no se pudo completar (equivalente a `work_performed.sections_untouched`), para que el usuario decida cómo obtener más contexto.

## Puerta de Calidad

Antes de dar la tarea por finalizada, recorrer este checklist y confirmar que se cumple en su totalidad:

- [ ] Se generó `QA.automation-generation-report.md` con el formato esperado por la guía.
- [ ] El reporte NO incluye contenido de ningún `.spec.ts` ni de page objects (sólo rutas y estados).
- [ ] `every_test_case_resolved`: cada Test Case se resolvió como creado, editado o deprecado.
- [ ] `every_spec_has_test_id`: cada test creado o editado lleva el comentario `// TEST-ID: <id>`.
- [ ] `every_touched_file_timestamped`: todo archivo tocado tiene marcaje temporal con fecha.
- [ ] `deprecated_tests_use_fixme`: los tests deprecados usan `test.fixme`, no borrado.
- [ ] No se usó `page.waitForTimeout` en ningún `.spec.ts` generado o editado.
- [ ] Los PROVISIONAL del paso 02 están listados en el reporte con su motivo.
- [ ] El handoff JSON tiene `agent=QA.automation` y `summary_md`/`work_log_md` apuntan a archivos ya persistidos.
- [ ] `checks` y `counts` del handoff son hechos objetivos, no interpretaciones.
- [ ] Se actualizó `./tests/Documentation/HANDOFF_Summary.md` con la entrada del handoff.

Si algún punto no se cumple, la tarea no debe marcarse como finalizada.
