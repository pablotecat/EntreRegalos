import { test, expect, uiUser } from './fixtures';
import { LoginPage, RegisterPage, ResetPasswordPage } from '../pages/auth.page';
import { ShellPage } from '../pages/shell.page';

const password = 'Password123!';
const invitationToken = 'ui-invitation-token';
const resetToken = 'ui-reset-token';
const validationPath = `/auth/reset-password/validate?token=${resetToken}`;
const errorVariants = [
  { variant: 'string', message: 'Solicitud rechazada.' },
  { variant: 'array', message: ['Solicitud rechazada.', 'Este segundo mensaje no debe mostrarse.'] },
];

for (const flow of [
  { name: 'login', id: 'TEST-008', errorId: 'TEST-009', path: '/auth/login' },
  { name: 'registro', id: 'TEST-011', errorId: 'TEST-012', path: '/auth/register' },
]) {
  test(`${flow.id}: ${flow.name} bloquea cada campo ausente y crea una sesion con datos validos`, async ({ page, mockApi }) => {
    const auth = flow.name === 'login' ? new LoginPage(page) : new RegisterPage(page);
    const shell = new ShellPage(page);
    const accessToken = `ui-${flow.name}-access-token`;
    mockApi.respond('POST', flow.path, { accessToken });
    mockApi.respond('GET', '/auth/me', uiUser);
    mockApi.respond('GET', '/lists', []);
    if (auth instanceof RegisterPage) await auth.goto(invitationToken);
    else await auth.goto();
    await expect(auth.productHeading).toBeVisible();
    await expect(auth.pageHeading).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBeNull();

    for (const missing of ['ambos', 'usuario', 'password']) {
      await auth.fillCredentials(missing === 'password' ? uiUser.username : '', missing === 'usuario' ? password : '');
      await auth.submit();
      const invalidInput = missing === 'password' ? auth.passwordInput : auth.usernameInput;
      // Focus confirms the attempted submit completed through native validation.
      await expect(invalidInput).toBeFocused();
      expect(await invalidInput.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
      expect(mockApi.requests).toHaveLength(0);
    }

    await auth.fillCredentials(uiUser.username, password);
    await auth.submit();
    await expect(page).toHaveURL('/listas');
    await expect(shell.username(uiUser.username)).toBeVisible();
    expect(mockApi.calls('POST', flow.path)).toHaveLength(1);
    expect(mockApi.calls('POST', flow.path)[0].postDataJSON()).toEqual({
      username: uiUser.username,
      password,
      ...(flow.name === 'registro' ? { invitationToken } : {}),
    });
    expect(mockApi.calls('GET', '/auth/me').length).toBeGreaterThan(0);
    for (const request of mockApi.calls('GET', '/auth/me')) {
      expect(request.headers().authorization).toBe(`Bearer ${accessToken}`);
    }
    expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBe(accessToken);

    const meCalls = mockApi.calls('GET', '/auth/me').length;
    await page.reload();
    await expect(shell.username(uiUser.username)).toBeVisible();
    await expect(page).toHaveURL('/listas');
    expect(mockApi.calls('GET', '/auth/me').length).toBeGreaterThan(meCalls);
    expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBe(accessToken);
    expect(mockApi.calls('POST', flow.path)).toHaveLength(1);
  });

  for (const { variant, message } of errorVariants) {
    test(`${flow.errorId}: ${flow.name} muestra solo el primer mensaje remoto (${variant})`, async ({ page, mockApi }) => {
      const auth = flow.name === 'login' ? new LoginPage(page) : new RegisterPage(page);
      mockApi.respond('POST', flow.path, { message, statusCode: 400 }, 400);
      if (auth instanceof RegisterPage) await auth.goto(invitationToken);
      else await auth.goto();
      await auth.fillCredentials(uiUser.username, password);
      await auth.submit();
      await expect(auth.error('Solicitud rechazada.')).toBeVisible();
      await expect(auth.error('Este segundo mensaje no debe mostrarse.')).toHaveCount(0);
      await expect(auth.submitButton).toBeEnabled();
      await expect(page).toHaveURL(flow.name === 'login' ? '/login' : `/register?token=${invitationToken}`);
      expect(mockApi.calls('POST', flow.path)).toHaveLength(1);
      expect(mockApi.calls('POST', flow.path)[0].postDataJSON()).toEqual({
        username: uiUser.username,
        password,
        ...(flow.name === 'registro' ? { invitationToken } : {}),
      });
      expect(mockApi.calls('GET', '/auth/me')).toHaveLength(0);
      expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBeNull();
    });
  }
}

test('TEST-010: registro sin invitacion avisa y bloquea el envio sin API', async ({ page, mockApi }) => {
  const register = new RegisterPage(page);
  await register.goto();
  await expect(register.invitationRequired).toBeVisible();
  await expect(register.submitButton).toBeDisabled();
  await register.fillCredentials(uiUser.username, password);
  await register.passwordInput.press('Enter');
  await expect(register.passwordInput).toBeFocused();
  await expect(register.submitButton).toBeDisabled();
  await expect(register.invitationRequired).toBeVisible();
  await expect(page).toHaveURL('/register');
  expect(mockApi.requests).toHaveLength(0);
  await register.loginLink.click();
  await expect(new LoginPage(page).pageHeading).toBeVisible();
  expect(mockApi.requests).toHaveLength(0);
});

test('TEST-013: reset sin token no consulta ni muestra formulario y permite volver a login', async ({ page, mockApi }) => {
  const reset = new ResetPasswordPage(page);
  await reset.goto();
  await expect(reset.missingTokenMessage).toBeVisible();
  await expect(reset.passwordInput).toHaveCount(0);
  await expect(reset.confirmationInput).toHaveCount(0);
  await expect(reset.submitButton).toHaveCount(0);
  await expect(reset.backToLoginLink).toHaveAttribute('href', '/login');
  expect(mockApi.requests).toHaveLength(0);
  await reset.backToLoginLink.click();
  await expect(page).toHaveURL('/login');
  await expect(new LoginPage(page).pageHeading).toBeVisible();
  expect(mockApi.requests).toHaveLength(0);
});

for (const valid of [false, true]) {
  test(`TEST-013: reset pendiente termina en enlace ${valid ? 'valido con usuario' : 'invalido con retorno a login'}`, async ({ page, mockApi }) => {
    const reset = new ResetPasswordPage(page);
    const release = mockApi.hold('GET', validationPath,
      valid ? { valid: true, username: uiUser.username } : { message: 'Token expirado', statusCode: 410 },
      valid ? 200 : 410);
    await reset.goto(resetToken);
    await expect(reset.verifyingMessage).toBeVisible();
    await expect(reset.passwordInput).toHaveCount(0);
    await expect(reset.confirmationInput).toHaveCount(0);
    await expect(reset.submitButton).toHaveCount(0);
    await expect.poll(() => mockApi.calls('GET', validationPath).length).toBe(1);
    expect(mockApi.calls('GET', validationPath)[0].postData()).toBeNull();
    release();
    await expect(reset.verifyingMessage).toHaveCount(0);
    if (valid) {
      await expect(reset.username(uiUser.username)).toBeVisible();
      await expect(reset.passwordInput).toBeVisible();
      await expect(reset.confirmationInput).toBeVisible();
      await expect(reset.submitButton).toBeEnabled();
      await expect(reset.invalidTokenMessage).toHaveCount(0);
    } else {
      await expect(reset.invalidTokenMessage).toBeVisible();
      await expect(reset.passwordInput).toHaveCount(0);
      await expect(reset.confirmationInput).toHaveCount(0);
      await expect(reset.submitButton).toHaveCount(0);
      await expect(reset.backToLoginLink).toHaveAttribute('href', '/login');
      await reset.backToLoginLink.click();
      await expect(page).toHaveURL('/login');
      await expect(new LoginPage(page).pageHeading).toBeVisible();
    }
    expect(mockApi.calls('GET', validationPath)).toHaveLength(1);
    expect(mockApi.calls('POST', '/auth/reset-password')).toHaveLength(0);
  });
}

for (const field of ['passwordInput', 'confirmationInput'] as const) {
  test(`TEST-014: rechaza siete caracteres y mismatch; editar ${field} limpia cada error sin API`, async ({ page, mockApi }) => {
    const reset = new ResetPasswordPage(page);
    mockApi.respond('GET', validationPath, { valid: true, username: uiUser.username });
    await reset.goto(resetToken);
    await expect(reset.username(uiUser.username)).toBeVisible();
    const requestsBefore = mockApi.requests.slice();
    for (const invalid of [
      { password: 'Abc123!', confirmation: 'Abc123!', error: 'La contrase\u00f1a debe tener al menos 8 caracteres.' },
      { password: 'Abcd123!', confirmation: 'Abcd124!', error: 'Las contrase\u00f1as no coinciden.' },
    ]) {
      await reset.fillPasswords(invalid.password, invalid.confirmation);
      await reset.submit();
      await expect(reset.error(invalid.error)).toBeVisible();
      expect(mockApi.requests).toEqual(requestsBefore);
      await reset[field].fill('Edited123!');
      await expect(reset[field]).toHaveValue('Edited123!');
      await expect(reset.error(invalid.error)).toHaveCount(0);
      expect(mockApi.requests).toEqual(requestsBefore);
    }
    await expect(page).toHaveURL(`/reset-password?token=${resetToken}`);
    expect(mockApi.calls('POST', '/auth/reset-password')).toHaveLength(0);
  });
}

test('TEST-015: acepta exactamente ocho caracteres, envia token y password y vuelve a login con 204', async ({ page, mockApi }) => {
  const reset = new ResetPasswordPage(page);
  mockApi.respond('GET', validationPath, { valid: true, username: uiUser.username });
  mockApi.respond('POST', '/auth/reset-password', undefined, 204);
  await reset.goto(resetToken);
  await expect(reset.username(uiUser.username)).toBeVisible();
  await reset.fillPasswords('Abcd123!', 'Abcd123!');
  const response = page.waitForResponse((res) =>
    new URL(res.url()).pathname === '/api/v1/auth/reset-password' && res.request().method() === 'POST');
  await reset.submit();
  const completed = await response;
  expect(completed.status()).toBe(204);
  await expect(page).toHaveURL('/login');
  await expect(new LoginPage(page).pageHeading).toBeVisible();
  expect(mockApi.calls('POST', '/auth/reset-password')).toHaveLength(1);
  expect(mockApi.calls('POST', '/auth/reset-password')[0].postDataJSON()).toEqual({ token: resetToken, password: 'Abcd123!' });
});

for (const { variant, message } of errorVariants) {
  test(`TEST-016: reset muestra solo el primer mensaje remoto (${variant})`, async ({ page, mockApi }) => {
    const reset = new ResetPasswordPage(page);
    mockApi.respond('GET', validationPath, { valid: true, username: uiUser.username });
    mockApi.respond('POST', '/auth/reset-password', { message, statusCode: 400 }, 400);
    await reset.goto(resetToken);
    await reset.fillPasswords(password, password);
    await reset.submit();
    await expect(reset.error('Solicitud rechazada.')).toBeVisible();
    await expect(reset.error('Este segundo mensaje no debe mostrarse.')).toHaveCount(0);
    await expect(reset.submitButton).toBeEnabled();
    await expect(page).toHaveURL(`/reset-password?token=${resetToken}`);
    expect(mockApi.calls('POST', '/auth/reset-password')).toHaveLength(1);
    expect(mockApi.calls('POST', '/auth/reset-password')[0].postDataJSON()).toEqual({ token: resetToken, password });
  });
}
