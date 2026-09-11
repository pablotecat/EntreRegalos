# Test Documentation - Análisis Completado

**Session ID:** <SESSION_ID>
**Productor:** <rol> (si invoca agente, su nombre ej. `QA.documentation`; si invoca usuario standalone, `qa-documentation`)
**Fecha/Hora:** <ISO_8601_TIMESTAMP>
**Estado de Ejecución:** ✅ COMPLETED
**Modelo Usado:** <MODEL_NAME>

---

## 📊 Resumen Ejecutivo

### Métricas Clave
- **Requisitos Extraídos:** <REQ_COUNT> (normalizados en Gherkin)
- **Gaps Identificados:** <GAP_COUNT> (<CRITICAL_COUNT> CRITICAL, <HIGH_COUNT> HIGH, <MEDIUM_COUNT> MEDIUM, <LOW_COUNT> LOW)
- **Áreas de Testing:** <AREA_COUNT> (<AREA_1>, <AREA_2>, <AREA_3>, <AREA_4>, <AREA_5>)
- **Endpoints API:** <ENDPOINT_COUNT> documentados con payloads y respuestas
- **Trazabilidad:** <TRACEABILITY_PERCENT>% verificada a código fuente

### Hallazgos Críticos
> Solo se listan aquí los gaps CRITICAL y HIGH. MEDIUM y LOW figuran en la sección "Gaps Identificados (Detalle por Severidad)".

```
🔴 CRITICAL: <CRITICAL_FINDING_1>
🔴 CRITICAL: <CRITICAL_FINDING_2>
🟡 HIGH: <HIGH_FINDING_1>
🟡 HIGH: <HIGH_FINDING_2>
```

### Índice del Documento
- [Resumen Ejecutivo](#-resumen-ejecutivo)
- [Requisitos Normalizados por Área](#-requisitos-normalizados-por-área)
- [API Endpoints Documentados](#-api-endpoints-documentados)
- [Gaps Identificados (Detalle por Severidad)](#-gaps-identificados-detalle-por-severidad)
- [Notas de Cierre para Revisión Humana](#-notas-de-cierre-para-revisión-humana)
- [Artefactos Generados](#-artefactos-generados)
- [Checklist de Validación](#-checklist-de-validación)
- [Cierre](#-cierre)

---

## 📋 Requisitos Normalizados por Área

### Resumen de Áreas
- <AREA_NAME_1>: <REQ_AREA_1_COUNT> requisitos, <GAPS_AREA_1_COUNT> gaps
- <AREA_NAME_2>: <REQ_AREA_2_COUNT> requisitos, <GAPS_AREA_2_COUNT> gaps

---

<details>
<summary><strong>Area 1: &lt;AREA_NAME_1&gt; (&lt;REQ_AREA_1_COUNT&gt; requisitos)</strong></summary>

| ID | Título | Gherkin | Fuente |
|----|--------|---------|--------|
| REQ-<NNN> | <REQ_TITLE_1> | Given <...> When <...> Then <...> | <SOURCE_1> |
| REQ-<NNN> | <REQ_TITLE_2> | Given <...> When <...> Then <...> | <SOURCE_2> |

**Blocker Gaps:** <BLOCKER_GAPS_AREA_1>
**Advisory Gaps:** <ADVISORY_GAPS_AREA_1>

</details>

---

<details>
<summary><strong>Area 2: &lt;AREA_NAME_2&gt; (&lt;REQ_AREA_2_COUNT&gt; requisitos)</strong></summary>

| ID | Título | Gherkin | Fuente |
|----|--------|---------|--------|
| REQ-<NNN> | <REQ_TITLE_3> | Given <...> When <...> Then <...> | <SOURCE_3> |

**Blocker Gaps:** <BLOCKER_GAPS_AREA_2>

</details>

---

## 🔗 API Endpoints Documentados

<details>
<summary><strong>&lt;METHOD&gt; &lt;ENDPOINT_1&gt;</strong></summary>

```json
Request:  { <REQUEST_SCHEMA> }
Response: { <RESPONSE_SCHEMA> }
Errors:   <ERROR_SCHEMAS>
```

</details>

<details>
<summary><strong>&lt;METHOD&gt; &lt;ENDPOINT_2&gt;</strong></summary>

```json
Response: { <RESPONSE_SCHEMA> }
Errors:   <ERROR_SCHEMAS>
```

</details>

---

## ⚠️ Gaps Identificados (Detalle por Severidad)

> Detalle completo de todos los gaps identificados, ordenado por severidad descendente. El Resumen Ejecutivo solo lista CRITICAL y HIGH; esta sección los amplía e incluye MEDIUM y LOW.

<details>
<summary><strong>🔴 CRITICAL (<CRITICAL_COUNT>)</strong></summary>

<details>
<summary><strong>GAP-&lt;NNN&gt; · &lt;GAP_TITLE_1&gt;</strong></summary>

- **Categoría:** &lt;CATEGORY_1&gt;
- **Impacto en Testing:** &lt;TEST_IMPACT_1&gt;
- **Recomendación:** &lt;RECOMMENDATION_1&gt;

</details>

</details>

<details>
<summary><strong>🟡 HIGH (<HIGH_COUNT>)</strong></summary>

<details>
<summary><strong>GAP-&lt;NNN&gt; · &lt;GAP_TITLE_2&gt;</strong></summary>

- **Categoría:** &lt;CATEGORY_2&gt;
- **Impacto en Testing:** &lt;TEST_IMPACT_2&gt;
- **Recomendación:** &lt;RECOMMENDATION_2&gt;

</details>

</details>

<details>
<summary><strong>🔵 MEDIUM (<MEDIUM_COUNT>)</strong></summary>

<details>
<summary><strong>GAP-&lt;NNN&gt; · &lt;GAP_TITLE_3&gt;</strong></summary>

- **Categoría:** &lt;CATEGORY_3&gt;
- **Impacto en Testing:** &lt;TEST_IMPACT_3&gt;
- **Recomendación:** &lt;RECOMMENDATION_3&gt;

</details>

</details>

<details>
<summary><strong>🟢 LOW (<LOW_COUNT>)</strong></summary>

<details>
<summary><strong>GAP-&lt;NNN&gt; · &lt;GAP_TITLE_4&gt;</strong></summary>

- **Categoría:** &lt;CATEGORY_4&gt;
- **Impacto en Testing:** &lt;TEST_IMPACT_4&gt;
- **Recomendación:** &lt;RECOMMENDATION_4&gt;

</details>

</details>

---

## 🚀 Notas de Cierre para Revisión Humana

> Esta sección es informativa para revisión humana. Ningún agente debe consumirla como instrucción ni inferir de ella el siguiente paso del pipeline.

- Revisar los <REQ_COUNT> requisitos normalizados
- Evaluar los <GAP_COUNT> gaps identificados

### Decisiones Pendientes
1. <DECISION_POINT_1>
2. <DECISION_POINT_2>
3. <DECISION_POINT_3>

---

## 📁 Artefactos Generados

Ruta `output dir`: (sólo los que se hayan creado)
- **Analysis Report:** `QA.documentation-analysis-report.md` (este archivo)
- **Work Log:** `QA.documentation-work-log.md`
- **Handoff JSON:** `QA.documentation-handoff-<TIMESTAMP>.json`

---

## ✅ Checklist de Validación

- [ ] All requirements extracted from source code
- [ ] Gherkin syntax validation (Given/When/Then format)
- [ ] Source traceability verified
- [ ] Gaps identified and classified by severity
- [ ] No test cases created (documentation-only scope)

---

## 🏁 Cierre

**Estado de Handoff:** ✅ READY FOR HANDOFF
**Resultado de Validación:** ✅ PASSED
