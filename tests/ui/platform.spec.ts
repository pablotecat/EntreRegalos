import { test, expect, uiUser } from './fixtures';
import { LoginPage, RegisterPage, ResetPasswordPage } from '../pages/auth.page';
import { ShellPage } from '../pages/shell.page';
import { ListsPage } from '../pages/lists.page';
import { FriendsPage } from '../pages/social.page';
import { AdminPage } from '../pages/admin.page';
import { DocumentPage } from '../pages/document.page';

test('TEST-003: un reintento y cache fresca durante 60000 ms', async ({ page, mockApi }) => {
  await mockApi.session();
  await page.clock.install();
  mockApi.respond('GET', '/users', []);
  const release = mockApi.hold('GET', '/lists', { message: 'Temporal' }, 500);
  const lists = new ListsPage(page);
  const shell = new ShellPage(page);
  await lists.goto();
  await expect(lists.loading).toBeVisible();
  expect(mockApi.calls('GET', '/lists')).toHaveLength(1);
  mockApi.respond('GET', '/lists', []);
  release();
  await expect(lists.empty).toBeVisible();
  expect(mockApi.calls('GET', '/lists')).toHaveLength(2);
  await shell.friendsLink.click();
  await expect(new FriendsPage(page).empty).toBeVisible();
  await page.clock.fastForward(59_000);
  await shell.listsLink.click();
  await expect(lists.empty).toBeVisible();
  expect(mockApi.calls('GET', '/lists')).toHaveLength(2);
  await shell.friendsLink.click();
  await expect(new FriendsPage(page).empty).toBeVisible();
  await page.clock.fastForward(2_000);
  await shell.listsLink.click();
  await expect.poll(() => mockApi.calls('GET', '/lists').length).toBe(3);
});

test('TEST-003: un error persistente agota exactamente un reintento', async ({ page, mockApi }) => {
  await mockApi.session();
  mockApi.respond('GET', '/lists', { message: 'Persistente' }, 500);
  const lists = new ListsPage(page);
  await lists.goto();
  await expect(lists.loading).toBeVisible();
  await expect(lists.heading).toBeVisible();
  expect(mockApi.calls('GET', '/lists')).toHaveLength(2);
});

for (const [path, module, heading] of [
  ['/login', 'LoginPage', 'Iniciar sesión'],
  ['/register', 'RegisterPage', 'Crear cuenta'],
  ['/reset-password', 'ResetPasswordPage', 'Restablecer contraseña'],
]) {
  test(`TEST-004: Suspense y AuthLayout en ${path}`, async ({ page, context }) => {
    let release!: () => void;
    const ready = new Promise<void>((resolve) => { release = resolve; });
    let requests = 0;
    await context.route(`**/assets/${module}-*.js`, async (route) => {
      requests++;
      await ready;
      await route.continue();
    });
    try {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(new ShellPage(page).loading).toBeVisible();
      expect(requests).toBe(1);
      release();
      const auth = module === 'LoginPage' ? new LoginPage(page)
        : module === 'RegisterPage' ? new RegisterPage(page) : new ResetPasswordPage(page);
      await expect(auth.productHeading).toBeVisible();
      await expect(auth.pageHeading).toHaveText(heading);
      await expect(new ShellPage(page).nav).toHaveCount(0);
    } finally {
      release();
    }
  });
}

for (const path of ['/', '/ruta-desconocida']) {
  test(`TEST-004: ${path} reemplaza el historial con /listas`, async ({ page, mockApi }) => {
    await mockApi.session();
    mockApi.respond('GET', '/lists', []);
    await page.goto('/register');
    await expect(new RegisterPage(page).pageHeading).toBeVisible();
    await page.goto(path);
    await expect(new ListsPage(page).heading).toBeVisible();
    await expect(page).toHaveURL('/listas');
    await page.goBack();
    await expect(page).toHaveURL('/register');
    await expect(new RegisterPage(page).pageHeading).toBeVisible();
  });
}

for (const path of ['/listas', '/listas/list-1', '/amigos', '/amigos/user-2/listas', '/admin']) {
  test(`TEST-005: ${path} sin token y sin usuario remoto no autoriza contenido`, async ({ page, mockApi }) => {
    const shell = new ShellPage(page);
    await shell.goto(path);
    await expect(new LoginPage(page).pageHeading).toBeVisible();
    await expect(page).toHaveURL('/login');
    expect(mockApi.requests).toHaveLength(0);
    await mockApi.session();
    const release = mockApi.hold('GET', '/auth/me', null);
    await shell.goto(path);
    await expect(shell.loading).toBeVisible();
    await expect(shell.nav).toHaveCount(0);
    release();
    await expect(page).toHaveURL('/login');
    await expect(new LoginPage(page).pageHeading).toBeVisible();
    expect(mockApi.calls('GET', '/auth/me')).toHaveLength(1);
    expect(mockApi.requests).toHaveLength(1);
  });
}

test('TEST-005: usuario remoto pendiente sincroniza la sesion y autoriza AppLayout', async ({ page, mockApi }) => {
  await mockApi.session();
  const release = mockApi.hold('GET', '/auth/me', uiUser);
  mockApi.respond('GET', '/lists', []);
  const shell = new ShellPage(page);
  await shell.goto('/listas');
  await expect(shell.loading).toBeVisible();
  expect(mockApi.calls('GET', '/lists')).toHaveLength(0);
  release();
  await expect(shell.username(uiUser.username)).toBeVisible();
  await expect(new ListsPage(page).heading).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBe('ui-access-token');
});

for (const role of ['USER', 'ADMIN']) {
  test(`TEST-006: navegacion, enlace activo y acceso ${role}`, async ({ page, mockApi }) => {
    await mockApi.session({ ...uiUser, role });
    for (const path of ['/lists', '/users', '/invitations', '/users/password-reset-tokens']) {
      mockApi.respond('GET', path, []);
    }
    const shell = new ShellPage(page);
    await shell.goto('/listas');
    await expect(shell.brand).toBeVisible();
    await expect(shell.username(uiUser.username)).toBeVisible();
    await expect(shell.logoutButton).toBeEnabled();
    await expect(shell.listsLink).toHaveAttribute('aria-current', 'page');
    await shell.friendsLink.click();
    await expect(new FriendsPage(page).heading).toBeVisible();
    await expect(shell.friendsLink).toHaveAttribute('aria-current', 'page');
    await expect(shell.listsLink).not.toHaveAttribute('aria-current', 'page');
    await shell.listsLink.click();
    await expect(new ListsPage(page).heading).toBeVisible();
    if (role === 'ADMIN') {
      await shell.adminLink.click();
      await expect(new AdminPage(page).heading).toBeVisible();
      await expect(shell.adminLink).toHaveAttribute('aria-current', 'page');
    } else {
      await expect(shell.adminLink).toHaveCount(0);
      await shell.goto('/admin');
      await expect(page).toHaveURL('/listas');
      await expect(new ListsPage(page).heading).toBeVisible();
    }
  });
}

for (const status of [204, 500]) {
  test(`TEST-007: logout ${status} limpia sesion y cache antes del siguiente login`, async ({ page, mockApi }) => {
    await mockApi.session();
    mockApi.respond('GET', '/lists', [{ id: 'private', name: 'Lista de Ana', ownerId: uiUser.id, visibility: 'PRIVATE' }]);
    mockApi.respond('POST', '/auth/logout', status === 204 ? undefined : { message: 'Error remoto' }, status);
    const shell = new ShellPage(page);
    const lists = new ListsPage(page);
    await lists.goto();
    await expect(lists.link('Lista de Ana')).toBeVisible();
    await shell.logoutButton.click();
    await expect(new LoginPage(page).pageHeading).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBeNull();
    expect(mockApi.calls('POST', '/auth/logout')).toHaveLength(1);
    expect(mockApi.calls('POST', '/auth/logout')[0].postData()).toBeNull();
    mockApi.respond('POST', '/auth/login', { accessToken: 'other-token' });
    mockApi.respond('GET', '/auth/me', { ...uiUser, id: 'other', username: 'beatriz' });
    mockApi.respond('GET', '/lists', []);
    const login = new LoginPage(page);
    await login.fillCredentials('beatriz', 'Password123!');
    await login.submit();
    await expect(shell.username('beatriz')).toBeVisible();
    await expect(lists.empty).toBeVisible();
    await expect(lists.link('Lista de Ana')).toHaveCount(0);
    expect(mockApi.calls('GET', '/lists')).toHaveLength(2);
  });
}

test('TEST-044: documento declara idioma, charset, viewport, favicon y titulo', async ({ page }) => {
  await new LoginPage(page).goto();
  const document = new DocumentPage(page);
  await expect(page).toHaveTitle('EntreRegalos');
  await expect(document.html).toHaveAttribute('lang', 'es');
  await expect(document.charset).toHaveAttribute('charset', /utf-8/i);
  await expect(document.viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
  await expect(document.favicon).toHaveAttribute('href', '/favicon.svg');
});

test('TEST-045: acceso por invitacion presentado como no abierto al registro', async ({ page, mockApi }) => {
  const register = new RegisterPage(page);
  await register.goto();
  await expect(register.productHeading).toBeVisible();
  await expect(register.invitationRequired).toBeVisible();
  await expect(register.submitButton).toBeDisabled();
  expect(mockApi.requests).toHaveLength(0);
});
