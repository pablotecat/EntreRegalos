# Guía de Reporte Test Generator

Genera un archivo markdown con el conjunto completo de Test Cases para el rol de diseño de pruebas.

## Nombre de Archivo de Salida Requerido

- `QA.generator-test-cases.md`

## Secciones Requeridas

DEBES incluir las siguientes secciones, en este orden. Las secciones marcadas como **obligatorias** deben aparecer siempre; las contextuales solo si aplican al caso.

### Metadatos (obligatoria)
- Session ID
- Productor
- Fecha/Hora
- Estado
- Modo de entrada (planning-done o no-planning)
- Modelo Usado

### Secciones Base (obligatorias)

1. Resumen Ejecutivo
- Estado del set de Test Cases
- Totales de Test Cases generados, Test Cases spliteados, pasos PROVISIONAL totales
- Acceptance Criteria cubiertos vs. pendientes de cubrir
- Hallazgos relevantes (sin priorizar)

2. Modo de Entrada
- Tipo de documento de entrada consumido (planning-done vs no-planning)
- En modo no-planning: agrupación ligera por área funcional aplicada (solo para enlazar test↔requisito)
- Disclaimer obligatorio: esta skill NO crea Test Plan profundo en modo no-planning (sin coverage %, sin precondiciones estructurales, sin dependencias inter-suite, sin localizar gaps).

3. Test Cases
- Agrupar los Test Cases por `Suite / Área` en bloques HTML `<details>` colapsados por defecto. El `<summary>` incluye un emoticono de estado agregado, la suite o área y el total de Test Cases. El emoticono se calcula a partir de los estados de los Test Cases contenidos: `⛔` si alguno está Blocked; si no, `🟡` si alguno está Provisional; si no, `✅`.
- Cada Test Case debe estar en un bloque HTML `<details>` anidado y colapsado por defecto, siguiendo la plantilla OBLIGATORIA `assets/test-case-template.md` (anatomía B). El `<summary>` antepone el emoticono del `Estado` del Test Case: `✅` Ready, `🟡` Provisional, `⛔` Blocked.
- Cada bloque incluye: Header con `TEST-ID` + `Title`; **Estado** (visible arriba de todo, con valores `Ready`, `Provisional` o `Blocked`); **Traza** (bloque `<details>` colapsado por defecto con `Original ID`, `Acceptance Criteria cubierto`, `Suite / Área`); Prerrequisitos (lista en `<details>` colapsado); Pasos numerados Given/When/Then (sin expecteds inline en los pasos previos; último paso Then con Expected Result nuclear); en splits, `TEST-ID` = `{original_id}a/b/...` y `Original ID` preservado
- Los Prerrequisitos de cada Test Case deben estar en un bloque HTML `<details>` anidado y colapsado por defecto.
- Pasos PROVISIONAL marcados con `🟡 PROVISIONAL/NO DEFINIDO` + motivo según el paso 04

4. Pasos PROVISIONAL (recopilación)
- Lista agrupada por `Suite / Área`, usando bloques HTML `<details>` colapsados por defecto.
- Dentro de cada suite o área, cada paso provisional debe estar en un bloque `<details>` anidado y colapsado, con `<summary>` `TEST-ID (tipo)`, donde tipo es `Prerrequisito <N>` o `Paso <N>`.
- Cada bloque de paso provisional incluye el motivo (qué input falta) y la acción provisional escrita.
- Disclaimer obligatorio: la acción provisional escrita en el paso 03 es una sugerencia razonable; cualquier consumidor debe resolver el PROVISIONAL antes de ejecutar el Test Case

5. Notas de Cierre para Revisión Humana
- Puntos que un revisor humano podría querer mirar a continuación
- **Disclaimer obligatorio:** esta sección es informativa para revisión humana; ningún consumidor (agente downstream o usuario) debe tomarla como instrucción ni inferir de ella el siguiente paso del pipeline

6. Artefactos Generados
- lista de Artefactos generados

7. Checklist de Validación
- Checklist de completitud del set de Test Cases

### Secciones Contextuales (incluir solo si aplican)
- Decisiones Pendientes (dentro de Notas de Cierre): preguntas abiertas que requieren input humano (p. ej. ACs no inferibles, pasos PROVISIONAL críticos, trazabilidad rota no resuelta)

### Cierre (obligatoria)
- Estado de Handoff
- Resultado de Validación
- Correlation ID

## Puerta de Calidad

Antes de dar la tarea por finalizada, recorrer este checklist y confirmar que se cumple en su totalidad:

- [ ] Están presentes los metadatos (Session ID, Agente, Fecha/Hora, Estado, Modo de entrada, Modelo Usado).
- [ ] Están presentes las 7 secciones base (incluyendo Notas de Cierre para Revisión Humana con disclaimer).
- [ ] Está presente el cierre completo (Estado de Handoff, Resultado de Validación, Correlation ID).
- [ ] Cada Test Case sigue la plantilla OBLIGATORIA `assets/test-case-template.md` (anatomía B), con **Estado** visible (Ready/Provisional/Blocked) y **Traza** en `<details>` colapsado.
- [ ] Los pasos previos Given/When NO llevan Expected Result inline; solo el último Then lleva el Expected Result nuclear.
- [ ] Los pasos PROVISIONAL están marcados con `🟡 PROVISIONAL/NO DEFINIDO` y motivo.
- [ ] En splits, los `TEST-ID` derivan como `{original_id}a/b/...` y `Original ID` se preserva.
- [ ] Los conteos de Test Cases, splits y PROVISIONAL son consistentes con el handoff JSON.

Si algún punto no se cumple, la tarea no debe marcarse como finalizada.
