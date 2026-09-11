---
name: qa-handoff-creation
description: "Skill compartida para generar el handoff JSON minimo de cualquier agente productor QA."
disable-model-invocation: true
argument-hint: "nombre del agente productor, session id, y rutas de summary_md/work_log_md ya generados"
user-invocable: false
compatibility: 
  - agents: [QA.documentation, QA.generator, QA.planner, QA.prioritization]
---

# Skill de Creacion de Handoff

Genera el handoff JSON minimo de cualquier agente productor QA. Esta skill es compartida: no pertenece a un agente en particular, se referencia parametrizando `{agent}` con el nombre del agente que la invoca (ej. `QA.documentation`).

> **Opcionalidad:** esta skill NO es prerrequisito de ningún workflow. Las skills de workflow (`qa-documentation`, `qa-generator`, `qa-planner`) generan su reporte markdown de forma autónoma; el handoff JSON solo se crea si el invocador (agente o usuario) decide llamar a esta skill una vez cerrado el workflow.

> Nota: el handoff es un recibo minimo de validacion para quien consume el resultado del agente, no un payload de contenido. Todo el contenido de trabajo vive en el markdown de resumen del agente (`summary_md`), no en este JSON.

## Nombre del Handoff JSON

El nombre del archivo no debe incluir el agente destino. Solo debe identificar al agente productor y la fecha-hora de generacion.

Patron: `{agent}-handoff-{timestamp}.json` — definido en esta skill.

## Formato minimo de salida

```
./tests/Documentation/sessions/session_{session_N}_{session_id}/
└── QA-{agent}-agent/
    ├── {agent}-handoff-{timestamp}.json
    ├── {agent}-analysis-report.md (o el nombre de resumen definido por rol)
    └── {agent}-work-log.md
```

## Campos Requeridos

Los tipos, patrones y reglas exactas viven en `assets/handoff-schema.json` (fuente canonica). Resumen de proposito de cada campo:

- `agent`: nombre del agente productor.
- `session_id`: identificador uuid de la sesion.
- `timestamp`: fecha-hora ISO8601 de generacion del handoff.
- `status`: `completed`, `blocked` o `partial`.
- `assigned_task.task_id`: identificador de la instruccion o tarea recibida.
- `assigned_task.scope_received`: eco textual de lo que el agente entendio que se le pedia.
- `work_performed.sections_touched`: secciones del documento de trabajo que se completaron.
- `work_performed.sections_untouched`: secciones que no aplicaban o quedaron pendientes.
- `checks`: mapa de booleanos con validaciones objetivas propias del agente.
- `counts`: mapa de conteos objetivos propios del agente.
- `summary_md`: ruta al markdown de trabajo completo del agente.
- `work_log_md`: ruta al log de ejecucion por paso del agente.

## Ejemplo Completo

- Ver [example handoff](./assets/example-handoff.json)

> Nota: las claves concretas dentro de `checks` y `counts` en el ejemplo (`gherkin_format_valid`, `requirements`, etc.) son ilustrativas, no un catalogo fijo: cada agente define las suyas propias segun lo que objetivamente haya verificado o contado.

## Handoff de Priorizacion

Cuando el productor sea `QA.prioritization`, usa `prioritization-report.md` como `summary_md`. El detalle de riesgo, etiquetas, automatizacion y secuencia manual vive exclusivamente en ese reporte.

Las claves objetivas recomendadas son:

- `checks`: `all_evaluable_items_classified`, `dependencies_checked`, `manual_sequence_consistent`, `report_consistent_with_counts`.
- `counts`: `items_evaluated`, `priority_pending`, `smoke_tagged`, `regression_tagged`, `automation_candidates`, `manual_items`, `possible_items`, `blocked_sequence_items`.

## Pasos de Creacion

1. Con el documento de trabajo (`summary_md`) y el log de ejecucion (`work_log_md`) ya generados y persistidos, crea el handoff JSON siguiendo `assets/handoff-specification.md` y validando contra `assets/handoff-schema.json`.
2. Reporta solo hechos objetivos (`assigned_task`, `work_performed`, `checks`, `counts`). Nunca incluyas aqui un juicio propio de cumplimiento de alcance: eso lo decide quien consume el handoff.
3. Usa el nombre de archivo definido en esta skill, sustituyendo `{agent}` por tu propio nombre de agente.
4. Persiste el archivo en la subcarpeta `QA-{agent}-agent/` dentro de la carpeta de sesion correspondiente, junto al resumen y al log de trabajo.
5. Actualiza `./tests/Documentation/HANDOFF_Summary.md` con la entrada del handoff recién generado (agente productor, `session_id`, `timestamp`, `status`, rutas a `summary_md`/`work_log_md`).

## Puerta de Calidad

Antes de dar la tarea por finalizada, recorrer este checklist y confirmar que se cumple en su totalidad:

- [ ] El nombre de archivo sigue el patron `{agent}-handoff-{timestamp}.json`.
- [ ] Estan presentes todos los campos requeridos por `assets/handoff-schema.json`.
- [ ] `assigned_task.scope_received` es un eco fiel de la instruccion recibida, sin juicio de cumplimiento propio.
- [ ] `work_performed` refleja exactamente las secciones tocadas en `summary_md`.
- [ ] `checks` y `counts` son hechos objetivos, no interpretaciones.
- [ ] `summary_md` y `work_log_md` apuntan a archivos ya generados y persistidos.
- [ ] Se actualizo `./tests/Documentation/HANDOFF_Summary.md` con la entrada del handoff.

Si algun punto no se cumple, la tarea no debe marcarse como finalizada.
