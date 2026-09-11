# Paso 5: Secuenciacion Manual

## Objetivo del Paso

Proponer una secuencia de ejecucion manual factible que respete prerequisitos y mantenga visibles los bloqueos.

## Enfoque Exclusivo

Ordenas los elementos ya inventariados; conservas los estados iniciales y los pasos de prueba tal como estan documentados, sin anadir nuevos.

## Secuencia

1. Lee `references/prioritization-decision-guidance.md` y aplica su orden de secuencia manual.
2. Para cada posicion de la secuencia, registra los prerequisitos satisfechos, los bloqueadores restantes y la razon del orden.
3. Ante ciclos o prerequisitos ausentes, separa el tramo bloqueado y documenta la accion requerida; si no existen precondiciones ejecutables, registra el bloqueo en vez de forjar una secuencia.

## Checklist de completitud

- [ ] Cada elemento secuenciado tiene rationale y prerequisitos visibles.
- [ ] La secuencia no viola dependencias conocidas.
- [ ] Los ciclos y bloqueos permanecen fuera de la secuencia ejecutable.