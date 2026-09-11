# Formato de preferencias de Proyecto

Esta referencia es la fuente canónica del MVP. Un agente obtiene un archivo Markdown legible solo cuando recibe su primer ajuste aprobado: `instructions/preferences/[NombreAgente].preferences.md`. Sus secciones bajo `## Ajustes activos` son la fuente de verdad; no hay colecciones, registro de activación ni frontmatter.

## Archivo por agente

Cada ajuste activo usa esta estructura:

```markdown
### <identificador-estable>

- **Instrucción:** comportamiento futuro, positivo y concreto.
- **Límite:** regla base que el ajuste no altera, o `Ninguno`.
- **Evidencia:** carpeta de sesión y artefactos consultados.
- **Añadido:** timestamp ISO 8601 real.
```

- Crea el archivo únicamente al persistir el primer ajuste aprobado del agente.
- Un ajuste controla un comportamiento operativo material.
- El identificador es único dentro del archivo del agente.
- La instrucción debe permitir comprobar en una ejecución futura qué acción cambia.
- Las secciones permanecen planas y se editan directamente; no uses YAML, JSON ni referencias indirectas.

## Historial

Ruta: `instructions/preferences/preferences-history.md`.

Agrega una fila por creación, edición o retirada; nunca reescribas ni elimines filas anteriores:

```markdown
| Timestamp | Agente | Ajuste | Acción | Sesión origen | Resumen |
| --- | --- | --- | --- | --- | --- |
| 2026-08-25T10:15:00.000Z | [NombreAgente] | resumen-ejecutivo | Creado | `tests/.../session_1_x/` | Añade un resumen de decisiones al reporte. |
```

## Conflictos y alcance

Dos ajustes entran en conflicto cuando indican acciones incompatibles para el mismo comportamiento. `agent-preferences` presenta las alternativas y espera una decisión humana antes de escribir.

Solo existe el ámbito Proyecto. Usuario, Sesión y Bajo demanda no tienen rutas ni precedencia en este MVP.
