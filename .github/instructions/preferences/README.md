# Preferencias de Proyecto

Esta carpeta contiene la capa configurable de instrucciones para los agentes QA. Las preferencias complementan las instrucciones base: no reemplazan contratos, guardarraíles, non-goals ni objetivos de los agentes.

## Contenido

- `[NombreAgente].preferences.md` contiene los ajustes activos de un agente y se crea al aprobar su primer ajuste.
- `preferences-history.md` conserva el historial cronológico de cambios.

Las [instrucciones generales de QA](../QATesting-general.instructions.md) leen el archivo del agente antes de su workflow.

## Ámbito

El MVP solo admite preferencias de Proyecto. Gestiona cambios mediante `agent-preferences` después de una ejecución concreta: aporta el agente, la carpeta de sesión y feedback sobre el comportamiento que quieres ajustar. La skill presenta el texto exacto y solo escribe tras aprobación explícita.

> Una reinstalación forzada de `qa-agents` copia el runtime completo y puede sobrescribir esta carpeta. Conserva una copia antes de reinstalar si necesitas preservar preferencias locales.
