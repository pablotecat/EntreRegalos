# Paso 6: Generacion de Reporte

## Objetivo del Paso

Generar el documento markdown `QA.generator-test-cases.md` y persistirlo correctamente. Este paso solo persiste lo ya diseñado, marcado y verificado; no redacta pasos, ni marca provisionales, ni revisa trazabilidad (eso ya se hizo en 03, 04, 05).

## Modelo Recomendado

Usa el modelo de razonamiento mas potente disponible. Este paso produce el entregable final que otros consumidores leerán sin acceso al documento de entrada original: exige maxima precision y consistencia.

## Enfoque Exclusivo

Durante este paso tu unico objetivo es ensamblar, validar y persistir el entregable final. No redactes nuevos pasos ni marques nuevos provisionales, ni replantees la trazabilidad ya verificada.

## Resolución de output

Esta skill resuelve el directorio de salida (`output_dir`) así:

1. **Path explícito en la invocación**: si el usuario o el agente invocador indica un destino (patrones como `to <path>`, `save [to] <path>`, `en <path>`), úsalo como `output_dir`.
2. **Default**: en caso contrario o error, `output_dir` = `./.qa-tmp/qa-generator/<timestamp>/` (relativo al cwd del workspace; `<timestamp>` en ISO8601 compacto `YYYYMMDD-HHMMSS`).
3. Si el usuario pide explícitamente no generar el reporte, en lugar de generarla escríbela en el chat.

## Secuencia

1. Genera `QA.generator-test-cases.md` siguiendo la guía `references/generator-report-guidance.md` de esta skill y la plantilla OBLIGATORIA `references/assets/test-case-template.md` (anatomía B: Prerrequisitos + pasos numerados Given/When/Then sin expecteds inline en los pasos previos + último paso Then con Expected Result nuclear).
2. Revisa la consistencia y trazabilidad internas del documento, sobre estos ejes:
   - `original_id_preserved`, `splits_follow_pattern` (verificado en paso 02, reconfirmado aquí).
   - `every_test_has_ac`, `every_test_has_nuclear_then`, `every_step_clear_or_provisional`.
   - Conteos: `test_cases_total`, `test_cases_splitted`, `steps_provisional_total`, `acceptance_criteria_covered`, `acceptance_criteria_uncovered`, `mode_planning_done` o `mode_no_planning`.

## Registro de bloqueos en pasos anteriores

### Bloqueos por documentación insuficiente

- Documenta el bloqueo en el reporte `QA.generator-test-cases.md`, sección "Notas de Cierre para Revisión Humana → Decisiones Pendientes", indicando que el estado del resultado es `blocked` o `partial`.
- Especifica en esa misma sección qué no se pudo completar (equivalente a `work_performed.sections_untouched`), para que el usuario decida cómo obtener más contexto.

### Bloqueos por cobertura imposible de Acceptance Criteria

- Justifica la decisión en el reporte `QA.generator-test-cases.md`, sección "Notas de Cierre para Revisión Humana → Decisiones Pendientes", dejando el estado del resultado como `partial`.

## Checklist de completitud

- [ ] Se generó `QA.generator-test-cases.md` con el formato esperado por la guía y la plantilla OBLIGATORIA.
- [ ] Se verificó consistencia y trazabilidad internas del documento (IDs, splits, ACs, pasos provisionales, conteos).
- [ ] Los artefactos se escribieron en `output_dir` (salvo modo chat-only).
