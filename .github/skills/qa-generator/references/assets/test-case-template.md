# Plantilla OBLIGATORIA de Test Case (anatomía B)

Esta plantilla ES OBLIGATORIA. No es un ejemplo, es el formato que debe seguirse en `QA.generator-test-cases.md`.

Agrupa los Test Cases por suite o área. Cada suite, cada Test Case y sus Prerrequisitos deben usar los bloques HTML `<details>` mostrados abajo, sin atributo `open`, para permanecer colapsados por defecto. Sustituye los `<PLACEHOLDERS>` con valores reales.

**Emoticono de estado en los títulos:**
- En cada Test Case, antepón al `TEST-<ID>` el emoticono según su `Estado`: `✅` Ready, `🟡` Provisional, `⛔` Blocked.
- En cada Suite / Área, antepón el emoticono calculado a partir de los estados de sus Test Cases: `⛔` si alguno está Blocked; si no, `🟡` si alguno está Provisional; si no, `✅`.

---

<details>
<summary><strong>&lt;SUITE_ICON&gt; Suite / Área: &lt;SUITE_OR_AREA&gt; (&lt;TEST_CASE_COUNT&gt; Test Cases)</strong></summary>

Repite el siguiente bloque por cada Test Case de la suite o área.

<details>
<summary><strong>&lt;TEST_ICON&gt; TEST-&lt;ID&gt;: &lt;Title&gt;</strong></summary>

**Estado:** Ready | Provisional | Blocked

<details>
<summary><strong>Traza</strong></summary>

- **Original ID:** <original_id del documento de entrada | N/A (modo no-planning sin ID original)>
- **Acceptance Criteria cubierto:** <ref al AC del documento de entrada, p. ej. AC-001 o REQ-NNN>
- **Suite / Área:** <suite_id del planner | área funcional en modo no-planning>

</details>

<details>
<summary><strong>Prerrequisitos</strong></summary>

- <Pre-condición 1: estado inicial, datos, configuración necesaria antes de ejecutar el Test Case.>
- <Pre-condición 2: ...>
- <(añadir más según convenga; puede estar vacío si el Test Case no requiere prerrequisitos especiales)>

</details>

**Pasos**

1. **Given** <estado inicial/contexto del paso.>
2. **When** <acción realizada por el usuario o sistema.>
3. **When** <acción adicional si la prueba lo requiere (pueden aparecer varios When).>
4. **Then** <verificación intermedia (opcional, si la necesitas).>
   🟡 **PROVISIONAL/NO DEFINIDO** — Motivo: <qué input falta del documento de entrada>. Acción provisional escrita: <acción razonable asumida>.
5. **Then** <verificación final del Test Case> → **Expected Result (nuclear):** <resultado nuclear del Test Case, redactado de forma observable y verificable.>

</details>

</details>

---

## Reglas de la plantilla (anatomía B)

1. **Estructura colapsable:** agrupa los Test Cases por `Suite / Área` en un `<details>` colapsado. Dentro, cada Test Case debe tener su propio `<details>` colapsado, con `<summary>` `<TEST_ICON> TEST-<ID>: <Title>` donde `<TEST_ICON>` refleja su `Estado` (`✅` Ready, `🟡` Provisional, `⛔` Blocked). El `<summary>` de la Suite antepone `<SUITE_ICON>`, calculado como `⛔` si algún Test Case está Blocked, `🟡` si alguno está Provisional y `✅` en caso contrario. Los **Prerrequisitos** van en un tercer `<details>` anidado y colapsado.

2. **Metadatos obligatorios:** `Estado` (visible arriba de todo) y `Traza` (bloque `<details>` colapsado por defecto con `Original ID`, `Acceptance Criteria cubierto`, `Suite / Área`).
   - **Estado** admite tres valores:
     - `✅Ready`: todo ok, el Test Case está definido y verificado.
     - `🟡Provisional`: definición actual asumida; hay pasos marcados `🟡 PROVISIONAL/NO DEFINIDO` que requieren confirmación humana antes de ejecutar.
     - `⛔Blocked`: existe una incidencia grave que ha de resolver el humano (p. ej. AC no inferible, trazabilidad rota no resuelta, dependencia bloqueante).
   - `Original ID` es el ID del documento de entrada (escenario del planner, p. ej. `registration_001`). Si se está en modo no-planning usar `N/A`.
   - En **splits**, `Original ID` se conserva con el valor original (p. ej. los Test Cases `registration_001a` y `registration_001b` ambos con `Original ID: registration_001`).

3. **Prerrequisitos:** lista. Estado inicial, datos y configuración necesarios antes de ejecutar el Test Case. Puede estar vacía si no aplica.

4. **Pasos numerados:** secuencia `Given` / `When` / `Then` (pueden aparecer varios pasos de cada tipo según la prueba).
   - Los pasos previos (`Given` y `When`) **NO llevan Expected Result inline**.
   - El **ÚLTIMO paso ES OBLIGATORIAMENTE un `Then`**.   
   
5. **Expected Result (nuclear)** es el resultado nuclear del Test Case. Es una sección aparte; no vive dentro del último paso. Es muy explícita con lo esperado del tests, es la comprobación atómica y nuclear de la prueba.

6. **Pasos PROVISIONAL:** Si un paso (incluido un Prerrequisito) no está claro por falta de definición en el documento de entrada, el marcaje explícito `🟡 PROVISIONAL` con motivo se incluye en el propio paso (lo decide el paso 04 del workflow). La acción provisional se escribe en el paso 03 del workflow.

7. **IDs en splits:** Si un escenario del documento de entrada se splitea en N Test Cases por cubrir N Acceptance Criteria:
   - `TEST-ID` deriva como `<original_id>a`, `<original_id>b`, ... (respetando el orden de los ACs).
   - `Original ID` se conserva con el valor `<original_id>` en todos los Test Case hijos.

8. **Prueba un único AC:** En la medida de lo posible, un Test Case prueba un único Acceptance Criteria. Si el documento de entrada cubre N ACs en un solo escenario, **splitear** en N Test Cases (regla 6).

9. **No priorizar, no clasificar, no automatizar:** la plantilla no incluye campos de prioridad, criticidad, tier (Smoke/Regresión/Exploratory) ni automatización. Esos son Non-goals de esta skill.
