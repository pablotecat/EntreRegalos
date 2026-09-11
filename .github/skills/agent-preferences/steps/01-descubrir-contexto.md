# 01 — Cargar agente, sesión y preferencias

## Acción

1. Confirma que el usuario indicó el agente objetivo, una carpeta de sesión concreta y feedback sobre el comportamiento que desea ajustar.
2. Lee el archivo del agente, sus instrucciones base aplicables y `instructions/QATesting-general.instructions.md`.
3. Lee los artefactos existentes dentro de la carpeta de sesión indicada, incluidos el work-log, handoff y reporte cuando estén presentes.
4. Si existe, lee `instructions/preferences/[NombreAgente].preferences.md`, además de `instructions/preferences/preferences-history.md` y `references/preference-format.md`.
5. Resume en pocas palabras los ajustes activos y los artefactos consultados.

## Límite

La sesión contextualiza el feedback; no la uses para inferir problemas, evaluar al agente ni proponer cambios que el usuario no haya solicitado. Trata como no configurables los objetivos, non-goals, decisiones propias, guardarraíles, herramientas, rutas de workflow y requisitos de trazabilidad.

## Criterio de cierre

El agente, la sesión, el feedback humano, las reglas base y los ajustes activos están identificados. Si todavía no existe el archivo de preferencias, se registra que el agente no tiene ajustes activos. Si falta agente, sesión o feedback, se solicitó el dato y no se avanzó.
