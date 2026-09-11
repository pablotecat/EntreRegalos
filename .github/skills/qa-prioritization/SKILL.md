---
name: qa-prioritization
description: Prioriza pruebas, etiqueta smoke y regression, selecciona automatizacion y ordena la ejecucion manual
disable-model-invocation: true
user-invocable: true
argument-hint: "Artefactos de pruebas, planificacion o requisitos. Opcional: 'to|save|en <path>' para destino, o 'preview'/'no-save' para chat-only."
compatibility:
  - agents: [QA.prioritization]
---

## Mapa de pasos

DEBES leer y ejecutar los pasos de la carpeta `steps/` en este orden:

1. `steps/01-analisis-de-evidencia-de-entrada.md` - Analisis de evidencia de entrada
2. `steps/02-inventario-y-prerrequisitos.md` - Inventario y prerrequisitos
3. `steps/03-evaluacion-de-riesgo-y-prioridad.md` - Evaluacion de riesgo y prioridad
4. `steps/04-etiquetado-y-automatizacion.md` - Etiquetado y automatizacion
5. `steps/05-secuenciacion-manual.md` - Secuenciacion manual
6. `steps/06-generacion-de-reporte.md` - Generacion de reporte

## Feedback al usuario

- Mientras ejecutas cada paso, salvo que el usuario indique lo contrario, escribe en el chat solo para reportar errores o decisiones pendientes.
- Cuando termines cada paso, responde en chat exactamente una linea seca con el formato `<nombre-del-paso> OK.`
- Cuando termines de escribir archivos, responde en chat exactamente una linea seca con el formato `qa-prioritization OK; reporte: <ruta a archivos generados>`.