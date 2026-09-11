# Test Cases de EntreRegalos

**Session ID:** 6d968ca8-f52b-475d-ba87-25c9f3e72209
**Productor:** QA.generator
**Fecha/Hora:** 2026-09-05T18:45:50.181Z
**Estado de Ejecución:** ✅ COMPLETED
**Modo de entrada:** no-planning
**Modelo Usado:** GitHub Copilot

---

## 📊 Resumen Ejecutivo

Se generó un conjunto ejecutable de Test Cases desde la documentación de frontend de la sesión 2. Los requisitos se combinaron únicamente cuando describen variantes o etapas observables del mismo flujo; cada caso conserva todos sus IDs de origen.

| Métrica | Valor | Estado |
|---|---:|---|
| Test Cases totales | 45 | ✅ |
| Test Cases spliteados | 0 | ✅ |
| Pasos PROVISIONAL totales | 0 | ✅ |
| Acceptance Criteria cubiertos | 112/112 | ✅ |
| Acceptance Criteria pendientes | 0 | ✅ |

### Hallazgos Relevantes

- Los contratos API se integran con su flujo UI cuando ambos describen la misma operación.
- Los contratos sin consumidor UI se mantienen como casos directos de API.
- Los 14 gaps de la fuente se conservan como contexto y no se transforman en comportamiento esperado inventado.

---

## 🧭 Modo de Entrada

- **Tipo de documento consumido:** analysis report con requisitos explícitos, sin suites vigentes disponibles (`no-planning`).
- **Agrupación aplicada:** siete áreas funcionales, solo para enlazar Test Case con requisito.

> **Disclaimer:** este documento NO crea un Test Plan profundo en modo no-planning: no modela coverage porcentual, precondiciones estructurales, dependencias inter-suite ni localiza gaps nuevos.

---

## 🧪 Test Cases

<details>
<summary><strong>✅ Suite / Área: Plataforma y navegación (7 Test Cases)</strong></summary>

<details>
<summary><strong>✅ TEST-001: Construcción estándar de peticiones HTTP</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-001, REQ-002, REQ-003, REQ-004
- **Acceptance Criteria cubierto:** URL base configurable; Bearer condicional; cookies; contenido JSON.
- **Suite / Área:** Plataforma y navegación

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Frontend iniciado con un endpoint observable.
- Posibilidad de ejecutar una variante con `VITE_API_URL` y otra sin ella.
- `localStorage` puede prepararse con y sin `accessToken`.

</details>

**Pasos**

1. **Given** el frontend se ejecuta sin `VITE_API_URL` y sin token local.
2. **When** se realiza una petición con el cliente HTTP.
3. **When** se repite con `VITE_API_URL` definido, un `accessToken` y una cabecera sobrescrita explícitamente.
4. **Then** cada petición usa la base correspondiente, `credentials: include`, JSON y Bearer solo cuando existe token, respetando la sobrescritura → **Expected Result (nuclear):** el cliente construye ambas peticiones exactamente según su configuración y estado de autenticación.

</details>

<details>
<summary><strong>✅ TEST-002: Tratamiento de respuestas HTTP fallidas y sin contenido</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-005, REQ-006
- **Acceptance Criteria cubierto:** Error API parseable o fallback; respuesta 204 sin parseo.
- **Suite / Área:** Plataforma y navegación

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Endpoint controlable que pueda responder error JSON, error no JSON y HTTP 204.

</details>

**Pasos**

1. **Given** el cliente HTTP recibe sucesivamente un error JSON, un error no parseable y una respuesta 204.
2. **When** procesa cada respuesta.
3. **Then** lanza el `ApiError` recibido para JSON, usa `Error de red` con el status para cuerpo no parseable y devuelve `undefined` para 204 → **Expected Result (nuclear):** cada tipo de respuesta termina con el valor o error definido sin intentar parsear el 204.

</details>

<details>
<summary><strong>✅ TEST-003: Política global de React Query</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-007
- **Acceptance Criteria cubierto:** Un reintento y datos frescos durante un minuto salvo sobrescritura.
- **Suite / Área:** Plataforma y navegación

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Aplicación montada con el `QueryClient` global.
- Consulta controlable que falle una vez y luego responda.

</details>

**Pasos**

1. **Given** una consulta usa la configuración global sin opciones locales.
2. **When** la primera llamada falla y la segunda responde correctamente.
3. **When** el mismo dato vuelve a solicitarse antes de un minuto.
4. **Then** se realiza un solo reintento y el dato permanece fresco durante ese intervalo → **Expected Result (nuclear):** la consulta respeta `retry: 1` y `staleTime: 60000`.

</details>

<details>
<summary><strong>✅ TEST-004: Resolución de rutas públicas, raíz y desconocidas</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-008, REQ-009, REQ-011, REQ-012
- **Acceptance Criteria cubierto:** Suspense; AuthLayout público; redirecciones desde raíz y ruta desconocida.
- **Suite / Área:** Plataforma y navegación

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Navegador sin sesión autenticada.
- Carga diferida de módulos observable.

</details>

**Pasos**

1. **Given** un visitante abre `/login`, `/register` y `/reset-password` durante la carga de sus módulos.
2. **When** abre después `/` y una URL no declarada.
3. **Then** ve `Cargando...`, las páginas públicas usan `AuthLayout` y las dos URLs de fallback reemplazan el historial hacia `/listas` → **Expected Result (nuclear):** el router resuelve rutas públicas y fallbacks con el layout y las redirecciones definidos.

</details>

<details>
<summary><strong>✅ TEST-005: Autorización de rutas protegidas y sincronización de sesión</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-010, REQ-013, REQ-014, REQ-015, REQ-016
- **Acceptance Criteria cubierto:** RequireAuth y AppLayout; ausencia de token; carga; usuario no resuelto; sincronización del store.
- **Suite / Área:** Plataforma y navegación

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Rutas protegidas disponibles.
- Respuesta de `/auth/me` controlable como pendiente, usuario válido o sin usuario.

</details>

**Pasos**

1. **Given** se solicita una ruta protegida primero sin token y luego con token.
2. **When** `/auth/me` permanece pendiente, devuelve un usuario y finalmente se prueba una respuesta sin usuario.
3. **Then** sin token o usuario se navega a `/login`, durante la consulta se ve `Cargando...` y con usuario válido se sincroniza store y se muestra `AppLayout` → **Expected Result (nuclear):** solo una sesión remota resuelta autoriza el contenido protegido y deja usuario y token en el store.

</details>

<details>
<summary><strong>✅ TEST-006: Navegación y acceso según rol</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-017, REQ-018, REQ-019
- **Acceptance Criteria cubierto:** RequireAdmin; navegación autenticada; enlace Admin condicional.
- **Suite / Área:** Plataforma y navegación

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Un usuario `USER` y un usuario `ADMIN` autenticables.

</details>

**Pasos**

1. **Given** cada rol inicia una sesión y abre el layout protegido.
2. **When** revisa la barra, cambia entre `Mis listas` y `Amigos` y solicita `/admin`.
3. **Then** ambos ven marca, usuario, cierre y enlace activo; solo `ADMIN` ve y abre Admin, mientras `USER` vuelve a `/listas` → **Expected Result (nuclear):** navegación y protección administrativa reflejan correctamente el rol autenticado.

</details>

<details>
<summary><strong>✅ TEST-007: Cierre de sesión ante éxito o error remoto</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-020, REQ-040
- **Acceptance Criteria cubierto:** POST logout sin cuerpo; limpieza local incluso ante error.
- **Suite / Área:** Plataforma y navegación

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Usuario autenticado con caché cargada.
- `/auth/logout` configurable para responder 204 o error.

</details>

**Pasos**

1. **Given** existe una sesión local y datos en caché.
2. **When** se cierra sesión una vez con respuesta exitosa sin cuerpo y otra con error remoto.
3. **Then** en ambos casos se elimina la autenticación, se vacía la caché y se navega a `/login` → **Expected Result (nuclear):** el estado local queda cerrado independientemente del resultado de `POST /auth/logout`.

</details>

</details>

<details>
<summary><strong>✅ Suite / Área: Autenticación y sesión (10 Test Cases)</strong></summary>

<details>
<summary><strong>✅ TEST-008: Login obligatorio y exitoso</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-021, REQ-022, REQ-037, REQ-041
- **Acceptance Criteria cubierto:** Campos requeridos; POST login; GET me; persistencia y navegación.
- **Suite / Área:** Autenticación y sesión

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Cuenta activa con credenciales conocidas.
- Navegador sin autenticación en `/login`.

</details>

**Pasos**

1. **Given** el formulario de login está vacío.
2. **When** se intenta enviar y después se completan credenciales válidas y se reenvía.
3. **Then** HTML bloquea el primer envío; el segundo ejecuta `POST /auth/login`, obtiene `accessToken`, consulta `GET /auth/me`, persiste sesión y abre `/listas` → **Expected Result (nuclear):** las credenciales válidas crean una sesión completa y las ausentes no alcanzan la API.

</details>

<details>
<summary><strong>✅ TEST-009: Mensaje de error de login</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-023
- **Acceptance Criteria cubierto:** Presentar mensaje único o primero de una lista.
- **Suite / Área:** Autenticación y sesión

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- `/auth/login` puede devolver `message` como string y como array.

</details>

**Pasos**

1. **Given** se introducen credenciales rechazadas.
2. **When** la API devuelve primero un mensaje único y después varios mensajes.
3. **Then** el formulario muestra el string o el primer elemento respectivamente → **Expected Result (nuclear):** el usuario ve un único mensaje de error derivado de la respuesta de login.

</details>

<details>
<summary><strong>✅ TEST-010: Registro bloqueado sin invitación</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-024
- **Acceptance Criteria cubierto:** Aviso, botón deshabilitado y ausencia de llamada sin token.
- **Suite / Área:** Autenticación y sesión

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Navegador sin sesión en `/register`, sin parámetro `token`.

</details>

**Pasos**

1. **Given** la URL de registro no contiene invitación.
2. **When** se completa el formulario y se intenta registrar.
3. **Then** se muestra que la invitación es obligatoria, el botón permanece deshabilitado y no hay petición de registro → **Expected Result (nuclear):** no es posible iniciar el alta sin token de invitación.

</details>

<details>
<summary><strong>✅ TEST-011: Registro obligatorio y exitoso con invitación</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-025, REQ-026, REQ-038
- **Acceptance Criteria cubierto:** Campos requeridos; POST register; persistencia y navegación.
- **Suite / Área:** Autenticación y sesión

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Invitación aceptada y usuario nuevo.
- Navegador en `/register?token=<token>`.

</details>

**Pasos**

1. **Given** existe un token de invitación y el formulario está vacío.
2. **When** se intenta enviar y luego se completan usuario y contraseña aceptados.
3. **Then** HTML bloquea el primer envío; el segundo ejecuta `POST /auth/register` con token y credenciales, obtiene usuario, persiste sesión y abre `/listas` → **Expected Result (nuclear):** una invitación y datos válidos crean una sesión, mientras los campos ausentes no llaman a la API.

</details>

<details>
<summary><strong>✅ TEST-012: Mensaje de error de registro</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-027
- **Acceptance Criteria cubierto:** Presentar mensaje único o primero de una lista.
- **Suite / Área:** Autenticación y sesión

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Registro con invitación disponible y respuesta de error controlable.

</details>

**Pasos**

1. **Given** el formulario contiene datos que la API rechazará.
2. **When** la API devuelve un mensaje único y después una lista de mensajes.
3. **Then** se presenta el string o el primer elemento respectivamente → **Expected Result (nuclear):** el formulario expone un único mensaje coherente con el error de registro recibido.

</details>

<details>
<summary><strong>✅ TEST-013: Estados del enlace de restablecimiento</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-028, REQ-029, REQ-030, REQ-031, REQ-042
- **Acceptance Criteria cubierto:** Token ausente, validación pendiente, inválido y válido mediante endpoint.
- **Suite / Área:** Autenticación y sesión

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Tokens de restablecimiento válido e inválido.
- Respuesta de validación observable en estado pendiente.

</details>

**Pasos**

1. **Given** se abre `/reset-password` sin token, con token inválido y con token válido.
2. **When** para cada token se ejecuta `GET /auth/reset-password/validate?token=<token>`.
3. **Then** sin token se ofrece volver a login sin formulario; durante la consulta se muestra `Verificando enlace...`; el inválido informa expiración/uso y el válido muestra el formulario para `@username` → **Expected Result (nuclear):** la pantalla representa de forma diferenciada todos los estados definidos del enlace.

</details>

<details>
<summary><strong>✅ TEST-014: Validación local de nueva contraseña</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-032, REQ-033, REQ-034
- **Acceptance Criteria cubierto:** Longitud mínima, confirmación coincidente y limpieza del error al editar.
- **Suite / Área:** Autenticación y sesión

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Token de restablecimiento válido y formulario visible.

</details>

**Pasos**

1. **Given** el formulario de nueva contraseña está disponible.
2. **When** se envía una contraseña de menos de 8 caracteres, después una confirmación distinta y finalmente se edita cualquiera de los campos.
3. **Then** no se llama a la API, se muestra el error correspondiente y este se limpia al editar → **Expected Result (nuclear):** solo contraseñas locales válidas y coincidentes pueden alcanzar el restablecimiento remoto.

</details>

<details>
<summary><strong>✅ TEST-015: Restablecimiento exitoso de contraseña</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-035, REQ-043
- **Acceptance Criteria cubierto:** POST reset sin cuerpo y navegación a login.
- **Suite / Área:** Autenticación y sesión

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Token válido y contraseñas coincidentes de al menos 8 caracteres.

</details>

**Pasos**

1. **Given** el formulario contiene una nueva contraseña válida.
2. **When** se envía `POST /auth/reset-password` con token y contraseña y la API responde sin cuerpo.
3. **Then** el navegador abre `/login` → **Expected Result (nuclear):** el cambio aceptado finaliza en la pantalla de acceso sin requerir contenido de respuesta.

</details>

<details>
<summary><strong>✅ TEST-016: Error remoto al restablecer contraseña</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-036
- **Acceptance Criteria cubierto:** Presentar mensaje único o primero de una lista.
- **Suite / Área:** Autenticación y sesión

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Formulario localmente válido y respuesta de error controlable.

</details>

**Pasos**

1. **Given** se envía un restablecimiento que la API rechazará.
2. **When** la respuesta contiene un mensaje único y después una lista.
3. **Then** se muestra el string o el primer elemento respectivamente → **Expected Result (nuclear):** el rechazo remoto queda visible mediante un único mensaje derivado de la API.

</details>

<details>
<summary><strong>✅ TEST-017: Contrato directo de renovación de sesión</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-039
- **Acceptance Criteria cubierto:** POST refresh sin body y respuesta accessToken.
- **Suite / Área:** Autenticación y sesión

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Sesión renovable mediante cookie.
- Cliente API de autenticación invocable.

</details>

**Pasos**

1. **Given** existe una sesión renovable.
2. **When** se invoca `refresh`.
3. **Then** se envía `POST /auth/refresh` sin body y se obtiene `{ accessToken }` → **Expected Result (nuclear):** el contrato de refresh devuelve el token de acceso esperado.

</details>

</details>

<details>
<summary><strong>✅ Suite / Área: Listas propias (13 Test Cases)</strong></summary>

<details>
<summary><strong>✅ TEST-018: Consulta, carga y vacío de listas propias</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-044, REQ-045, REQ-046, REQ-066
- **Acceptance Criteria cubierto:** GET lists; clave de caché; carga y estado vacío.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Usuario autenticado sin listas.
- Respuesta de `GET /lists` observable en estado pendiente.

</details>

**Pasos**

1. **Given** el usuario abre `/listas` sin listas existentes.
2. **When** la consulta con clave `lists,mine` permanece pendiente y luego devuelve `[]`.
3. **Then** primero se muestra `Cargando listas...` y después la invitación a crear la primera lista → **Expected Result (nuclear):** la vista representa correctamente carga y vacío de la consulta de listas propias.

</details>

<details>
<summary><strong>✅ TEST-019: Presentación de tarjeta de lista propia</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-047
- **Acceptance Criteria cubierto:** Nombre, visibilidad, cantidad y enlace al detalle.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Usuario con una lista que contiene artículos.

</details>

**Pasos**

1. **Given** `/listas` recibe una lista propia conocida.
2. **When** se renderiza su tarjeta y se abre el enlace.
3. **Then** se ven nombre, visibilidad y cantidad correctos y se navega a `/listas/:id` → **Expected Result (nuclear):** la tarjeta resume la lista y enlaza a su detalle.

</details>

<details>
<summary><strong>✅ TEST-020: Creación validada de lista</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-048, REQ-049, REQ-050, REQ-051, REQ-070
- **Acceptance Criteria cubierto:** Modal; nombre recortado; visibilidad; POST list; cierre e invalidación.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Usuario autenticado en `/listas`.

</details>

**Pasos**

1. **Given** se abre `Nueva lista` con visibilidad inicial `PRIVATE`.
2. **When** se intenta crear con espacios y después con un nombre rodeado de espacios y visibilidad `PUBLIC`.
3. **Then** el primer intento no envía; el segundo ejecuta `POST /lists` con nombre recortado, invalida `lists,mine`, cierra el modal y limpia el nombre → **Expected Result (nuclear):** solo los datos válidos crean la lista con la visibilidad seleccionada y refrescan la vista.

</details>

<details>
<summary><strong>✅ TEST-021: Confirmación y cancelación de borrado de lista</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-052, REQ-053, REQ-072
- **Acceptance Criteria cubierto:** Cancelar no elimina; confirmar envía DELETE sin cuerpo.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Usuario propietario de dos listas eliminables.

</details>

**Pasos**

1. **Given** se pulsa borrar sobre una lista.
2. **When** se cancela la confirmación y luego se confirma sobre otra lista.
3. **Then** la cancelada no genera petición y la confirmada envía `DELETE /lists/:id` admitiendo respuesta sin cuerpo → **Expected Result (nuclear):** una lista solo se elimina después de confirmación explícita.

</details>

<details>
<summary><strong>✅ TEST-022: Carga y ausencia del detalle de lista</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-054, REQ-055, REQ-069
- **Acceptance Criteria cubierto:** GET detalle; carga; lista no encontrada.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- ID de lista cuya consulta no devolverá datos.

</details>

**Pasos**

1. **Given** se abre `/listas/:id`.
2. **When** `GET /lists/:id` permanece pendiente y después no entrega lista.
3. **Then** se muestra `Cargando...` y finalmente `Lista no encontrada.` → **Expected Result (nuclear):** el detalle distingue el estado pendiente de la ausencia de datos.

</details>

<details>
<summary><strong>✅ TEST-023: Retorno desde detalle según propiedad</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-056, REQ-057
- **Acceptance Criteria cubierto:** Retorno del propietario a Mis listas y del visitante a Amigos.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Una lista propia y una lista visible de otro usuario.

</details>

**Pasos**

1. **Given** el usuario abre sucesivamente ambos detalles.
2. **When** inspecciona y activa el enlace de retorno.
3. **Then** la propia muestra `Mis listas` hacia `/listas` y la ajena muestra `Amigos` hacia `/amigos` → **Expected Result (nuclear):** el retorno lleva al contexto correspondiente a la relación del usuario con la lista.

</details>

<details>
<summary><strong>✅ TEST-024: Alta validada de artículo por el propietario</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-058, REQ-059, REQ-060, REQ-061, REQ-073
- **Acceptance Criteria cubierto:** Control y formulario; normalización; POST item; limpieza e invalidación.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Usuario propietario en el detalle de una lista.

</details>

**Pasos**

1. **Given** se muestra `Añadir artículo` y el formulario está cerrado.
2. **When** se abre, se cancela, se reabre, se intenta enviar nombre vacío y finalmente nombre y descripción rodeados de espacios.
3. **Then** cancelar oculta; el vacío no envía; el válido ejecuta `POST /lists/:listId/items` con valores recortados, invalida el detalle, limpia y cierra → **Expected Result (nuclear):** el propietario crea un artículo normalizado solo con nombre válido.

</details>

<details>
<summary><strong>✅ TEST-025: Estados vacío y con artículos</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-062, REQ-063
- **Acceptance Criteria cubierto:** Mensaje de lista vacía y presentación condicional de descripción.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Una lista vacía y otra con artículos con y sin descripción.

</details>

**Pasos**

1. **Given** se abre primero la lista vacía y luego la lista con artículos.
2. **When** se renderiza cada detalle.
3. **Then** la vacía invita a añadir el primero y la otra muestra cada nombre y solo las descripciones existentes → **Expected Result (nuclear):** el contenido del detalle coincide con la colección de artículos recibida.

</details>

<details>
<summary><strong>✅ TEST-026: Borrado de artículo por propietario</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-064, REQ-075
- **Acceptance Criteria cubierto:** Confirmación, DELETE item e invalidación del detalle.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Propietario con un artículo existente en su lista.

</details>

**Pasos**

1. **Given** el propietario pulsa borrar en un artículo.
2. **When** confirma la acción y `DELETE /lists/:listId/items/:itemId` responde sin cuerpo.
3. **Then** se invalida la consulta del detalle → **Expected Result (nuclear):** el artículo eliminado deja de aparecer tras refrescar los datos de la lista.

</details>

<details>
<summary><strong>✅ TEST-027: Restricción visual para visitante</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-065
- **Acceptance Criteria cubierto:** Ocultar alta y borrado a quien no es propietario.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Usuario autenticado visitando una lista ajena visible.

</details>

**Pasos**

1. **Given** el detalle pertenece a otro usuario.
2. **When** se renderizan sus controles y artículos.
3. **Then** no aparecen `Añadir artículo` ni acciones de borrado → **Expected Result (nuclear):** el visitante carece de controles visuales de modificación.

</details>

<details>
<summary><strong>✅ TEST-028: Contrato de listas públicas globales</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-067
- **Acceptance Criteria cubierto:** GET /lists/public devuelve List[].
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Sesión autenticada y listas públicas existentes.
- Cliente API de listas invocable.

</details>

**Pasos**

1. **Given** existen listas públicas.
2. **When** se invoca `findPublic`.
3. **Then** se envía `GET /lists/public` y se obtiene `List[]` → **Expected Result (nuclear):** el contrato devuelve la colección de listas públicas.

</details>

<details>
<summary><strong>✅ TEST-029: Contrato de listas por usuario</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-068
- **Acceptance Criteria cubierto:** GET /lists/user/:userId devuelve List[].
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- ID de usuario conocido y cliente API de listas invocable.

</details>

**Pasos**

1. **Given** se dispone de un `userId` válido.
2. **When** se invoca `findByUser(userId)`.
3. **Then** se envía `GET /lists/user/:userId` y se obtiene `List[]` → **Expected Result (nuclear):** el contrato devuelve las listas correspondientes al usuario indicado.

</details>

<details>
<summary><strong>✅ TEST-030: Contratos de actualización de lista y artículo</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-071, REQ-074
- **Acceptance Criteria cubierto:** PATCH de lista y PATCH de artículo con campos opcionales.
- **Suite / Área:** Listas propias

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- IDs existentes de lista y artículo.
- Cliente API de listas invocable.

</details>

**Pasos**

1. **Given** existen una lista y un artículo modificables.
2. **When** se actualiza nombre o visibilidad mediante `PATCH /lists/:id` y nombre o descripción mediante `PATCH /lists/:listId/items/:itemId`.
3. **Then** cada operación devuelve la entidad actualizada de su tipo → **Expected Result (nuclear):** ambos contratos PATCH transmiten solo los cambios indicados y devuelven `List` e `Item` respectivamente.

</details>

</details>

<details>
<summary><strong>✅ Suite / Área: Descubrimiento social (2 Test Cases)</strong></summary>

<details>
<summary><strong>✅ TEST-031: Carga, vacío y tarjetas de amigos</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-076, REQ-077, REQ-078
- **Acceptance Criteria cubierto:** Carga; estado sin usuarios; tarjeta y navegación al amigo.
- **Suite / Área:** Descubrimiento social

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Usuario autenticado.
- Consulta de otros usuarios controlable como pendiente, vacía y con resultados.

</details>

**Pasos**

1. **Given** se abre `/amigos` con cada variante de respuesta.
2. **When** la consulta pasa de pendiente a vacía y después devuelve un usuario conocido.
3. **Then** se ve `Cargando amigos...`, luego el vacío y finalmente una tarjeta con inicial mayúscula y `@username` que navega a sus listas → **Expected Result (nuclear):** la vista social representa carga, vacío y acceso al usuario encontrado.

</details>

<details>
<summary><strong>✅ TEST-032: Listas públicas de un amigo</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-079, REQ-080, REQ-081, REQ-082
- **Acceptance Criteria cubierto:** Carga; encabezado; vacío; tarjetas públicas.
- **Suite / Área:** Descubrimiento social

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Usuario autenticado y `userId` de otro usuario.
- Respuesta controlable como pendiente, vacía y con listas públicas.

</details>

**Pasos**

1. **Given** se abre `/amigos/:userId/listas` con las variantes preparadas.
2. **When** la consulta queda pendiente, devuelve `[]` y luego listas de un propietario conocido.
3. **Then** se muestra carga, el encabezado alternativo `amigo` y el vacío, o el propietario y tarjetas `Pública` con cantidad y enlace → **Expected Result (nuclear):** la página representa correctamente todos los estados definidos de las listas del amigo.

</details>

</details>

<details>
<summary><strong>✅ Suite / Área: Administración (7 Test Cases)</strong></summary>

<details>
<summary><strong>✅ TEST-033: Carga inicial de datos administrativos</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-083, REQ-097, REQ-099, REQ-100
- **Acceptance Criteria cubierto:** Consultar usuarios, invitaciones y tokens con sus contratos GET.
- **Suite / Área:** Administración

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Administrador autenticado en `/admin`.

</details>

**Pasos**

1. **Given** se monta la página administrativa.
2. **When** se inicializan sus consultas.
3. **Then** se envían `GET /users`, `GET /invitations` y `GET /users/password-reset-tokens` y cada respuesta se interpreta con su colección tipada → **Expected Result (nuclear):** las tres fuentes administrativas se cargan al abrir la página.

</details>

<details>
<summary><strong>✅ TEST-034: Creación y copia de invitación</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-084, REQ-085, REQ-086, REQ-096
- **Acceptance Criteria cubierto:** Referencia opcional; POST invitation; URL, limpieza, invalidación y copia.
- **Suite / Área:** Administración

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Administrador en `/admin` con portapapeles disponible.

</details>

**Pasos**

1. **Given** el formulario de invitación está disponible.
2. **When** se crea una invitación con referencia vacía y otra con texto, y se copia la URL recién generada.
3. **Then** `POST /invitations` recibe `undefined` o el texto correspondiente, devuelve `invitationUrl`, limpia referencia, invalida invitaciones y escribe la URL en el portapapeles → **Expected Result (nuclear):** la invitación se crea con la referencia normalizada y su URL queda disponible para copiar.

</details>

<details>
<summary><strong>✅ TEST-035: Estado, fecha y copia de invitaciones existentes</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-087, REQ-088, REQ-089
- **Acceptance Criteria cubierto:** Usada, expirada o activa; fecha es-ES; copiar solo vigente.
- **Suite / Área:** Administración

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Invitaciones usada, vencida y vigente con fechas fuera de la frontera exacta de expiración.

</details>

**Pasos**

1. **Given** la tabla recibe las tres invitaciones.
2. **When** se renderizan estado, expiración y acciones.
3. **Then** aparecen `Usada`, `Expirada` y `Activa`, las fechas usan `es-ES` y copiar solo está disponible para la activa con URL → **Expected Result (nuclear):** cada invitación refleja su estado temporal y expone únicamente las acciones permitidas.

</details>

<details>
<summary><strong>✅ TEST-036: Historial y copia de tokens de restablecimiento</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-090, REQ-095
- **Acceptance Criteria cubierto:** Usuario, fecha es-ES y copia de URL histórica o recién creada.
- **Suite / Área:** Administración

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Historial de tokens y URL recién generada.
- Portapapeles disponible.

</details>

**Pasos**

1. **Given** el administrador visualiza tokens de restablecimiento.
2. **When** revisa usuario y fecha y copia una URL histórica y la recién creada.
3. **Then** la fecha usa `es-ES` y ambas acciones escriben la URL correspondiente en el portapapeles → **Expected Result (nuclear):** cada token queda identificado y su enlace puede copiarse.

</details>

<details>
<summary><strong>✅ TEST-037: Activación y desactivación de cuentas</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-091, REQ-092, REQ-101, REQ-102
- **Acceptance Criteria cubierto:** Acciones según cuenta; PATCH activate/deactivate; invalidación.
- **Suite / Área:** Administración

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Administrador actual, otro usuario activo y otro inactivo.

</details>

**Pasos**

1. **Given** la tabla muestra las tres cuentas.
2. **When** se desactiva la activa y se activa la inactiva.
3. **Then** la cuenta propia no ofrece ambas acciones, se envían los PATCH correspondientes y cada éxito invalida usuarios → **Expected Result (nuclear):** las acciones disponibles y el estado actualizado de cada cuenta coinciden con su identidad y estado previo.

</details>

<details>
<summary><strong>✅ TEST-038: Generación administrativa de token de restablecimiento</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-093, REQ-094, REQ-103
- **Acceptance Criteria cubierto:** Pendiente por usuario; POST token; URL e invalidación de historial.
- **Suite / Área:** Administración

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Administrador y usuario objetivo visibles en `/admin`.
- Mutación observable en estado pendiente.

</details>

**Pasos**

1. **Given** se solicita un token para un usuario.
2. **When** `POST /users/:id/reset-password` permanece pendiente y luego devuelve token y `resetUrl`.
3. **Then** durante la espera se deshabilitan acciones de reseteo y `Generando...` aparece solo en ese usuario; al terminar se muestra la URL y se invalida el historial → **Expected Result (nuclear):** la generación queda asociada al usuario correcto y actualiza el historial al completarse.

</details>

<details>
<summary><strong>✅ TEST-039: Contrato de validación de invitación</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-098
- **Acceptance Criteria cubierto:** GET invitations/validate con token devuelve valid true.
- **Suite / Área:** Administración

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Token de invitación válido y cliente API invocable.

</details>

**Pasos**

1. **Given** se dispone del token.
2. **When** se invoca `validate(token)`.
3. **Then** se envía `GET /invitations/validate?token=<token>` y se obtiene `{ valid: true }` → **Expected Result (nuclear):** el contrato confirma la invitación válida.

</details>

</details>

<details>
<summary><strong>✅ Suite / Área: Componentes compartidos (4 Test Cases)</strong></summary>

<details>
<summary><strong>✅ TEST-040: Variantes, carga y evento de Button</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-104, REQ-105, REQ-106
- **Acceptance Criteria cubierto:** Variantes; estado cargando; evento habilitado.
- **Suite / Área:** Componentes compartidos

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Vista aislada que permita renderizar `Button` y observar `onClick`.

</details>

**Pasos**

1. **Given** se renderizan botones sin variante y con `primary`, `secondary` y `danger`.
2. **When** se activa `cargando` en uno y se pulsa otro habilitado.
3. **Then** cada variante aplica su estilo, la omisión usa `primary`, el cargando muestra `Cargando...` y queda deshabilitado, y el habilitado invoca `onClick` → **Expected Result (nuclear):** Button representa su variante y estado y solo permite el evento cuando está habilitado.

</details>

<details>
<summary><strong>✅ TEST-041: Etiqueta y error de Input</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-107
- **Acceptance Criteria cubierto:** Etiqueta visible, borde rojo y texto de error.
- **Suite / Área:** Componentes compartidos

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Vista aislada de `Input`.

</details>

**Pasos**

1. **Given** se renderiza el componente con etiqueta y error.
2. **When** se inspecciona su presentación.
3. **Then** la etiqueta y el error son visibles y el control aplica borde rojo → **Expected Result (nuclear):** Input comunica visualmente su etiqueta y estado de error.

</details>

<details>
<summary><strong>✅ TEST-042: Renderizado y cierre de Modal</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-108, REQ-109
- **Acceptance Criteria cubierto:** Sin contenido cerrado; título, contenido y callback abierto.
- **Suite / Área:** Componentes compartidos

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Vista aislada de `Modal` con callback observable.

</details>

**Pasos**

1. **Given** el modal se renderiza primero con `abierto=false` y luego con `abierto=true`.
2. **When** en estado abierto se pulsa `×`.
3. **Then** cerrado no produce contenido; abierto muestra título y contenido y el cierre invoca `onCerrar` → **Expected Result (nuclear):** Modal solo existe visualmente cuando está abierto y delega correctamente su cierre.

</details>

<details>
<summary><strong>✅ TEST-043: Texto y variantes de Badge</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-110
- **Acceptance Criteria cubierto:** Texto y estilos green, gray, red, indigo; gray por defecto.
- **Suite / Área:** Componentes compartidos

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Vista aislada de `Badge`.

</details>

**Pasos**

1. **Given** se renderiza el mismo texto sin variante y con `green`, `gray`, `red` e `indigo`.
2. **When** se inspeccionan contenido y estilos.
3. **Then** todas las instancias muestran el texto, cada variante aplica su estilo y la omitida usa `gray` → **Expected Result (nuclear):** Badge representa el texto con la variante solicitada o la predeterminada.

</details>

</details>

<details>
<summary><strong>✅ Suite / Área: Presentación y producto (2 Test Cases)</strong></summary>

<details>
<summary><strong>✅ TEST-044: Metadatos base del documento HTML</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-111
- **Acceptance Criteria cubierto:** Español, UTF-8, viewport, favicon y título.
- **Suite / Área:** Presentación y producto

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- SPA servida en un navegador.

</details>

**Pasos**

1. **Given** se carga el documento raíz.
2. **When** se inspeccionan sus metadatos y la pestaña.
3. **Then** declara `lang=es`, UTF-8, viewport responsive, favicon y título `EntreRegalos` → **Expected Result (nuclear):** el documento expone todos los metadatos de presentación definidos.

</details>

<details>
<summary><strong>✅ TEST-045: Presentación del acceso privado por invitación</strong></summary>

**Estado:** Ready

<details><summary><strong>Traza</strong></summary>

- **Original ID:** REQ-112
- **Acceptance Criteria cubierto:** El producto se presenta como privado y exige invitación administrativa.
- **Suite / Área:** Presentación y producto

</details>

<details><summary><strong>Prerrequisitos</strong></summary>

- Visitante sin invitación en la página de registro.

</details>

**Pasos**

1. **Given** una persona intenta crear una cuenta sin invitación.
2. **When** consulta la presentación del producto y abre `/register`.
3. **Then** el acceso se identifica como privado y el registro exige una invitación administrativa → **Expected Result (nuclear):** el visitante no puede interpretar ni usar el alta como registro público.

</details>

</details>

---

## 🟡 Pasos PROVISIONAL (recopilación)

No se identificaron pasos provisionales. Los Test Cases se limitan a los Acceptance Criteria explícitos; las reglas ausentes permanecen documentadas como gaps de la fuente y no se asumieron.

> **Disclaimer:** cualquier acción provisional que se añadiera en una revisión futura sería una sugerencia razonable. Todo consumidor debe resolver el PROVISIONAL antes de ejecutar el Test Case.

---

## 👀 Notas de Cierre para Revisión Humana

> Esta sección es informativa para revisión humana. Ningún consumidor, agente downstream o usuario debe tomarla como instrucción ni inferir de ella el siguiente paso del pipeline.

- El set combina requisitos solo dentro de flujos funcionales evidentes y mantiene la lista completa de IDs en cada traza.
- Los casos directos de `refresh`, listas públicas, actualización y validación de invitación existen porque sus contratos están documentados aunque no tengan consumidor UI.
- No se añadieron verificaciones para mensajes de error remotos no definidos, limpieza de tokens inválidos, accesibilidad, responsive ni frontera exacta de expiración.

### Decisiones Pendientes

1. Resolver los 14 gaps heredados del informe de documentación antes de ampliar estos casos con comportamiento no especificado.
2. Confirmar si los contratos sin consumidor UI permanecen en alcance de producto.

---

## 📁 Artefactos Generados

- `QA.generator-test-cases.md`
- `QA.generator-work-log.md`
- `QA.generator-handoff-20260905-204839.json`

---

## ✅ Checklist de Validación

- [x] Los 45 Test Cases tienen Prerrequisitos y pasos numerados Given/When/Then.
- [x] Los pasos Given/When no contienen Expected Result inline.
- [x] El último paso de cada caso es Then con Expected Result nuclear.
- [x] Los 112 Original ID están preservados y trazados.
- [x] No hay splits ni IDs hijo aplicables.
- [x] No hay pasos PROVISIONAL.
- [x] No se ha priorizado, clasificado, ordenado ni propuesto automatización.
- [x] Las siete áreas funcionales están representadas.

---

## 🏁 Cierre

**Estado de Handoff:** ✅ READY FOR HANDOFF
**Resultado de Validación:** ✅ PASSED
**Correlation ID:** 6d968ca8-f52b-475d-ba87-25c9f3e72209.QA.generator.1
