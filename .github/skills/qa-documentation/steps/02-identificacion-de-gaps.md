# Paso 2: Identificacion de Gaps

## Objetivo del Paso

Revisar los requisitos extraidos y determinar de forma rigurosa que informacion falta o es ambigua, clasificando cada gap por severidad.

## Modelo Recomendado

Usa un modelo con buena capacidad de razonamiento y juicio critico. La calidad de esta clasificacion condiciona que gaps se escalan como bloqueantes mas adelante.

## Enfoque Exclusivo

Durante este paso tu ÚNICO objetivo es detectar y clasificar gaps.

## Secuencia

1. Revisa uno a uno los requisitos extraidos en el Paso 1.
2. Determina que requisitos estan incompletos, son ambiguos o carecen de criterios de aceptacion.
3. Clasifica cada gap detectado por severidad (CRITICAL, HIGH, MEDIUM, LOW).
4. Documenta el impacto y una recomendacion breve por cada gap.

## Guardarrailes de calidad

🛑 **Severidad inmutable**:
- La severidad que asignas aquí es **definitiva**. No puedes promover un HIGH a CRITICAL ni degradar un CRITICAL a HIGH en pasos posteriores.
- No descartes gaps: todo gap identificado aquí debe figurar en el reporte final con su ID original.


## Checklist de completitud

- [ ] Se revisaron los requisitos extraidos en el paso anterior.
- [ ] Se identificaron requisitos faltantes o ambiguos.
- [ ] Cada GAP identificado tiene severidad asignada (CRITICAL, HIGH, MEDIUM o LOW).
- [ ] Cada gap tiene severidad asignada sabiendo que NO se podrá reasignar en pasos posteriores (inmutable).
