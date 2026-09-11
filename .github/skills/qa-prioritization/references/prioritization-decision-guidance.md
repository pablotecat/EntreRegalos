# Guia de Decision de Priorizacion

## Evidencia

Para cada decision registra la fuente concreta y su nivel de confianza: `confirmada`, `parcial` o `ausente`. Una evidencia ausente no se sustituye por una suposicion; se transforma en GAP o decision pendiente.

## Riesgo y Prioridad

Evalua de forma separada los factores disponibles:

- Impacto: dano para usuarios, negocio, seguridad, datos o continuidad.
- Probabilidad: frecuencia esperada del fallo o fragilidad conocida.
- Alcance: usuarios, integraciones o flujos afectados.
- Detectabilidad: facilidad de detectar el fallo antes de que tenga impacto.

Clasifica la prioridad como `P0`, `P1`, `P2` o `P3`. Riesgo y esfuerzo permanecen **desacoplados**: el esfuerzo va como trade-off, no reduce la prioridad.

## Etiquetas

- `regression`: conjunto de tests que prueban un comportamiento establecido que debe verificarse de forma repetible tras cambios.
- `smoke`: subconjunto de tests de regresión de comprobacion pequeña y decisiva para detectar indisponibilidad o rotura critica antes de continuar con más pruebas.
- Ninguna: la prueba puede seguir siendo manual y prioritaria sin pertenecer a esos conjuntos.

## Automatizacion

Registra `AUTOMATE`, `MANUAL` o `POSIBLE` usando determinismo, estabilidad, observabilidad, coste de implementacion, mantenibilidad y retorno esperado. La automatizacion permanece **desacoplada** del riesgo: una prueba manual de alto riesgo conserva su prioridad y su lugar en la secuencia. POSIBLE son tests que no esté clara la posibilidad de implementación automatizada, se mantienen priorizados y pueden ejecutarse manualmente mientras se resuelve.

## Secuencia Manual

El orden se deriva de roles, datos, estados iniciales, integraciones y dependencias explicitas. Ejecuta primero las pruebas que establecen precondiciones reutilizables; dentro de los elementos disponibles, prioriza `P0` antes de `P1`, `P2` y `P3`. Si existen ciclos o prerequisitos ausentes, no inventes un orden: registra el bloqueo y la accion requerida.