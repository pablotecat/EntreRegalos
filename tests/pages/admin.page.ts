import type { Locator, Page } from '@playwright/test';

export class AdminPage {
  readonly heading: Locator;
  readonly invitations: Locator;
  readonly users: Locator;
  readonly resets: Locator;
  readonly referenceInput: Locator;
  readonly generateInvitationButton: Locator;
  readonly copyGeneratedInvitationButton: Locator;
  readonly copyGeneratedResetButton: Locator;
  readonly resetButtons: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Panel de administraci\u00f3n', exact: true });
    this.invitations = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Invitaciones', exact: true }),
    });
    this.users = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Usuarios', exact: true }),
    });
    this.resets = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Tokens de reseteo de contrase\u00f1a', exact: true }),
    });
    this.referenceInput = this.invitations.getByLabel('Referencia (opcional)', { exact: true });
    this.generateInvitationButton = this.invitations.getByRole('button', { name: 'Generar invitaci\u00f3n', exact: true });
    this.copyGeneratedInvitationButton = this.invitations.getByRole('button', { name: 'Copiar al portapapeles', exact: true });
    this.copyGeneratedResetButton = this.resets.getByRole('button', { name: 'Copiar al portapapeles', exact: true });
    this.resetButtons = this.users.getByRole('button', { name: /^(Resetear contrase\u00f1a|Generando\.\.\.)$/ });
  }

  async goto() {
    await this.page.goto('/admin');
  }

  userRow(username: string) {
    return this.users.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: `@${username}`, exact: true }),
    });
  }

  invitationRow(reference: string) {
    return this.invitations.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: reference, exact: true }),
    });
  }

  resetRow(username: string) {
    return this.resets.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: `@${username}`, exact: true }),
    });
  }

  generatedInvitationUrl(url: string) {
    return this.invitations.getByText(url, { exact: true });
  }

  generatedResetUrl(url: string) {
    return this.resets.getByText(url, { exact: true });
  }

  copyInvitationButton(reference: string) {
    return this.invitationRow(reference).getByRole('button', { name: 'Copiar enlace', exact: true });
  }

  copyResetButton(username: string) {
    return this.resetRow(username).getByRole('button', { name: 'Copiar enlace', exact: true });
  }

  activateButton(username: string) {
    return this.userRow(username).getByRole('button', { name: 'Activar', exact: true });
  }

  deactivateButton(username: string) {
    return this.userRow(username).getByRole('button', { name: 'Desactivar', exact: true });
  }

  resetButton(username: string) {
    return this.userRow(username).getByRole('button', { name: /^(Resetear contrase\u00f1a|Generando\.\.\.)$/ });
  }

  async generateInvitation(reference = '') {
    await this.referenceInput.fill(reference);
    await this.generateInvitationButton.click();
  }

  async generateReset(username: string) {
    await this.resetButton(username).click();
  }
}
