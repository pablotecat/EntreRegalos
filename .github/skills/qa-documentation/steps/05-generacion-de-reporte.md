# Paso 5: Generacion de Reporte

## Objetivo del Paso

Generar el reporte markdown final del analisis y persistirlo correctamente, tras una revision de consistencia interna. Este paso produce el entregable principal del workflow.

## Modelo Recomendado

Usa el modelo de razonamiento mas potente disponible. Este paso produce el entregable final que otros agentes consumiran sin acceso a la fuente original: exige maxima precision y consistencia.

## Enfoque Exclusivo

Durante este paso tu ÚNICO objetivo es ensamblar, validar y persistir el entregable final.

## Resolución de output

Esta skill resuelve el directorio de salida (`output_dir`) así:

1. **Path explícito en la invocación**: si el usuario o el agente invocador indica un destino (patrones como `to <path>`, `save [to] <path>`, `en <path>`), úsalo como `output_dir`.
2. **Default**: en caso contrario o error, `output_dir` = `./.qa-tmp/qa-documentation/<timestamp>/` (relativo al cwd del workspace; `<timestamp>` en ISO8601 compacto `YYYYMMDD-HHMMSS`).
3. Si el usuario pide explícitamente no generar documentación, en lugar de generarla escríbela en el chat.

## Secuencia

1. Genera `QA.documentation-analysis-report.md` siguiendo la guía `references/analysis-report-guidance.md` de esta skill.
2. Revisa la consistencia y trazabilidad internas del reporte (requisitos, gaps, agrupamiento por area, conteos por area/endpoint, estado del analisis).

## Restricciones operativas

- Trabaja sobre los requisitos, gaps y agrupamiento producidos en los pasos 01–04. Si detectas un faltante en este punto, regístralo como "decisión pendiente" en el reporte (sección Notas de Cierre) y continúa.
- La estructura y el nombre del reporte markdown: siguen la guía `references/analysis-report-guidance.md`.

## Guardarrailes de calidad

🛑 **Registro de conservación**:
- Antes de cerrar el paso, verifica: `count_requisitos_extracción == count_requisitos_reporte` y `count_gaps_extracción == count_gaps_reporte`. Si hay diferencia, el paso está **bloqueado**.
- Prohibido silently drop: ningún requisito ni gap puede quedar sin destino documentado (pista: si falta, vuelve al Paso 3 y crea la área "Miscelánea").

🛑 **CRITICAL nunca desaparece**:
- Todo gap CRITICAL generado en el Paso 2 debe figurar en el reporte. Si alguno no aparece, el reporte no pasa la puerta de calidad.
- La severidad asignada en el Paso 2 es inmutable: no promuevas ni degradues en el reporte.

🛑 **Veracidad de auditorías**:
- Si se te pide auditoría o desglose, usa **exclusivamente** la lista real de requisitos extraídos.
- Prohibido inventar conteos, ratios, granularidades intermedias o fabricar sub-IDs no presentes en la extracción.
- Si no recuerdas el conteo exacto, di "no tengo el conteo en memoria" en lugar de inventar.

🛑 **Métricas honestas**:
- Los counts (requirements, gaps, áreas, endpoints) del reporte deben coincidir con el conteo **real de extracción**, no con el de la agregación.

## Checklist de completitud

- [ ] Se generó `QA.documentation-analysis-report.md` con el formato esperado.
- [ ] count_requisitos_reporte == count_requisitos_extracción (Paso 1) — gate de conservación superado.
- [ ] count_gaps_reporte == count_gaps_extracción (Paso 2) — todos los gaps figuran, sin silently drop.
- [ ] Todo gap CRITICAL del Paso 2 aparece en el reporte (puerta de calidad superada).
- [ ] Ninguna severidad fue reasignada (inmutabilidad de Paso 2 respetada).
- [ ] Estado del análisis y counts por área/endpoint son internamente consistentes y reflejan la extracción real (no la agregación).
