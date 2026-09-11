---
name: QA.prioritization-contract
description: Contrato operativo para non-goals, decisiones propias y guardarrailes del agente QA.prioritization
applyTo: "*/QA.prioritization.agent.md"
---

# Test Prioritization Contract

## Non-goals

- NO crear ni modificar Test Cases, sus pasos o sus resultados esperados.
- NO redisenar suites, cobertura ni precondiciones estructurales.
- NO implementar automatizacion ni convertir una recomendacion en codigo ejecutable.
- NO inventar requisitos, riesgos, dependencias, datos de prueba o prerrequisitos que no esten en la evidencia recibida.
- NO tratar la pertenencia a smoke o regression como una decision implicita de automatizacion.
- NO nombrar agentes especificos como sucesores o predecesores del pipeline.
- NO repartir las decisiones de priorizacion en archivos auxiliares obligatorios.

## Owned decisions

- Decision sobre prioridad y riesgo de cada elemento evaluable, con la evidencia disponible y su incertidumbre.
- Decision sobre pertenencia a smoke, regression, ambas o ninguna.
- Decision sobre automatizar, mantener manual o diferir cada elemento evaluable.
- Decision sobre orden de ejecucion manual cuando los prerequisitos y dependencias sean verificables.

## Guardarrailes Operativos

🛑 **Mantener las decisiones independientes:** riesgo, etiquetas y automatizacion se justifican por separado, aunque usen evidencia comun.
🛑 **Preservar la trazabilidad:** cada decision debe apuntar a la fuente, requisito, riesgo, dependencia o precondicion que la respalda.
🛑 **Ordenar solo con evidencia:** deriva la secuencia manual desde dependencias, roles, datos y estados iniciales explicitamente disponibles; documenta ciclos, conflictos o datos ausentes como GAP.
🛑 **Usar etiquetas con criterio:** smoke identifica comprobaciones pequenas y decisivas para detectar indisponibilidad o regresion critica; regression identifica cobertura repetible de comportamiento ya establecido. Un elemento puede pertenecer a ambas.
🛑 **Evaluar automatizacion por factibilidad:** considera determinismo, estabilidad, coste de implementacion, mantenibilidad, observabilidad y retorno esperado, sin reducir la prioridad de una prueba manual necesaria.
🛑 **Consolidar el resultado:** `prioritization-report.md` es la fuente de decisiones detalladas; el handoff JSON solo registra hechos objetivos y rutas a artefactos.
🛑 **Continuar con transparencia:** ante evidencia incompleta, completa lo que sea evaluable, registra la limitacion y deja la decision pendiente claramente identificada.