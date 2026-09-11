import { test, expect, username, password } from '../fixtures';

test('TEST-017 refresh sin body usa la cookie del login y devuelve un token utilizable', async ({ account, request }) => {
  const login = await request.post('/api/v1/auth/login', {
    data: { username: account.username, password: account.password },
  });
  expect(login.status()).toBe(200);
  expect((await request.storageState()).cookies).toEqual(expect.arrayContaining([
    expect.objectContaining({ name: 'refreshToken', value: expect.stringMatching(/\S+/), httpOnly: true }),
  ]));

  const refresh = await request.post('/api/v1/auth/refresh');
  expect(refresh.status()).toBe(200);
  const tokens = await refresh.json();
  expect(tokens).toEqual({ accessToken: expect.stringMatching(/\S+/) });

  const me = await request.get('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  expect(me.status()).toBe(200);
  expect(await me.json()).toMatchObject({ id: account.id, username: account.username, role: 'USER' });
});

test('TEST-028 listas publicas globales excluyen privadas y propias', async ({ account, createAccount }) => {
  const other = await createAccount();
  const created: { id: string; name: string; visibility: string; ownerId: string }[] = [];
  try {
    for (const owner of [account, other]) {
      for (const visibility of ['PRIVATE', 'PUBLIC']) {
        const data = { name: `TEST-028-${username()}-${visibility}`, visibility };
        const response = await owner.api.post('/api/v1/lists', { data });
        expect(response.status()).toBe(201);
        const list = await response.json();
        created.push({ id: list.id, ...data, ownerId: owner.id });
      }
    }

    const response = await account.api.get('/api/v1/lists/public');
    expect(response.status()).toBe(200);
    const lists = await response.json();
    expect(Array.isArray(lists)).toBe(true);
    expect(lists).toEqual(expect.arrayContaining([
      expect.objectContaining({
        ...created.find((list) => list.ownerId === other.id && list.visibility === 'PUBLIC'),
        owner: { id: other.id, username: other.username },
        _count: { items: 0 },
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    ]));
    for (const list of lists) {
      expect(list.visibility).toBe('PUBLIC');
      expect(list.ownerId).not.toBe(account.id);
    }
    for (const excluded of created.filter((list) => list.ownerId === account.id || list.visibility === 'PRIVATE')) {
      expect(lists).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: excluded.id })]));
    }
  } finally {
    await Promise.all(created.map((list) =>
      (list.ownerId === account.id ? account.api : other.api).delete(`/api/v1/lists/${list.id}`)));
  }
});

test('TEST-029 listas por usuario contienen solo sus publicas y su identidad', async ({ account, createAccount }) => {
  const other = await createAccount();
  const created: { id: string; name: string; visibility: string; ownerId: string }[] = [];
  try {
    for (const owner of [account, other]) {
      for (const visibility of ['PRIVATE', 'PUBLIC']) {
        const data = { name: `TEST-029-${username()}-${visibility}`, visibility };
        const response = await owner.api.post('/api/v1/lists', { data });
        expect(response.status()).toBe(201);
        const list = await response.json();
        created.push({ id: list.id, ...data, ownerId: owner.id });
      }
    }

    for (const owner of [account, other]) {
      const response = await account.api.get(`/api/v1/lists/user/${owner.id}`);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual([
        expect.objectContaining({
          ...created.find((list) => list.ownerId === owner.id && list.visibility === 'PUBLIC'),
          owner: { id: owner.id, username: owner.username },
          _count: { items: 0 },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]);
    }
  } finally {
    await Promise.all(created.map((list) =>
      (list.ownerId === account.id ? account.api : other.api).delete(`/api/v1/lists/${list.id}`)));
  }
});

for (const [variant, changes] of [
  ['nombre', { name: 'Nombre actualizado' }],
  ['visibilidad', { visibility: 'PUBLIC' }],
  ['nombre y visibilidad', { name: 'Nombre actualizado', visibility: 'PUBLIC' }],
] as const) {
  test(`TEST-030 PATCH lista: ${variant}, conserva campos omitidos y persiste`, async ({ account }) => {
    const response = await account.api.post('/api/v1/lists', {
      data: { name: `TEST-030-${username()}`, visibility: 'PRIVATE' },
    });
    expect(response.status()).toBe(201);
    const original = await response.json();
    try {
      const patch = await account.api.patch(`/api/v1/lists/${original.id}`, { data: changes });
      expect(patch.status()).toBe(200);
      const expected = { ...original, ...changes, updatedAt: expect.any(String) };
      expect(await patch.json()).toEqual(expected);

      const get = await account.api.get(`/api/v1/lists/${original.id}`);
      expect(get.status()).toBe(200);
      expect(await get.json()).toMatchObject({ ...expected, items: [] });
    } finally {
      await account.api.delete(`/api/v1/lists/${original.id}`);
    }
  });
}

for (const [variant, changes] of [
  ['nombre', { name: 'Articulo actualizado' }],
  ['descripcion', { description: 'Descripcion actualizada' }],
  ['nombre y descripcion', { name: 'Articulo actualizado', description: 'Descripcion actualizada' }],
] as const) {
  test(`TEST-030 PATCH articulo: ${variant}, conserva campos omitidos y persiste`, async ({ account }) => {
    const response = await account.api.post('/api/v1/lists', {
      data: { name: `TEST-030-${username()}`, visibility: 'PRIVATE' },
    });
    expect(response.status()).toBe(201);
    const list = await response.json();
    try {
      const item = await account.api.post(`/api/v1/lists/${list.id}/items`, {
        data: { name: 'Articulo original', description: 'Descripcion original' },
      });
      expect(item.status()).toBe(201);
      const original = await item.json();

      const patch = await account.api.patch(`/api/v1/lists/${list.id}/items/${original.id}`, { data: changes });
      expect(patch.status()).toBe(200);
      const expected = { ...original, ...changes, updatedAt: expect.any(String) };
      expect(await patch.json()).toEqual(expected);

      const get = await account.api.get(`/api/v1/lists/${list.id}`);
      expect(get.status()).toBe(200);
      expect(await get.json()).toMatchObject({ ...list, items: [expected] });
    } finally {
      await account.api.delete(`/api/v1/lists/${list.id}`);
    }
  });
}

test('TEST-039 valida una invitacion real sin consumirla y rechaza su reutilizacion', async ({ admin, request }) => {
  const credentials = { username: username(), password };
  const response = await admin.api.post('/api/v1/invitations', { data: { reference: credentials.username } });
  expect(response.status()).toBe(201);
  const invitation = await response.json();
  expect(invitation.token).toEqual(expect.stringMatching(/\S+/));
  expect(new URL(invitation.invitationUrl).searchParams.get('token')).toBe(invitation.token);

  for (let attempt = 0; attempt < 2; attempt++) {
    const validation = await request.get('/api/v1/invitations/validate', { params: { token: invitation.token } });
    expect(validation.status()).toBe(200);
    expect(await validation.json()).toEqual({ valid: true });
  }

  const registration = await request.post('/api/v1/auth/register', {
    data: { ...credentials, invitationToken: invitation.token },
  });
  expect(registration.status()).toBe(201);
  expect(await registration.json()).toEqual({ accessToken: expect.stringMatching(/\S+/) });

  const validation = await request.get('/api/v1/invitations/validate', { params: { token: invitation.token } });
  expect(validation.status()).toBe(410);
  expect(await validation.json()).toMatchObject({ statusCode: 410 });
  const replay = await request.post('/api/v1/auth/register', {
    data: { username: username(), password, invitationToken: invitation.token },
  });
  expect(replay.status()).toBe(410);
  expect(await replay.json()).toMatchObject({ statusCode: 410 });
});
