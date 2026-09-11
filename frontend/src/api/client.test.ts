import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.resetModules();
  // Vitest 1.x stringifies undefined; register restoration before deleting the key.
  vi.stubEnv('VITE_API_URL', '');
  delete import.meta.env.VITE_API_URL;
  localStorage.removeItem('accessToken');
  fetchMock.mockReset().mockImplementation(() => Promise.resolve(new Response('{"ok":true}')));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  localStorage.removeItem('accessToken');
});

describe('API consumer Vitest - api client', () => {
  it.each([
    [undefined, '/api/v1'],
    ['https://api.example.test/api/v1', 'https://api.example.test/api/v1'],
  ])('TEST-001: usa la URL base %s y devuelve el JSON', async (url, expectedBase) => {
    if (url !== undefined) vi.stubEnv('VITE_API_URL', url);
    vi.resetModules();
    const { api } = await import('./client');

    await expect(api.get('/resource')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(`${expectedBase}/resource`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('TEST-001: lee el token actual en cada peticion y omite Authorization al quitarlo', async () => {
    localStorage.setItem('accessToken', 'old-token');
    const { api } = await import('./client');

    for (const token of ['fresh-token', 'renewed-token', null]) {
      if (token) localStorage.setItem('accessToken', token);
      else localStorage.removeItem('accessToken');

      await api.get('/resource');
      expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/resource', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    }
  });

  it('TEST-001: respeta una cabecera sobrescrita y conserva el Bearer', async () => {
    localStorage.setItem('accessToken', 'access-token');
    const { api } = await import('./client');

    await api.get('/resource', { headers: { 'Content-Type': 'text/plain' } });
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/resource', {
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain', Authorization: 'Bearer access-token' },
    });
  });

  it.each([
    ['get', undefined, undefined],
    ['post', { name: 'Nuevo' }, 'POST'],
    ['post', undefined, 'POST'],
    ['patch', { name: 'Cambio' }, 'PATCH'],
    ['patch', undefined, 'PATCH'],
    ['delete', undefined, 'DELETE'],
  ] as const)('TEST-001: %s envia body %j con el metodo correcto', async (method, body, expectedMethod) => {
    const { api } = await import('./client');

    if (method === 'get') await api.get('/resource');
    else if (method === 'post') await api.post('/resource', body);
    else if (method === 'patch') await api.patch('/resource', body);
    else await api.delete('/resource');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/resource');
    expect(options.method).toBe(expectedMethod);
    expect(options.body).toBe(JSON.stringify(body));
    expect(options.credentials).toBe('include');
  });

  it('TEST-002: rechaza explicitamente el error HTTP JSON', async () => {
    const error = { message: 'Error conocido', statusCode: 400 };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(error), { status: 400 }));
    const { api } = await import('./client');

    await expect(api.get('/resource')).rejects.toEqual(error);
  });

  it('TEST-002: usa el error de respaldo cuando la respuesta HTTP no es JSON', async () => {
    fetchMock.mockResolvedValue(new Response('bad gateway', { status: 502 }));
    const { api } = await import('./client');

    await expect(api.get('/resource')).rejects.toEqual({ message: 'Error de red', statusCode: 502 });
  });

  it('TEST-002: devuelve undefined para 204 sin intentar parsear JSON', async () => {
    const response = new Response(null, { status: 204 });
    const json = vi.spyOn(response, 'json');
    fetchMock.mockResolvedValue(response);
    const { api } = await import('./client');

    await expect(api.delete('/resource')).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it('TEST-002: propaga el fallo de transporte (cobertura adicional)', async () => {
    const error = new TypeError('Failed to fetch');
    fetchMock.mockRejectedValue(error);
    const { api } = await import('./client');

    await expect(api.get('/resource')).rejects.toBe(error);
  });
});
