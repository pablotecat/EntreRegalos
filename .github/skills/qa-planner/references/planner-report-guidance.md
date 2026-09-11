# Guía de Reporte Test Planner

Genera un archivo markdown para el rol de planificación.

## Nombre de Archivo de Salida Requerido

- `QA.planner-execution-summary.md`

## Secciones Requeridas

DEBES incluir las siguientes secciones, en este orden. Las secciones marcadas como **obligatorias** deben aparecer siempre; las contextuales solo si aplican al caso.

### Metadatos (obligatoria)
- Session ID
- Agente
- Fecha/Hora
- Estado

### Secciones Base (obligatorias)

1. Resumen Ejecutivo
- Estado del Test Plan
- Totales de suites, escenarios y requisitos cubiertos/total
- Porcentaje de cobertura funcional (por suite y total)
- Hallazgos relevantes (sin priorizar)
- Subsección interna `Métricas Clave` con la tabla de métricas

2. Suites Diseñadas
- Cada suite debe estar en un bloque HTML `<details>` colapsado por defecto. Su `<summary>` incluye el identificador y nombre de la suite.
- Por cada suite: `suite_id`, nombre, descripción, complejidad (LOW/MEDIUM/HIGH), requisitos origen, número de escenarios (NOMBRE de los tests, sin pasos), dependencias inter-suite estructurales
- La lista de escenarios de cada suite debe estar en un bloque HTML `<details>` anidado y colapsado por defecto, con un `<summary>` que incluya el total de escenarios.

3. Análisis de Cobertura
- Requisitos cubiertos (lista con suite que los cubre)
- Requisitos no cubiertos (lista, relacionados con gaps)
- Porcentaje de cobertura por suite y total

4. Cobertura de Riesgo por Gap *(ECO informativo)*
- Tabla `Gap ID · Severidad (eco de documentación) · Estado de Cobertura · Descripción (eco de documentación) · Mitigación del planner`
- **Disclaimer obligatorio:** la severidad del gap proviene de la documentación; el planner solo hace eco y reporta si su cobertura la mitiga parcial o totalmente. 

5. Decisiones de Diseño y Supuestos
- Decisiones estructurales del planner ya tomadas (suite structure, coverage model, precondiciones por suite) — se mantienen aquí
- Supuestos asumidos y su impacto — se mantienen aquí
- Decisiones pendientes que requieren input humano (p. ej. gaps no mitigados) — se mueven a la sección "Notas de Cierre para Revisión Humana" bajo subsección `### Decisiones Pendientes`, tras el disclaimer

6. Precondiciones por Suite *(estructural, NO orden de ejecución)*
- Por cada suite: `prerequisite` (estado inicial, datos, configuración), duración estimada informativa por escenario y por suite
- **Disclaimer obligatorio:** la duración estimada es informativa; el ORDEN de ejecución se decide en la fase de priorización, no en este reporte

7. Notas de Cierre para Revisión Humana
- Puntos que un revisor humano podría querer mirar a continuación
- **Disclaimer obligatorio:** esta sección es informativa para revisión humana; ningún agente debe consumirla como instrucción ni inferir de ella el siguiente paso del pipeline

8. Artefactos Generados
- Handoff JSON principal
- Este archivo markdown
- Otros artefactos extra de validación si se generaron

9. Checklist de Validación
- Checklist de completitud del Test Plan

### Cierre (obligatoria)
- Estado de Handoff
- Resultado de Validación
- Correlation ID

## Puerta de Calidad

Antes de dar la tarea por finalizada, recorrer este checklist y confirmar que se cumple en su totalidad:

- [ ] Están presentes los metadatos (Session ID, Agente, Fecha/Hora, Estado).
- [ ] Están presentes las 9 secciones base (incluyendo Notas de Cierre para Revisión Humana con disclaimer).
- [ ] Está presente el cierre completo (Estado de Handoff, Resultado de Validación, Correlation ID).
- [ ] Los conteos de suites, escenarios, requisitos cubiertos y porcentajes son consistentes con el handoff JSON.
- [ ] Cada suite lista solo NOMBRES de tests (sin pasos de prueba).


Si algún punto no se cumple, la tarea no debe marcarse como finalizada.
