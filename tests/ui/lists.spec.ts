import { test, expect, uiUser } from './fixtures';
import { ListsPage, ListDetailPage } from '../pages/lists.page';
import { FriendsPage } from '../pages/social.page';

const ownList = { id: 'list-1', name: 'Navidad', visibility: 'PRIVATE', ownerId: uiUser.id, items: [] };

test.beforeEach(async ({ mockApi }) => {
  await mockApi.session();
});

test('TEST-018: consulta pendiente y listas propias vacias', async ({ page, mockApi }) => {
  const lists = new ListsPage(page);
  const release = mockApi.hold('GET', '/lists', []);
  await lists.goto();
  await expect(lists.loading).toBeVisible();
  await expect(lists.empty).toBeHidden();
  expect(mockApi.calls('GET', '/lists')).toHaveLength(1);
  release();
  await expect(lists.empty).toBeVisible();
  await expect(lists.loading).toBeHidden();
  await expect(lists.newList).toBeVisible();
});

for (const [visibility, label] of [['PRIVATE', 'Privada'], ['PUBLIC', 'P\u00fablica']]) {
  for (const via of ['nombre', 'Ver']) {
    test(`TEST-019: tarjeta ${visibility}, cantidad y navegacion por ${via}`, async ({ page, mockApi }) => {
      const list = { ...ownList, visibility, _count: { items: 2 } };
      mockApi.respond('GET', '/lists', [list]);
      mockApi.respond('GET', `/lists/${list.id}`, { ...list, items: [
        { id: 'item-1', name: 'Libro', listId: list.id },
        { id: 'item-2', name: 'Auriculares', listId: list.id },
      ] });
      const lists = new ListsPage(page);
      await lists.goto();
      const card = lists.card(list.name);
      await expect(lists.link(list.name)).toBeVisible();
      await expect(card.getByText(label, { exact: true })).toBeVisible();
      await expect(card.getByText('2 art\u00edculos', { exact: true })).toBeVisible();
      const link = via === 'nombre' ? lists.link(list.name) : card.getByRole('link', { name: 'Ver', exact: true });
      await expect(link).toHaveAttribute('href', `/listas/${list.id}`);
      await link.click();
      await expect(page).toHaveURL(`/listas/${list.id}`);
      await expect(new ListDetailPage(page).heading).toHaveText(list.name);
      expect(mockApi.calls('GET', `/lists/${list.id}`)).toHaveLength(1);
    });
  }
}

test('TEST-019: tarjeta sin contador presenta cero articulos', async ({ page, mockApi }) => {
  mockApi.respond('GET', '/lists', [ownList]);
  const lists = new ListsPage(page);
  await lists.goto();
  await expect(lists.link(ownList.name)).toBeVisible();
  await expect(lists.card(ownList.name).getByText('0 art\u00edculos', { exact: true })).toBeVisible();
});

for (const visibility of ['PRIVATE', 'PUBLIC']) {
  test(`TEST-020: valida nombre, crea ${visibility}, limpia modal e invalida listas`, async ({ page, mockApi }) => {
    mockApi.respond('GET', '/lists', []);
    const lists = new ListsPage(page);
    await lists.goto();
    await lists.newList.click();
    await expect(lists.modal).toBeVisible();
    await expect(lists.visibility).toHaveValue('PRIVATE');
    await lists.name.fill('   ');
    await lists.create.click();
    await expect(lists.modal).toBeVisible();
    await expect(lists.name).toHaveValue('   ');
    expect(mockApi.calls('POST', '/lists')).toHaveLength(0);

    const created = { ...ownList, visibility, _count: { items: 0 } };
    const reads = mockApi.calls('GET', '/lists').length;
    const release = mockApi.hold('POST', '/lists', created, 201);
    await lists.name.fill('  Navidad  ');
    await lists.visibility.selectOption(visibility);
    await lists.create.click();
    await expect.poll(() => mockApi.calls('POST', '/lists').length).toBe(1);
    await expect(lists.modal).toBeVisible();
    await expect(lists.name).toHaveValue('  Navidad  ');
    await expect(lists.createPending).toBeDisabled();
    expect(mockApi.calls('GET', '/lists')).toHaveLength(reads);
    mockApi.respond('GET', '/lists', [created]);
    release();
    await expect(lists.modal).toBeHidden();
    await expect(lists.link('Navidad')).toBeVisible();
    await expect(lists.empty).toBeHidden();
    await expect.poll(() => mockApi.calls('GET', '/lists').length).toBeGreaterThan(reads);
    const posts = mockApi.calls('POST', '/lists');
    expect(posts).toHaveLength(1);
    expect(posts[0].method()).toBe('POST');
    expect(posts[0].postDataJSON()).toEqual({ name: 'Navidad', visibility });
    await lists.newList.click();
    await expect(lists.modal).toBeVisible();
    await expect(lists.name).toHaveValue('');
  });
}

for (const action of ['Cancelar', 'Cerrar'] as const) {
  test(`TEST-020: cierra Nueva lista mediante ${action} sin crear`, async ({ page, mockApi }) => {
    mockApi.respond('GET', '/lists', []);
    const lists = new ListsPage(page);
    await lists.goto();
    await lists.newList.click();
    await expect(lists.modal).toBeVisible();
    await (action === 'Cancelar' ? lists.cancel : lists.close).click();
    await expect(lists.modal).toBeHidden();
    expect(mockApi.calls('POST', '/lists')).toHaveLength(0);
  });
}

test('TEST-021: cancela borrado de lista A y confirma lista B con 204 y refetch', async ({ page, mockApi }) => {
  const other = { ...ownList, id: 'list-2', name: 'Cumple' };
  mockApi.respond('GET', '/lists', [ownList, other]);
  const lists = new ListsPage(page);
  await lists.goto();
  await expect(lists.link(ownList.name)).toBeVisible();
  await expect(lists.link(other.name)).toBeVisible();
  await lists.deleteList(ownList.name, false);
  await expect(lists.link(ownList.name)).toBeVisible();
  expect(mockApi.requests.filter((request) => request.method() === 'DELETE')).toHaveLength(0);

  const reads = mockApi.calls('GET', '/lists').length;
  const release = mockApi.hold('DELETE', `/lists/${other.id}`, undefined, 204);
  await lists.deleteList(other.name, true);
  await expect.poll(() => mockApi.calls('DELETE', `/lists/${other.id}`).length).toBe(1);
  await expect(lists.link(other.name)).toBeVisible();
  expect(mockApi.calls('GET', '/lists')).toHaveLength(reads);
  mockApi.respond('GET', '/lists', [ownList]);
  release();
  await expect(lists.link(other.name)).toHaveCount(0);
  await expect(lists.link(ownList.name)).toBeVisible();
  await expect.poll(() => mockApi.calls('GET', '/lists').length).toBeGreaterThan(reads);
  const deletes = mockApi.calls('DELETE', `/lists/${other.id}`);
  expect(deletes).toHaveLength(1);
  expect(deletes[0].method()).toBe('DELETE');
  expect(deletes[0].postData()).toBeNull();
  expect(mockApi.calls('DELETE', `/lists/${ownList.id}`)).toHaveLength(0);
});

test('TEST-022: detalle pendiente y lista ausente tras 404', async ({ page, mockApi }) => {
  const release = mockApi.hold('GET', '/lists/missing', { statusCode: 404, message: 'Lista no encontrada' }, 404);
  const detail = new ListDetailPage(page);
  await detail.goto('missing');
  await expect.poll(() => mockApi.calls('GET', '/lists/missing').length).toBe(1);
  await expect(detail.loading).toBeVisible();
  await expect(detail.notFound).toBeHidden();
  release();
  await expect(detail.notFound).toBeVisible();
  await expect(detail.loading).toBeHidden();
  await expect(detail.addItem).toHaveCount(0);
});

for (const owner of [true, false]) {
  test(`TEST-023: activa retorno del ${owner ? 'propietario' : 'visitante'}`, async ({ page, mockApi }) => {
    mockApi.respond('GET', `/lists/${ownList.id}`, { ...ownList, visibility: 'PUBLIC', ownerId: owner ? uiUser.id : 'friend-1' });
    mockApi.respond('GET', owner ? '/lists' : '/users', []);
    const detail = new ListDetailPage(page);
    await detail.goto(ownList.id);
    await expect(detail.heading).toHaveText(ownList.name);
    const back = owner ? detail.backToLists : detail.backToFriends;
    await expect(back).toHaveAttribute('href', owner ? '/listas' : '/amigos');
    await back.click();
    await expect(page).toHaveURL(owner ? '/listas' : '/amigos');
    await expect(owner ? new ListsPage(page).heading : new FriendsPage(page).heading).toBeVisible();
  });
}

for (const description of ['  Azules  ', '', '   ']) {
  test(`TEST-024: cancela, rechaza nombre vacio y crea con descripcion ${JSON.stringify(description)}`, async ({ page, mockApi }) => {
    const path = `/lists/${ownList.id}`;
    mockApi.respond('GET', path, ownList);
    const detail = new ListDetailPage(page);
    await detail.goto(ownList.id);
    await expect(detail.addItem).toBeVisible();
    await expect(detail.name).toBeHidden();
    await detail.addItem.click();
    await expect(detail.description).toBeVisible();
    await detail.cancel.click();
    await expect(detail.name).toBeHidden();
    await expect(detail.addItem).toBeVisible();
    expect(mockApi.calls('POST', `${path}/items`)).toHaveLength(0);
    await detail.addItem.click();
    for (const invalidName of ['', '   ']) {
      await detail.name.fill(invalidName);
      await detail.add.click();
      await expect(detail.name).toHaveValue(invalidName);
      await expect(detail.cancel).toBeVisible();
      expect(mockApi.calls('POST', `${path}/items`)).toHaveLength(0);
    }

    const item = { id: 'item-1', name: 'Auriculares', description: description.trim() || null, listId: ownList.id };
    const reads = mockApi.calls('GET', path).length;
    const release = mockApi.hold('POST', `${path}/items`, item, 201);
    await detail.name.fill('  Auriculares  ');
    await detail.description.fill(description);
    await detail.add.click();
    await expect.poll(() => mockApi.calls('POST', `${path}/items`).length).toBe(1);
    await expect(detail.name).toHaveValue('  Auriculares  ');
    await expect(detail.addPending).toBeDisabled();
    expect(mockApi.calls('GET', path)).toHaveLength(reads);
    mockApi.respond('GET', path, { ...ownList, items: [item] });
    release();
    await expect(detail.item(item.name)).toBeVisible();
    await expect(detail.items).toHaveCount(1);
    await expect(detail.empty).toBeHidden();
    await expect(detail.addItem).toBeVisible();
    await expect(detail.name).toBeHidden();
    await expect.poll(() => mockApi.calls('GET', path).length).toBeGreaterThan(reads);
    const posts = mockApi.calls('POST', `${path}/items`);
    expect(posts).toHaveLength(1);
    expect(posts[0].method()).toBe('POST');
    expect(posts[0].postDataJSON()).toEqual(description.trim()
      ? { name: 'Auriculares', description: 'Azules' }
      : { name: 'Auriculares' });
    await detail.addItem.click();
    await expect(detail.name).toHaveValue('');
    await expect(detail.description).toHaveValue('');
  });
}

test('TEST-025: detalle vacio invita a crear el primer articulo', async ({ page, mockApi }) => {
  mockApi.respond('GET', `/lists/${ownList.id}`, ownList);
  const detail = new ListDetailPage(page);
  await detail.goto(ownList.id);
  await expect(detail.heading).toHaveText(ownList.name);
  await expect(detail.empty).toBeVisible();
  await expect(detail.items).toHaveCount(0);
});

test('TEST-025: articulos con y sin descripcion solo muestran su contenido', async ({ page, mockApi }) => {
  mockApi.respond('GET', `/lists/${ownList.id}`, { ...ownList, items: [
    { id: 'item-1', name: 'Auriculares', description: 'Azules', listId: ownList.id },
    { id: 'item-2', name: 'Libro', description: null, listId: ownList.id },
  ] });
  const detail = new ListDetailPage(page);
  await detail.goto(ownList.id);
  await expect(detail.items).toHaveCount(2);
  await expect(detail.itemText('Auriculares')).toHaveText(['Auriculares', 'Azules']);
  await expect(detail.itemText('Libro')).toHaveText(['Libro']);
  await expect(detail.empty).toBeHidden();
});

for (const confirmDeletion of [false, true]) {
  test(`TEST-026: ${confirmDeletion ? 'confirma 204 y refresca' : 'cancela sin DELETE'} borrado de articulo`, async ({ page, mockApi }) => {
    const path = `/lists/${ownList.id}`;
    const item = { id: 'item-1', name: 'Libro', listId: ownList.id };
    mockApi.respond('GET', path, { ...ownList, items: [item] });
    const detail = new ListDetailPage(page);
    await detail.goto(ownList.id);
    await expect(detail.item(item.name)).toBeVisible();
    const reads = mockApi.calls('GET', path).length;
    if (confirmDeletion) {
      const release = mockApi.hold('DELETE', `${path}/items/${item.id}`, undefined, 204);
      await detail.deleteItem(item.name, true);
      await expect.poll(() => mockApi.calls('DELETE', `${path}/items/${item.id}`).length).toBe(1);
      await expect(detail.item(item.name)).toBeVisible();
      expect(mockApi.calls('GET', path)).toHaveLength(reads);
      mockApi.respond('GET', path, ownList);
      release();
    } else {
      await detail.deleteItem(item.name, false);
    }
    if (confirmDeletion) {
      await expect(detail.item(item.name)).toHaveCount(0);
      await expect(detail.empty).toBeVisible();
      await expect.poll(() => mockApi.calls('GET', path).length).toBeGreaterThan(reads);
      const deletes = mockApi.calls('DELETE', `${path}/items/${item.id}`);
      expect(deletes).toHaveLength(1);
      expect(deletes[0].method()).toBe('DELETE');
      expect(deletes[0].postData()).toBeNull();
    } else {
      await expect(detail.item(item.name)).toBeVisible();
      expect(mockApi.calls('DELETE', `${path}/items/${item.id}`)).toHaveLength(0);
      expect(mockApi.calls('GET', path)).toHaveLength(reads);
    }
  });
}

test('TEST-027: visitante ve articulos pero ningun control de modificacion', async ({ page, mockApi }) => {
  mockApi.respond('GET', `/lists/${ownList.id}`, { ...ownList, ownerId: 'friend-1', visibility: 'PUBLIC', items: [
    { id: 'item-1', name: 'Libro', description: 'Tapa dura', listId: ownList.id },
  ] });
  const detail = new ListDetailPage(page);
  await detail.goto(ownList.id);
  await expect(detail.heading).toHaveText(ownList.name);
  await expect(detail.items).toHaveCount(1);
  await expect(detail.itemText('Libro')).toHaveText(['Libro', 'Tapa dura']);
  await expect(detail.addItem).toHaveCount(0);
  await expect(detail.deleteButtons).toHaveCount(0);
  await expect(detail.name).toHaveCount(0);
  await expect(detail.description).toHaveCount(0);
});
