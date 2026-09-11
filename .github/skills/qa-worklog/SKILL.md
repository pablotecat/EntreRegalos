---
name: qa-worklog
description: Construye el work-log de un workflow QA. Se aplica durante la ejecución de workflows QA o cuando se pide loguear/trazar la ejecución de un workflow QA.
---

## Log de Trabajo (traza incremental)

El work-log es **traza incremental de ejecución**. Se escribe siguiendo las instrucciones de `references/work-log-guidance.md` y la plantilla `references/assets/work-log-template.md`.

> El work-log es **traza incremental** para auditoría y handoff. Cada workflow QA define su propio conteo de pasos y nombres.

## Reglas

- Crear un log por ejecución del workflow, con el nombre `QA.<workflow>-work-log.md` (ej. `QA.documentation-work-log.md`).
- Estructura fija: una fila por paso del workflow, en orden. El conteo y los nombres de los pasos se toman del workflow que se esté ejecutando.
- Rellenar cada celda de la fila al cerrar ese paso, antes de avanzar al siguiente.
- No dejar celdas vacías: usar "N/A" o "none" cuando no aplique.

## Referencias

- `references/work-log-guidance.md` — guía de formato y reglas (DEBES seguirla).
- `references/assets/work-log-template.md` — plantilla canónica del formato de tabla.
