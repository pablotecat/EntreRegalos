# Especificación de Handoff para QA

## Objetivo

Este contrato define el formato del handoff JSON que todo agente QA produce al finalizar su ejecución. El handoff es un **recibo mínimo de validación** — no un payload de contenido.

## Principios

- **Recibo mínimo:** el JSON solo contiene lo necesario para validar la ejecución. Todo el contenido sustantivo vive en el Markdown de trabajo (`summary_md`) y el log de ejecución (`work_log_md`).
- **Hechos, no juicios:** el agente productor reporta hechos observables (`assigned_task`, `work_performed`, `checks`, `counts`). Nunca autoevalúa si cumplió el alcance — eso lo decide quien consume el handoff.
- **Inmutabilidad:** una vez generado y persistido, un handoff no se modifica.

## Schema canónico

La definición autoritativa de tipos, campos requeridos y restricciones vive en `handoff-schema.json`. Este documento es un resumen orientativo; en caso de conflicto, el schema prevalece.

## Estructura del Handoff JSON

```json
{
  "handoff": {
    "agent": "nombre_del_agente_productor",
    "session_id": "uuid",
    "timestamp": "ISO8601",
    "status": "completed|blocked|partial",
    "assigned_task": {
      "task_id": "identificador de la tarea recibida",
      "scope_received": "eco textual de lo que el agente entendió que se le pedía"
    },
    "work_performed": {
      "sections_touched": ["secciones completadas del documento de trabajo"],
      "sections_untouched": ["secciones pendientes o no aplicables"]
    },
    "checks": {},
    "counts": {},
    "summary_md": "ruta al markdown de trabajo del agente",
    "work_log_md": "ruta al log de ejecución del agente"
  }
}
```

### Notas sobre los campos

- **`agent`**: nombre del agente productor. Patrón: `^[a-z][a-z0-9_]{2,30}$`.
- **`status`**: `completed` si se procesó todo el alcance recibido; `blocked` si un bloqueador impidió terminar; `partial` si se completó solo parte del alcance sin bloqueador.
- **`assigned_task.scope_received`**: eco fiel de la instrucción recibida, sin juicio de cumplimiento.
- **`checks`**: mapa de booleanos con validaciones objetivas del agente. Las claves las define cada agente según lo que verifique.
- **`counts`**: mapa de enteros (≥ 0) con conteos objetivos del agente. Las claves las define cada agente según lo que cuente.
- **`summary_md`** y **`work_log_md`**: rutas a archivos ya generados y persistidos.
