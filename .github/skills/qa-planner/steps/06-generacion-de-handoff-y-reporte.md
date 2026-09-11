# Paso 6: Generacion de Reporte

## Objetivo del Paso

Generar el reporte markdown `QA.planner-execution-summary.md` y persistirlo correctamente.

## Modelo Recomendado

Usa el modelo de razonamiento mas potente disponible. Este paso produce el entregable final que otros agentes consumiran sin acceso a la fuente original: exige maxima precision y consistencia.

## Enfoque Exclusivo

Durante este paso tu unico objetivo es ensamblar, validar y persistir el entregable final. No diseñes nuevas suites ni replantees cobertura, precondiciones o trazabilidad.

## Resolución de output

Esta skill resuelve el directorio de salida (`output_dir`) así:

1. **Path explícito en la invocación**: si el usuario o el agente invocador indica un destino (patrones como `to <path>`, `save [to] <path>`, `en <path>`), úsalo como `output_dir`.
2. **Default**: en caso contrario o error, `output_dir` = `./.qa-tmp/qa-planner/<timestamp>/` (relativo al cwd del workspace; `<timestamp>` en ISO8601 compacto `YYYYMMDD-HHMMSS`).
3. Si el usuario pide explícitamente no generar el reporte, en lugar de generarla escríbela en el chat.

## Secuencia

1. Genera `QA.planner-execution-summary.md` siguiendo la guía `references/planner-report-guidance.md` de esta skill.
2. Revisa la consistencia y trazabilidad internas del reporte (suites, escenarios, requisitos cubiertos, porcentaje de cobertura, estado del plan): `work_performed`, `checks`, `counts` deben ser internamente consistentes en el markdown.

## Registro de bloqueos en pasos anteriores

### Bloqueos por documentación insuficiente
- Documenta el bloqueo en el reporte `QA.planner-execution-summary.md`, sección "Notas de Cierre para Revisión Humana → Decisiones Pendientes", indicando que el estado del resultado es `blocked` o `partial`.
- Especifica en esa misma sección qué no se pudo completar (equivalente a `work_performed.sections_untouched`), para que el usuario decida cómo obtener más contexto.

### Bloqueos por cobertura imposible
- Justifica la decisión en el reporte `QA.planner-execution-summary.md`, sección "Notas de Cierre para Revisión Humana → Decisiones Pendientes", dejando el estado del resultado como `partial`.

## Checklist de completitud

- [ ] Se generó `QA.planner-execution-summary.md` con el formato esperado por la guía.
- [ ] Los counts (suites/escenarios/requisitos cubiertos/porcentaje de cobertura) del reporte son internamente consistentes y el estado del plan queda reflejado en el reporte.
