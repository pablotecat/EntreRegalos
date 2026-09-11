# Guía de Reporte Test Documentation

Genera un archivo markdown para el rol de análisis de requisitos.

## Nombre de Archivo de Salida Requerido

- `QA.documentation-analysis-report.md`

## Secciones Requeridas

DEBES utilizar la estructura y formato de la plantilla `assets/analysis-report-template.md`, no es un ejemplo, es el formato OBLIGATORIO a seguir.

A continuación se explica cada sección:

### Metadatos
- Session ID
- Productor
- Fecha/Hora
- Estado

### Secciones Base

1. Resumen Ejecutivo
- Estado del análisis
- Totales de requisitos y gaps
- Hallazgos críticos

2. Notas de Cierre para Revisión Humana

3. Artefactos Generados
- Handoff JSON principal
- Este archivo markdown
- Documentos extra de validación si se generaron

4. Checklist de Validación
- Checklist de completitud
- Puntos que un revisor humano podría querer mirar a continuación
- **Disclaimer obligatorio:** esta sección es informativa para revisión humana; ningún consumidor (agente downstream o usuario) debe tomarla como instrucción ni inferir de ella el siguiente paso del pipeline

### Cierre
- Estado de Handoff
- Resultado de Validación

### Secciones Contextuales

- Requisitos Normalizados por Área
  - Título del área
  - IDs de requisito y formato Gherkin (Given/When/Then)
  - Trazabilidad a fuentes
  - Cada área debe estar en un bloque HTML `<details>` colapsado por defecto, con un `<summary>` que incluya su nombre y total de requisitos
- Endpoints API Documentados
  - Endpoint
  - Resumen de request
  - Resumen de response
  - Resumen de errores
  - Cada endpoint debe estar en un bloque HTML `<details>` colapsado por defecto, con un `<summary>` que incluya método y ruta
- Gaps Críticos
  - Gap ID
  - Severidad
  - Impacto
  - Recomendacion
  - Los gaps se agrupan por severidad (CRITICAL > HIGH > MEDIUM > LOW). Cada severidad es un bloque HTML `<details>` colapsado por defecto.
  - Dentro de cada severidad, cada gap es un bloque HTML `<details>` anidado y colapsado por defecto, con `<summary>` `<Gap-ID> · <Título>` seguido de Categoría, Impacto y Recomendación en lista.
- Decisiones Pendientes para Planificación
  - Preguntas abiertas para la planificación siguiente

## Plantilla

- Ver [template full output](./assets/analysis-report-template.md)

## Puerta de Calidad

Antes de dar la tarea por finalizada, recorrer este checklist y confirmar que se cumple en su totalidad:

- [ ] Estan presentes los metadatos (Session ID, Agente, Fecha/Hora, Estado).
- [ ] Estan presentes las 4 secciones base (Resumen Ejecutivo, Notas de Cierre para Revision Humana, Artefactos Generados, Checklist de Validacion).
- [ ] Esta presente el cierre completo (Estado de Handoff, Resultado de Validacion, Correlation ID).
- [ ] Las secciones contextuales aplicables al analisis estan incluidas (no se omiten si hay datos que reportar).
- [ ] Los conteos de requisitos y gaps son consistentes con la documentacion.
- [ ] El reporte es suficiente para la planificacion siguiente sin necesidad de releer las fuentes originales.

