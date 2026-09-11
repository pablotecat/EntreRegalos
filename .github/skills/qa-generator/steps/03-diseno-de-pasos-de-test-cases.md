# Paso 3: Diseno de Pasos de Test Cases (Fase Critica)

## Objetivo del Paso

Para cada Test Case definido en el paso 02, redactar los Prerrequisitos y una secuencia numerada de pasos en formato Given/When/Then. Los pasos previos (Given/When) NO llevan Resultado Esperado inline. El ÚLTIMO paso es obligatoriamente un Then cuyo Expected Result es el resultado nuclear del Test Case (anatomía B). Si un paso no está claro por falta de definición, escríbelo provisionalmente pero NO lo marques aquí: el marcaje de PROVISIONAL es el paso 04.

## Modelo Recomendado

Usa el modelo de razonamiento mas potente disponible. Es la fase critica de detalle: prioriza exhaustividad y precisión de la secuencia de pasos sobre velocidad.

## Enfoque Exclusivo

Durante este paso tu unico objetivo es redactar pasos de Test Cases. No marques provisionales (paso 04), ni revises trazabilidad global (paso 05), ni generes el handoff JSON ni el documento de Test Cases todavía. Sólo redactas pasos; si detectas que un paso no está claro, lo escribes provisionalmente y dejas el marcaje explícito para el paso 04.

## Secuencia

Para cada Test Case del índice del paso 02:

1. Define los **Prerrequisitos** como una lista (estado inicial, datos, configuración necesarios antes de ejecutar el Test Case).
2. Define la secuencia de **pasos numerados** en formato Given/When/Then:
   - Paso 1: `Given {estado inicial/contexto del paso}` (puede incluir varios `Given` si conviene).
   - Pasos intermedios: `When {acción realizada}`. Pueden aparecer varios `When` si la acción lo requiere.
   - Último paso: OBLIGATORIAMENTE `Then {verificación final} → Expected Result (nuclear): {resultado nuclear del Test Case}`.
3. Pasos previos (todos los `Given` y `When`) NO llevan Resultado Esperado inline. Solo el último `Then` lleva el Expected Result nuclear dentro de sí (anatomía B).
4. Mantiene la trazabilidad test↔AC en cada Test Case (campo `Acceptance Criteria cubierto` ya fijado en el paso 02).
5. Si un paso no está claro por falta de definición:
   - Escribe una acción provisional razonable (qué crees que debería hacerse según el contexto disponible).
   - NO marques el paso como PROVISIONAL en este paso; el marcaje explícito con motivo va en el paso 04. Aquí sólo escribes la acción provisional y sigues.
   - No te detengas: avanza al siguiente paso o al siguiente Test Case.
6. Respeta el `Original ID` y los IDs derivados ya fijados en el paso 02: no los renombres ni los rederivados aquí.

## Checklist de completitud

- [ ] Para cada Test Case se definieron los Prerrequisitos.
- [ ] Cada Test Case tiene una secuencia numerada de pasos Given/When/Then.
- [ ] Los pasos previos (Given/When) NO llevan Resultado Esperado inline.
- [ ] El último paso es un Then con su Expected Result (nuclear) dentro de sí.
- [ ] Se mantuvo el campo `Acceptance Criteria cubierto` por Test Case (del paso 02).
- [ ] Los pasos no claros se escribieron como acción provisional (sin marcar todavía).
- [ ] Los `Original ID` y los IDs derivados no se renombraron ni rederivados aquí.
