# Paso 3: Particionado por Area

## Objetivo del Paso

Agrupar los requisitos y gaps ya identificados en areas o modulos funcionales, mapeando las dependencias entre ellas.

## Modelo Recomendado

Un modelo estandar es suficiente: esta es una tarea de organizacion estructural mas que de razonamiento profundo.

## Enfoque Exclusivo

Durante este paso tu ÚNICO objetivo es agrupar y mapear dependencias.

## Secuencia

1. Agrupa los requisitos por funcionalidad o modulo.
2. Asigna cada gap identificado al area correspondiente.
3. Mapea las dependencias entre areas (que area depende de cual y por que).
4. Consolida el agrupamiento resultante como estructura interna, lista para normalizar.

## Guardarrailes de calidad

🛑 **Prohibición de agregación**:
- Agrupar NO es colapsar. Si en el Paso 1 extrajiste N requisitos, tras el particionado sigues teniendo N requisitos (uno por área, no fusionados).
- NO decidir qué "merece un REQ propio": todo comportamiento observable extraído es un requisito. No es tu responsabilidad juzgar su relevancia.
- No fusionar requisitos al asignarlos a un área: el particionado solo los distribuye, no los absorbe.
🛑 **Miscelánea como fallback** :
- ningún requisito puede quedar sin destino documentado. Si un requisito no encaja en ningún área, se crea un área "Miscelánea". Prohibido silently drop.

## Checklist de completitud

- [ ] Los requisitos fueron agrupados por funcionalidad o modulo.
- [ ] Se mapearon dependencias entre areas.
- [ ] La consolidación por área quedó reflejada en la estructura interna (requisitos agrupados + gaps asignados + dependencias mapeadas).
- [ ] count_requisitos tras particionado == count_requisitos extraídos en Paso 1 (sin colapso).
- [ ] Todo requisito tiene área asignada (o "Miscelánea" si no encaja).
