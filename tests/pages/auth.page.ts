import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly productHeading: Locator;
  readonly pageHeading: Locator;
  readonly registerLink: Locator;

  constructor(readonly page: Page) {
    this.usernameInput = page.getByLabel('Usuario', { exact: true });
    this.passwordInput = page.getByLabel('Contrase\u00f1a', { exact: true });
    this.submitButton = page.getByRole('button', { name: 'Entrar', exact: true });
    this.productHeading = page.getByRole('heading', { name: 'EntreRegalos', exact: true });
    this.pageHeading = page.getByRole('heading', { name: 'Iniciar sesi\u00f3n', exact: true });
    this.registerLink = page.getByRole('link', { name: 'Reg\u00edstrate', exact: true });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async fillCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  error(text: string) {
    return this.page.getByText(text, { exact: true });
  }
}

export class RegisterPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly productHeading: Locator;
  readonly pageHeading: Locator;
  readonly invitationRequired: Locator;
  readonly loginLink: Locator;

  constructor(readonly page: Page) {
    this.usernameInput = page.getByLabel('Usuario', { exact: true });
    this.passwordInput = page.getByLabel('Contrase\u00f1a', { exact: true });
    this.submitButton = page.getByRole('button', { name: 'Registrarse', exact: true });
    this.productHeading = page.getByRole('heading', { name: 'EntreRegalos', exact: true });
    this.pageHeading = page.getByRole('heading', { name: 'Crear cuenta', exact: true });
    this.invitationRequired = page.getByText('Necesitas un enlace de invitaci\u00f3n v\u00e1lido para registrarte.', { exact: true });
    this.loginLink = page.getByRole('link', { name: 'Inicia sesi\u00f3n', exact: true });
  }

  async goto(token?: string) {
    await this.page.goto(`/register${token === undefined ? '' : `?token=${encodeURIComponent(token)}`}`);
  }

  async fillCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  error(text: string) {
    return this.page.getByText(text, { exact: true });
  }
}

export class ResetPasswordPage {
  readonly passwordInput: Locator;
  readonly confirmationInput: Locator;
  readonly submitButton: Locator;
  readonly productHeading: Locator;
  readonly pageHeading: Locator;
  readonly missingTokenMessage: Locator;
  readonly verifyingMessage: Locator;
  readonly invalidTokenMessage: Locator;
  readonly backToLoginLink: Locator;
  readonly loginLink: Locator;

  constructor(readonly page: Page) {
    this.passwordInput = page.getByLabel('Nueva contrase\u00f1a', { exact: true });
    this.confirmationInput = page.getByLabel('Repetir contrase\u00f1a', { exact: true });
    this.submitButton = page.getByRole('button', { name: 'Guardar contrase\u00f1a', exact: true });
    this.productHeading = page.getByRole('heading', { name: 'EntreRegalos', exact: true });
    this.pageHeading = page.getByRole('heading', { name: 'Restablecer contrase\u00f1a', exact: true });
    this.missingTokenMessage = page.getByText('Necesitas un enlace de reseteo v\u00e1lido para continuar.', { exact: true });
    this.verifyingMessage = page.getByText('Verificando enlace...', { exact: true });
    this.invalidTokenMessage = page.getByText('El enlace ha expirado o ya ha sido utilizado.', { exact: true });
    this.backToLoginLink = page.getByRole('link', { name: 'Volver al inicio de sesi\u00f3n', exact: true });
    this.loginLink = page.getByRole('link', { name: 'Inicia sesi\u00f3n', exact: true });
  }

  async goto(token?: string) {
    await this.page.goto(`/reset-password${token === undefined ? '' : `?token=${encodeURIComponent(token)}`}`);
  }

  async fillPasswords(password: string, confirmation: string) {
    await this.passwordInput.fill(password);
    await this.confirmationInput.fill(confirmation);
  }

  async submit() {
    await this.submitButton.click();
  }

  error(text: string) {
    return this.page.getByText(text, { exact: true });
  }

  username(name: string) {
    return this.page.getByText(`@${name}`, { exact: true });
  }
}
