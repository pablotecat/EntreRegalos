# Plantilla de Log de Trabajo

Este es el formato canónico y único para `QA.documentation-work-log.md`. Referenciado desde `SKILL.md`.

## Objetivo

Registrar evidencia de ejecucion por paso del workflow para auditar decisiones y facilitar handoff.

IMPORTANTE: Antes de cada paso del workflow, registra la hora de inicio (HH:MM:ss) en el work-log. Al terminar cada paso, registra la hora de fin y el tiempo dedicado antes de pasar al siguiente paso.

## Reglas

- Crear un log por ejecucion del agente, usando la tabla de abajo como unico formato.
- Las filas son fijas: una fila por cada paso del workflow (01 a 05), en ese orden.
- No añadir, eliminar ni reordenar filas.
- Rellenar cada celda de la fila al cerrar ese paso, antes de avanzar al siguiente.
- No dejar celdas vacias: usar "N/A" o "none" cuando no aplique.
- Registrar hechos observables (horas, artefactos, decisiones), no opiniones.
- Si un paso queda bloqueado o parcial, documentarlo en "Comentarios / Bloqueos" y detener el avance hasta resolverlo o escalarlo.

## Formato

DEBES utilizar la estructura y formato de la plantilla `assets/work-log-template.md`, no es un ejemplo, es el formato OBLIGATORIO a seguir.

Estados permitidos (columna Estado):

- `in_progress`
- `completed`
- `blocked`
- `partial`


## Notas de columnas

- **Tiempo dedicado:** diferencia entre hora inicio y hora fin del paso, en minutos y segundos.
- **Checklist completado:** proporcion de items marcados frente al total del checklist de ese paso (ej. 5/5).
- **Skill usada:** nombre de las skills, instrucciones u otros recursos consultados o aplicados durante ese paso (ej. nombres de archivo o de skill); "N/A" si no se uso ninguno.
- **Artefactos generados:** rutas de archivos creados o actualizados durante ese paso.
- **Bloqueos:** motivo de bloqueo; "none" si no aplica.
- **Comentarios:** número de gaps o detalle de decisiones relevantes; "none" si no aplica.
