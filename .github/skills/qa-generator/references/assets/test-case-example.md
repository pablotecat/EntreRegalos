# Test Generator Agent - Set de Test Cases (Ejemplo)

> Este es un **ejemplo completo** de salida de la skill `qa-generator`. No es plantilla; la plantilla OBLIGATORIA está en `assets/test-case-template.md`.
>
> Fuente de entrada simulada: `execution-summary-example.md` (modo planning-done). En este ejemplo se ha spliteado `registration_001` en `registration_001a` y `registration_001b` porque el escenario cubría dos Acceptance Criteria. También se incluye un paso marcado `🟡 PROVISIONAL/NO DEFINIDO` para ilustrar el marcaje.

**Session ID:** `<SESSION_ID>`
**Productor:** QA.generator (ejemplo)
**Fecha/Hora:** `<ISO_8601_TIMESTAMP>`
**Estado de Ejecución:** ✅ COMPLETED
**Modo de entrada:** planning-done
**Modelo Usado:** `<MODEL_NAME>`

---

## 📊 Resumen Ejecutivo

El agente **QA.generator** ha generado el set de Test Cases a partir del documento de planificación de entrada. Cada Test Case contiene Prerrequisitos y una secuencia numerada de pasos Given/When/Then, donde el último paso es un `Then` con su Expected Result nuclear.

### Métricas Clave

| Métrica | Valor | Estado |
|---------|-------|--------|
| Test Cases Totales | 3 | ✅ |
| Test Cases Spliteados (de un escenario) | 1 | ✅ |
| Pasos PROVISIONAL Totales | 1 | 🟡 si > 0 |
| Acceptance Criteria Cubiertos | 3/3 | ✅ |
| Acceptance Criteria Pendientes de Cubrir | 0 | ✅ |

### Hallazgos Relevantes
- El escenario `registration_001` cubría dos Acceptance Criteria (AC-001 y AC-002); se ha spliteado en `registration_001a` y `registration_001b` preservando `Original ID`.
- Un paso en `registration_001b` quedó marcado como PROVISIONAL porque el documento de entrada no especifica el mensaje de error exacto para email duplicado.

---

## 🧭 Modo de Entrada

- **Tipo de documento de entrada:** planning-done.
- Se han respetado las suites del planner (`registration_suite`, `listing_suite` en el ejemplo completo) y se han expandido los nombres de escenarios a Test Cases.
- En modo no-planning (no aplicable en este ejemplo), se aplicaría una agrupación ligera por área funcional solo para enlazar Test Case con requisito.

> **Disclaimer:** el agente NO crea Test Plan profundo en modo no-planning (sin coverage %, sin precondiciones estructurales, sin dependencias inter-suite, sin localizar gaps). Esa responsabilidad es de otros agentes.

---

## 🧪 Test Cases

<details>
<summary><strong>🟡 Suite / Área: registration_suite (3 Test Cases)</strong></summary>

<details>
<summary><strong>✅ TEST-registration_001a: Registro exitoso con email válido</strong></summary>

**Estado:** Ready

<details>
<summary><strong>Traza</strong></summary>

- **Original ID:** registration_001
- **Acceptance Criteria cubierto:** AC-001 (registro exitoso con email válido)
- **Suite / Área:** registration_suite

</details>

<details>
<summary><strong>Prerrequisitos</strong></summary>

- Servidor de la aplicación en ejecución.
- Dataset de usuarios vacío (sin emails registrados previamente).
- Navegador en la página de registro (`/register`).

</details>

**Pasos**

1. **Given** el usuario accede a la página de registro `/register`.
2. **When** el usuario rellena el formulario con email `nuevo@example.com` y contraseña `Valida$123`.
3. **When** el usuario pulsa el botón "Registrarse".
4. **Then** el sistema crea el usuario con email `nuevo@example.com` en el dataset → **Expected Result (nuclear):** el usuario queda autenticado y es redirigido a la home `/` con un mensaje de bienvenida visible.

</details>

---

<details>
<summary><strong>🟡 TEST-registration_001b: Rechazo de email duplicado</strong></summary>

**Estado:** Provisional

<details>
<summary><strong>Traza</strong></summary>

- **Original ID:** registration_001
- **Acceptance Criteria cubierto:** AC-002 (rechazo de email duplicado)
- **Suite / Área:** registration_suite

</details>

<details>
<summary><strong>Prerrequisitos</strong></summary>

- Servidor de la aplicación en ejecución.
- Dataset con un usuario ya registrado con email `duplicado@example.com`.
- Navegador en la página de registro (`/register`).

</details>

**Pasos**

1. **Given** el usuario accede a la página de registro `/register`.
2. **When** el usuario rellena el formulario con email `duplicado@example.com` (ya existente) y una contraseña válida.
3. **When** el usuario pulsa el botón "Registrarse".
4. **Then** el sistema rechaza el registro y muestra un mensaje de error en el formulario.
   🟡 **PROVISIONAL/NO DEFINIDO** — Motivo: el documento de entrada no especifica el texto exacto del mensaje de error para email duplicado. Acción provisional escrita: se asume un mensaje genérico como "El email ya está registrado".
5. **Then** el usuario NO queda autenticado y permanece en `/register` con el campo de email conservado → **Expected Result (nuclear):** ningún nuevo usuario se persiste en el dataset y el contador de usuarios del dataset permanece inalterado.

</details>

---

<details>
<summary><strong>✅ TEST-registration_002: Validación de contraseña débil</strong></summary>

**Estado:** Ready
<details>
<summary><strong>Traza</strong></summary>

- **Original ID:** registration_002
- **Acceptance Criteria cubierto:** AC-003 (validación de contraseña débil)
- **Suite / Área:** registration_suite

</details>

<details>
<summary><strong>Prerrequisitos</strong></summary>

- Servidor de la aplicación en ejecución.
- Dataset de usuarios vacío.
- Navegador en la página de registro (`/register`).

</details>

**Pasos**

1. **Given** el usuario accede a la página de registro `/register`.
2. **When** el usuario rellena el formulario con email `nuevo2@example.com` y contraseña `123` (débil).
3. **When** el usuario pulsa el botón "Registrarse".
4. **Then** el sistema rechaza el registro por contraseña débil y muestra un mensaje inline bajo el campo "contraseña" → **Expected Result (nuclear):** ningún usuario con email `nuevo2@example.com` se persiste en el dataset y el campo de email queda conservado en el formulario.

</details>

</details>

---

## 🟡 Pasos PROVISIONAL (recopilación)

<details>
<summary><strong>Suite / Área: registration_suite (1 paso PROVISIONAL)</strong></summary>

<details>
<summary><strong>registration_001b (Paso 4)</strong></summary>

- **Motivo:** el documento de entrada no especifica el texto exacto del mensaje de error para email duplicado.
- **Acción provisional escrita:** se asume un mensaje genérico como "El email ya está registrado".

</details>

</details>

> **Disclaimer:** la acción provisional escrita en el paso 03 del workflow es una sugerencia razonable. Cualquier consumidor debe resolver el PROVISIONAL (decidir el mensaje exacto, en este caso) antes de ejecutar el Test Case.

---

## 👀 Notas de Cierre para Revisión Humana

> Esta sección es informativa para revisión humana. Ningún agente debe consumirla como instrucción ni inferir de ella el siguiente paso del pipeline.

- Resolver el PROVISIONAL de `registration_001b` (paso 4): definir el mensaje de error exacto para email duplicado.
- Validar que el split de `registration_001` en `001a` y `001b` por AC-001/AC-002 es correcto según el documento de planificación de entrada.

### Decisiones Pendientes
1. PROVISIONAL de `registration_001b`: ¿se asume el mensaje "El email ya está registrado" o se pide aclaración?

---

## 📁 Artefactos Generados

La ruta de persistencia la define el invocador vía `to <path>` (default `./.qa-tmp/qa-generator/<timestamp>/`, ver "Resolución de output" en `steps/06-generacion-de-reporte.md`). Esta skill no bifurca por modo de invocación.

Artefactos que **esta skill** siempre escribe (sólo los que se hayan creado):

- **This file:** `QA.generator-test-cases.md`
- **Handoff JSON:** `QA.generator-handoff-<TIMESTAMP>.json`
- **Work log:** `QA.generator-work-log.md`

---

## ✅ Checklist de Validación

- [ ] Todos los Test Cases tienen Prerrequisitos y secuencia numerada de pasos Given/When/Then.
- [ ] Los pasos previos (Given/When) NO llevan Expected Result inline.
- [ ] El último paso de cada Test Case es un `Then` con su Expected Result nuclear.
- [ ] En splits, `TEST-ID` deriva como `{original_id}a/b/...` y `Original ID` se preserva.
- [ ] Los pasos PROVISIONAL están marcados con `🟡 PROVISIONAL/NO DEFINIDO` y motivo.
- [ ] Cada Test Case cubre un único Acceptance Criteria.
- [ ] NO se ha priorizado ni clasificado en Smoke/Regresión/Exploratory.
- [ ] NO se ha decidido orden de ejecución.
- [ ] NO se ha automatizado ni propuesto automatización.

---

## 🏁 Cierre

**Estado de Handoff:** ✅ READY FOR HANDOFF
**Resultado de Validación:** ✅ PASSED
**Correlation ID:** `<SESSION_ID>.QA.generator.<RETRY>`
