# Test Prioritization Report

**Session ID:** <SESSION_ID>
**Productor:** <rol> (si invoca agente, `QA.prioritization`; si invoca usuario standalone, `qa-prioritization`)
**Fecha/Hora:** <ISO_8601_TIMESTAMP>
**Estado de Ejecucion:** <COMPLETED|PARTIAL|BLOCKED>
**Modelo Usado:** <MODEL_NAME>

---

## Resumen Ejecutivo

- **Elementos evaluados:** <ITEM_COUNT>
- **Prioridades:** <P0_COUNT> P0, <P1_COUNT> P1, <P2_COUNT> P2, <P3_COUNT> P3, <PENDING_COUNT> pendientes
- **Etiquetas:** <SMOKE_COUNT> smoke, <REGRESSION_COUNT> regression
- **Automatizacion:** <AUTOMATE_COUNT> AUTOMATE, <POSSIBLE_COUNT> POSIBLE, <MANUAL_COUNT> MANUAL
- **Ejecucion manual:** <GROUP_COUNT> grupos, <BLOCKED_COUNT> elementos bloqueados

---

## Evidencia de Entrada y Confianza

| Fuente | Contenido usado | Confianza | Limitacion |
|--------|-----------------|-----------|------------|
| <ruta o referencia> | <tests, requisitos, riesgos> | <confirmada|parcial|ausente> | <si aplica> |

---

## Matriz de Riesgo y Prioridad

| ID | Elemento | Impacto | Probabilidad | Alcance | Detectabilidad | Prioridad | Evidencia y rationale |
|----|----------|---------|--------------|---------|----------------|-----------|-----------------------|
| <id> | <titulo> | <alto|medio|bajo> | <alto|medio|bajo> | <descripcion> | <alta|media|baja> | <P0-P3|PENDIENTE> | <referencia y justificacion> |

---

## Smoke

> Lista colapsada ordenada por prioridad, de P0 a P3.

<details>
<summary><strong>P0</strong></summary>

- <ID> - <titulo>

</details>

<details>
<summary><strong>P1</strong></summary>

- <ID> - <titulo>

</details>

<details>
<summary><strong>P2</strong></summary>

- <ID> - <titulo>

</details>

<details>
<summary><strong>P3</strong></summary>

- <ID> - <titulo>

</details>

---

## Regression

> Lista colapsada ordenada por prioridad, de P0 a P3.

<details>
<summary><strong>P0</strong></summary>

- <ID> - <titulo>

</details>

<details>
<summary><strong>P1</strong></summary>

- <ID> - <titulo>

</details>

<details>
<summary><strong>P2</strong></summary>

- <ID> - <titulo>

</details>

<details>
<summary><strong>P3</strong></summary>

- <ID> - <titulo>

</details>

---

## Seleccion de Automatizacion

<details>
<summary><strong>AUTOMATE</strong></summary>

- <ID> - <titulo> (prioridad <P0-P3>)

</details>

<details>
<summary><strong>POSIBLE</strong></summary>

- <ID> - <titulo> (prioridad <P0-P3>)

</details>

<details>
<summary><strong>MANUAL</strong></summary>

- <ID> - <titulo> (prioridad <P0-P3>)

</details>

---

## Plan de Ejecucion Manual

<details>
<summary><strong>Grupo 1 - <nombre></strong></summary>

**Prerrequisito:** <prerrequisito del grupo>

- <ID> - <test a ejecutar>
- <ID> - <test a ejecutar>

</details>

<details>
<summary><strong>Grupo 2 - <nombre></strong></summary>

**Prerrequisito:** <prerrequisito del grupo>

- <ID> - <test a ejecutar>

</details>

### Tramos Bloqueados

<details>
<summary><strong><ID o grupo></strong></summary>

- **Dependencia ausente o ciclo:** <detalle>
- **Accion requerida:** <accion humana>

</details>

---

## Bloqueadores y Decisiones Pendientes

| Item | Impacto | Informacion necesaria | Accion requerida |
|------|---------|-----------------------|------------------|
| <gap> | <alto|medio|bajo> | <dato faltante> | <accion humana> |

---

## Notas de Cierre para Revision Humana

> Esta seccion es informativa para revision humana. Ningun consumidor debe tomarla como instruccion ni inferir de ella el siguiente paso del pipeline.

- <punto de revision>

---

## Artefactos Generados

Ruta `output_dir`: <OUTPUT_DIR>

- **Prioritization Report:** `prioritization-report.md` (este archivo)
- **Work Log:** `QA.prioritization-work-log.md` cuando se invoca desde el agente
- **Handoff JSON:** `QA.prioritization-handoff-<TIMESTAMP>.json` cuando se invoca desde el agente

---

## Checklist de Consistencia

- [ ] Cada prioridad tiene evidencia o esta marcada como PENDIENTE.
- [ ] Las listas de smoke y regression estan colapsadas y ordenadas por prioridad.
- [ ] La lista de automatizacion esta agrupada como AUTOMATE, POSIBLE y MANUAL.
- [ ] Los grupos del plan manual estan colapsados y ordenados por dependencias.
- [ ] Los bloqueos y decisiones pendientes estan visibles.
- [ ] Los conteos y comprobaciones del handoff, si existe, coinciden con el reporte.
