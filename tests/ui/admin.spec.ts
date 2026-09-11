import { test, expect, uiUser } from './fixtures';
import { AdminPage } from '../pages/admin.page';

const admin = { ...uiUser, id: 'admin-033', username: 'admin_033', role: 'ADMIN' as const, isActive: true };
const activeUser = { ...uiUser, id: 'user-active', username: 'active_user', isActive: true };
const inactiveUser = { ...uiUser, id: 'user-inactive', username: 'inactive_user', isActive: false };
const users = [admin, activeUser, inactiveUser];
const invitation = {
  id: 'invitation-033', token: 'invitation-token-033', reference: 'Para Ana', used: false,
  createdAt: '2026-09-01T12:00:00Z', expiresAt: '2026-09-20T12:00:00Z',
  invitationUrl: 'https://entreregalos.test/register?token=invitation-token-033',
};
const reset = {
  id: 'reset-033', token: 'reset-token-033', used: false,
  createdAt: '2026-09-01T12:00:00Z', expiresAt: '2026-09-21T12:00:00Z',
  userId: activeUser.id, user: { id: activeUser.id, username: activeUser.username },
  resetUrl: 'https://entreregalos.test/reset-password?token=reset-token-033',
};

test.describe('Administracion UI: TEST-033 a TEST-038', () => {
  test.use({ timezoneId: 'Europe/Madrid' });

  test.beforeEach(async ({ page, context, mockApi }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.clock.setFixedTime(new Date('2026-09-08T12:00:00Z'));
    mockApi.respond('GET', '/users', users);
    mockApi.respond('GET', '/invitations', []);
    mockApi.respond('GET', '/users/password-reset-tokens', []);
    await mockApi.session(admin);
  });

  test('TEST-033: carga las tres fuentes GET y muestra sus colecciones', async ({ page, mockApi }) => {
    mockApi.respond('GET', '/invitations', [invitation]);
    mockApi.respond('GET', '/users/password-reset-tokens', [reset]);
    const adminPage = new AdminPage(page);
    await adminPage.goto();

    await expect(adminPage.heading).toBeVisible();
    for (const path of ['/users', '/invitations', '/users/password-reset-tokens']) {
      await expect.poll(() => mockApi.calls('GET', path).length).toBe(1);
    }
    await expect(adminPage.users.getByRole('row')).toHaveCount(4);
    for (const user of users) {
      const row = adminPage.userRow(user.username);
      await expect(row.getByRole('cell', { name: user.role, exact: true })).toBeVisible();
      await expect(row.getByRole('cell', { name: user.isActive ? 'Activo' : 'Inactivo', exact: true })).toBeVisible();
    }
    await expect(adminPage.invitations.getByRole('row')).toHaveCount(2);
    await expect(adminPage.invitationRow(invitation.reference)).toContainText('Activa');
    await expect(adminPage.resets.getByRole('row')).toHaveCount(2);
    await expect(adminPage.resetRow(activeUser.username)).toContainText('21/9/2026');
  });

  for (const reference of ['', '  Para Ana  ']) {
    test(`TEST-034: crea y copia invitacion con referencia ${reference ? 'textual exacta' : 'vacia'}`, async ({ page, mockApi }) => {
      const created = {
        ...invitation, reference: reference || undefined,
        invitationUrl: `https://entreregalos.test/register?token=created-${reference ? 'text' : 'blank'}`,
      };
      const release = mockApi.hold('POST', '/invitations', created, 201);
      const adminPage = new AdminPage(page);
      await adminPage.goto();
      await expect.poll(() => mockApi.calls('GET', '/invitations').length).toBe(1);
      await expect(adminPage.invitations.getByRole('row')).toHaveCount(1);
      await adminPage.generateInvitation(reference);
      await expect.poll(() => mockApi.calls('POST', '/invitations').length).toBe(1);
      await expect(adminPage.generatedInvitationUrl(created.invitationUrl)).toHaveCount(0);
      await expect(adminPage.referenceInput).toHaveValue(reference);
      expect(mockApi.calls('GET', '/invitations')).toHaveLength(1);
      mockApi.respond('GET', '/invitations', [created]);
      release();
      // JSON omits undefined; nonempty text is sent verbatim, not trimmed.
      expect(mockApi.calls('POST', '/invitations')[0].postDataJSON()).toEqual(reference ? { reference } : {});
      await expect(adminPage.generatedInvitationUrl(created.invitationUrl)).toBeVisible();
      await expect(adminPage.referenceInput).toBeEmpty();
      await expect.poll(() => mockApi.calls('GET', '/invitations').length).toBe(2);
      await expect(adminPage.invitationRow(reference || '\u2014')).toContainText('Activa');
      await adminPage.copyGeneratedInvitationButton.click();
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(created.invitationUrl);
    });
  }

  test('TEST-035: estados, prioridad usada, fechas es-ES y copia solo activa con URL', async ({ page, mockApi }) => {
    const invitations = [
      { ...invitation, id: 'used', reference: 'Usada y vencida', used: true, expiresAt: '2026-09-01T12:00:00Z' },
      { ...invitation, id: 'expired', reference: 'Vencida', expiresAt: '2026-09-02T12:00:00Z' },
      { ...invitation, id: 'active', reference: 'Vigente' },
      { ...invitation, id: 'no-url', reference: 'Vigente sin URL', invitationUrl: undefined },
    ];
    mockApi.respond('GET', '/invitations', invitations);
    const adminPage = new AdminPage(page);
    await adminPage.goto();

    for (const [reference, state, date] of [
      ['Usada y vencida', 'Usada', '1/9/2026'],
      ['Vencida', 'Expirada', '2/9/2026'],
      ['Vigente', 'Activa', '20/9/2026'],
      ['Vigente sin URL', 'Activa', '20/9/2026'],
    ]) {
      const row = adminPage.invitationRow(reference);
      await expect(row.getByRole('cell', { name: state, exact: true })).toBeVisible();
      await expect(row.getByRole('cell', { name: date, exact: true })).toBeVisible();
      if (reference !== 'Vigente') await expect(adminPage.copyInvitationButton(reference)).toHaveCount(0);
    }
    await expect(adminPage.invitations.getByRole('button', { name: 'Copiar enlace', exact: true })).toHaveCount(1);
    await adminPage.copyInvitationButton('Vigente').click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(invitation.invitationUrl);
  });

  test('TEST-036: identifica usuario y fecha y copia historial y reset recien generado', async ({ page, mockApi }) => {
    const otherReset = {
      ...reset, id: 'reset-other', token: 'reset-other-token',
      userId: inactiveUser.id, user: { id: inactiveUser.id, username: inactiveUser.username },
      expiresAt: '2026-09-22T12:00:00Z',
      resetUrl: 'https://entreregalos.test/reset-password?token=reset-other-token',
    };
    const generated = {
      ...reset, id: 'reset-new', token: 'reset-new-token', expiresAt: '2026-09-23T12:00:00Z',
      resetUrl: 'https://entreregalos.test/reset-password?token=reset-new-token',
    };
    mockApi.respond('GET', '/users/password-reset-tokens', [reset, otherReset]);
    mockApi.respond('POST', `/users/${activeUser.id}/reset-password`, {
      token: generated.token, resetUrl: generated.resetUrl,
    }, 201);
    const adminPage = new AdminPage(page);
    await adminPage.goto();

    await expect(adminPage.resetRow(activeUser.username).getByRole('cell', { name: '21/9/2026', exact: true })).toBeVisible();
    await expect(adminPage.resetRow(inactiveUser.username).getByRole('cell', { name: '22/9/2026', exact: true })).toBeVisible();
    await adminPage.copyResetButton(inactiveUser.username).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(otherReset.resetUrl);
    await adminPage.copyResetButton(activeUser.username).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(reset.resetUrl);

    const reads = mockApi.calls('GET', '/users/password-reset-tokens').length;
    mockApi.respond('GET', '/users/password-reset-tokens', [generated, otherReset]);
    await adminPage.generateReset(activeUser.username);
    await expect(adminPage.generatedResetUrl(generated.resetUrl)).toBeVisible();
    await expect.poll(() => mockApi.calls('GET', '/users/password-reset-tokens').length).toBe(reads + 1);
    await expect(adminPage.resetRow(activeUser.username).getByRole('cell', { name: '23/9/2026', exact: true })).toBeVisible();
    await adminPage.copyGeneratedResetButton.click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(generated.resetUrl);
    await adminPage.copyResetButton(inactiveUser.username).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(otherReset.resetUrl);
  });

  test('TEST-037: protege cuenta propia y actualiza estado mediante PATCH y refetch', async ({ page, mockApi }) => {
    const deactivated = { ...activeUser, isActive: false };
    const activated = { ...inactiveUser, isActive: true };
    const releaseDeactivate = mockApi.hold('PATCH', `/users/${activeUser.id}/deactivate`, deactivated);
    const releaseActivate = mockApi.hold('PATCH', `/users/${inactiveUser.id}/activate`, activated);
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await expect(adminPage.userRow(admin.username)).toBeVisible();
    await expect(adminPage.activateButton(admin.username)).toHaveCount(0);
    await expect(adminPage.deactivateButton(admin.username)).toHaveCount(0);
    await expect(adminPage.resetButton(admin.username)).toBeEnabled();
    await expect(adminPage.deactivateButton(activeUser.username)).toBeVisible();
    await expect(adminPage.activateButton(activeUser.username)).toHaveCount(0);
    await expect(adminPage.activateButton(inactiveUser.username)).toBeVisible();
    await expect(adminPage.deactivateButton(inactiveUser.username)).toHaveCount(0);

    await adminPage.deactivateButton(activeUser.username).click();
    await expect.poll(() => mockApi.calls('PATCH', `/users/${activeUser.id}/deactivate`).length).toBe(1);
    await expect(adminPage.userRow(activeUser.username).getByRole('cell', { name: 'Activo', exact: true })).toBeVisible();
    expect(mockApi.calls('GET', '/users')).toHaveLength(1);
    mockApi.respond('GET', '/users', [admin, deactivated, inactiveUser]);
    releaseDeactivate();
    expect(mockApi.calls('PATCH', `/users/${activeUser.id}/deactivate`)[0].postData()).toBeNull();
    await expect.poll(() => mockApi.calls('GET', '/users').length).toBe(2);
    await expect(adminPage.userRow(activeUser.username).getByRole('cell', { name: 'Inactivo', exact: true })).toBeVisible();
    await expect(adminPage.activateButton(activeUser.username)).toBeVisible();
    await expect(adminPage.deactivateButton(activeUser.username)).toHaveCount(0);

    await adminPage.activateButton(inactiveUser.username).click();
    await expect.poll(() => mockApi.calls('PATCH', `/users/${inactiveUser.id}/activate`).length).toBe(1);
    await expect(adminPage.userRow(inactiveUser.username).getByRole('cell', { name: 'Inactivo', exact: true })).toBeVisible();
    expect(mockApi.calls('GET', '/users')).toHaveLength(2);
    mockApi.respond('GET', '/users', [admin, deactivated, activated]);
    releaseActivate();
    expect(mockApi.calls('PATCH', `/users/${inactiveUser.id}/activate`)[0].postData()).toBeNull();
    await expect.poll(() => mockApi.calls('GET', '/users').length).toBe(3);
    await expect(adminPage.userRow(inactiveUser.username).getByRole('cell', { name: 'Activo', exact: true })).toBeVisible();
    await expect(adminPage.deactivateButton(inactiveUser.username)).toBeVisible();
    await expect(adminPage.activateButton(inactiveUser.username)).toHaveCount(0);
    await expect(adminPage.activateButton(admin.username)).toHaveCount(0);
    await expect(adminPage.deactivateButton(admin.username)).toHaveCount(0);
  });

  test('TEST-038: pendiente bloquea todos los resets y Generando solo identifica al objetivo', async ({ page, mockApi }) => {
    const pending = mockApi.hold('POST', `/users/${activeUser.id}/reset-password`, {
      token: reset.token, resetUrl: reset.resetUrl,
    }, 201);
    const adminPage = new AdminPage(page);
    await adminPage.goto();
    await expect.poll(() => mockApi.calls('GET', '/users/password-reset-tokens').length).toBe(1);
    await expect(adminPage.resets.getByRole('row')).toHaveCount(1);
    await expect(adminPage.resetButtons).toHaveCount(3);
    for (const user of users) await expect(adminPage.resetButton(user.username)).toBeEnabled();
    mockApi.respond('GET', '/users/password-reset-tokens', [reset]);

    await adminPage.generateReset(activeUser.username);
    await expect.poll(() => mockApi.calls('POST', `/users/${activeUser.id}/reset-password`).length).toBe(1);
    expect(mockApi.calls('POST', `/users/${activeUser.id}/reset-password`)[0].postData()).toBeNull();
    for (const user of users) {
      await expect(adminPage.resetButton(user.username)).toBeDisabled();
      await expect(adminPage.resetButton(user.username)).toHaveText(
        user.id === activeUser.id ? 'Generando...' : 'Resetear contrase\u00f1a',
      );
    }
    await expect(adminPage.users.getByRole('button', { name: 'Generando...', exact: true })).toHaveCount(1);
    await expect(adminPage.generatedResetUrl(reset.resetUrl)).toHaveCount(0);
    expect(mockApi.calls('GET', '/users/password-reset-tokens')).toHaveLength(1);
    expect(mockApi.calls('POST', `/users/${admin.id}/reset-password`)).toHaveLength(0);
    expect(mockApi.calls('POST', `/users/${inactiveUser.id}/reset-password`)).toHaveLength(0);

    pending();

    await expect(adminPage.generatedResetUrl(reset.resetUrl)).toBeVisible();
    await expect.poll(() => mockApi.calls('GET', '/users/password-reset-tokens').length).toBe(2);
    await expect(adminPage.resetRow(activeUser.username)).toContainText('21/9/2026');
    await expect(adminPage.resets.getByRole('row')).toHaveCount(2);
    for (const user of users) {
      await expect(adminPage.resetButton(user.username)).toBeEnabled();
      await expect(adminPage.resetButton(user.username)).toHaveText('Resetear contrase\u00f1a');
    }
    await adminPage.copyGeneratedResetButton.click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(reset.resetUrl);
  });
});
