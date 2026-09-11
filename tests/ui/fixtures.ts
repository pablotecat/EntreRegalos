import { test as base, expect, type Page, type Request } from '@playwright/test';

export const uiUser = { id: 'user-1', username: 'ana', role: 'USER', isActive: true };
type Reply = { json: unknown; status: number; ready?: Promise<void> };

class MockApi {
  readonly requests: Request[] = [];
  readonly replies = new Map<string, Reply>();
  readonly releases: Array<() => void> = [];
  constructor(readonly page: Page) {}

  calls(method: string, path: string) {
    return this.requests.filter((request) => {
      const url = new URL(request.url());
      return request.method() === method && `${url.pathname}${url.search}` === `/api/v1${path}`;
    });
  }
  respond(method: string, path: string, json: unknown, status = 200) {
    this.replies.set(`${method} /api/v1${path}`, { json, status });
  }
  hold(method: string, path: string, json: unknown, status = 200) {
    let release!: () => void;
    const ready = new Promise<void>((resolve) => { release = resolve; });
    this.releases.push(release);
    this.replies.set(`${method} /api/v1${path}`, { json, status, ready });
    return release;
  }
  async session(user = uiUser) {
    this.respond('GET', '/auth/me', user);
    await this.page.goto('/login');
    // UI-only session, written once so navigation cannot resurrect it after logout.
    await this.page.evaluate(() => localStorage.setItem('accessToken', 'ui-access-token'));
  }
}

export const test = base.extend<{ mockApi: MockApi }>({
  mockApi: [async ({ page, context, baseURL }, use) => {
    const mock = new MockApi(page);
    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));
    await context.route('**/api/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      mock.requests.push(request);
      const key = `${request.method()} ${url.pathname}${url.search}`;
      const reply = mock.replies.get(key);
      if (!reply || url.origin !== new URL(baseURL!).origin) {
        failures.push(`Unexpected UI request: ${request.method()} ${request.url()}`);
        await route.abort();
        return;
      }
      await reply.ready;
      await route.fulfill(reply.status === 204
        ? { status: 204, body: '' }
        : { status: reply.status, json: reply.json });
    });
    try {
      await use(mock);
    } finally {
      mock.releases.forEach((release) => release());
      await context.unrouteAll({ behavior: 'wait' });
      expect(failures, 'UI mocks reject unexpected methods, paths and origins').toEqual([]);
    }
  }, { auto: true }],
});
export { expect };
