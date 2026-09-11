# Test Documentation - Análisis Completado

**Session ID:** 6d968ca8-f52b-475d-ba87-25c9f3e72209
**Productor:** QA.documentation
**Fecha/Hora:** 2026-09-05T18:18:53.035Z
**Estado de Ejecución:** ✅ COMPLETED
**Modelo Usado:** GitHub Copilot

---

## 📊 Resumen Ejecutivo

### Métricas Clave
- **Requisitos Extraídos:** 112 (normalizados en Gherkin)
- **Gaps Identificados:** 14 (0 CRITICAL, 3 HIGH, 8 MEDIUM, 3 LOW)
- **Áreas de Testing:** 7 (Plataforma y navegación, Autenticación y sesión, Listas propias, Descubrimiento social, Administración, Componentes compartidos, Presentación y producto)
- **Endpoints API:** 25 documentados con payloads y respuestas
- **Trazabilidad:** 100% verificada a código fuente o documentación de proyecto

### Hallazgos Críticos
> Solo se listan aquí los gaps CRITICAL y HIGH. MEDIUM y LOW figuran en la sección "Gaps Identificados (Detalle por Severidad)".

```text
CRITICAL: ninguno.
HIGH: GAP-001 - La especificación funcional referenciada por el README no existe.
HIGH: GAP-002 - Varias consultas y mutaciones no presentan errores al usuario.
HIGH: GAP-003 - No se define la limpieza o recuperación de una sesión persistida inválida.
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
- Plataforma y navegación: 20 requisitos, 2 gaps
- Autenticación y sesión: 23 requisitos, 3 gaps
- Listas propias: 32 requisitos, 2 gaps
- Descubrimiento social: 7 requisitos, 2 gaps
- Administración: 21 requisitos, 2 gaps
- Componentes compartidos: 7 requisitos, 2 gaps
- Presentación y producto: 2 requisitos, 1 gap

### Dependencias entre áreas
- Autenticación y sesión depende del cliente HTTP y habilita todas las rutas protegidas.
- Listas propias y descubrimiento social dependen de una sesión autenticada y reutilizan el detalle de lista.
- Administración depende de sesión autenticada, rol `ADMIN`, cliente HTTP y componentes compartidos.
- Todas las áreas visuales dependen de los componentes compartidos y de React Query para los estados remotos.

---

<details>
<summary><strong>Area 1: Plataforma y navegación (20 requisitos)</strong></summary>

| ID | Título | Gherkin | Fuente |
|----|--------|---------|--------|
| REQ-001 | URL base configurable | Given el frontend realiza una petición When `VITE_API_URL` está definido Then usa ese valor; en otro caso usa `/api/v1`. | `frontend/src/api/client.ts: BASE_URL` |
| REQ-002 | Token Bearer condicional | Given existe `accessToken` en `localStorage` When se envía una petición Then incluye `Authorization: Bearer <token>`; sin token omite la cabecera. | `frontend/src/api/client.ts: request` |
| REQ-003 | Cookies en peticiones | Given cualquier llamada API When se ejecuta `fetch` Then usa `credentials: include`. | `frontend/src/api/client.ts: request` |
| REQ-004 | Contenido JSON | Given una llamada API When se construyen sus cabeceras Then declara `Content-Type: application/json` y permite sobrescrituras explícitas. | `frontend/src/api/client.ts: request` |
| REQ-005 | Respuesta HTTP fallida | Given una respuesta no exitosa When el cuerpo es JSON válido Then lanza ese `ApiError`; si no se puede parsear, lanza mensaje `Error de red` y el status recibido. | `frontend/src/api/client.ts: request` |
| REQ-006 | Respuesta sin contenido | Given una respuesta HTTP 204 When finaliza la llamada Then devuelve `undefined` sin intentar parsear JSON. | `frontend/src/api/client.ts: request` |
| REQ-007 | Política global de consultas | Given una consulta React Query When se ejecuta Then reintenta una vez y conserva los datos frescos durante un minuto, salvo sobrescritura local. | `frontend/src/main.tsx: QueryClient` |
| REQ-008 | Carga diferida de páginas | Given se resuelve una página de ruta When su módulo aún carga Then muestra `Cargando...` mediante `Suspense`. | `frontend/src/App.tsx: App, Cargando` |
| REQ-009 | Rutas públicas | Given cualquier visitante When navega a `/login`, `/register` o `/reset-password` Then la página se muestra dentro de `AuthLayout`. | `frontend/src/App.tsx: App` |
| REQ-010 | Rutas autenticadas | Given se solicita `/listas`, `/listas/:id`, `/amigos`, `/amigos/:userId/listas` o `/admin` When se resuelve la ruta Then pasa por `RequireAuth` y `AppLayout`. | `frontend/src/App.tsx: App` |
| REQ-011 | Redirección raíz | Given se abre `/` When el router resuelve la URL Then reemplaza el historial y navega a `/listas`. | `frontend/src/App.tsx: App` |
| REQ-012 | Redirección de ruta desconocida | Given se abre una ruta no declarada When el router la resuelve Then reemplaza el historial y navega a `/listas`. | `frontend/src/App.tsx: App` |
| REQ-013 | Protección sin token | Given no existe token local When se solicita una ruta protegida Then redirige a `/login`. | `frontend/src/components/layout/RequireAuth.tsx: RequireAuth` |
| REQ-014 | Verificación de sesión en curso | Given existe token local When la consulta del usuario sigue cargando Then muestra `Cargando...`. | `frontend/src/components/layout/RequireAuth.tsx: RequireAuth` |
| REQ-015 | Protección con usuario no resuelto | Given existe token local When `/auth/me` no produce usuario Then redirige a `/login`. | `frontend/src/components/layout/RequireAuth.tsx: RequireAuth` |
| REQ-016 | Sincronización del usuario | Given la sesión remota devuelve usuario y el store no lo contiene When se autoriza la ruta Then guarda usuario y token en el store. | `frontend/src/components/layout/RequireAuth.tsx: RequireAuth` |
| REQ-017 | Protección de administración | Given el usuario no tiene rol `ADMIN` When solicita `/admin` Then redirige a `/listas`; un administrador accede al contenido. | `frontend/src/components/layout/RequireAdmin.tsx: RequireAdmin` |
| REQ-018 | Navegación autenticada | Given el layout protegido está visible When se renderiza la barra Then ofrece marca, `Mis listas`, `Amigos`, usuario actual y cierre de sesión, marcando el enlace activo. | `frontend/src/components/layout/Navbar.tsx: Navbar` |
| REQ-019 | Navegación administrativa | Given el usuario tiene rol `ADMIN` When se renderiza la barra Then muestra el enlace `Admin`; para otros roles lo oculta. | `frontend/src/components/layout/Navbar.tsx: Navbar` |
| REQ-020 | Cierre de sesión asentado | Given el usuario solicita cerrar sesión When la llamada termina con éxito o error Then elimina la autenticación, vacía la caché y navega a `/login`. | `frontend/src/hooks/useAuth.ts: useLogout` |

**Blocker Gaps:** GAP-002, GAP-003
**Advisory Gaps:** none

</details>

---

<details>
<summary><strong>Area 2: Autenticación y sesión (23 requisitos)</strong></summary>

| ID | Título | Gherkin | Fuente |
|----|--------|---------|--------|
| REQ-021 | Campos obligatorios de login | Given el formulario de acceso When faltan usuario o contraseña Then la validación HTML impide el envío. | `frontend/src/pages/auth/LoginPage.tsx: LoginPage` |
| REQ-022 | Login exitoso | Given credenciales aceptadas When login y consulta de usuario terminan Then persiste token y usuario y navega a `/listas`. | `frontend/src/hooks/useAuth.ts: useLogin`; `frontend/src/pages/auth/LoginPage.tsx` |
| REQ-023 | Error de login | Given el login falla When la API devuelve uno o varios mensajes Then muestra el mensaje único o el primero de la lista. | `frontend/src/pages/auth/LoginPage.tsx: handleSubmit` |
| REQ-024 | Registro sin invitación | Given `/register` no contiene `token` When se muestra o envía el formulario Then avisa que requiere invitación, deshabilita el botón y no llama a la API. | `frontend/src/pages/auth/RegisterPage.tsx` |
| REQ-025 | Campos obligatorios de registro | Given existe token de invitación When faltan usuario o contraseña Then la validación HTML impide el envío. | `frontend/src/pages/auth/RegisterPage.tsx` |
| REQ-026 | Registro exitoso | Given token, usuario y contraseña aceptados When termina el registro y se obtiene el usuario Then persiste la sesión y navega a `/listas`. | `frontend/src/hooks/useAuth.ts: useRegister`; `frontend/src/pages/auth/RegisterPage.tsx` |
| REQ-027 | Error de registro | Given el registro falla When la API devuelve uno o varios mensajes Then muestra el mensaje único o el primero de la lista. | `frontend/src/pages/auth/RegisterPage.tsx: handleSubmit` |
| REQ-028 | Reseteo sin token | Given `/reset-password` no contiene `token` When se renderiza Then muestra el aviso de enlace requerido y un enlace a login, sin formulario. | `frontend/src/pages/auth/ResetPasswordPage.tsx` |
| REQ-029 | Validación de token en curso | Given hay token de reseteo When se valida Then muestra `Verificando enlace...`. | `frontend/src/pages/auth/ResetPasswordPage.tsx` |
| REQ-030 | Token de reseteo inválido | Given la validación del token falla When termina la consulta Then informa que expiró o fue utilizado y ofrece volver a login. | `frontend/src/pages/auth/ResetPasswordPage.tsx` |
| REQ-031 | Token de reseteo válido | Given la validación devuelve usuario When se muestra el formulario Then identifica la cuenta como `@username`. | `frontend/src/pages/auth/ResetPasswordPage.tsx` |
| REQ-032 | Longitud de nueva contraseña | Given el formulario de reseteo When la contraseña tiene menos de 8 caracteres Then muestra el error local y no llama a la API. | `frontend/src/pages/auth/ResetPasswordPage.tsx: handleSubmit` |
| REQ-033 | Confirmación de contraseña | Given una contraseña con al menos 8 caracteres When la confirmación difiere Then muestra `Las contraseñas no coinciden.` y no llama a la API. | `frontend/src/pages/auth/ResetPasswordPage.tsx: handleSubmit` |
| REQ-034 | Limpieza de error al editar | Given existe un error de reseteo When cambia cualquiera de las contraseñas Then limpia el mensaje. | `frontend/src/pages/auth/ResetPasswordPage.tsx: useEffect` |
| REQ-035 | Reseteo exitoso | Given token válido y contraseñas válidas When la API acepta el cambio Then navega a `/login`. | `frontend/src/pages/auth/ResetPasswordPage.tsx: resetPassword` |
| REQ-036 | Error de reseteo | Given la API rechaza el cambio When devuelve uno o varios mensajes Then muestra el mensaje único o el primero. | `frontend/src/pages/auth/ResetPasswordPage.tsx: resetPassword` |
| REQ-037 | API login | Given credenciales When se invoca login Then envía `POST /auth/login` y espera `accessToken`. | `frontend/src/api/auth.api.ts: login` |
| REQ-038 | API registro | Given invitación, usuario y contraseña When se invoca registro Then envía `POST /auth/register` y espera `accessToken`. | `frontend/src/api/auth.api.ts: register` |
| REQ-039 | API refresh | Given una sesión renovable When se invoca refresh Then envía `POST /auth/refresh` y espera `accessToken`. | `frontend/src/api/auth.api.ts: refresh` |
| REQ-040 | API logout | Given una sesión When se invoca logout Then envía `POST /auth/logout` y admite respuesta sin cuerpo. | `frontend/src/api/auth.api.ts: logout` |
| REQ-041 | API usuario actual | Given una sesión When se invoca `me` Then envía `GET /auth/me` y espera un `User`. | `frontend/src/api/auth.api.ts: me` |
| REQ-042 | API validar reseteo | Given un token When se valida Then envía `GET /auth/reset-password/validate?token=<token>` y espera `{valid:true, username}`. | `frontend/src/api/auth.api.ts: validateResetToken` |
| REQ-043 | API restablecer contraseña | Given token y contraseña When se restablece Then envía `POST /auth/reset-password` y admite respuesta sin cuerpo. | `frontend/src/api/auth.api.ts: resetPassword` |

**Blocker Gaps:** none
**Advisory Gaps:** GAP-004, GAP-005, GAP-006

</details>

---

<details>
<summary><strong>Area 3: Listas propias (32 requisitos)</strong></summary>

| ID | Título | Gherkin | Fuente |
|----|--------|---------|--------|
| REQ-044 | Consulta de listas propias | Given un usuario autenticado When entra en `/listas` Then solicita sus listas con clave de caché `lists,mine`. | `frontend/src/hooks/useLists.ts: useMyLists` |
| REQ-045 | Carga de listas propias | Given la consulta está cargando When se renderiza `/listas` Then muestra `Cargando listas...`. | `frontend/src/pages/lists/ListsPage.tsx` |
| REQ-046 | Estado vacío de listas | Given la consulta devuelve cero listas When se renderiza Then invita a crear la primera. | `frontend/src/pages/lists/ListsPage.tsx` |
| REQ-047 | Tarjeta de lista propia | Given existen listas When se renderizan Then cada tarjeta muestra nombre, visibilidad, cantidad de artículos y enlaces al detalle. | `frontend/src/pages/lists/ListsPage.tsx` |
| REQ-048 | Apertura de nueva lista | Given `/listas` visible When se pulsa `Nueva lista` Then abre el modal de creación. | `frontend/src/pages/lists/ListsPage.tsx` |
| REQ-049 | Nombre requerido de lista | Given el modal abierto When el nombre solo contiene espacios Then no crea; con contenido envía el nombre recortado. | `frontend/src/pages/lists/ListsPage.tsx: handleCrear` |
| REQ-050 | Visibilidad de nueva lista | Given el modal abierto When se elige visibilidad Then permite `PRIVATE` o `PUBLIC`, con `PRIVATE` inicial. | `frontend/src/pages/lists/ListsPage.tsx` |
| REQ-051 | Creación exitosa de lista | Given datos válidos When la API crea la lista Then invalida listas propias, cierra el modal y limpia el nombre. | `frontend/src/hooks/useLists.ts: useCreateList`; `ListsPage.tsx` |
| REQ-052 | Confirmación de borrado de lista | Given una lista When se pulsa borrar y se confirma Then solicita su eliminación. | `frontend/src/pages/lists/ListsPage.tsx` |
| REQ-053 | Cancelación de borrado de lista | Given una lista When se rechaza la confirmación Then no solicita su eliminación. | `frontend/src/pages/lists/ListsPage.tsx` |
| REQ-054 | Carga de detalle | Given una ruta `/listas/:id` When la consulta está cargando Then muestra `Cargando...`. | `frontend/src/pages/lists/ListDetailPage.tsx` |
| REQ-055 | Lista no encontrada | Given la consulta no entrega lista When termina Then muestra `Lista no encontrada.`. | `frontend/src/pages/lists/ListDetailPage.tsx` |
| REQ-056 | Retorno del propietario | Given el usuario es propietario When ve el detalle Then el enlace de retorno apunta a `/listas` con texto `Mis listas`. | `frontend/src/pages/lists/ListDetailPage.tsx` |
| REQ-057 | Retorno del visitante | Given el usuario no es propietario When ve el detalle Then el enlace de retorno apunta a `/amigos` con texto `Amigos`. | `frontend/src/pages/lists/ListDetailPage.tsx` |
| REQ-058 | Control de alta para propietario | Given el usuario es propietario y el formulario está cerrado When ve el detalle Then muestra `Añadir artículo`. | `frontend/src/pages/lists/ListDetailPage.tsx` |
| REQ-059 | Formulario de artículo | Given el propietario abre el formulario When lo cancela Then lo oculta; mientras está abierto permite nombre y descripción opcional. | `frontend/src/pages/lists/ListDetailPage.tsx` |
| REQ-060 | Datos válidos de artículo | Given el formulario abierto When se intenta añadir un artículo Then con nombre vacío no envía; con contenido recorta nombre y descripción y omite descripción vacía. | `frontend/src/pages/lists/ListDetailPage.tsx: handleAddItem` |
| REQ-061 | Alta exitosa de artículo | Given datos válidos When la API crea el artículo Then invalida el detalle, limpia campos y cierra el formulario. | `frontend/src/hooks/useLists.ts: useCreateItem`; `ListDetailPage.tsx` |
| REQ-062 | Estado vacío de artículos | Given la lista no tiene artículos When se muestra el detalle Then informa que está vacía e invita a añadir el primero. | `frontend/src/pages/lists/ListDetailPage.tsx` |
| REQ-063 | Presentación de artículo | Given la lista tiene artículos When se renderizan Then muestra nombre y descripción solo cuando existe. | `frontend/src/pages/lists/ListDetailPage.tsx` |
| REQ-064 | Borrado de artículo por propietario | Given el usuario es propietario When confirma borrar un artículo Then solicita eliminarlo e invalida el detalle al tener éxito. | `frontend/src/pages/lists/ListDetailPage.tsx`; `frontend/src/hooks/useLists.ts: useDeleteItem` |
| REQ-065 | Restricción visual para visitante | Given el usuario no es propietario When ve el detalle Then no muestra alta ni borrado de artículos. | `frontend/src/pages/lists/ListDetailPage.tsx` |
| REQ-066 | API listar propias | Given una sesión When se consultan listas propias Then envía `GET /lists` y espera `List[]`. | `frontend/src/api/lists.api.ts: findMine` |
| REQ-067 | API listar públicas | Given una sesión When se consultan listas públicas Then envía `GET /lists/public` y espera `List[]`. | `frontend/src/api/lists.api.ts: findPublic` |
| REQ-068 | API listas por usuario | Given un `userId` When se consultan sus listas Then envía `GET /lists/user/:userId` y espera `List[]`. | `frontend/src/api/lists.api.ts: findByUser` |
| REQ-069 | API detalle de lista | Given un ID When se consulta una lista Then envía `GET /lists/:id` y espera `List`. | `frontend/src/api/lists.api.ts: findById` |
| REQ-070 | API crear lista | Given nombre y visibilidad opcional When se crea Then envía `POST /lists` y espera `List`. | `frontend/src/api/lists.api.ts: create` |
| REQ-071 | API actualizar lista | Given ID y nombre o visibilidad When se actualiza Then envía `PATCH /lists/:id` y espera `List`. | `frontend/src/api/lists.api.ts: update` |
| REQ-072 | API eliminar lista | Given un ID When se elimina Then envía `DELETE /lists/:id` y admite respuesta sin cuerpo. | `frontend/src/api/lists.api.ts: delete` |
| REQ-073 | API crear artículo | Given lista, nombre y descripción opcional When se crea Then envía `POST /lists/:listId/items` y espera `Item`. | `frontend/src/api/lists.api.ts: createItem` |
| REQ-074 | API actualizar artículo | Given lista, artículo y cambios When se actualiza Then envía `PATCH /lists/:listId/items/:itemId` y espera `Item`. | `frontend/src/api/lists.api.ts: updateItem` |
| REQ-075 | API eliminar artículo | Given lista y artículo When se elimina Then envía `DELETE /lists/:listId/items/:itemId` y admite respuesta sin cuerpo. | `frontend/src/api/lists.api.ts: deleteItem` |

**Blocker Gaps:** none
**Advisory Gaps:** GAP-007, GAP-008

</details>

---

<details>
<summary><strong>Area 4: Descubrimiento social (7 requisitos)</strong></summary>

| ID | Título | Gherkin | Fuente |
|----|--------|---------|--------|
| REQ-076 | Carga de amigos | Given `/amigos` When usuarios están cargando Then muestra `Cargando amigos...`. | `frontend/src/pages/lists/AmigosPage.tsx` |
| REQ-077 | Estado vacío de amigos | Given la consulta devuelve cero usuarios When se renderiza Then informa que no hay otros usuarios registrados. | `frontend/src/pages/lists/AmigosPage.tsx` |
| REQ-078 | Tarjeta de amigo | Given existen usuarios When se renderizan Then cada enlace muestra inicial en mayúscula, `@username` y navega a sus listas. | `frontend/src/pages/lists/AmigosPage.tsx` |
| REQ-079 | Carga de listas de amigo | Given `/amigos/:userId/listas` When la consulta está cargando Then muestra `Cargando listas...`. | `frontend/src/pages/lists/UserListsPage.tsx` |
| REQ-080 | Encabezado de listas de amigo | Given listas devueltas When se renderiza Then usa el propietario de la primera lista o el texto alternativo `amigo`. | `frontend/src/pages/lists/UserListsPage.tsx` |
| REQ-081 | Sin listas públicas | Given el usuario no tiene listas devueltas When se renderiza Then informa que no tiene listas públicas. | `frontend/src/pages/lists/UserListsPage.tsx` |
| REQ-082 | Tarjeta de lista pública | Given hay listas When se renderizan Then cada tarjeta indica `Pública`, cantidad de artículos y enlaza al detalle. | `frontend/src/pages/lists/UserListsPage.tsx` |

**Blocker Gaps:** none
**Advisory Gaps:** GAP-011, GAP-013

</details>

---

<details>
<summary><strong>Area 5: Administración (21 requisitos)</strong></summary>

| ID | Título | Gherkin | Fuente |
|----|--------|---------|--------|
| REQ-083 | Carga de datos administrativos | Given un administrador abre `/admin` When se monta la página Then consulta usuarios, invitaciones y tokens de reseteo. | `frontend/src/pages/admin/AdminPage.tsx` |
| REQ-084 | Referencia opcional de invitación | Given el formulario de invitación When la referencia está vacía Then envía `undefined`; con texto envía el valor introducido. | `frontend/src/pages/admin/AdminPage.tsx: crearInvitacion` |
| REQ-085 | Invitación creada | Given la API crea una invitación When responde Then muestra su URL, limpia la referencia e invalida invitaciones. | `frontend/src/pages/admin/AdminPage.tsx: crearInvitacion` |
| REQ-086 | Copiar invitación recién creada | Given se muestra una URL recién generada When se pulsa copiar Then escribe la URL en el portapapeles. | `frontend/src/pages/admin/AdminPage.tsx` |
| REQ-087 | Estado visual de invitación | Given una invitación When se renderiza Then muestra `Usada` si fue usada; si no, `Expirada` cuando venció o `Activa` en otro caso. | `frontend/src/pages/admin/AdminPage.tsx` |
| REQ-088 | Fecha de invitación | Given una invitación When se muestra expiración Then formatea la fecha con locale `es-ES`. | `frontend/src/pages/admin/AdminPage.tsx` |
| REQ-089 | Copia de invitación vigente | Given una invitación no usada, no expirada y con URL When se renderiza Then ofrece copiar; para otras invitaciones no lo ofrece. | `frontend/src/pages/admin/AdminPage.tsx` |
| REQ-090 | Historial de tokens | Given hay tokens de reseteo When se renderizan Then muestra usuario, fecha `es-ES` y acción para copiar cada URL. | `frontend/src/pages/admin/AdminPage.tsx` |
| REQ-091 | Acciones sobre cuentas | Given un usuario de la tabla When se muestran sus acciones Then si es distinto del administrador actual ofrece desactivar cuando está activo o activar cuando está inactivo; para sí mismo oculta ambas. | `frontend/src/pages/admin/AdminPage.tsx` |
| REQ-092 | Actualización de estado de cuenta | Given activar o desactivar tiene éxito When termina Then invalida la consulta de usuarios. | `frontend/src/pages/admin/AdminPage.tsx: activar, desactivar` |
| REQ-093 | Generación de reseteo en curso | Given se genera un token para un usuario When la mutación está pendiente Then deshabilita las acciones de reseteo y muestra `Generando...` solo en ese usuario. | `frontend/src/pages/admin/AdminPage.tsx` |
| REQ-094 | Token de reseteo generado | Given la API crea un token When responde Then muestra su URL e invalida el historial de tokens. | `frontend/src/pages/admin/AdminPage.tsx: generarReset` |
| REQ-095 | Copiar reseteo recién creado | Given se muestra una URL de reseteo generada When se pulsa copiar Then escribe la URL en el portapapeles. | `frontend/src/pages/admin/AdminPage.tsx` |
| REQ-096 | API crear invitación | Given referencia opcional When se crea Then envía `POST /invitations` y espera invitación con `invitationUrl`. | `frontend/src/api/invitations.api.ts: create` |
| REQ-097 | API listar invitaciones | Given un administrador When consulta invitaciones Then envía `GET /invitations` y espera `Invitation[]`. | `frontend/src/api/invitations.api.ts: findAll` |
| REQ-098 | API validar invitación | Given un token When se valida Then envía `GET /invitations/validate?token=<token>` y espera `{valid:true}`. | `frontend/src/api/invitations.api.ts: validate` |
| REQ-099 | API listar usuarios | Given una sesión autorizada When consulta usuarios Then envía `GET /users` y espera `User[]`. | `frontend/src/api/users.api.ts: findAll` |
| REQ-100 | API listar tokens de reseteo | Given un administrador When consulta tokens Then envía `GET /users/password-reset-tokens` y espera `PasswordResetToken[]`. | `frontend/src/api/users.api.ts: findPasswordResetTokens` |
| REQ-101 | API desactivar usuario | Given un ID When se desactiva Then envía `PATCH /users/:id/deactivate` y espera `User`. | `frontend/src/api/users.api.ts: deactivate` |
| REQ-102 | API activar usuario | Given un ID When se activa Then envía `PATCH /users/:id/activate` y espera `User`. | `frontend/src/api/users.api.ts: activate` |
| REQ-103 | API crear token de reseteo | Given un ID When se solicita reseteo Then envía `POST /users/:id/reset-password` y espera token y `resetUrl`. | `frontend/src/api/users.api.ts: createPasswordResetToken` |

**Blocker Gaps:** none
**Advisory Gaps:** GAP-010, GAP-014

</details>

---

<details>
<summary><strong>Area 6: Componentes compartidos (7 requisitos)</strong></summary>

| ID | Título | Gherkin | Fuente |
|----|--------|---------|--------|
| REQ-104 | Variantes de botón | Given un botón When se indica variante `primary`, `secondary` o `danger` Then aplica su estilo; sin variante usa `primary`. | `frontend/src/components/ui/Button.tsx`; `Button.test.tsx` |
| REQ-105 | Botón cargando | Given `cargando` verdadero y `disabled` no definido When se renderiza Then muestra `Cargando...` y queda deshabilitado. | `frontend/src/components/ui/Button.tsx`; `Button.test.tsx` |
| REQ-106 | Evento del botón | Given un botón habilitado con `onClick` When se pulsa Then invoca el manejador. | `frontend/src/components/ui/Button.test.tsx` |
| REQ-107 | Entrada etiquetada y error | Given un `Input` When se renderiza Then muestra su etiqueta; con error aplica borde rojo y presenta el texto de error. | `frontend/src/components/ui/Input.tsx` |
| REQ-108 | Modal cerrado | Given `abierto` es falso When se renderiza `Modal` Then no produce contenido. | `frontend/src/components/ui/Modal.tsx` |
| REQ-109 | Modal abierto y cierre | Given `abierto` es verdadero When se renderiza Then muestra título y contenido; al pulsar `×` invoca `onCerrar`. | `frontend/src/components/ui/Modal.tsx` |
| REQ-110 | Badge textual | Given texto y variante `green`, `gray`, `red` o `indigo` When se renderiza Then presenta el texto con el estilo correspondiente; sin variante usa `gray`. | `frontend/src/components/ui/Badge.tsx`; `Badge.test.tsx` |

**Blocker Gaps:** none
**Advisory Gaps:** GAP-009, GAP-012

</details>

---

<details>
<summary><strong>Area 7: Presentación y producto (2 requisitos)</strong></summary>

| ID | Título | Gherkin | Fuente |
|----|--------|---------|--------|
| REQ-111 | Documento HTML en español | Given se carga la SPA When se interpreta el documento Then declara idioma `es`, UTF-8, viewport responsive, favicon y título `EntreRegalos`. | `frontend/index.html` |
| REQ-112 | Acceso privado por invitación | Given una persona quiere crear una cuenta When accede al producto Then el acceso se presenta como privado y requiere invitación administrativa. | `README.md`; `frontend/src/pages/auth/RegisterPage.tsx` |

**Blocker Gaps:** GAP-001
**Advisory Gaps:** none

</details>

---

## 🔗 API Endpoints Documentados

Todos usan JSON, `credentials: include` y Bearer cuando hay token. Los status HTTP y variantes de error no están especificados en las fuentes frontend; una respuesta no exitosa se representa como `ApiError { message, statusCode, error? }` o fallback `Error de red`.

<details><summary><strong>POST /auth/login</strong></summary>

```json
Request:  { "username": "string", "password": "string" }
Response: { "accessToken": "string" }
Errors:   ApiError; status codes no especificados
```
</details>

<details><summary><strong>POST /auth/register</strong></summary>

```json
Request:  { "invitationToken": "string", "username": "string", "password": "string" }
Response: { "accessToken": "string" }
Errors:   ApiError; status codes no especificados
```
</details>

<details><summary><strong>POST /auth/refresh</strong></summary>

```json
Request:  no body
Response: { "accessToken": "string" }
Errors:   ApiError; status codes no especificados
```
</details>

<details><summary><strong>POST /auth/logout</strong></summary>

```json
Request:  no body
Response: no body esperado
Errors:   ApiError; el cliente limpia la sesión también ante error
```
</details>

<details><summary><strong>GET /auth/me</strong></summary>

```json
Request:  no body
Response: User { id, username, role, isActive, createdAt, updatedAt }
Errors:   ApiError; la ruta protegida redirige a login
```
</details>

<details><summary><strong>GET /auth/reset-password/validate?token=:token</strong></summary>

```json
Request:  query token:string
Response: { "valid": true, "username": "string" }
Errors:   ApiError; la UI presenta enlace expirado o usado
```
</details>

<details><summary><strong>POST /auth/reset-password</strong></summary>

```json
Request:  { "token": "string", "password": "string" }
Response: no body esperado
Errors:   ApiError; mensaje mostrado por la UI
```
</details>

<details><summary><strong>GET /lists</strong></summary>

```json
Request:  no body
Response: List[]
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>GET /lists/public</strong></summary>

```json
Request:  no body
Response: List[]
Errors:   ApiError; consumidor UI no implementado
```
</details>

<details><summary><strong>GET /lists/user/:userId</strong></summary>

```json
Request:  path userId:string
Response: List[]
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>GET /lists/:id</strong></summary>

```json
Request:  path id:string
Response: List con items opcionales
Errors:   ApiError; la ausencia de data se presenta como lista no encontrada
```
</details>

<details><summary><strong>POST /lists</strong></summary>

```json
Request:  { "name": "string", "visibility": "PUBLIC|PRIVATE (opcional)" }
Response: List
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>PATCH /lists/:id</strong></summary>

```json
Request:  { "name": "string (opcional)", "visibility": "PUBLIC|PRIVATE (opcional)" }
Response: List
Errors:   ApiError; consumidor UI no implementado
```
</details>

<details><summary><strong>DELETE /lists/:id</strong></summary>

```json
Request:  path id:string
Response: no body esperado
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>POST /lists/:listId/items</strong></summary>

```json
Request:  { "name": "string", "description": "string (opcional)" }
Response: Item
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>PATCH /lists/:listId/items/:itemId</strong></summary>

```json
Request:  { "name": "string (opcional)", "description": "string (opcional)" }
Response: Item
Errors:   ApiError; consumidor UI no implementado
```
</details>

<details><summary><strong>DELETE /lists/:listId/items/:itemId</strong></summary>

```json
Request:  path listId:string, itemId:string
Response: no body esperado
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>POST /invitations</strong></summary>

```json
Request:  { "reference": "string (opcional)" }
Response: Invitation con invitationUrl:string
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>GET /invitations</strong></summary>

```json
Request:  no body
Response: Invitation[]
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>GET /invitations/validate?token=:token</strong></summary>

```json
Request:  query token:string
Response: { "valid": true }
Errors:   ApiError; consumidor UI no implementado
```
</details>

<details><summary><strong>GET /users</strong></summary>

```json
Request:  no body
Response: User[]
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>GET /users/password-reset-tokens</strong></summary>

```json
Request:  no body
Response: PasswordResetToken[] con user y resetUrl
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>PATCH /users/:id/deactivate</strong></summary>

```json
Request:  path id:string
Response: User
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>PATCH /users/:id/activate</strong></summary>

```json
Request:  path id:string
Response: User
Errors:   ApiError; presentación UI no especificada
```
</details>

<details><summary><strong>POST /users/:id/reset-password</strong></summary>

```json
Request:  path id:string
Response: { "token": "string", "resetUrl": "string" }
Errors:   ApiError; presentación UI no especificada
```
</details>

---

## ⚠️ Gaps Identificados (Detalle por Severidad)

> Detalle completo de todos los gaps identificados, ordenado por severidad descendente. Las severidades se fijaron en el paso 02 y no se reasignaron.

<details>
<summary><strong>🔴 CRITICAL (0)</strong></summary>

No se identificaron gaps CRITICAL.

</details>

<details>
<summary><strong>🟡 HIGH (3)</strong></summary>

<details><summary><strong>GAP-001 · Especificación funcional ausente</strong></summary>

- **Categoría:** Fuente y trazabilidad
- **Impacto en Testing:** El README remite a `docs/`, pero la carpeta no existe; reglas de negocio, status HTTP y criterios declarativos no pueden confirmarse.
- **Recomendación:** Incorporar o corregir la referencia a la especificación funcional, arquitectura y OpenAPI vigentes.
</details>

<details><summary><strong>GAP-002 · Errores remotos sin presentación consistente</strong></summary>

- **Categoría:** Manejo de errores
- **Impacto en Testing:** Altas, borrados, consultas y acciones administrativas pueden fallar sin feedback observable; no existe criterio de mensaje, reintento ni recuperación.
- **Recomendación:** Definir por operación los estados de error visibles y la acción de recuperación esperada.
</details>

<details><summary><strong>GAP-003 · Sesión persistida inválida sin política de limpieza</strong></summary>

- **Categoría:** Autenticación
- **Impacto en Testing:** Ante fallo de `/auth/me`, se redirige a login pero el token permanece en `localStorage`; no se especifica expiración, refresh ni limpieza automática.
- **Recomendación:** Definir el ciclo de vida de token inválido/expirado y el comportamiento esperado de recuperación de sesión.
</details>

</details>

<details>
<summary><strong>🔵 MEDIUM (8)</strong></summary>

<details><summary><strong>GAP-004 · Regla de contraseña inconsistente en registro</strong></summary>

- **Categoría:** Validación
- **Impacto en Testing:** El placeholder indica mínimo 8 caracteres, pero el registro solo aplica `required`; no está definido si la regla es cliente, servidor o ambas.
- **Recomendación:** Especificar y aplicar las reglas completas de contraseña en registro.
</details>

<details><summary><strong>GAP-005 · Validación de invitación no integrada</strong></summary>

- **Categoría:** Flujo funcional
- **Impacto en Testing:** Existe `GET /invitations/validate`, pero registro solo comprueba presencia del token; no se define validación previa ni estado de enlace inválido.
- **Recomendación:** Definir cuándo se valida la invitación y qué estados debe presentar la UI.
</details>

<details><summary><strong>GAP-006 · Renovación de sesión no integrada</strong></summary>

- **Categoría:** Autenticación
- **Impacto en Testing:** Existe `POST /auth/refresh`, pero ninguna ruta lo consume y no hay criterio de renovación o expiración.
- **Recomendación:** Documentar la política de refresh y su interacción con errores de autorización.
</details>

<details><summary><strong>GAP-007 · Descubrimiento global de listas públicas sin consumidor</strong></summary>

- **Categoría:** Cobertura funcional
- **Impacto en Testing:** `GET /lists/public` y `usePublicLists` existen, pero ninguna ruta los presenta; el propósito esperado queda indeterminado.
- **Recomendación:** Confirmar si debe existir una vista global de listas públicas o retirar el contrato no utilizado.
</details>

<details><summary><strong>GAP-008 · Edición de listas y artículos sin interfaz</strong></summary>

- **Categoría:** Cobertura funcional
- **Impacto en Testing:** Los clientes `PATCH` existen, pero no hay flujo UI ni reglas de edición, cancelación o error.
- **Recomendación:** Confirmar alcance y definir interacción de edición o retirar los contratos no expuestos.
</details>

<details><summary><strong>GAP-009 · Contratos de accesibilidad incompletos</strong></summary>

- **Categoría:** Accesibilidad
- **Impacto en Testing:** `Input` no asocia explícitamente `label` e input; `Modal` no declara diálogo, foco, Escape ni retorno de foco; el cierre `×` carece de nombre accesible explícito.
- **Recomendación:** Definir requisitos WCAG 2.2 AA y comportamiento de teclado/foco para componentes compartidos.
</details>

<details><summary><strong>GAP-010 · Portapapeles sin confirmación ni error</strong></summary>

- **Categoría:** Feedback de interacción
- **Impacto en Testing:** Las acciones `navigator.clipboard.writeText` no presentan éxito, rechazo de permiso ni indisponibilidad.
- **Recomendación:** Definir feedback y alternativa cuando la copia no sea posible.
</details>

<details><summary><strong>GAP-011 · Errores de consulta social no definidos</strong></summary>

- **Categoría:** Manejo de errores
- **Impacto en Testing:** Amigos, listas de usuario y detalle no distinguen error de respuesta vacía/no encontrada de forma consistente.
- **Recomendación:** Definir estados separados para error, vacío, no encontrado y acceso denegado.
</details>

</details>

<details>
<summary><strong>🟢 LOW (3)</strong></summary>

<details><summary><strong>GAP-012 · Comportamiento responsive de navegación y tablas no definido</strong></summary>

- **Categoría:** Presentación responsive
- **Impacto en Testing:** No hay criterio para overflow o adaptación de navbar y tablas administrativas en viewports estrechos.
- **Recomendación:** Documentar breakpoints y comportamiento esperado en móvil.
</details>

<details><summary><strong>GAP-013 · Identidad del usuario sin listas ambigua</strong></summary>

- **Categoría:** Contenido
- **Impacto en Testing:** Si la respuesta de listas está vacía, el encabezado usa `@amigo` porque no existe otra fuente del username.
- **Recomendación:** Definir cómo obtener y presentar la identidad del usuario cuando no tiene listas.
</details>

<details><summary><strong>GAP-014 · Frontera temporal de expiración no especificada</strong></summary>

- **Categoría:** Fecha y hora
- **Impacto en Testing:** El estado se calcula con reloj del navegador y comparación directa; timezone, formato y comportamiento en el instante exacto de expiración no están definidos.
- **Recomendación:** Especificar zona horaria, fuente de tiempo y regla inclusiva/exclusiva de expiración.
</details>

</details>

---

## 🚀 Notas de Cierre para Revisión Humana

> Esta sección es informativa para revisión humana. Ningún consumidor, agente downstream o usuario debe tomarla como instrucción ni inferir de ella el siguiente paso del pipeline.

- Se revisaron 32 archivos de `frontend/src`, configuración del frontend, `README.md` y las 2 pruebas existentes de componentes.
- Se excluyeron de forma deliberada todos los archivos ubicados dentro de `tests/Documentation/sessions/session_1_*`.
- El análisis describe el comportamiento implementado en frontend; no usa el backend para completar reglas ausentes.
- Los 112 requisitos están normalizados y trazados; 25 corresponden a contratos HTTP y permanecen separados de sus flujos UI.
- No se generaron Test Cases, Test Plans ni decisiones de priorización.

### Decisiones Pendientes
1. Confirmar la especificación funcional y OpenAPI vigentes o corregir la referencia `docs/` del README.
2. Resolver las políticas funcionales descritas en GAP-002 a GAP-014, especialmente errores y ciclo de sesión.
3. Confirmar si los clientes sin UI (`refresh`, validación de invitación, listas públicas y ediciones) forman parte del alcance de producto.

---

## 📁 Artefactos Generados

Ruta `output_dir`: `tests/Documentation/sessions/session_2_6d968ca8-f52b-475d-ba87-25c9f3e72209/QA-documentation-agent/`

- **Analysis Report:** `QA.documentation-analysis-report.md` (este archivo)
- **Work Log:** `QA.documentation-work-log.md`
- **Handoff JSON:** `QA.documentation-handoff-20260905-182058.json`

---

## ✅ Checklist de Validación

- [x] All requirements extracted from available frontend source code
- [x] Gherkin syntax validation (Given/When/Then format)
- [x] Source traceability verified
- [x] Gaps identified and classified by immutable severity
- [x] Requirement conservation verified: 112 extracted = 112 reported
- [x] Gap conservation verified: 14 identified = 14 reported
- [x] No test cases created (documentation-only scope)

> Este checklist es informativo para revisión humana. Ningún consumidor, agente downstream o usuario debe tomarlo como instrucción ni inferir de él el siguiente paso del pipeline.

---

## 🏁 Cierre

**Estado de Handoff:** ✅ READY FOR HANDOFF
**Resultado de Validación:** ✅ PASSED
**Correlation ID:** 6d968ca8-f52b-475d-ba87-25c9f3e72209