import { test, expect, login } from '../fixtures';
import { FriendsPage, UserListsPage } from '../pages/social.page';
import { ListDetailPage } from '../pages/lists.page';

test('TEST-023 TEST-027 TEST-029 TEST-030 TEST-031 TEST-032: descubre listas publicas de otro usuario sin poder leer privadas ni modificar ninguna', async ({ page, account, createAccount }) => {
  const friendsPage = new FriendsPage(page);
  const userLists = new UserListsPage(page);
  const detail = new ListDetailPage(page);
  const owner = await createAccount();
  expect(owner.id).not.toBe(account.id);
  const lists = [];
  for (const [name, visibility] of [['Ideas compartidas', 'PUBLIC'], ['Ideas reservadas', 'PRIVATE']]) {
    const createdList = await owner.api.post('/api/v1/lists', { data: { name: 'Borrador', visibility } });
    expect(createdList.status()).toBe(201);
    const draft = await createdList.json();
    const editedList = await owner.api.patch(`/api/v1/lists/${draft.id}`, { data: { name } });
    expect(editedList.status()).toBe(200);
    const list = await editedList.json();
    expect(list).toMatchObject({ id: draft.id, name, visibility });
    const createdItem = await owner.api.post(`/api/v1/lists/${list.id}/items`, {
      data: { name: `Libro de ${name}`, description: 'Borrador' },
    });
    expect(createdItem.status()).toBe(201);
    const draftItem = await createdItem.json();
    const editedItem = await owner.api.patch(`/api/v1/lists/${list.id}/items/${draftItem.id}`, { data: { description: 'Tapa dura' } });
    expect(editedItem.status()).toBe(200);
    const item = await editedItem.json();
    expect(item).toMatchObject({ id: draftItem.id, name: `Libro de ${name}`, description: 'Tapa dura' });
    const persisted = await owner.api.get(`/api/v1/lists/${list.id}`);
    expect(persisted.status()).toBe(200);
    const snapshot = await persisted.json();
    expect(snapshot).toMatchObject({ id: list.id, name, visibility, ownerId: owner.id, items: [item] });
    lists.push({ list, item, snapshot });
  }
  const [publicList, privateList] = lists;

  await login(page, account);
  await friendsPage.navigation.click();
  await expect(friendsPage.heading).toBeVisible();
  const friend = friendsPage.card(owner.username);
  await expect(friend).toHaveAttribute('href', `/amigos/${owner.id}/listas`);
  await friend.click();
  await expect(page).toHaveURL(new RegExp(`/amigos/${owner.id}/listas$`));
  await expect(userLists.heading).toBeVisible();
  await expect(userLists.heading).toHaveText(`Listas de @${owner.username}`);
  await expect(userLists.link(publicList.list.name)).toBeVisible();
  await expect(userLists.link(privateList.list.name)).toHaveCount(0);
  const visibleLists = await account.api.get(`/api/v1/lists/user/${owner.id}`);
  expect(visibleLists.status()).toBe(200);
  expect(await visibleLists.json()).toEqual([
    expect.objectContaining({
      id: publicList.list.id, name: publicList.list.name, ownerId: owner.id, visibility: 'PUBLIC',
      _count: { items: 1 },
    }),
  ]);

  await userLists.link(publicList.list.name).click();
  await expect(page).toHaveURL(new RegExp(`/listas/${publicList.list.id}$`));
  await expect(detail.heading).toBeVisible();
  await expect(detail.heading).toHaveText(publicList.list.name);
  await expect(detail.items.getByText(publicList.item.name, { exact: true })).toBeVisible();
  await expect(detail.items.getByText('Tapa dura', { exact: true })).toBeVisible();
  await expect(detail.backToFriends).toHaveAttribute('href', '/amigos');
  await expect(detail.addItem).toHaveCount(0);
  await expect(detail.deleteButtons).toHaveCount(0);
  await expect(detail.name).toHaveCount(0);
  const publicAccess = await account.api.get(`/api/v1/lists/${publicList.list.id}`);
  expect(publicAccess.status()).toBe(200);
  expect(await publicAccess.json()).toEqual(publicList.snapshot);
  const privateAccess = await account.api.get(`/api/v1/lists/${privateList.list.id}`);
  expect(privateAccess.status()).toBe(403);

  for (const { list, item } of lists) {
    const path = `/api/v1/lists/${list.id}`;
    expect((await account.api.patch(path, { data: { name: 'Intrusion', visibility: 'PUBLIC' } })).status()).toBe(403);
    expect((await account.api.post(`${path}/items`, { data: { name: 'Intrusion' } })).status()).toBe(403);
    expect((await account.api.patch(`${path}/items/${item.id}`, { data: { name: 'Intrusion' } })).status()).toBe(403);
    expect((await account.api.delete(`${path}/items/${item.id}`)).status()).toBe(403);
    expect((await account.api.delete(path)).status()).toBe(403);
  }

  // Even the owner cannot address an item through a different list.
  const mismatchedItemPath = `/api/v1/lists/${publicList.list.id}/items/${privateList.item.id}`;
  expect((await owner.api.patch(mismatchedItemPath, { data: { name: 'Intrusion' } })).status()).toBe(404);
  expect((await owner.api.delete(mismatchedItemPath)).status()).toBe(404);

  for (const { list, snapshot } of lists) {
    const persisted = await owner.api.get(`/api/v1/lists/${list.id}`);
    expect(persisted.status()).toBe(200);
    expect(await persisted.json()).toEqual(snapshot);
  }
  await page.reload();
  await expect(detail.heading).toBeVisible();
  await expect(detail.heading).toHaveText(publicList.list.name);
  await expect(detail.items).toHaveCount(1);
  await expect(detail.items.getByText(publicList.item.name, { exact: true })).toBeVisible();
  await expect(detail.items.getByText('Tapa dura', { exact: true })).toBeVisible();
  await expect(detail.addItem).toHaveCount(0);
  await expect(detail.deleteButtons).toHaveCount(0);
});
