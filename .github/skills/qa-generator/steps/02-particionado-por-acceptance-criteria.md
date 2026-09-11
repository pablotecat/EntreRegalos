# Paso 2: Particionado por Acceptance Criteria (con verificación de IDs en el origen)

## Objetivo del Paso

Para cada escenario del documento de entrada (o cada Acceptance Criteria en modo no-planning), definir un Test Case independiente. Si un escenario cubre más de un Acceptance Criteria, splitear en N Test Cases derivando IDs hijo y preservando el Original ID. Verificar en este paso, en el origen del split, que el Original ID queda preservado y los IDs derivados siguen el patrón esperado. No redactar pasos todavía.

## Modelo Recomendado

Usa un modelo con buena capacidad de razonamiento y estructuración. La asignación 1 AC por Test Case condiciona la trazabilidad y el marcaje de provisionales posteriores.

## Enfoque Exclusivo

Durante este paso tu unico objetivo es particionar por Acceptance Criteria y verificar IDs en el origen del split. No redactes pasos Given/When/Then (paso 03), ni marques provisionales (paso 04), ni revises trazabilidad global (paso 05).

## Secuencia

1. Para cada escenario del documento de entrada (o cada AC en modo no-planning), define un Test Case provisional con:
   - `TEST-ID` (igual al ID del escenario en modo planning-done; derivado como `{original_id}a`, `{original_id}b` si hay split).
   - `Title` (puede renombrarse respecto al title del documento de entrada si describe mejor el objetivo del test).
   - `Original ID` (ID original del documento de entrada, preservado siempre).
   - `Acceptance Criteria cubierto` (uno solo por Test Case en lo posible).
   - `Suite / Área` (suite del planning-done, o área funcional en modo no-planning).
2. Si un escenario cubre más de un Acceptance Criteria N, splitear en N Test Cases:
   - Cada Test Case cubre exactamente un AC.
   - Los IDs derivan como `{original_id}a`, `{original_id}b`, ..., respetando el orden de los ACs.
   - El `Original ID` se conserva en todos los Test Case hijos (mismo valor `{original_id}`).
3. **Verificación de IDs en el origen del split (este paso, no posterior):**
   - Confirma que `Original ID` está presente en cada Test Case (incluidos los no-splitados y los hijos del split).
   - Confirma que los IDs derivados en splits siguen estrictamente el patrón `{original_id}a`, `{original_id}b`, ... (sin saltos de letras, sin numeración distinta).
   - Si la verificación falla: corrige en este mismo paso. NO pases al paso 03 con IDs inconsistentes. NO se reabren pasos posteriores para corregir IDs.
4. Registra un índice de pares `[TEST-ID, Original ID, Acceptance Criteria cubierto, Suite/Área]` para usar en el paso 05 (Revisión de Trazabilidad).
5. Si no es posible partir un escenario por falta de ACs explícitos, márcalo como GAP preliminar y déjalo pendiente de resolución (no redactar pasos sin AC).

## Checklist de completitud

- [ ] Cada escenario del documento de entrada (o cada AC en modo no-planning) tiene al menos un Test Case provisional asignado.
- [ ] Un Test Case cubre un único Acceptance Criteria en lo posible.
- [ ] Los escenarios que cubren N>1 AC se han spliteado en N Test Cases con IDs `{original_id}a`, `{original_id}b`, ...
- [ ] `Original ID` está presente y preservado en todos los Test Case (incluidos los no-splitados y los hijos).
- [ ] Los IDs derivados siguen estrictamente el patrón `{original_id}a`, `{original_id}b`, ... (verificado en este paso).
- [ ] Se registró el índice de pares `[TEST-ID, Original ID, Acceptance Criteria cubierto, Suite/Área]`.
- [ ] Los escenarios sin ACs explícitos se han marcado como GAP preliminar.
