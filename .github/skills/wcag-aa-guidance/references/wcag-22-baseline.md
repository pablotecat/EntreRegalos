# Baseline WCAG 2.2 A+AA

## Alcance De La Baseline

- Estándar: **Web Content Accessibility Guidelines (WCAG) 2.2**, W3C Recommendation del **2024-12-12**.
- Cobertura activa de niveles A+AA: **55 criterios**, compuestos por **31 de nivel A** y **24 de nivel AA**.
- `4.1.1 Parsing` es obsoleto y fue eliminado en WCAG 2.2. No lo evalúes, no lo cuentes y no inventes un resultado para conservar compatibilidad con versiones anteriores.
- Los criterios AAA y una evaluación legal o regulatoria quedan fuera de esta baseline salvo que el usuario solicite expresamente otra referencia. La salida técnica no constituye certificación legal.

## Jerarquía De Fuentes

1. **Normativa**: [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/), incluidos criterios de éxito, términos definidos y requisitos de conformidad. Esta fuente gobierna cuando existe conflicto.
2. **Apoyo no normativo de W3C**: [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), [Techniques for WCAG 2.2](https://www.w3.org/WAI/WCAG22/Techniques/) y [How to Meet WCAG](https://www.w3.org/WAI/WCAG22/quickref/). Explican intención, ejemplos, técnicas suficientes o advisory y fallos comunes; una técnica concreta no es obligatoria si otra solución satisface el criterio.
3. **Referencia operativa local**: los archivos de guideline de esta skill resumen requisitos, señales, pruebas y remediaciones para trabajar en el repositorio. Son ayuda derivada, no texto normativo.
4. **Evidencia del producto**: código, DOM computado, estilos, contenido, tests, capturas, ejecución y pruebas manuales determinan qué puede concluirse sobre el alcance revisado.

No presentes una técnica, herramienta automática o patrón local como si fuera el criterio normativo. Cita la fuente normativa para el requisito y la fuente de apoyo para la interpretación o técnica.

## Local-first Y Escalado

Inspecciona primero artefactos locales y carga la guideline local aplicable. Escala a W3C cuando ocurra al menos uno de estos casos:

- El texto exacto, una definición, una excepción, una nota de conformidad o la relación entre niveles cambia la decisión.
- La referencia local es ausente, ambigua, contradictoria o posiblemente desactualizada.
- Debes confirmar si una técnica o failure documentado realmente cubre el criterio.
- El usuario solicita interpretación normativa, citas o trazabilidad de fuentes.

Para compatibilidad actual de browser o assistive technology, consulta además documentación primaria del proveedor o resultados de pruebas reproducibles. Para una pregunta legal o regulatoria, identifica jurisdicción y versión aplicable y remite a fuentes oficiales; conserva la respuesta como orientación técnica, no certificación.

## Semántica De Resultados

Un resultado describe únicamente un **criterio**, un **alcance**, los **estados del producto observados** y los **métodos ejecutados**:

- Una evidencia directa que contradice el criterio permite `FAIL`.
- Una señal plausible que requiere ejecución, contenido, tecnología asistiva o juicio no disponible permite `POTENTIAL_FAILURE`.
- Checks pertinentes ejecutados sin encontrar un fallo permiten `NO_FAILURE_OBSERVED`; este estado no equivale a `PASS` ni demuestra conformidad.
- Un criterio que no puede aplicar a ningún elemento o comportamiento del alcance permite `NOT_APPLICABLE`, con justificación.
- Evidencia o métodos no ejecutados se conservan como `NOT_TESTED`, no como resultado favorable.

La automatización detecta solo una parte de WCAG. Una ausencia de findings automáticos conserva como pendientes los checks manuales relevantes. Las revisiones usan las reglas de estado, agregación y salida de [`review-format.md`](review-format.md).

## Límite De Conformidad

Una afirmación de conformidad WCAG requiere satisfacer todos los requisitos normativos de conformidad para páginas completas, procesos completos y tecnologías soportadas, no solo criterios muestreados o código estático. Por tanto, incluso una revisión de los 55 criterios se describe como revisión A+AA completa **del alcance y evidencia indicados**, nunca como afirmación global de conformidad del producto.
