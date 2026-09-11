# Paso 2: Diseno de Suites

## Objetivo del Paso

Agrupar los requisitos y escenarios comprendidos en el Paso 1 en suites lógicas cohesivas por área funcional, definiendo identificador, nombre, descripción, complejidad y dependencias inter-suite estructurales (no orden de ejecución).

## Modelo Recomendado

Usa un modelo con buena capacidad de razonamiento y estructuración. La cohesión de cada suite condiciona la trazabilidad y la cobertura que se modelarán después.

## Enfoque Exclusivo

Durante este paso tu unico objetivo es diseñar suites cohesivas.

## Secuencia

1. Agrupa los requisitos en suites por área funcional (ej: "Auth Suite", "Registration Suite").
2. Define cada suite con: `suite_id`, `name`, `description`, `complexity` (LOW/MEDIUM/HIGH), y lista de `requirements` origen.
3. Define los escenarios dentro de cada suite: cada escenario debe contener sólo el ID y NOMBRE de un test (`id`, `title`).
4. Lista las dependencias inter-suite estructurales (`suite_dependencies`): qué suite depende de qué (estríctamente informativo).
5. Estima `estimated_total_duration_seconds` por suite como dato estrictamente informativo.

## Checklist de completitud

- [ ] Las suites son cohesivas por área funcional.
- [ ] Cada suite tiene `suite_id` único, `name`, `description`, `complexity` y lista de `requirements` origen.
- [ ] Cada escenario dentro de una suite es un ID y NOMBRE de test (sin pasos).
- [ ] Las dependencias inter-suite estructurales están mapeadas (sin prescribir orden).
