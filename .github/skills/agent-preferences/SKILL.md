---
name: agent-preferences
description: Calibra el comportamiento operativo de un agente QA después de una ejecución concreta.
disable-model-invocation: true
user-invocable: true
argument-hint: "agente objetivo, carpeta de sesión y feedback concreto sobre la ejecución"
---

# Calibración posterior a una ejecución

Calibra preferencias operativas de ámbito Proyecto sin cambiar prompts, contratos ni instrucciones base. El usuario aporta el ajuste que observó; la sesión aporta contexto y evidencia, pero no autoriza a diagnosticar problemas ni a inventar mejoras.

Necesitas tres entradas antes de avanzar: el agente objetivo, la carpeta de una sesión concreta y feedback que describa el comportamiento que debe cambiar. Si falta alguna, solicítala y no propongas ajustes.

## Mapa de pasos

Lee y ejecuta los pasos de `steps/` en este orden:

1. `steps/01-descubrir-contexto.md` — Cargar agente, sesión y preferencias vigentes
2. `steps/02-cargar-y-resumir-preferencias.md` — Traducir el feedback a un ajuste operativo
3. `steps/03-detectar-decisiones-configurables.md` — Comprobar materialidad y conflictos
4. `steps/04-consultar-y-resolver.md` — Presentar la propuesta y obtener aprobación explícita
5. `steps/05-persistir.md` — Persistir la preferencia y su historial

## Límites

- Configura solo decisiones que cambien materialmente el comportamiento operativo del agente en ejecuciones futuras.
- Conserva contratos, non-goals, guardarraíles, herramientas y límites de rol como reglas base.
- Lee los artefactos de la sesión indicada solo para contextualizar el feedback humano.
- Antes de escribir, presenta el texto exacto que se añadirá, editará o retirará y pide aprobación explícita.
- Modifica únicamente `instructions/preferences/[NombreAgente].preferences.md` y `instructions/preferences/preferences-history.md`.

## Referencias

- `references/preference-format.md` — formato canónico de preferencias e historial.
