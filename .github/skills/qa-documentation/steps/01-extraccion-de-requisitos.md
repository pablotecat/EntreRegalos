# Paso 1: Extraccion de Requisitos (Fase Critica)

## Objetivo del Paso

Extraer de forma exhaustiva y trazable todos los requisitos, criterios de aceptacion, precondiciones y dependencias desde las fuentes originales.

## Modelo Recomendado

Usa el modelo de razonamiento mas potente disponible para este paso. Es la fase critica de la que depende todo el pipeline: prioriza exhaustividad y precision sobre velocidad.

## Enfoque Exclusivo

Durante este paso tu ÚNICO objetivo es leer y extraer.

## Secuencia

1. Lee la documentacion, especificacion tecnica, flujos de UI y API specs disponibles.
2. Identifica features, user stories y funcionalidades.
3. Extrae criterios de aceptacion explicitos e implicitos por cada funcionalidad.
4. Lista precondiciones y dependencias detectadas.
5. Si encuentras ambiguedad o falta de informacion, anotala brevemente como GAP preliminar y continua sin detenerte.

## Guardarrailes de calidad

🛑 **No mezclar dominios ni ramas**:
- Un endpoint API y su flujo UI asociado son requisitos **distintos** (uno prueba contrato, otro prueba interacción). No fusionar.
- Cada rama observable (happy path, error HTTP, catch de red) es un requisito **distinto**. Prohibido empaquetar ok/error/catch en un solo Gherkin.
- Cada combinación (verbo HTTP + status code) es un requisito **distinto**. No fusionar los 404 de GET/PUT/DELETE en un solo requisito.


## Checklist de completitud

- [ ] Se revisaron todas las fuentes relevantes (documentacion, especificacion tecnica, UI y API).
- [ ] Cada feature/user story de las fuentes tiene al menos un criterio de aceptación (explícito o inferido) registrado.
- [ ] Se extrajeron criterios de aceptacion explicitos e implicitos.
- [ ] Se listaron precondiciones y dependencias.
- [ ] Se registraron ambiguedades o faltantes como GAP sin detener el flujo.
- [ ] Cada rama observable y cada combinación verbo+status_code se extrajo como requisito separado (no se empaquetaron ok/error/catch juntos).
