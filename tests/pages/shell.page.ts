import type { Page } from '@playwright/test';

export class ShellPage {
  constructor(readonly page: Page) {}

  get nav() { return this.page.getByRole('navigation'); }
  get brand() { return this.nav.getByRole('link', { name: 'EntreRegalos', exact: true }); }
  get listsLink() { return this.nav.getByRole('link', { name: 'Mis listas', exact: true }); }
  get friendsLink() { return this.nav.getByRole('link', { name: 'Amigos', exact: true }); }
  get adminLink() { return this.nav.getByRole('link', { name: 'Admin', exact: true }); }
  get logoutButton() { return this.nav.getByRole('button', { name: 'Cerrar sesión', exact: true }); }
  get loading() { return this.page.getByText('Cargando...', { exact: true }); }
  username(name: string) { return this.nav.getByText(`@${name}`, { exact: true }); }
  async goto(path: string) { await this.page.goto(path); }
}
