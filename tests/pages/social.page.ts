import { type Page } from '@playwright/test';

export class FriendsPage {
  constructor(readonly page: Page) {}

  get navigation() { return this.page.getByRole('link', { name: 'Amigos', exact: true }); }
  get heading() { return this.page.getByRole('heading', { name: 'Amigos', exact: true }); }
  get loading() { return this.page.getByText('Cargando amigos...', { exact: true }); }
  get empty() { return this.page.getByText('No hay otros usuarios registrados todav\u00eda.', { exact: true }); }
  get cards() { return this.page.getByRole('link').filter({ hasText: 'Ver sus listas' }); }

  async goto() {
    await this.page.goto('/amigos');
  }

  card(username: string) {
    return this.cards.filter({ has: this.page.getByText(`@${username}`, { exact: true }) });
  }
}

export class UserListsPage {
  constructor(readonly page: Page) {}

  get heading() { return this.page.getByRole('heading', { level: 1 }); }
  get loading() { return this.page.getByText('Cargando listas...', { exact: true }); }
  get empty() { return this.page.getByText('Este usuario no tiene listas p\u00fablicas.', { exact: true }); }
  get back() { return this.page.getByRole('link', { name: '\u2190 Amigos', exact: true }); }

  async goto(userId: string) {
    await this.page.goto(`/amigos/${userId}/listas`);
  }

  link(name: string) {
    return this.page.getByRole('link', { name, exact: true });
  }

  card(name: string) {
    return this.page.getByRole('article').filter({ has: this.link(name) });
  }
}
