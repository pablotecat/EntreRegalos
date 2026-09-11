import type { Page } from '@playwright/test';

export class DocumentPage {
  constructor(readonly page: Page) {}
  get html() { return this.page.locator('html'); }
  get charset() { return this.page.locator('meta[charset]'); }
  get viewport() { return this.page.locator('meta[name="viewport"]'); }
  get favicon() { return this.page.locator('link[rel="icon"]'); }
}
