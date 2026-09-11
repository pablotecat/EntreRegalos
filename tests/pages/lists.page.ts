import { expect, type Page } from '@playwright/test';

export class ListsPage {
  constructor(readonly page: Page) {}

  get heading() { return this.page.getByRole('heading', { name: 'Mis listas', exact: true }); }
  get loading() { return this.page.getByText('Cargando listas...', { exact: true }); }
  get empty() { return this.page.getByText('A\u00fan no tienes listas. \u00a1Crea la primera!', { exact: true }); }
  get newList() { return this.page.getByRole('button', { name: '+ Nueva lista', exact: true }); }
  get modal() { return this.page.getByRole('dialog', { name: 'Nueva lista', exact: true }); }
  get name() { return this.modal.getByLabel('Nombre', { exact: true }); }
  get visibility() { return this.modal.getByLabel('Visibilidad', { exact: true }); }
  get create() { return this.modal.getByRole('button', { name: 'Crear', exact: true }); }
  get createPending() { return this.modal.getByRole('button', { name: 'Cargando...', exact: true }); }
  get cancel() { return this.modal.getByRole('button', { name: 'Cancelar', exact: true }); }
  get close() { return this.modal.getByRole('button', { name: 'Cerrar', exact: true }); }

  async goto() {
    await this.page.goto('/listas');
  }

  link(name: string) {
    return this.page.getByRole('link', { name, exact: true });
  }

  card(name: string) {
    return this.page.getByRole('article').filter({ has: this.link(name) });
  }

  async deleteList(name: string, confirmDeletion: boolean) {
    const dialogPromise = this.page.waitForEvent('dialog');
    const clickPromise = this.card(name).getByRole('button', { name: 'Borrar', exact: true }).click();
    const dialog = await dialogPromise;
    const type = dialog.type();
    const message = dialog.message();
    try {
      if (confirmDeletion) await dialog.accept();
      else await dialog.dismiss();
    } finally {
      await clickPromise;
    }
    expect(type).toBe('confirm');
    expect(message).toBe('\u00bfBorrar esta lista?');
  }
}

export class ListDetailPage {
  constructor(readonly page: Page) {}

  get heading() { return this.page.getByRole('heading', { level: 1 }); }
  get loading() { return this.page.getByRole('main').getByText('Cargando...', { exact: true }); }
  get notFound() { return this.page.getByText('Lista no encontrada.', { exact: true }); }
  get empty() { return this.page.getByText('La lista est\u00e1 vac\u00eda. \u00a1A\u00f1ade el primer art\u00edculo!', { exact: true }); }
  get backToLists() { return this.page.getByRole('link', { name: '\u2190 Mis listas', exact: true }); }
  get backToFriends() { return this.page.getByRole('link', { name: '\u2190 Amigos', exact: true }); }
  get addItem() { return this.page.getByRole('button', { name: 'A\u00f1adir art\u00edculo', exact: true }); }
  get name() { return this.page.getByLabel('Nombre', { exact: true }); }
  get description() { return this.page.getByLabel('Descripci\u00f3n (opcional)', { exact: true }); }
  get add() { return this.page.getByRole('button', { name: 'A\u00f1adir', exact: true }); }
  get addPending() { return this.page.getByRole('button', { name: 'Cargando...', exact: true }); }
  get cancel() { return this.page.getByRole('button', { name: 'Cancelar', exact: true }); }
  get items() { return this.page.getByRole('listitem'); }
  get deleteButtons() { return this.page.getByRole('button', { name: 'Borrar', exact: true }); }

  async goto(id: string) {
    await this.page.goto(`/listas/${id}`);
  }

  item(name: string) {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  itemText(name: string) {
    return this.item(name).locator('p');
  }

  async deleteItem(name: string, confirmDeletion: boolean) {
    const dialogPromise = this.page.waitForEvent('dialog');
    const clickPromise = this.item(name).getByRole('button', { name: 'Borrar', exact: true }).click();
    const dialog = await dialogPromise;
    const type = dialog.type();
    const message = dialog.message();
    try {
      if (confirmDeletion) await dialog.accept();
      else await dialog.dismiss();
    } finally {
      await clickPromise;
    }
    expect(type).toBe('confirm');
    expect(message).toBe('\u00bfBorrar este art\u00edculo?');
  }
}
