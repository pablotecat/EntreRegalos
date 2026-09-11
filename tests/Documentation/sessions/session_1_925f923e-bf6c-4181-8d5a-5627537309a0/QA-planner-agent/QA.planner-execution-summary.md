# Test Plan - EntreRegalos

**Session ID:** 925f923e-bf6c-4181-8d5a-5627537309a0
**Agente:** QA.planner
**Fecha/Hora:** 2026-09-05T19:58:40.7998149+02:00 (estimado; `.agents/scripts/current-time.mjs` no existe)
**Estado:** COMPLETED

---

## Resumen Ejecutivo

**Estado del Test Plan:** completo para el alcance vigente. Se planifican 51 escenarios nominales que cubren los 51 requisitos cuya fuente permanece vigente. `REQ-018`, `REQ-026` y `REQ-030` quedan excluidos porque dependen exclusivamente de `SPEC_LISTAS_Y_AMIGOS.md`, eliminado por el usuario. `REQ-019` y `REQ-028` se cubren solamente por la evidencia de implementación que conserva el handoff entrante.

### Métricas Clave

| Métrica | Valor |
|---|---:|
| Suites | 7 |
| Escenarios nominales | 51 |
| Requisitos cubiertos / incluidos | 51 / 51 |
| Cobertura funcional total | 100% |
| Requisitos excluidos por fuente retirada | 3 |
| Duración informativa total | 1,830 s |

Hallazgos relevantes: los contratos de error HTTP (GAP-003) y criterios no funcionales (GAP-004) siguen sin definición en la documentación entrante. GAP-001 y GAP-002 corresponden a divergencias con la especificación retirada y no aplican al alcance de este plan.

## Suites Diseñadas

<details>
<summary><strong>SUITE-001 - Acceso, sesion y navegacion</strong></summary>

- **Descripción:** rutas públicas, guarda de autenticación, identidad y flujo de inicio de sesión.
- **Complejidad:** HIGH
- **Requisitos origen:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-010, REQ-011.
- **Dependencias estructurales:** SUITE-007 provee los contratos HTTP de autenticación; SUITE-006 consume la sesión y la guarda de rol.
- **Duración informativa total:** 330 s.

<details><summary>11 escenarios nominales</summary>

| ID | Nombre del test | Criterio de aceptación origen |
|---|---|---|
| TS-001 | Mostrar la ruta de inicio de sesión | REQ-001 |
| TS-002 | Mostrar la ruta de registro | REQ-002 |
| TS-003 | Mostrar la ruta de restablecimiento | REQ-003 |
| TS-004 | Redirigir una ruta protegida sin token | REQ-004 |
| TS-005 | Mostrar carga al resolver identidad | REQ-005 |
| TS-006 | Redirigir ante identidad inválida | REQ-006 |
| TS-007 | Redirigir a listas a un usuario sin rol ADMIN | REQ-007 |
| TS-008 | Resolver rutas raíz y desconocidas hacia listas | REQ-008 |
| TS-009 | Exigir usuario y contraseña en inicio de sesión | REQ-009 |
| TS-010 | Conservar sesión y navegar tras inicio de sesión correcto | REQ-010 |
| TS-011 | Mostrar el primer mensaje ante rechazo de inicio de sesión | REQ-011 |
</details>
</details>

<details>
<summary><strong>SUITE-002 - Registro por invitacion</strong></summary>

- **Descripción:** registro de usuarios mediante token de invitación y sus restricciones de interfaz.
- **Complejidad:** MEDIUM
- **Requisitos origen:** REQ-012, REQ-013, REQ-014.
- **Dependencias estructurales:** SUITE-007 provee el contrato de registro; la invitación válida es un dato compartido con SUITE-006.
- **Duración informativa total:** 120 s.

<details><summary>3 escenarios nominales</summary>

| ID | Nombre del test | Criterio de aceptación origen |
|---|---|---|
| TS-012 | Conservar sesión y navegar tras registro correcto | REQ-012 |
| TS-013 | Deshabilitar registro sin token de invitación | REQ-013 |
| TS-014 | Informar restricciones de usuario y contraseña en registro | REQ-014 |
</details>
</details>

<details>
<summary><strong>SUITE-003 - Restablecimiento y cierre de sesion</strong></summary>

- **Descripción:** validación del token de restablecimiento, validación local de contraseña y limpieza de sesión.
- **Complejidad:** MEDIUM
- **Requisitos origen:** REQ-015, REQ-016, REQ-017.
- **Dependencias estructurales:** SUITE-007 provee contratos de reset y logout; comparte el estado autenticado con SUITE-001.
- **Duración informativa total:** 120 s.

<details><summary>3 escenarios nominales</summary>

| ID | Nombre del test | Criterio de aceptación origen |
|---|---|---|
| TS-015 | Informar y enlazar a login ante token de reset ausente o inválido | REQ-015 |
| TS-016 | Rechazar localmente contraseñas cortas o no coincidentes | REQ-016 |
| TS-017 | Navegar a login tras reset y limpiar sesión tras logout | REQ-017 |
</details>
</details>

<details>
<summary><strong>SUITE-004 - Listas propias e items</strong></summary>

- **Descripción:** listado, estado vacío o móvil, creación y eliminación de listas, permisos y gestión de items propios.
- **Complejidad:** HIGH
- **Requisitos origen:** REQ-019, REQ-020, REQ-021, REQ-022, REQ-023, REQ-024, REQ-025.
- **Dependencias estructurales:** requiere sesión estructural de SUITE-001 y contratos de listas/items de SUITE-007.
- **Duración informativa total:** 300 s.

<details><summary>7 escenarios nominales</summary>

| ID | Nombre del test | Criterio de aceptación origen |
|---|---|---|
| TS-018 | Apilar listas en móvil y mostrar estado vacío sin listas | REQ-019 |
| TS-019 | Consultar y mostrar carga de listas propias | REQ-020 |
| TS-020 | Crear una lista e invalidar listas propias | REQ-021 |
| TS-021 | Mostrar datos y acciones de una tarjeta de lista propia | REQ-022 |
| TS-022 | Eliminar una lista confirmada e invalidar listas propias | REQ-023 |
| TS-023 | Restringir la gestión de items al propietario | REQ-024 |
| TS-024 | Gestionar campos y actualización de items | REQ-025 |
</details>
</details>

<details>
<summary><strong>SUITE-005 - Amigos y listas publicas</strong></summary>

- **Descripción:** disponibilidad de otros usuarios y consulta/presentación de sus listas públicas sin acciones de modificación.
- **Complejidad:** MEDIUM
- **Requisitos origen:** REQ-027, REQ-028, REQ-029.
- **Dependencias estructurales:** requiere sesión estructural de SUITE-001, usuarios distintos y contratos de usuarios/listas de SUITE-007.
- **Duración informativa total:** 120 s.

<details><summary>3 escenarios nominales</summary>

| ID | Nombre del test | Criterio de aceptación origen |
|---|---|---|
| TS-025 | Mostrar estado vacío sin otros usuarios | REQ-027 |
| TS-026 | Mostrar tarjetas de usuarios y enlace a sus listas | REQ-028 |
| TS-027 | Consultar y presentar listas públicas de un usuario | REQ-029 |
</details>
</details>

<details>
<summary><strong>SUITE-006 - Administracion</strong></summary>

- **Descripción:** consultas administrativas, invitaciones y administración de cuentas y restablecimientos.
- **Complejidad:** HIGH
- **Requisitos origen:** REQ-031, REQ-032, REQ-033, REQ-034.
- **Dependencias estructurales:** requiere identidad `ADMIN` de SUITE-001; comparte invitaciones con SUITE-002 y contratos de administración con SUITE-007.
- **Duración informativa total:** 240 s.

<details><summary>4 escenarios nominales</summary>

| ID | Nombre del test | Criterio de aceptación origen |
|---|---|---|
| TS-028 | Consultar datos administrativos | REQ-031 |
| TS-029 | Generar, mostrar y copiar una invitación | REQ-032 |
| TS-030 | Diferenciar estados de una invitación | REQ-033 |
| TS-031 | Activar, desactivar y generar reset para terceros | REQ-034 |
</details>
</details>

<details>
<summary><strong>SUITE-007 - Contratos API consumidos</strong></summary>

- **Descripción:** contratos exitosos consumidos por la SPA para autenticación, listas, usuarios e invitaciones.
- **Complejidad:** HIGH
- **Requisitos origen:** REQ-035 a REQ-054.
- **Dependencias estructurales:** provee contratos de datos a las suites SUITE-001 a SUITE-006; no depende de otra suite.
- **Duración informativa total:** 600 s.

<details><summary>20 escenarios nominales</summary>

| ID | Nombre del test | Criterio de aceptación origen |
|---|---|---|
| TS-032 | Recibir accessToken al iniciar sesión | REQ-035 |
| TS-033 | Recibir accessToken al registrar una invitación válida | REQ-036 |
| TS-034 | Aceptar logout sin contenido | REQ-037 |
| TS-035 | Obtener identidad autenticada | REQ-038 |
| TS-036 | Validar un token de restablecimiento | REQ-039 |
| TS-037 | Restablecer contraseña con token y password | REQ-040 |
| TS-038 | Obtener listas propias | REQ-041 |
| TS-039 | Obtener listas públicas por usuario | REQ-042 |
| TS-040 | Obtener detalle de lista e items | REQ-043 |
| TS-041 | Crear una lista | REQ-044 |
| TS-042 | Eliminar una lista | REQ-045 |
| TS-043 | Crear un item de lista | REQ-046 |
| TS-044 | Eliminar un item de lista | REQ-047 |
| TS-045 | Obtener usuarios | REQ-048 |
| TS-046 | Obtener tokens de restablecimiento | REQ-049 |
| TS-047 | Desactivar un usuario | REQ-050 |
| TS-048 | Activar un usuario | REQ-051 |
| TS-049 | Generar restablecimiento para un usuario | REQ-052 |
| TS-050 | Crear una invitación | REQ-053 |
| TS-051 | Obtener invitaciones | REQ-054 |
</details>
</details>

## Análisis de Cobertura

| Suite | Requisitos cubiertos | Cobertura |
|---|---|---:|
| SUITE-001 | REQ-001 a REQ-011 | 11/11 (100%) |
| SUITE-002 | REQ-012 a REQ-014 | 3/3 (100%) |
| SUITE-003 | REQ-015 a REQ-017 | 3/3 (100%) |
| SUITE-004 | REQ-019 a REQ-025 | 7/7 (100%) |
| SUITE-005 | REQ-027 a REQ-029 | 3/3 (100%) |
| SUITE-006 | REQ-031 a REQ-034 | 4/4 (100%) |
| SUITE-007 | REQ-035 a REQ-054 | 20/20 (100%) |
| **Total** | **51 requisitos incluidos** | **51/51 (100%)** |

**Requisitos no cubiertos:** ninguno dentro del alcance vigente. `REQ-018`, `REQ-026` y `REQ-030` no son requisitos no cubiertos: fueron excluidos del denominador por provenir solo de la fuente eliminada. Cada fila de escenarios en las suites establece la trazabilidad escenario a criterio de aceptación; la tabla anterior aporta la relación inversa requisito a suite.

## Cobertura de Riesgo por Gap *(ECO informativo)*

La severidad de cada gap proviene de la documentación; el planner solo hace eco y reporta si su cobertura la mitiga parcial o totalmente.

| Gap ID | Severidad (eco) | Estado de cobertura | Descripción (eco de documentación) | Mitigación del planner |
|---|---|---|---|---|
| GAP-001 | HIGH | No aplica | Maestro-detalle de listas no implementado | Su única fuente fue retirada; REQ-018 se excluyó. |
| GAP-002 | HIGH | No aplica | Maestro-detalle de amigos no implementado | Sus únicos requisitos se excluyeron; no se planifica esa funcionalidad. |
| GAP-003 | MEDIUM | No mitigado | Contratos de error HTTP incompletos | Solo se cubren contratos exitosos explícitos. |
| GAP-004 | MEDIUM | No mitigado | Criterios no funcionales incompletos | No existe criterio fuente para añadir escenarios. |

## Decisiones de Diseño y Supuestos

- Se usa un escenario nominal por requisito incluido para mantener mapeo uno a uno y cobertura calculable.
- Las suites se organizan por flujo funcional; SUITE-007 concentra contratos API porque son fuente de datos compartida por las demás suites.
- Se conserva REQ-019 por `ListsPage.tsx` y REQ-028 por `AmigosPage.tsx`, limitando sus títulos a la evidencia no retirada.
- Se excluyen REQ-018, REQ-026 y REQ-030, pues el handoff les asigna exclusivamente la fuente eliminada; no se infieren reemplazos.

## Precondiciones por Suite *(estructural, NO orden de ejecución)*

La duración estimada es informativa; el ORDEN de ejecución se decide en la fase de priorización, no en este reporte.

| Suite | Prerequisite | Duración por escenario | Estado compartido estructural |
|---|---|---:|---|
| SUITE-001 | SPA y API disponibles; cuentas válida e inválida; un usuario no ADMIN. | 30 s | Token e identidad resuelta entre escenarios de sesión. |
| SUITE-002 | SPA y API disponibles; token de invitación válido y ausencia de token. | 40 s | Usuario registrado y token de sesión resultante. |
| SUITE-003 | SPA y API disponibles; token reset válido, token ausente o inválido y sesión existente. | 40 s | Contraseña restablecida y limpieza de sesión. |
| SUITE-004 | SPA y API disponibles; usuario autenticado, lista propia, lista ajena e items de datos. | 43 s aprox. | Lista creada/eliminada e items asociados. |
| SUITE-005 | SPA y API disponibles; usuario autenticado, otros usuarios y listas públicas. | 40 s | Usuario público seleccionado y sus listas. |
| SUITE-006 | SPA y API disponibles; identidad ADMIN, usuario tercero e invitaciones en estados diversos. | 60 s | Invitación generada, estado de cuenta y URL de reset. |
| SUITE-007 | API disponible; credenciales, tokens, IDs de lista/item/usuario e identidad ADMIN válidos. | 30 s | Recursos creados para sus operaciones de consulta o eliminación. |

## Notas de Cierre para Revisión Humana

Esta sección es informativa para revisión humana; ningún agente debe consumirla como instrucción ni inferir de ella el siguiente paso del pipeline.

### Decisiones Pendientes

1. Definir status, payload y mensaje UI esperados para errores por endpoint (GAP-003).
2. Acordar criterios verificables de accesibilidad, navegadores, rendimiento y errores no implementados (GAP-004).
3. Si se restituye una especificación de maestro-detalle, deberá entrar en un nuevo handoff antes de planificar sus requisitos.

## Artefactos Generados

- Resumen de planificación: `QA.planner-execution-summary.md`.
- Work-log: `QA.planner-work-log.md`.
- Handoff JSON: `QA.planner-handoff-20260905-195840.json`.

## Checklist de Validación

- [x] Metadatos y nueve secciones base presentes.
- [x] Siete suites cohesivas con ID, complejidad, requisitos y dependencias estructurales.
- [x] 51 escenarios contienen solo ID y nombre, sin pasos de prueba.
- [x] Trazabilidad bidireccional requisito-suite y escenario-criterio documentada.
- [x] Cobertura y conteos consistentes: 51/51 requisitos incluidos, 100%.
- [x] Tres requisitos basados exclusivamente en la fuente retirada excluidos explícitamente.

## Cierre

**Estado de Handoff:** READY FOR HANDOFF
**Resultado de Validación:** PASSED
**Correlation ID:** 925f923e-bf6c-4181-8d5a-5627537309a0