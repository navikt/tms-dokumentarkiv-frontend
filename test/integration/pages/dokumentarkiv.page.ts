import { expect, type Locator, type Page } from "@playwright/test";
import type { Language } from "../../../src/language/language";

const BASE_PATH = "/dokumentarkiv";

/**
 * Page object for the dokumentarkiv landing page.
 *
 * Locators are scoped to the `<main>` content region because the Nav decorator
 * renders its own header/footer navigation and links outside of it.
 */
export class DokumentarkivPage {
  readonly main: Locator;
  readonly heading: Locator;
  readonly breadcrumb: Locator;
  readonly representasjonSelect: Locator;

  constructor(
    private readonly page: Page,
    private readonly language: Language = "nb",
  ) {
    this.main = page.getByRole("main");
    this.heading = this.main.getByRole("heading", { level: 1 });
    this.breadcrumb = this.main.getByRole("navigation");
    this.representasjonSelect = this.main.getByRole("combobox", {
      name: "Hvem vil du bruke dokumentarkivet på vegne av?",
    });
  }

  private path(): string {
    return `${BASE_PATH}/${this.language}`;
  }

  async goto() {
    await this.page.goto(this.path());
    await expect(this.heading).toBeVisible();
  }

  journalpostLinks(): Locator {
    return this.main.getByRole("link", { name: /søknad om/i });
  }

  journalpostLinkByTitle(title: string | RegExp): Locator {
    return this.main.getByRole("link", { name: title }).first();
  }

  async expectAtLeastOneJournalpost() {
    await expect(this.journalpostLinks().first()).toBeVisible({
      timeout: 20_000,
    });
  }
}
