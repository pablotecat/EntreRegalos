# Paso 1: Analisis de Entrada (Fase Critica)

## Objetivo del Paso

Leer y comprender de forma exhaustiva el documento de entrada recibido, identificando si es un documento de planificación (preferido, con suites y nombres de tests) o un documento de requisitos (alternativo, con Acceptance Criteria sueltos). Extraer los escenarios, los Acceptance Criteria cubiertos y las dependencias que serviran de base para el diseño de pasos de Test Cases.

## Modelo Recomendado

Usa el modelo de razonamiento mas potente disponible para este paso. Es la fase critica de la que depende todo el diseño de Test Cases: prioriza comprensión y precisión sobre velocidad.

## Enfoque Exclusivo

Durante este paso tu unico objetivo es leer y entender. No diseñes Test Cases todavía, ni particiones por AC, ni pasos numerados, ni marques provisionales. Asimila el documento de entrada y, en modo requisitos directos, pre-armas una agrupación ligera por área (sin modelamiento de cobertura ni dependencias inter-suite).

## Secuencia

1. Detecta el tipo de documento de entrada:
   - Si contiene suites y "escenarios" como nombres de tests (id, title, sin pasos), es modo **planning-done** (caso preferido).
   - Si contiene un analysis-report o requisitos sueltos con Acceptance Criteria pero sin suites organizadas, es modo **no-planning** (caso alternativo).
2. Lee el documento de entrada completo.
3. Dependiendo del modo:
   - **Si el modo es planning-done:** Extrae: suites (suite_id, name, description, requirements origen), escenarios (id, title), Acceptance Criteria cubiertos por cada escenario, gaps y dependencias inter-suite estructurales.
   - **Si el modo es no-planning:** Lee los Acceptance Criteria explícitos; pre-armar una agrupación ligera por área funcional SOLO para enlazar Test Case con requisito. No crear Test Plan profundo: sin modelamiento de cobertura, sin precondiciones estructurales, sin dependencias inter-suite, sin localizar gaps.

## Manejo de bloqueos por documentación insuficiente

Recopila ambigüedades o faltantes detectados (AC sin definir claramente, requisitos sin contexto, escenarios sin Acceptance Criteria asociado) como GAP preliminar y continúa sin detenerte.

## Checklist de completitud

- [ ] Se identificó el modo de entrada (planning-done vs no-planning).
- [ ] Se leyó el documento de entrada completo.
- [ ] En modo planning-done: se extrajeron suites, escenarios (id, title), ACs cubiertos, gaps y dependencias.
- [ ] En modo no-planning: se identificaron Acceptance Criteria y se preparó agrupación ligera por área.
- [ ] Se registraron ambigüedades o faltantes como GAP preliminar sin detener el flujo.
