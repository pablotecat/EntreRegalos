# Paso 4: Definicion de Precondiciones

## Objetivo del Paso

Definir por suite las precondiciones estructurales: estado inicial, datos y configuración necesarios para ejecutar los escenarios de la suite. Queda fuera de este paso cualquier orden de ejecución.

## Modelo Recomendado

Un modelo estándar es suficiente: esta es una tarea de documentación estructural más que de razonamiento profundo.

## Enfoque Exclusivo

Durante este paso tu unico objetivo es definir precondiciones estructurales.

## Secuencia

1. Por cada suite, define la precondición estructural en formato `prerequisite` (qué estado inicial se requiere: servidor corriendo, dataset vacío, usuario autenticado, etc.).
2. Estima `estimated_duration_seconds` por escenario como dato estrictamente informativo.
3. Documenta, si aplica, el state sharing estructural dentro de la suite (qué datos persisten entre escenarios de una misma suite).
4. Documenta las relaciones entre suites como **estructurales** (dependencias, datos compartidos). El orden de ejecución y los tiers Smoke/Regresión/Exploratory son responsabilidad del usuario; aquí no entrar.
5. Si una suite prerevisa de otra, regístralo como `suite_dependency` (qué suite), nunca como "primero/segundo".


## Checklist de completitud

- [ ] Cada suite tiene su `prerequisite` estructural documentado.
- [ ] Las duraciones por escenario y por suite están estimadas como dato informativo.
- [ ] Se documentó el state sharing estructural dentro de la suite (si aplica).
- [ ] Las relaciones inter-suite están documentadas como estructurales (sin orden ni tiers).

