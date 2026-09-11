import { test, expect, login } from '../fixtures';
import { ListsPage, ListDetailPage } from '../pages/lists.page';

test('TEST-018 TEST-019 TEST-020 TEST-021 TEST-023 TEST-024 TEST-025 TEST-026: crea y persiste una lista y sus articulos; cancela y confirma los borrados', async ({ page, account }) => {
  const listsPage = new ListsPage(page);
  const detail = new ListDetailPage(page);
  await login(page, account);
  await expect(listsPage.empty).toBeVisible();

  const modal = listsPage.modal;
  await listsPage.newList.click();
  await expect(modal).toBeVisible();
  await listsPage.cancel.click();
  await expect(modal).toBeHidden();
  await listsPage.newList.click();
  await expect(modal).toBeVisible();
  await listsPage.close.click();
  await expect(modal).toBeHidden();

  await listsPage.newList.click();
  await listsPage.name.fill('  Navidad  ');
  await listsPage.visibility.selectOption('PUBLIC');
  const createdListResponse = page.waitForResponse((response) =>
    new URL(response.url()).pathname === '/api/v1/lists' && response.request().method() === 'POST');
  await listsPage.create.click();
  const createdList = await createdListResponse;
  expect(createdList.status()).toBe(201);
  const list = await createdList.json();
  await expect(listsPage.link('Navidad')).toBeVisible();
  await expect(modal).toBeHidden();

  await page.reload();
  await expect(listsPage.link('Navidad')).toBeVisible();
  await expect(listsPage.card('Navidad').getByText('Pública', { exact: true })).toBeVisible();
  const myLists = await account.api.get('/api/v1/lists');
  expect(myLists.status()).toBe(200);
  expect(await myLists.json()).toEqual([
    expect.objectContaining({ id: list.id, name: 'Navidad', visibility: 'PUBLIC', ownerId: account.id }),
  ]);
  const listPath = `/api/v1/lists/${list.id}`;
  const persistedList = await account.api.get(listPath);
  expect(persistedList.status()).toBe(200);
  expect(await persistedList.json()).toMatchObject({
    id: list.id, name: 'Navidad', visibility: 'PUBLIC', ownerId: account.id, items: [],
  });

  await listsPage.link('Navidad').click();
  await expect(page).toHaveURL(new RegExp(`/listas/${list.id}$`));
  await expect(detail.heading).toBeVisible();
  await expect(detail.heading).toHaveText('Navidad');
  await expect(detail.empty).toBeVisible();
  await detail.addItem.click();
  await detail.cancel.click();
  await expect(detail.addItem).toBeVisible();
  await expect(detail.name).toBeHidden();

  const items: Array<{ id: string; name: string; description: string | null; listId: string }> = [];
  for (const [name, description] of [['Auriculares', 'Azules'], ['Libro', '']]) {
    await detail.addItem.click();
    await detail.name.fill(`  ${name}  `);
    await detail.description.fill(`  ${description}  `);
    const createdItemResponse = page.waitForResponse((response) =>
      new URL(response.url()).pathname === `${listPath}/items` && response.request().method() === 'POST');
    await detail.add.click();
    const createdItem = await createdItemResponse;
    expect(createdItem.status()).toBe(201);
    const item = await createdItem.json();
    expect(item).toMatchObject({ name, description: description || null, listId: list.id });
    items.push(item);
    await expect(detail.item(name)).toBeVisible();
    await expect(detail.addItem).toBeVisible();
  }

  await page.reload();
  const headphones = detail.item('Auriculares');
  await expect(headphones.getByText('Azules', { exact: true })).toBeVisible();
  await expect(detail.item('Libro')).toBeVisible();
  await expect(detail.items).toHaveCount(2);
  const withItems = await account.api.get(listPath);
  expect(withItems.status()).toBe(200);
  const snapshot = await withItems.json();
  expect(snapshot.items).toHaveLength(2);
  expect(snapshot.items).toEqual(expect.arrayContaining(items));

  for (const confirmDeletion of [false, true]) {
    const deletedResponse = confirmDeletion ? page.waitForResponse((response) =>
      new URL(response.url()).pathname === `${listPath}/items/${items[0].id}` &&
      response.request().method() === 'DELETE') : undefined;
    await detail.deleteItem('Auriculares', confirmDeletion);
    if (deletedResponse) {
      expect((await deletedResponse).status()).toBe(204);
      await expect(headphones).toHaveCount(0);
    }

    await page.reload();
    await expect(detail.heading).toBeVisible();
    await expect(detail.heading).toHaveText('Navidad');
    await expect(detail.item('Libro')).toBeVisible();
    await expect(headphones).toHaveCount(confirmDeletion ? 0 : 1);
    const persisted = await account.api.get(listPath);
    expect(persisted.status()).toBe(200);
    expect(await persisted.json()).toEqual({ ...snapshot, items: confirmDeletion ? [items[1]] : snapshot.items });
  }

  await detail.backToLists.click();
  await expect(listsPage.link('Navidad')).toBeVisible();
  for (const confirmDeletion of [false, true]) {
    const deletedResponse = confirmDeletion ? page.waitForResponse((response) =>
      new URL(response.url()).pathname === listPath && response.request().method() === 'DELETE') : undefined;
    await listsPage.deleteList('Navidad', confirmDeletion);
    if (deletedResponse) {
      expect((await deletedResponse).status()).toBe(204);
      await expect(listsPage.empty).toBeVisible();
    }

    await page.reload();
    await expect(listsPage.heading).toBeVisible();
    const persisted = await account.api.get(listPath);
    expect(persisted.status()).toBe(confirmDeletion ? 404 : 200);
    const remainingLists = await account.api.get('/api/v1/lists');
    expect(remainingLists.status()).toBe(200);
    if (confirmDeletion) {
      await expect(listsPage.empty).toBeVisible();
      await expect(listsPage.link('Navidad')).toHaveCount(0);
      expect(await remainingLists.json()).toEqual([]);
    } else {
      await expect(listsPage.link('Navidad')).toBeVisible();
      expect(await persisted.json()).toEqual({ ...snapshot, items: [items[1]] });
      expect(await remainingLists.json()).toEqual([
        expect.objectContaining({ id: list.id, name: 'Navidad', visibility: 'PUBLIC', ownerId: account.id }),
      ]);
    }
  }
});
