import { test, expect, login, username, password } from '../fixtures';
import { AdminPage } from '../pages/admin.page';
import { LoginPage, RegisterPage, ResetPasswordPage } from '../pages/auth.page';
import { ListsPage } from '../pages/lists.page';
import { ShellPage } from '../pages/shell.page';

test.describe('Administración', () => {
  test.beforeEach(async ({ page, context, admin }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await login(page, admin);
  });

  test('TEST-034 / TEST-035 / TEST-011 / TEST-045: genera y copia una invitación que permite un único registro', async ({ page }) => {
    const adminPage = new AdminPage(page);
    const shell = new ShellPage(page);
    const registerPage = new RegisterPage(page);
    const listsPage = new ListsPage(page);
    await shell.adminLink.click();
    await expect(adminPage.heading).toBeVisible();
    const reference = username();
    const created = page.waitForResponse((response) =>
      new URL(response.url()).pathname === '/api/v1/invitations' && response.request().method() === 'POST',
    );
    await adminPage.generateInvitation(reference);
    const response = await created;
    expect(response.status()).toBe(201);
    const invitation = await response.json();
    expect(invitation).toMatchObject({ reference, used: false });
    await expect(adminPage.referenceInput).toBeEmpty();
    await expect(adminPage.generatedInvitationUrl(invitation.invitationUrl)).toBeVisible();

    const row = adminPage.invitationRow(reference);
    await expect(row.getByRole('cell', { name: 'Activa', exact: true })).toBeVisible();
    await adminPage.copyInvitationButton(reference).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(invitation.invitationUrl);
    const invitationUrl = new URL(await page.evaluate(() => navigator.clipboard.readText()));
    expect(invitationUrl.origin).toBe(new URL(page.url()).origin);
    expect(invitationUrl.pathname).toBe('/register');
    const token = invitationUrl.searchParams.get('token');
    expect(token).toBeTruthy();
    expect(token).toBe(invitation.token);
    const validation = await page.request.get('/api/v1/invitations/validate', { params: { token: token! } });
    expect(validation.status()).toBe(200);
    expect(await validation.json()).toEqual({ valid: true });

    await shell.logoutButton.click();
    await expect(page).toHaveURL('/login');
    await registerPage.goto(token!);
    await expect(page).toHaveURL(invitationUrl.href);
    await expect(registerPage.pageHeading).toBeVisible();
    const credentials = { username: username(), password };
    await registerPage.fillCredentials(credentials.username, credentials.password);
    await registerPage.submit();
    await expect(page).toHaveURL('/listas');
    await expect(listsPage.heading).toBeVisible();
    await expect(shell.listsLink).toBeVisible();
    await expect(shell.username(credentials.username)).toBeVisible();

    const consumed = await page.request.get('/api/v1/invitations/validate', { params: { token: token! } });
    expect(consumed.status()).toBe(410);
    // A fresh username makes this a token-reuse check, not a duplicate-user check.
    const replay = await page.request.post('/api/v1/auth/register', {
      data: { username: username(), password, invitationToken: token },
    });
    expect(replay.status()).toBe(410);
  });

  test('TEST-036 / TEST-038: genera y copia un reset, valida las contraseñas y consume el token', async ({ page, account }) => {
    const adminPage = new AdminPage(page);
    const shell = new ShellPage(page);
    const resetPage = new ResetPasswordPage(page);
    const loginPage = new LoginPage(page);
    await shell.adminLink.click();
    await expect(adminPage.heading).toBeVisible();
    const created = page.waitForResponse((response) =>
      new URL(response.url()).pathname === `/api/v1/users/${account.id}/reset-password`
        && response.request().method() === 'POST',
    );
    await adminPage.generateReset(account.username);
    const response = await created;
    expect(response.status()).toBe(201);
    const reset = await response.json();
    await expect(adminPage.generatedResetUrl(reset.resetUrl)).toBeVisible();
    await expect(adminPage.resetRow(account.username)).toBeVisible();
    await adminPage.copyGeneratedResetButton.click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(reset.resetUrl);
    const resetUrl = new URL(await page.evaluate(() => navigator.clipboard.readText()));
    expect(resetUrl.origin).toBe(new URL(page.url()).origin);
    expect(resetUrl.pathname).toBe('/reset-password');
    const token = resetUrl.searchParams.get('token');
    expect(token).toBeTruthy();
    expect(token).toBe(reset.token);
    const validation = await account.api.get('/api/v1/auth/reset-password/validate', { params: { token: token! } });
    expect(validation.status()).toBe(200);
    expect(await validation.json()).toEqual({ valid: true, username: account.username });

    await shell.logoutButton.click();
    await expect(page).toHaveURL('/login');
    await resetPage.goto(token!);
    await expect(page).toHaveURL(resetUrl.href);
    await expect(resetPage.username(account.username)).toBeVisible();
    const shortError = resetPage.error('La contraseña debe tener al menos 8 caracteres.');
    const mismatchError = resetPage.error('Las contraseñas no coinciden.');
    const replacement = `${account.password}Changed`;

    await resetPage.fillPasswords('short', 'short');
    await resetPage.submitButton.click();
    await expect(shortError).toBeVisible();
    await resetPage.passwordInput.fill(replacement);
    await expect(shortError).toHaveCount(0);
    await resetPage.submitButton.click();
    await expect(mismatchError).toBeVisible();
    await resetPage.confirmationInput.fill(replacement);
    await expect(mismatchError).toHaveCount(0);
    await resetPage.submitButton.click();
    await expect(page).toHaveURL('/login');

    await loginPage.fillCredentials(account.username, account.password);
    await loginPage.submit();
    await expect(loginPage.error('Credenciales incorrectas')).toBeVisible();
    await expect(page).toHaveURL('/login');
    await login(page, { username: account.username, password: replacement });

    const consumed = await account.api.get('/api/v1/auth/reset-password/validate', { params: { token: token! } });
    expect(consumed.status()).toBe(410);
    const replay = await account.api.post('/api/v1/auth/reset-password', {
      data: { token, password: account.password },
    });
    expect(replay.status()).toBe(410);
  });
});
