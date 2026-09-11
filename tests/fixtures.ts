import { randomUUID } from 'node:crypto';
import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import { LoginPage } from './pages/auth.page';
import { ListsPage } from './pages/lists.page';

export type Account = { id: string; username: string; password: string; api: APIRequestContext };
export const password = 'E2ePassword123!';
export const username = () => `e2e_${randomUUID().replaceAll('-', '').slice(0, 16)}`;

export async function login(page: Page, account: Pick<Account, 'username' | 'password'>) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillCredentials(account.username, account.password);
  await loginPage.submit();
  await expect(page).toHaveURL('/listas');
  await expect(new ListsPage(page).heading).toBeVisible();
}

export const test = base.extend<{
  admin: Account;
  createAccount: () => Promise<Account>;
  account: Account;
}>({
  admin: async ({ playwright, baseURL }, use) => {
    const api = await playwright.request.newContext({ baseURL });
    try {
      const credentials = { username: 'e2e_admin', password: 'E2eAdminPassword123!' };
      const response = await api.post('/api/v1/auth/login', { data: credentials });
      await expect(response).toBeOK();
      const { accessToken } = await response.json();
      const authenticated = await playwright.request.newContext({
        baseURL, extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
      });
      try {
        const me = await authenticated.get('/api/v1/auth/me');
        await expect(me).toBeOK();
        const user = await me.json();
        expect(user.role).toBe('ADMIN');
        await use({ ...credentials, id: user.id, api: authenticated });
      } finally {
        await authenticated.dispose();
      }
    } finally {
      await api.dispose();
    }
  },
  createAccount: async ({ admin, playwright, baseURL }, use) => {
    const contexts: APIRequestContext[] = [];
    try {
      await use(async () => {
        const credentials = { username: username(), password };
        const invitation = await admin.api.post('/api/v1/invitations', { data: { reference: credentials.username } });
        expect(invitation.status()).toBe(201);
        const registration = await admin.api.post('/api/v1/auth/register', {
          data: { ...credentials, invitationToken: (await invitation.json()).token },
        });
        expect(registration.status()).toBe(201);
        const { accessToken } = await registration.json();
        const api = await playwright.request.newContext({
          baseURL, extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
        });
        contexts.push(api);
        const me = await api.get('/api/v1/auth/me');
        await expect(me).toBeOK();
        const user = await me.json();
        expect(user).toMatchObject({ username: credentials.username, role: 'USER' });
        return { ...credentials, id: user.id, api };
      });
    } finally {
      await Promise.all(contexts.map((api) => api.dispose()));
    }
  },
  account: async ({ createAccount }, use) => use(await createAccount()),
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await use(page);
    expect(errors, 'Uncaught browser errors').toEqual([]);
  },
});

export { expect };
