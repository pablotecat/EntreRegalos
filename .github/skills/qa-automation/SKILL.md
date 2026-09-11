---
name: qa-automation
description: Convierte Test Cases markdown en código Playwright ejecutable. Entrega el reporte `QA.automation-generation-report.md` y handoff JSON.
disable-model-invocation: true
argument-hint: "Documento con Test Cases Given/When/Then (con o sin trazabilidad formal) y contexto del proyecto. Opcional: 'to <path>' para destino del código, o 'preview'/'no-save' para chat-only."
user-invocable: true
compatibility: 
  - agents: [QA.automation]
---

## Modelo

Usa el modelo de razonamiento más potente disponible en todos los pasos: el workflow produce código y reportes que otros consumidores leerán sin acceso a la fuente original.

## Mapa de pasos

DEBES leer y ejecutar los pasos de la carpeta `steps/` en este orden:

1. `steps/01-analisis-de-test-cases.md` — Análisis de Test Cases
2. `steps/02-implementacion-con-playwright-best-practices.md` — Implementación con playwright-best-practices
3. `steps/03-generacion-de-reporte.md` — Generación de Reporte

> Esta skill es **deliberadamente breve**: no instruye sobre decisiones de implementación de Playwright (locators, fixtures, arquitectura). Esas decisiones las dicta la skill `playwright-best-practices`, invocada en el paso 02. Aquí solo se regula la lectura, la invocación y la persistencia de artefactos, alineado con el resto de skills de agentes QA.

## Feedback al usuario

- Mientras ejecutas cada paso: salvo que el usuario indique lo contrario, escribe en el chat solo para reportar errores o decisiones pendientes; de lo contrario, mantén silencio.
- Cuando termines cada paso: responde en chat **exactamente una línea seca** con el formato `<nombre-del-paso> OK.`.
- Cuando termines de escribir archivos: responde en chat **exactamente una línea seca** con el formato `qa-automation OK; reporte: <ruta a archivos generados>`.
