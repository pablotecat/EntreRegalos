# Paso 4: Normalizacion y Estructuracion

## Objetivo del Paso

Convertir los requisitos y criterios ya agrupados en una forma normalizada, consistente y testeable, asegurando trazabilidad a la fuente original.

## Modelo Recomendado

Usa un modelo con buena capacidad de estructuracion y consistencia. La calidad de esta normalizacion condiciona directamente la testabilidad del resto del pipeline.

## Enfoque Exclusivo

Durante este paso tu ÚNICO objetivo es normalizar redaccion y estructura.

## Secuencia

1. Convierte cada requisito a una redaccion consistente (ej. formato Given/When/Then).
2. Normaliza los criterios de aceptacion al mismo formato.
3. Aplica a cada área la estructura interna normalizada (requisitos + gaps asignados + dependencias).
4. Verifica legibilidad, cobertura semantica y trazabilidad de cada requisito a su fuente original.
5. Verifica que no existen Tests duplicados.

## Guardarrailes de calidad

🛑 **Trazabilidad uno-a-uno**:
- Cada requisito extraído tiene **exactamente un** destino en el reporte. Prohibido que un REQ del reporte absorba >1 requisito extraído (salvo petición explícita del usuario).
- Cada requisito extraído debe poder mapearse a su REQ del reporte **sin ambigüedad**. Si no puedes trazarlo, el Paso 4 no está completo.
- Normalizar redacción (p.ej. Given/When/Then) NO es fusionar: un solo Gherkin no puede absorber múltiples ramas (ok/error/catch), Verbo+status distinctions o dominios API+UI.


## Checklist de completitud

- [ ] Requisitos y criterios fueron normalizados de forma consistente.
- [ ] Cada área tiene su estructura interna normalizada (requisitos + gaps asignados + dependencias).
- [ ] Se verifico legibilidad y cobertura semantica.
- [ ] La trazabilidad a fuentes originales esta completa.
- [ ] No existen Tests duplicados.
- [ ] Cada requisito extraído en Paso 1 se mapea 1-a-1 a un REQ normalizado distinto (sin absorciones).
- [ ] count_requisitos normalizados == count_requisitos extraídos en Paso 1.
