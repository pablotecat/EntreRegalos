# Pruebas de EntreRegalos

## Fuente y alcance

La fuente correcta sigue siendo el [analisis de la sesion 2](Documentation/sessions/session_2_6d968ca8-f52b-475d-ba87-25c9f3e72209/QA-documentation-agent/QA.documentation-analysis-report.md) y sus [45 casos originales](Documentation/sessions/session_2_6d968ca8-f52b-475d-ba87-25c9f3e72209/QA-generator-agent/QA.generator-test-cases.md). Ambos permanecen intactos: este manual sustituye el juicio previo que descartaba su analisis, no sus requisitos ni sus 14 gaps. La matriz conserva todos los TEST y REQ; tener cobertura asociada no significa cubrir todos los criterios ni acreditar una ejecucion aprobada.

## Ejecucion manual

Usar Node 20 y Docker. Desde la raiz, instalar cada proyecto por separado y crear PostgreSQL desechable, sin volumen de la aplicacion:

```sh
node --version
npm ci
npm --prefix frontend ci
npm --prefix backend ci
npx playwright install chromium
docker run --rm --name entreregalos-playwright-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=entreregalos_e2e -p 127.0.0.1:55432:5432 -d postgres:16-alpine
docker exec entreregalos-playwright-db pg_isready -U postgres -d entreregalos_e2e
```

Repetir `pg_isready` hasta que acepte conexiones. `E2E_DATABASE_URL` permite otra base **local y desechable**, con nombre terminado en `_e2e`; `tests/start-backend.cjs` rechaza otros destinos antes de generar Prisma, aplicar migraciones, ejecutar seed y compilar Nest. No hace reset de la base.

`playwright.config.ts` compila la SPA real y sirve Vite preview en `http://127.0.0.1:3100`; Nest escucha en `http://127.0.0.1:3101/api/v1`. No usa los puertos habituales 3000/3001 ni reutiliza servidores existentes. El unico build frontend configurado usa `VITE_API_URL=/api/v1`, con proxy a 3101. Ambos servidores se inician incluso al seleccionar solo `api` o `ui`.

Comandos de verificacion, no resultados de esta edicion:

```sh
npm run test:types
npm run test:api
npm run test:ui
npm run test:e2e
npm run test:playwright
npm run test:playwright -- --project=e2e-mobile
npm --prefix frontend test
npm --prefix backend test
npm --prefix frontend run build
npm --prefix backend run build
npm --prefix frontend run lint
npx playwright show-report
```

`test:playwright` ejecuta todos los proyectos; es alternativa a ejecutar las tres capas por separado. `test:types` comprueba TypeScript de las pruebas. Al terminar, incluso tras fallos, eliminar la base deteniendo el contenedor creado arriba:

```sh
docker stop entreregalos-playwright-db
```

No usar cuentas ni datos reales. Quedan datos de prueba hasta destruir el contenedor; las trazas pueden contener credenciales y tokens y no deben versionarse. Playwright tiene `retries: 0`, dos workers, trazas retenidas y capturas ante fallo.

## Capas y fixtures

| Capa | Ubicacion y proyecto | Alcance |
| --- | --- | --- |
| API HTTP | `tests/api/contracts.spec.ts`, proyecto `api`, 10 pruebas | HTTP real con `APIRequestContext`, Nest y PostgreSQL, sin navegador ni mocks. |
| Cliente API | `frontend/src/api/client.test.ts` y `contracts.test.ts`, Vitest | Cliente y wrappers reales con `fetch` simulado; construccion, parseo, errores y contratos del consumidor. |
| UI navegador | `tests/ui/*.spec.ts`, proyecto `ui`, 70 pruebas | SPA compilada en Chromium con respuestas API controladas; estados pendientes, errores, vacios, reloj e interacciones. No acredita persistencia backend. |
| UI componentes | `frontend/src/components/ui/*.test.tsx`, Vitest | TEST-040 a TEST-043 conservan sus IDs; montaje aislado con Testing Library, sin POM artificial ni harness de montaje en navegador. |
| Hooks UI | `frontend/src/hooks/*.test.tsx`, Vitest | Claves e invalidaciones exactas de React Query y limpieza completa de cache/sesion para los REQ internos. |
| E2E | `tests/e2e/*.spec.ts`, proyectos `e2e` y `e2e-mobile` | Siete escenarios reales ejecutados en dos proyectos: Chrome escritorio y Pixel 7 emulado. SPA, API, cookies y persistencia, sin mocks. |

`tests/ui/fixtures.ts` intercepta `**/api/**` y exige coincidencia exacta de metodo, ruta con query y origen configurado. Una peticion sin respuesta registrada o con origen incorrecto se aborta y hace fallar la prueba; tambien se registran errores no controlados del navegador. `hold` permite observar pendientes; el `finally` libera todas las esperas y ejecuta `unrouteAll({ behavior: 'wait' })`. La sesion UI escribe `accessToken` una sola vez, no con un init script que lo resucite tras logout.

`tests/fixtures.ts` prepara cuentas unicas mediante invitaciones y registro por API real, autentica al administrador del seed y libera los contextos HTTP. Los E2E inician sesion por la UI, sin inyectar autenticacion de navegador.

Los POM compartidos por UI/E2E contienen selectores y acciones sobre paginas reales, no respuestas ni estado de mocks. Son seis archivos en `tests/pages/`:

| Archivo | Clases |
| --- | --- |
| `auth.page.ts` | `LoginPage`, `RegisterPage`, `ResetPasswordPage` |
| `lists.page.ts` | `ListsPage`, `ListDetailPage` |
| `social.page.ts` | `FriendsPage`, `UserListsPage` |
| `admin.page.ts` | `AdminPage` |
| `shell.page.ts` | `ShellPage` |
| `document.page.ts` | `DocumentPage` |

## Matriz de trazabilidad

Rutas abreviadas: `ui/`, `api/` y `e2e/` parten de `tests/`; `cliente/` significa `frontend/src/api/`; `componentes/`, `frontend/src/components/ui/`. Las variantes pueden compartir ID. La columna de alcance describe las aserciones existentes, no un resultado de ejecucion.

| ID | Requisitos originales | Archivos de pruebas | Alcance / limitacion |
| --- | --- | --- | --- |
| TEST-001 | REQ-001, REQ-002, REQ-003, REQ-004 | `cliente/client.test.ts` | Parcial: bases con/sin variable, Bearer condicional, cookies, JSON, metodos/cuerpos y sobrescritura explicita de cabecera. Variantes de entorno en Vitest, no segundo build frontend. |
| TEST-002 | REQ-005, REQ-006 | `cliente/client.test.ts` | Rechazo JSON y fallback con `rejects`; 204 devuelve `undefined` sin parseo. Fallo de transporte adicional simulado. |
| TEST-003 | REQ-007 | `ui/platform.spec.ts` | Runtime de la SPA: fallo transitorio y persistente con un reintento, cache antes de 60 s y refetch despues usando reloj. Usa el QueryClient global real, no uno personalizado. |
| TEST-004 | REQ-008, REQ-009, REQ-011, REQ-012 | `ui/platform.spec.ts`; `e2e/authentication.spec.ts` | Suspense reteniendo chunks reales, AuthLayout y reemplazo de historial; E2E aporta rutas reales. |
| TEST-005 | REQ-010, REQ-013, REQ-014, REQ-015, REQ-016 | `ui/platform.spec.ts`; `e2e/authentication.spec.ts` | Rutas sin token, usuario pendiente/nulo y AppLayout autorizado; sincronizacion observable por usuario visible y token, sin introspeccion del store. |
| TEST-006 | REQ-017, REQ-018, REQ-019 | `ui/platform.spec.ts`; `e2e/authentication.spec.ts` | Navegacion, enlace activo y roles USER/ADMIN; E2E comprueba restricciones API. |
| TEST-007 | REQ-020, REQ-040 | `ui/platform.spec.ts`; `e2e/authentication.spec.ts`; `hooks/useAuth.test.tsx` | Logout UI con 204/error, sin body y navegacion; el unitario comprueba que toda la cache y sesion local se vacian; E2E usa respuesta real 200 y rechaza replay de refresh. |
| TEST-008 | REQ-021, REQ-022, REQ-037, REQ-041 | `ui/authentication.spec.ts`; `e2e/authentication.spec.ts` | Campos ausentes bloqueados por HTML; POST login, GET me, Bearer, persistencia y recarga; login real E2E. |
| TEST-009 | REQ-023 | `ui/authentication.spec.ts`; `e2e/authentication.spec.ts` | String y primer elemento de array en UI; rechazo real de login en E2E, no todas las variantes remotas. |
| TEST-010 | REQ-024 | `ui/authentication.spec.ts`; `e2e/authentication.spec.ts` | Sin invitacion: aviso, boton deshabilitado y cero peticiones UI; API real rechaza alta sin token. |
| TEST-011 | REQ-025, REQ-026, REQ-038 | `ui/authentication.spec.ts`; `e2e/admin.spec.ts` | Campos requeridos, payload con invitacion y sesion persistida; invitacion y registro reales E2E. |
| TEST-012 | REQ-027 | `ui/authentication.spec.ts` | Errores string/array, solo primer mensaje, sin sesion creada; respuestas simuladas. |
| TEST-013 | REQ-028, REQ-029, REQ-030, REQ-031, REQ-042 | `ui/authentication.spec.ts`; `e2e/authentication.spec.ts`; `e2e/admin.spec.ts` | Sin token, pendiente, invalido y valido con usuario; validacion real complementaria. |
| TEST-014 | REQ-032, REQ-033, REQ-034 | `ui/authentication.spec.ts`; `e2e/admin.spec.ts` | Menos de ocho caracteres, mismatch y limpieza al editar cualquiera de los campos sin POST; flujo real complementario. |
| TEST-015 | REQ-035, REQ-043 | `ui/authentication.spec.ts`; `e2e/admin.spec.ts` | UI comprueba 204 sin cuerpo y retorno a login. Backend actual devuelve 200 JSON compatible con el cliente; E2E prueba cambio y consumo real, no la respuesta sin cuerpo esperada por la fuente. |
| TEST-016 | REQ-036 | `ui/authentication.spec.ts` | Rechazo de reset string/array, solo primer mensaje; no se atribuyen ambas variantes al backend. |
| TEST-017 | REQ-039 | `api/contracts.spec.ts`; `cliente/contracts.test.ts`; `e2e/authentication.spec.ts` | POST refresh sin body, cookie HttpOnly y token utilizable; wrapper Vitest y cookie de navegador E2E. No renovacion automatica de la SPA. |
| TEST-018 | REQ-044, REQ-045, REQ-046, REQ-066 | `ui/lists.spec.ts`; `e2e/lists.spec.ts`; `hooks/useLists.test.tsx` | GET, carga y vacio; el unitario comprueba la clave literal `['lists', 'mine']`; E2E aporta datos reales. |
| TEST-019 | REQ-047 | `ui/lists.spec.ts`; `e2e/lists.spec.ts` | Tarjetas privadas/publicas, contador y fallback cero, enlaces por nombre/Ver; datos persistidos en E2E. |
| TEST-020 | REQ-048, REQ-049, REQ-050, REQ-051, REQ-070 | `ui/lists.spec.ts`; `e2e/lists.spec.ts`; `hooks/useLists.test.tsx` | Modal, espacios, trim, PRIVATE inicial y ambas visibilidades; la UI permanece pendiente hasta exito y el hook invalida exactamente listas propias despues de resolver. |
| TEST-021 | REQ-052, REQ-053, REQ-072 | `ui/lists.spec.ts`; `e2e/lists.spec.ts`; `hooks/useLists.test.tsx` | Confirmacion nativa: cancelar no envia DELETE; confirmar admite 204 e invalida listas propias solo tras exito. Persistencia/404 reales E2E. |
| TEST-022 | REQ-054, REQ-055, REQ-069 | `ui/lists.spec.ts` | GET detalle pendiente y ausencia tras 404; no inventa una respuesta 204 de detalle. |
| TEST-023 | REQ-056, REQ-057 | `ui/lists.spec.ts`; `e2e/lists.spec.ts`; `e2e/social.spec.ts` | Enlace y retorno a Mis listas o Amigos segun propiedad; usuarios reales en E2E. |
| TEST-024 | REQ-058, REQ-059, REQ-060, REQ-061, REQ-073 | `ui/lists.spec.ts`; `e2e/lists.spec.ts`; `hooks/useLists.test.tsx` | Abrir/cancelar, nombre vacio, trim y descripcion omitida; mantiene formulario durante pendiente e invalida el detalle solo tras exito; persistencia real. |
| TEST-025 | REQ-062, REQ-063 | `ui/lists.spec.ts`; `e2e/lists.spec.ts` | Vacio y contenido exacto de articulos con/sin descripcion. |
| TEST-026 | REQ-064, REQ-075 | `ui/lists.spec.ts`; `e2e/lists.spec.ts`; `hooks/useLists.test.tsx` | Cancelar/confirmar borrado, DELETE sin body y 204; el elemento permanece hasta exito y el hook invalida exactamente el detalle; resultado persistido E2E. |
| TEST-027 | REQ-065 | `ui/lists.spec.ts`; `e2e/social.spec.ts` | Visitante sin controles de modificacion; E2E agrega rechazo de mutaciones ajenas por API. |
| TEST-028 | REQ-067 | `api/contracts.spec.ts`; `cliente/contracts.test.ts` | GET publicas globales real y wrapper `findPublic`, coleccion/vacio; no hay consumidor UI. |
| TEST-029 | REQ-068 | `api/contracts.spec.ts`; `cliente/contracts.test.ts`; `e2e/social.spec.ts` | GET por userId, identidad y publicas; wrapper con distintos IDs y vacio, descubrimiento real E2E. |
| TEST-030 | REQ-071, REQ-074 | `api/contracts.spec.ts`; `cliente/contracts.test.ts`; `e2e/social.spec.ts` | PATCH lista/articulo: campos individuales/combinados, omitidos preservados y persistencia; sin interfaz de edicion. |
| TEST-031 | REQ-076, REQ-077, REQ-078 | `ui/social.spec.ts`; `e2e/social.spec.ts` | Pendiente, vacio, inicial mayuscula, username y navegacion; usuarios reales complementarios. |
| TEST-032 | REQ-079, REQ-080, REQ-081, REQ-082 | `ui/social.spec.ts`; `e2e/social.spec.ts` | Carga, propietario/fallback amigo, vacio, tarjetas publicas, cantidades y enlaces; privacidad real E2E. |
| TEST-033 | REQ-083, REQ-097, REQ-099, REQ-100 | `ui/admin.spec.ts` | Tres GET y colecciones mediante los contratos originales. `GET /users` devuelve todos para ADMIN y el directorio filtrado para USER. |
| TEST-034 | REQ-084, REQ-085, REQ-086, REQ-096 | `ui/admin.spec.ts`; `e2e/admin.spec.ts` | Referencia vacia omitida en JSON, texto enviado sin trim, URL, limpieza, refetch y portapapeles nativo; creacion real E2E. |
| TEST-035 | REQ-087, REQ-088, REQ-089 | `ui/admin.spec.ts`; `e2e/admin.spec.ts` | Reloj fijo: usada prevalece, expirada/activa, fechas es-ES y copia solo activa con URL; no frontera exacta de expiracion ni expiracion backend por reloj. |
| TEST-036 | REQ-090, REQ-095 | `ui/admin.spec.ts`; `e2e/admin.spec.ts` | Usuario, fechas es-ES y lectura del portapapeles para URLs historicas y nuevas; flujo real complementario. |
| TEST-037 | REQ-091, REQ-092, REQ-101, REQ-102 | `ui/admin.spec.ts`; `e2e/authentication.spec.ts` | Cuenta propia protegida, PATCH activar/desactivar y refetch; persistencia y rechazo de sesion inactiva E2E. |
| TEST-038 | REQ-093, REQ-094, REQ-103 | `ui/admin.spec.ts`; `e2e/admin.spec.ts` | Pendiente bloquea resets, Generando solo en objetivo; POST sin body, URL y refetch del historial; token real E2E. |
| TEST-039 | REQ-098 | `api/contracts.spec.ts`; `cliente/contracts.test.ts`; `e2e/admin.spec.ts` | GET validate con token y `{ valid: true }`; validar no consume, registro consume y replay se rechaza. Wrapper probado sin inventar consumidor UI. |
| TEST-040 | REQ-104, REQ-105, REQ-106 | `componentes/Button.test.tsx` | Vitest aislado: variantes/default, carga con `disabled` omitido, disabled explicito y callback; ID preservado, sin POM de montaje. |
| TEST-041 | REQ-107 | `componentes/Input.test.tsx` | Vitest aislado: etiqueta, error y borde rojo; asociaciones accesibles, props y ref adicionales. |
| TEST-042 | REQ-108, REQ-109 | `componentes/Modal.test.tsx` | Vitest aislado: contenedor vacio cerrado, abierto con titulo/contenido, callback y desaparicion al recibir `abierto=false`; no cobertura completa de foco/teclado. |
| TEST-043 | REQ-110 | `componentes/Badge.test.tsx` | Vitest aislado: texto, green/gray/red/indigo y gray por defecto; ID preservado. |
| TEST-044 | REQ-111 | `ui/platform.spec.ts`; `e2e/authentication.spec.ts` | Idioma, charset, viewport, titulo y declaracion `href=/favicon.svg`; no demuestra existencia ni carga del asset. |
| TEST-045 | REQ-112 | `ui/platform.spec.ts`; `e2e/admin.spec.ts` | Encabezado, aviso de invitacion, registro deshabilitado y cero peticiones; el E2E acredita que la invitacion procede del administrador y habilita un unico alta. |

## Limites y estado

En TEST-045, privacidad e invitacion administrativa proceden del `README.md` del producto, no de una frase literal del frontend. La UI verifica marca, aviso, boton deshabilitado y cero peticiones; el recorrido E2E une la generacion administrativa con un unico registro. No se inventa copy de producto.

TEST-015 mantiene el esperado original sin cuerpo: la UI simula 204 y comprueba navegacion; el backend actual responde 200 con JSON. Son respuestas compatibles para el cliente, no evidencia de que Nest emita 204.

No se acredita Passenger, CORS entre origenes, Firefox/WebKit, movil fisico, foco/teclado completo del modal ni reglas ausentes en los gaps originales. El lint frontend tiene un bloqueo preexistente por falta de configuracion ESLint; no se afirma que pase.

Verificacion local actual: Playwright 94/94 y repeticion completa 188/188, frontend Vitest 48/48 y backend Vitest 22/22; TypeScript, builds frontend/backend y lint focalizado backend correctos. Se ejecuto con Node 24.18.0, mientras CI usa el Node 20 requerido. El lint frontend sigue bloqueado por no existir configuracion ESLint en el repositorio.
