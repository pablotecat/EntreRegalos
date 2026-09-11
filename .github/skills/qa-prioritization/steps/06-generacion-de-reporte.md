# Paso 6: Generacion de Reporte

## Objetivo del Paso

Consolidar y persistir un reporte de priorizacion consistente con las decisiones tomadas.

## Enfoque Exclusivo

Ensambles y verifiques el entregable; reabres las evaluaciones anteriores solo cuando detectes una inconsistencia concreta entre ellas y el reporte.

## Resolucion de output

1. Usa el directorio indicado mediante `to <path>`, `save [to] <path>` o `en <path>` cuando exista.
2. Para `preview` o `no-save`, entrega el reporte en chat sin crear archivos.
3. En cualquier otro caso usa `./.qa-tmp/qa-prioritization/<timestamp>/` como `output_dir`.

## Secuencia

1. Genera `prioritization-report.md` siguiendo `references/prioritization-report-guidance.md` y la plantilla obligatoria `references/assets/prioritization-report-template.md`.
2. Comprueba que cada elemento, conteo y decision del reporte es consistente con los pasos 01 a 05.
3. Cuando el invocador requiera handoff, registra solo hechos objetivos, conteos y las rutas al reporte y al work log del invocador (si existe, p. ej. `skills/qa-worklog`).

## Checklist de completitud

- [ ] El reporte usa el nombre y las secciones exigidos.
- [ ] Las decisiones detalladas viven en el reporte, no duplicadas en el handoff.
- [ ] La secuencia manual y los bloqueos son consistentes con los prerequisitos inventariados.