# Paso 5: Revision de Trazabilidad

## Objetivo del Paso

Verificar la trazabilidad bidireccional entre cada Test Case, su Acceptance Criteria y el requisito de origen. Confirmar que cada Test Case mapea a un único AC (1:1 en lo posible, según el particionado del paso 02). Identificar Test Cases sin trazabilidad clara y reportarlos como pendientes, sin detener el flujo. No rediseñes nada en este paso; solo verificas.

## Modelo Recomendado

Un modelo estándar es suficiente: esta es una tarea de verificación de relaciones ya existentes, no de razonamiento profundo.

## Enfoque Exclusivo

Durante este paso tu unico objetivo es verificar trazabilidad bidireccional. No rediseñes Test Cases (paso 03), ni marques provisionales (paso 04), ni partas por AC ni cambies IDs (paso 02), ni generes el handoff JSON ni el documento de Test Cases todavía.

## Secuencia

1. Para cada Test Case, verifica:
   - `TEST-ID` presente y único en el índice del paso 02.
   - `Original ID` presente y preservado (incluidos los Test Case que son hijos de splits, donde `Original ID` debe ser el mismo del escenario original).
   - IDs derivados en splits siguen el patrón `{original_id}a`, `{original_id}b`, ... (eco de la verificación ya hecha en el paso 02; aquí no se corrigen IDs, se vuelve al paso 02 si hay inconsistencia).
   - `Acceptance Criteria cubierto` presente y mapea a un AC explícito en el documento de entrada.
   - `Suite / Área` presente y consistente con el documento de entrada.
2. Verifica la trazabilidad bidireccional:
   - Desde cada Test Case → su Acceptance Criteria.
   - Desde cada Acceptance Criteria del documento de entrada → al menos un Test Case que lo cubra.
3. Identifica y reporta:
   - Test Cases sin AC asociado (p. ej. porque el AC no se pudo inferir sin inventarlo).
   - Acceptance Criteria del documento de entrada sin Test Case que los cubra.
   - Test Cases sin `Original ID` o con IDs que no respetan el patrón de split (en cuyo caso se debe volver al paso 02 a corregir; este paso no corrige IDs).
4. Los hallazgos se recopilan en un listado de pendientes de trazabilidad que se reflejará en el documento de Test Cases (paso 06) y en el handoff JSON como `checks` y `counts`.
5. No detengas el flujo: los pendientes se documentan y se continúa al paso 06.

## Checklist de completitud

- [ ] Se verificó la presencia de `TEST-ID`, `Original ID`, `Acceptance Criteria cubierto` y `Suite / Área` en cada Test Case.
- [ ] Se verificó la consistencia de los IDs derivados en splits (eco de la verificación del paso 02).
- [ ] Se verificó la trazabilidad bidireccional Test Case ↔ Acceptance Criteria.
- [ ] Se identificaron los Test Cases sin AC asociado, los ACs sin Test Case que los cubra y los Test Cases sin `Original ID` o con IDs inconsistentes.
- [ ] Los pendientes de trazabilidad se recopilaron en un listado.
