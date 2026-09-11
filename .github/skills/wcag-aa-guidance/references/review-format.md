# Formato De Revisión Limitada

Usa este contrato solo cuando el usuario solicite una revisión o auditoría. El reporte registra evidencia acotada y evita lenguaje de certificación o conformidad global.

## Estados Permitidos

Cada criterio incluido conserva exactamente uno de estos estados agregados:

| Estado | Uso |
|---|---|
| `FAIL` | Existe al menos una evidencia reproducible que contradice el criterio dentro del alcance. |
| `POTENTIAL_FAILURE` | Existe una señal concreta de posible incumplimiento, pero falta evidencia necesaria para confirmarla o descartarla. |
| `NO_FAILURE_OBSERVED` | Se ejecutaron los checks declarados y no se observó fallo; no significa `PASS` ni conformidad. |
| `NOT_APPLICABLE` | Ningún contenido, componente o comportamiento del alcance activa el criterio; incluye la razón. |
| `NOT_TESTED` | El criterio pertenece al alcance, pero no se ejecutó evidencia suficiente para asignar otro estado; incluye el método pendiente. |

No uses `PASS`, `COMPLIANT`, `PARTIAL` ni equivalentes. Registra incertidumbre como `POTENTIAL_FAILURE` o `NOT_TESTED`, según exista o no una señal concreta.

## Agregación

Agrega observaciones de cada criterio con esta precedencia:

1. Una o más observaciones confirmadas producen `FAIL`.
2. Sin `FAIL`, una o más señales sin confirmar producen `POTENTIAL_FAILURE`.
3. Sin señales, un criterio aplicable con todos los métodos declarados ejecutados produce `NO_FAILURE_OBSERVED`.
4. `NOT_APPLICABLE` exige que el criterio no aplique a todo el alcance revisado, no solo a una muestra.
5. Todo caso restante produce `NOT_TESTED` e identifica la cobertura faltante.

## Esquema Del Reporte

```markdown
# Revisión limitada WCAG 2.2 A+AA

## Contexto
- Fecha: <ISO-8601>
- Tipo: <criterios seleccionados | A+AA completo>
- Alcance: <páginas, componentes, archivos, rutas y estados>
- Evidencia: <artefactos y versiones examinados>
- Métodos ejecutados: <estático, herramienta y versión, browser, teclado, visual, AT y versión, otros>
- Métodos pendientes: <métodos y estados no cubiertos>
- Limitaciones: <contenido, autenticación, viewport, datos, entorno u otras>

## Resumen
| Estado | Criterios |
|---|---:|
| FAIL | <n> |
| POTENTIAL_FAILURE | <n> |
| NO_FAILURE_OBSERVED | <n> |
| NOT_APPLICABLE | <n> |
| NOT_TESTED | <n> |
| Total | <n> |

## Resultados
| Criterio | Nivel | Estado | Evidencia y ubicación | Métodos | Acción o prueba pendiente |
|---|---|---|---|---|---|
| <ID y nombre> | <A|AA> | <estado> | <hecho reproducible; archivo:línea, ruta o estado> | <ejecutados> | <remediación verificable o método faltante> |

## Observaciones
### <ID> - <nombre>
- Objetivo: <elemento, componente o página>
- Resultado: <fallo, señal, ausencia observada, no aplicabilidad o cobertura pendiente>
- Evidencia: <pasos y resultado esperado/observado>
- Impacto: <barrera funcional sin inventar severidad normativa>
- Recomendación: <cambio ligado a la causa>
- Retest: <procedimiento para verificar>

## Límites De La Conclusión
<Declaración explícita de que los resultados se limitan al alcance, estados, evidencia y métodos anteriores y no constituyen certificación legal ni afirmación global de conformidad.>
```

Incluye una observación detallada para cada `FAIL` y `POTENTIAL_FAILURE`. Para los demás estados, amplía la fila solo cuando haga falta conservar justificación o cobertura pendiente.

## Controles De Conservación

Antes de entregar, verifica todos estos invariantes:

- Existe una sola fila agregada por ID de criterio; ninguna fila mezcla dos criterios.
- `FAIL + POTENTIAL_FAILURE + NO_FAILURE_OBSERVED + NOT_APPLICABLE + NOT_TESTED = Total`.
- El total coincide con el número de IDs únicos en Resultados.
- Cada `FAIL` y `POTENTIAL_FAILURE` enlaza al menos una observación y cada observación enlaza una fila agregada.
- Cada `NOT_APPLICABLE` conserva una razón y cada `NOT_TESTED` conserva el método o evidencia pendiente.
- Una revisión completa A+AA contiene exactamente 55 IDs activos: 31 A y 24 AA, distribuidos por los 13 archivos de guideline; `4.1.1` no aparece.
- Una revisión seleccionada enumera criterios incluidos y límites de selección; los criterios no seleccionados no se contabilizan implícitamente.
- Los conteos del resumen se recalculan desde Resultados después de cualquier edición.

Si un control falla, corrige el reporte antes de presentarlo.

## Comportamiento De Salida

- Sin directiva de salida: ejecuta `node .agents/scripts/current-time.mjs` cuando esté disponible y forma `<timestamp>` como `<local_date>T<local_time>` reemplazando `:` por `-`; si el script no está disponible, usa una marca temporal ISO-8601 con el mismo reemplazo. Guarda el reporte completo en `./qa-tmp/wcag-aa-guidance/<timestamp>/wcag-aa-review.md` y responde con el resumen y la ruta.
- `to <path>`: guarda el reporte completo en esa ruta. Si `<path>` es un directorio, usa `<path>/wcag-aa-review.md`.
- `preview` o `no-save`: no escribas archivos; presenta en chat el contenido que se habría guardado.
- `summary`: muestra solo el Resumen y Límites de la conclusión en chat. Conserva el reporte completo en el destino normal o indicado, salvo que también se use `preview` o `no-save`.
- `summary preview` o `summary no-save`: no escribas archivos y muestra solo el Resumen y Límites de la conclusión.

Una solicitud de consulta, desarrollo, testing o remediación sin revisión explícita conserva la salida propia de esa tarea y no activa este formato.
