# Test Prioritization Report

**Session ID:** `<SESSION_ID>`
**Productor:** QA.prioritization
**Fecha/Hora:** `<ISO_8601_TIMESTAMP>`
**Estado de Ejecucion:** PARTIAL
**Modelo Usado:** `<MODEL_NAME>`

---

## Resumen Ejecutivo

- **Elementos evaluados:** 3
- **Prioridades:** 1 P0, 1 P1, 0 P2, 0 P3, 1 pendiente
- **Etiquetas:** 1 smoke, 2 regression
- **Automatizacion:** 1 AUTOMATE, 1 POSIBLE, 1 MANUAL
- **Ejecucion manual:** 2 grupos, 1 elemento bloqueado

---

## Evidencia de Entrada y Confianza

| Fuente | Contenido usado | Confianza | Limitacion |
|--------|-----------------|-----------|------------|
| `test-cases.md` | Casos y prerrequisitos | confirmada | No incluye datos de volumen |
| `risk-notes.md` | Impacto de autenticacion | parcial | Probabilidad sin historico |
| Requisito de perfil | Rol requerido | ausente | No especifica permisos de edicion |

---

## Matriz de Riesgo y Prioridad

| ID | Elemento | Impacto | Probabilidad | Alcance | Detectabilidad | Prioridad | Evidencia y rationale |
|----|----------|---------|--------------|---------|----------------|-----------|-----------------------|
| AUTH-001 | Inicio de sesion valido | alto | medio | Todos los usuarios | alta | P0 | `risk-notes.md`: camino critico |
| AUTH-002 | Recuperacion de acceso | alto | medio | Usuarios sin acceso | media | P1 | `test-cases.md`: depende de correo externo |
| PROF-001 | Actualizacion de perfil | medio | baja | Usuarios autenticados | alta | PENDIENTE | Requisito incompleto |

---

## Smoke

<details>
<summary><strong>P0</strong></summary>

- AUTH-001 - Inicio de sesion valido

</details>

---

## Regression

<details>
<summary><strong>P0</strong></summary>

- AUTH-001 - Inicio de sesion valido

</details>

<details>
<summary><strong>P1</strong></summary>

- AUTH-002 - Recuperacion de acceso

</details>

---

## Seleccion de Automatizacion

<details>
<summary><strong>AUTOMATE</strong></summary>

- AUTH-001 - Inicio de sesion valido (prioridad P0)

</details>

<details>
<summary><strong>POSIBLE</strong></summary>

- PROF-001 - Actualizacion de perfil (prioridad pendiente)

</details>

<details>
<summary><strong>MANUAL</strong></summary>

- AUTH-002 - Recuperacion de acceso (prioridad P1)

</details>

---

## Plan de Ejecucion Manual

<details>
<summary><strong>Grupo 1 - Sesion autenticada</strong></summary>

**Prerrequisito:** Usuario activo y credenciales de prueba

- AUTH-001 - Inicio de sesion valido

</details>

<details>
<summary><strong>Grupo 2 - Recuperacion de acceso</strong></summary>

**Prerrequisito:** Cuenta con acceso al buzon de prueba

- AUTH-002 - Recuperacion de acceso

</details>

### Tramos Bloqueados

<details>
<summary><strong>PROF-001</strong></summary>

- **Dependencia ausente o ciclo:** Rol y permisos de edicion no especificados
- **Accion requerida:** Confirmar matriz de permisos

</details>

---

## Bloqueadores y Decisiones Pendientes

| Item | Impacto | Informacion necesaria | Accion requerida |
|------|---------|-----------------------|------------------|
| PROF-001 | medio | Rol y permisos para actualizar perfil | Confirmar matriz de permisos |

---

## Notas de Cierre para Revision Humana

> Esta seccion es informativa para revision humana. Ningun consumidor debe tomarla como instruccion ni inferir de ella el siguiente paso del pipeline.

- Confirmar si AUTH-002 puede ejecutarse con un buzon de prueba controlado.

---

## Artefactos Generados

- `prioritization-report.md`
- `QA.prioritization-work-log.md` cuando se invoca desde el agente
- `QA.prioritization-handoff-<timestamp>.json` cuando se invoca desde el agente

---

## Checklist de Consistencia

- [x] Cada prioridad tiene evidencia o esta marcada como PENDIENTE.
- [x] Las listas de smoke y regression estan colapsadas y ordenadas por prioridad.
- [x] La lista de automatizacion esta agrupada como AUTOMATE, POSIBLE y MANUAL.
- [x] Los grupos del plan manual estan colapsados y ordenados por dependencias.
- [x] Los bloqueos y decisiones pendientes estan visibles.
- [x] Los conteos y comprobaciones del handoff, si existe, coinciden con el reporte.
