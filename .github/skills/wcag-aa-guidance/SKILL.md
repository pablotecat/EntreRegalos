---
name: wcag-aa-guidance
description: "Guía operativa WCAG 2.2 A+AA para desarrollar o modificar UI web, diseñar o ejecutar pruebas de accesibilidad, revisar código o componentes, remediar hallazgos e interpretar criterios WCAG. Enruta cada tarea a la guideline local relevante y limita las conclusiones a la evidencia disponible."
user-invocable: true
argument-hint: "tarea, componente o hallazgo WCAG; opcional: IDs de criterios, alcance de revisión, 'to <path>', 'preview'/'no-save' o 'summary'"
---

# WCAG AA Guidance

Referencia operativa invocable cuando una tarea necesita WCAG 2.2 A+AA. No inicia auditorías por sí sola ni convierte una tarea de Front o QA en un workflow de conformidad.

## Enrutamiento

1. Clasifica la solicitud en una de estas ramas. Si combina ramas, aplica cada una solo a la parte correspondiente.
2. Trabaja **local-first**: inspecciona primero el componente, estilos, tests, design system, requisitos y comportamiento disponibles en el repositorio.
3. Si desconoces los IDs aplicables, carga primero [`references/task-index.md`](references/task-index.md). Si ya conoces los IDs, ve directamente a sus archivos de guideline.
4. Carga únicamente los archivos de guideline relevantes. Carga los 13 solo cuando el usuario pida una revisión completa A+AA.

### Consulta

Para interpretar un criterio, una excepción o el alcance de WCAG, carga [`references/wcag-22-baseline.md`](references/wcag-22-baseline.md) y la guideline correspondiente. Responde la pregunta concreta, separando requisito normativo, apoyo no normativo y juicio dependiente del contexto.

**Completa cuando** la interpretación identifica criterio, nivel, aplicabilidad, límites de la evidencia y fuente que gobierna la respuesta.

### Desarrollo

Para crear o modificar UI web, identifica las tareas y componentes afectados, carga sus guidelines y usa los criterios como requisitos de implementación. Conserva los patrones accesibles locales que ya satisfacen el propósito; verifica con la evidencia estática, automática o manual que permita el cambio.

**Completa cuando** cada criterio relevante está implementado o una limitación concreta queda expuesta al usuario.

### Testing

Para diseñar, escribir o ejecutar pruebas de accesibilidad, deriva checks observables de las guidelines aplicables. Distingue lo automatizable de lo que exige interacción, inspección visual, teclado, lector de pantalla, contenido real o juicio humano. Comunica resultados dentro de la salida normal de la tarea; genera un reporte WCAG solo si el usuario solicita una revisión.

**Completa cuando** cada check indica criterio, método, resultado observado y cobertura pendiente.

### Remediación

Para corregir un hallazgo, parte de su ID cuando exista; de lo contrario, usa el índice para localizar candidatos y confirma el criterio antes de editar. Carga la guideline correspondiente, corrige la causa en el nivel reutilizable más cercano y repite el método que produjo el hallazgo junto con los checks relacionados.

**Completa cuando** el hallazgo original queda retestado y los efectos relacionados quedan verificados o declarados como pendientes.

### Revisión Limitada

Activa esta rama solo ante una petición explícita de revisar o auditar. Define alcance, artefactos, estados de interacción, métodos y criterios; carga [`references/wcag-22-baseline.md`](references/wcag-22-baseline.md), [`references/review-format.md`](references/review-format.md) y las guidelines aplicables. Una revisión completa A+AA debe cargar los 13 archivos y contabilizar los 55 criterios activos. Toda revisión sigue limitada por su alcance y evidencia: no emite una afirmación global de conformidad ni certificación legal.

**Completa cuando** cada criterio del alcance conserva un único estado permitido, el reporte pasa sus controles de agregación y la salida respeta la directiva del usuario.

## Mapa De Guidelines

| Guideline | Referencia |
|---|---|
| 1.1 Text Alternatives | [`references/perceivable/1.1-text-alternatives.md`](references/perceivable/1.1-text-alternatives.md) |
| 1.2 Time-based Media | [`references/perceivable/1.2-time-based-media.md`](references/perceivable/1.2-time-based-media.md) |
| 1.3 Adaptable | [`references/perceivable/1.3-adaptable.md`](references/perceivable/1.3-adaptable.md) |
| 1.4 Distinguishable | [`references/perceivable/1.4-distinguishable.md`](references/perceivable/1.4-distinguishable.md) |
| 2.1 Keyboard Accessible | [`references/operable/2.1-keyboard-accessible.md`](references/operable/2.1-keyboard-accessible.md) |
| 2.2 Enough Time | [`references/operable/2.2-enough-time.md`](references/operable/2.2-enough-time.md) |
| 2.3 Seizures and Physical Reactions | [`references/operable/2.3-seizures-and-physical-reactions.md`](references/operable/2.3-seizures-and-physical-reactions.md) |
| 2.4 Navigable | [`references/operable/2.4-navigable.md`](references/operable/2.4-navigable.md) |
| 2.5 Input Modalities | [`references/operable/2.5-input-modalities.md`](references/operable/2.5-input-modalities.md) |
| 3.1 Readable | [`references/understandable/3.1-readable.md`](references/understandable/3.1-readable.md) |
| 3.2 Predictable | [`references/understandable/3.2-predictable.md`](references/understandable/3.2-predictable.md) |
| 3.3 Input Assistance | [`references/understandable/3.3-input-assistance.md`](references/understandable/3.3-input-assistance.md) |
| 4.1 Compatible | [`references/robust/4.1-compatible.md`](references/robust/4.1-compatible.md) |

## Guardrails

- Limita toda conclusión al alcance, estados, métodos y evidencia realmente examinados.
- Trata `NO_FAILURE_OBSERVED` como ausencia de fallo observado, no como `PASS` ni conformidad.
- Usa el texto normativo de W3C cuando una referencia local resulte ambigua o entre en conflicto.
- Produce un reporte únicamente para la rama de revisión solicitada; desarrollo, testing, remediación y consulta conservan el formato propio de su tarea.
