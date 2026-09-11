# Guia de Reporte de Priorizacion

Genera `prioritization-report.md`, el documento consolidado de decisiones de priorizacion. El reporte contiene evidencia y decisiones detalladas; el handoff, cuando exista, solo registra comprobaciones objetivas y rutas a artefactos.

## Nombre de Archivo de Salida Requerido

- `prioritization-report.md`

## Estructura Requerida

DEBES utilizar la estructura y formato de `assets/prioritization-report-template.md`. La plantilla es el formato OBLIGATORIO, no un ejemplo.

## Secciones Base

1. Resumen Ejecutivo
2. Evidencia de Entrada y Confianza
3. Matriz de Riesgo y Prioridad
4. Etiquetas Smoke y Regression
5. Seleccion de Automatizacion
6. Plan de Ejecucion Manual
7. Bloqueadores y Decisiones Pendientes
8. Notas de Cierre para Revision Humana
9. Artefactos Generados
10. Checklist de Consistencia

## Reglas de Contenido

- Cada prioridad debe tener evidencia y rationale, o declararse `PENDIENTE` con la informacion necesaria para resolverla.
- Smoke y regression se muestran como listas colapsadas independientes, ordenadas por prioridad de `P0` a `P3`. No es necesario mostrar los criterios de seleccion en esas listas.
- La automatizacion se muestra como listas colapsadas en este orden: `AUTOMATE`, `POSIBLE`, `MANUAL`.
- El plan manual se muestra como grupos colapsados ordenados por dependencias. Cada grupo incluye su prerequisito y una lista de tests.
- El orden manual debe mostrar prerequisitos y bloqueadores. No debe inventar una secuencia para ciclos o dependencias ausentes.
- Los elementos manuales de alto riesgo permanecen visibles en la matriz y en el plan manual cuando sus prerequisitos lo permitan.
- Las decisiones detalladas viven en este reporte. El handoff solo contiene hechos objetivos, conteos y rutas.

## Plantilla y Ejemplo

- Ver [template full output](./assets/prioritization-report-template.md)
- Ver [example full output](./assets/prioritization-report-example.md)

## Puerta de Calidad

Antes de dar la tarea por finalizada, confirmar:

- [ ] Estan presentes los metadatos y las 10 secciones base.
- [ ] Cada elemento evaluable tiene prioridad o limitacion documentada.
- [ ] Las listas de smoke y regression estan colapsadas y ordenadas por prioridad.
- [ ] La lista de automatizacion esta agrupada como AUTOMATE, POSIBLE y MANUAL.
- [ ] Los grupos del plan manual estan colapsados y ordenados por dependencias.
- [ ] La secuencia manual respeta los prerequisitos conocidos y separa bloqueos.
- [ ] Los conteos y comprobaciones del handoff, si existe, coinciden con el reporte.