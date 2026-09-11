import { test, expect } from './fixtures';
import { FriendsPage, UserListsPage } from '../pages/social.page';
import { ListDetailPage } from '../pages/lists.page';

const friend = { id: 'friend-1', username: 'bea', role: 'USER', isActive: true };

test.beforeEach(async ({ mockApi }) => {
  await mockApi.session();
});

test('TEST-031: amigos pendientes y respuesta vacia', async ({ page, mockApi }) => {
  const release = mockApi.hold('GET', '/users', []);
  const friends = new FriendsPage(page);
  await friends.goto();
  await expect(friends.loading).toBeVisible();
  await expect(friends.empty).toBeHidden();
  expect(mockApi.calls('GET', '/users')).toHaveLength(1);
  release();
  await expect(friends.heading).toBeVisible();
  await expect(friends.empty).toBeVisible();
  await expect(friends.loading).toBeHidden();
  await expect(friends.cards).toHaveCount(0);
});

test('TEST-031: tarjeta con inicial mayuscula y username navega al amigo', async ({ page, mockApi }) => {
  mockApi.respond('GET', '/users', [friend]);
  mockApi.respond('GET', `/lists/user/${friend.id}`, []);
  const friends = new FriendsPage(page);
  await friends.goto();
  await expect(friends.heading).toBeVisible();
  await expect(friends.cards).toHaveCount(1);
  const card = friends.card(friend.username);
  await expect(card.getByText('B', { exact: true })).toBeVisible();
  await expect(card.getByText('@bea', { exact: true })).toBeVisible();
  await expect(card.getByText('Ver sus listas', { exact: true })).toBeVisible();
  await expect(friends.empty).toBeHidden();
  await expect(card).toHaveAttribute('href', `/amigos/${friend.id}/listas`);
  await card.click();
  await expect(page).toHaveURL(`/amigos/${friend.id}/listas`);
  await expect(new UserListsPage(page).empty).toBeVisible();
  expect(mockApi.calls('GET', `/lists/user/${friend.id}`)).toHaveLength(1);
});

test('TEST-032: listas pendientes, encabezado amigo y vacio; retorno a Amigos', async ({ page, mockApi }) => {
  const release = mockApi.hold('GET', `/lists/user/${friend.id}`, []);
  mockApi.respond('GET', '/users', [friend]);
  const lists = new UserListsPage(page);
  await lists.goto(friend.id);
  await expect(lists.loading).toBeVisible();
  await expect(lists.empty).toBeHidden();
  expect(mockApi.calls('GET', `/lists/user/${friend.id}`)).toHaveLength(1);
  release();
  await expect(lists.loading).toBeHidden();
  await expect(lists.heading).toHaveText('Listas de @amigo');
  await expect(lists.empty).toBeVisible();
  await expect(lists.back).toHaveAttribute('href', '/amigos');
  await lists.back.click();
  await expect(page).toHaveURL('/amigos');
  await expect(new FriendsPage(page).card(friend.username)).toBeVisible();
});

for (const withOwner of [true, false]) {
  for (const via of ['nombre', 'Ver lista']) {
    test(`TEST-032: tarjetas publicas, cantidades y ${withOwner ? 'propietario' : 'fallback amigo'}; abre ${via}`, async ({ page, mockApi }) => {
      const list = {
        id: 'public-1', name: 'Ideas', visibility: 'PUBLIC', ownerId: friend.id,
        ...(withOwner ? { owner: { id: friend.id, username: friend.username } } : {}),
        _count: { items: 2 },
      };
      const emptyList = { id: 'public-2', name: 'Sin contador', visibility: 'PUBLIC', ownerId: friend.id };
      mockApi.respond('GET', `/lists/user/${friend.id}`, [list, emptyList]);
      mockApi.respond('GET', `/lists/${list.id}`, { ...list, items: [
        { id: 'item-1', name: 'Libro', listId: list.id },
        { id: 'item-2', name: 'Auriculares', listId: list.id },
      ] });
      const lists = new UserListsPage(page);
      await lists.goto(friend.id);
      await expect(lists.heading).toHaveText(`Listas de @${withOwner ? friend.username : 'amigo'}`);
      await expect(lists.empty).toBeHidden();
      await expect(lists.card(list.name).getByText('P\u00fablica', { exact: true })).toBeVisible();
      await expect(lists.card(list.name).getByText('2 art\u00edculos', { exact: true })).toBeVisible();
      await expect(lists.card(emptyList.name).getByText('P\u00fablica', { exact: true })).toBeVisible();
      await expect(lists.card(emptyList.name).getByText('0 art\u00edculos', { exact: true })).toBeVisible();
      const link = via === 'nombre' ? lists.link(list.name)
        : lists.card(list.name).getByRole('link', { name: 'Ver lista \u2192', exact: true });
      await expect(link).toHaveAttribute('href', `/listas/${list.id}`);
      await link.click();
      await expect(page).toHaveURL(`/listas/${list.id}`);
      await expect(new ListDetailPage(page).heading).toHaveText(list.name);
      expect(mockApi.calls('GET', `/lists/${list.id}`)).toHaveLength(1);
    });
  }
}
