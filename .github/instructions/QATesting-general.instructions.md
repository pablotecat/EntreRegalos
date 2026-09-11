---
description: "Guardarrailes y reglas operativas comunes para todos los agentes QA del pipeline manual."
name: "QA Agents General"
applyTo: "*/QA.*.agent.md"
---

# Guardarrailes Generales para Agentes QA

Este documento define los guardarrailes obligatorios para todos los agentes QA. Cada agente puede tener guardarrailes adicionales en su propio `.agent.md`, pero estos son el mínimo común.

## Preferencias de Proyecto

Antes de iniciar el workflow, busca `instructions/preferences/[NombreAgente].preferences.md`.

1. Si el archivo no existe, continúa con las instrucciones base y el workflow.
2. Localiza la sección `## Ajustes activos` del archivo del agente actual.
3. Si no contiene ajustes, continúa con las instrucciones base y el workflow.
4. Aplica cada ajuste activo junto a las instrucciones base.
5. Si el archivo contiene ajustes incompatibles o ambiguos para el mismo comportamiento, no inicies el workflow: presenta el conflicto al usuario y pide qué ajuste conservar, sustituir o reformular.

Las preferencias complementan las reglas base. Conserva objetivos, contratos, non-goals, guardarraíles, herramientas y requisitos de trazabilidad.

## Instrucciones de workflow
- Salvo que se indique lo contrario, todos los agentes QA DEBEN seguir el flujo de trabajo definido en su skill sin saltarse ningún paso. 
- Sólo se debe persistir en la memoria de sesión y contexto de agente la información que se indica en el paso actual. Al finalizar el paso, todas las instrucciones de ese paso se consideran cumplidas y las instrucciones se olvidan.
- NO se debe asumir que otros agentes han ejecutado pasos previos ni que los pasos posteriores serán ejecutados por un agente específico. Cada agente debe ser capaz de ejecutar su flujo de trabajo de forma independiente.

## Guardarrailes de worklog
- 🛑 Prohibido escribir el work-log completo al final. Cada fila debe escribirse (o actualizarse) en el instante en que se cierra el paso del workflow, con el timestamp real de ese momento. El archivo se edita incrementalmente con replace_string_in_file o equivalente tras cada paso, no se genera de golpe con create_file.
- Antes de registrar la hora de inicio o fin de un paso, ejecuta `node .agents/scripts/current-time.mjs` en la terminal. Usa el campo `local_time` como timestamp del work-log; usa `utc` cuando el artefacto requiera un timestamp ISO 8601.
- 🛑 Prohibido usar timestamps estimados, planificados o "plausibles". Si no puedes obtener la hora real exacta, escribe "(estimado)" en lugar de dar por válido un valor.
- 🛑 El work-log no se construye en el Último paso — se va construyendo durante los todos los Pasos. El último Paso, además, lo lee para confirmar consistencia.

## Persistencia

El agente es responsable de:

1. **Inicializar `session-counter.json`** si es la primera sesión del proyecto: `./tests/Documentation/sessions/session-counter.json` con `{"last_session_number": 0}`.
2. **Crear la carpeta de sesión** si no existe: `./tests/Documentation/sessions/session_{session_N}_{session_id}/`. Durante el flujo sin orquestador, el agente que se ejecute primero es responsable de crearla. Si existe una sesión ya creada, el agente no creará una nueva sesión salvo que se le indique explícitamente.
3. **Crear la subcarpeta del agente** si no existe: `./tests/Documentation/sessions/session_{session_N}_{session_id}/QA-{agent}-agent/`.

## Alcance

- 🛑 **NO asumir responsabilidades fuera de las definidas en tu Role y Owned decisions.** Si una tarea cae fuera de tu scope, no la ejecutes.
- 🛑 **NO inferir contexto faltante:** si un input es ambiguo, incompleto o contradictorio, detente y pide aclaración al usuario. No inventes requisitos, escenarios ni decisiones.
- 🛑 **IGNORA las carpetas de sesión anteriores:** si existen, no las modifiques ni las uses como referencia para nada.
- 🛑 **NO abandonar ante complejidad o gaps:** si algo no se puede completar, avanza al siguiente paso, manten en memoria esta información para incluirla en los archivos de resumen del último paso, documenta qué falta y por qué en el resumen, y deja que el usuario decida.
- 🛑 **NO generar artefactos fuera de la estructura de sesión:** todos los archivos que generes, salvo indicación explícita, van en `./tests/Documentation/sessions/session_{N}_{id}/QA-{agent}-agent/`. No crear archivos sueltos, temporales ni en rutas ad-hoc.
- 🛑 **NO sobrescribir artefactos previos de una sesión existente** sin confirmación del usuario. Generar nuevos archivos con timestamp actualizado o preguntar si se desea reemplazar.
- 🛑 **NO incluir juicio de cumplimiento propio** en el handoff JSON: `assigned_task.scope_received` es un eco fiel de la instrucción, no tu evaluación.

### Idempotencia
- Si el agente se reinvoca sobre una sesión existente, NO sobrescribir artefactos previos sin confirmación del usuario. Generar nuevos archivos con timestamp actualizado o preguntar si se desea reemplazar.

