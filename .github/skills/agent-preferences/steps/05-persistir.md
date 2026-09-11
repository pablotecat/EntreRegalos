# 05 — Persistir preferencia e historial

## Acción

1. Consulta `../references/preference-format.md`. Si no existe, crea `instructions/preferences/[NombreAgente].preferences.md` con el ajuste aprobado; si existe, actualiza solo ese archivo.
2. Añade una entrada append-only con timestamp real en `instructions/preferences/preferences-history.md` por cada ajuste creado, editado o retirado.
3. Incluye el agente, identificador del ajuste, acción, sesión origen y un resumen conciso en el historial.
4. Resume el texto persistido y la ruta que lo carga en futuras ejecuciones.

## Puerta de calidad

Antes de cerrar, confirma todos los puntos:

- El archivo de preferencias contiene un ajuste con identificador único, instrucción concreta, evidencia y fecha.
- El ajuste no modifica una regla base y coincide exactamente con la propuesta aprobada.
- No quedan dos ajustes activos incompatibles para el mismo comportamiento.
- Cada modificación tiene exactamente una entrada nueva con fecha real, agente, ajuste, acción y sesión origen.
- No se modificó ningún archivo fuera de `instructions/preferences/`.

## Criterio de cierre

La preferencia del agente y el historial son coherentes, y el usuario recibió el resumen de los cambios aplicados.
