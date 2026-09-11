# Paso 2: Inventario y Prerrequisitos

## Objetivo del Paso

Construir el conjunto evaluable y las relaciones necesarias para secuenciar ejecucion manual.

## Enfoque Exclusivo

Normalizas identificadores y relaciones existentes; conservas el diseno y el contenido de las pruebas tal como vinieron en la evidencia.

## Secuencia

1. Lista cada suite, caso o escenario evaluable con su identificador y fuente.
2. Conserva requisitos, riesgos y cobertura ya documentados como evidencia, sin re-evaluarlos todavia.
3. Extrae prerequisitos de rol, datos, configuracion, estado inicial, integraciones y dependencias entre elementos.
4. Dibuja las dependencias como `elemento -> prerequisito` e identifica ciclos, referencias rotas o elementos sin identificador.

## Checklist de completitud

- [ ] Cada elemento evaluable tiene identificador, titulo y fuente.
- [ ] Los prerequisitos conocidos estan asociados al elemento que los necesita.
- [ ] Los ciclos, referencias rotas y datos ausentes estan marcados.