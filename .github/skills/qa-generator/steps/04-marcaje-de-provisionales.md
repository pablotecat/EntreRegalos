# Paso 4: Marcaje de Provisionales

## Objetivo del Paso

Recorrer los Test Cases ya redactados en el paso 03 y marcar como `🟡 PROVISIONAL/NO DEFINIDO` los pasos (Prerrequisitos o pasos numerados Given/When/Then) que no estén claros por falta de definición en el documento de entrada. Para cada paso marcado, documentar el motivo (qué input falta). No rediseñar los pasos aquí: sólo marcar.

## Modelo Recomendado

Un modelo estándar es suficiente: esta es una tarea de revisión y marcaje, no de razonamiento profundo.

## Enfoque Exclusivo

Durante este paso tu unico objetivo es marcar provisionales con motivo. No rediseñes los pasos (eso fue el paso 03), ni revises trazabilidad global (paso 05), ni generes el handoff JSON ni el documento de Test Cases todavía. Si en la revisión descubres que un paso necesita rediseño (no sólo marcaje), anótalo; pero el rediseño propiamente dicho se hace volviendo al paso 03 si el usuario lo pide, no aquí.

## Secuencia

1. Recorre cada Test Case ya redactado en el paso 03.
2. Para cada Prerrequisito o paso numerado:
   - Si está claro y completo, déjalo tal cual.
   - Si no está claro por falta de definición en el documento de entrada:
     - Marca el paso con `🟡 PROVISIONAL/NO DEFINIDO`.
     - Documenta el motivo: qué input falta (p. ej. "falta definición del estado inicial del dataset", "no se especifica el mensaje de error esperado", "el AC no aclara si el campo es obligatorio").
3. Recopila los pasos PROVISIONAL por `Suite / Área`. Para cada suite o área, registra cada elemento como `TEST-ID (tipo)`, donde tipo es `Prerrequisito <N>` o `Paso <N>`, incluyendo el motivo y la acción provisional escrita. Esta recopilación se incluirá posteriormente en el documento de Test Cases (paso 06) como bloques HTML `<details>` colapsados por defecto, anidados por suite o área, y se reflejará como `counts` y `checks` en el handoff JSON.

## Extensibilidad futura

Este paso está separado del paso 03 (Diseño) para permitir en el futuro ampliar cómo el agente buscará pasos ya definidos y marcará los que no estén. Por ejemplo:
- Integrar la búsqueda contra un repositorio de pasos reutilizables.
- Aplicar reglas heurísticas para sugerir acciones provisionales con base en proyectos anteriores.
- Conectar contra un catálogo de definiciones estándar (mensajes de error, estados de dataset, etc.).

Mientras tanto, la lógica actual es heurística: marca todo lo que no esté claro por falta de definición en el documento de entrada.

## Checklist de completitud

- [ ] Todos los Test Cases del paso 03 han sido recorridos.
- [ ] Los pasos no claros por falta de definición están marcados como `🟡 PROVISIONAL/NO DEFINIDO`.
- [ ] Cada paso marcado tiene documentado su motivo (qué input falta).
- [ ] Se recopilaron los pasos PROVISIONAL por Suite / Área, con `TEST-ID (tipo)`, motivo y acción provisional escrita.
- [ ] El marcaje no ha implicado rediseño de pasos.
