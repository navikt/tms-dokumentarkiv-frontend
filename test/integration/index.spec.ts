import { expect, test } from "@playwright/test";
import { DokumentarkivPage } from "./pages/dokumentarkiv.page";

test.describe("Dokumentarkiv-forsiden", () => {
  test("viser hovedoverskrift", async ({ page }) => {
    const dokumentarkiv = new DokumentarkivPage(page);
    await dokumentarkiv.goto();

    await expect(dokumentarkiv.heading).toHaveText("Dokumenter");
  });

  test("viser ingressteksten", async ({ page }) => {
    const dokumentarkiv = new DokumentarkivPage(page);
    await dokumentarkiv.goto();

    await expect(
      dokumentarkiv.main.getByText("Se dokumenter i sakene dine hos Nav."),
    ).toBeVisible();
  });

  test("viser brødsmulesti til Min side", async ({ page }) => {
    const dokumentarkiv = new DokumentarkivPage(page);
    await dokumentarkiv.goto();

    await expect(
      dokumentarkiv.breadcrumb.getByRole("link", { name: "Min side" }),
    ).toBeVisible();
  });

  test("viser dokumenter fra api-et", async ({ page }) => {
    const dokumentarkiv = new DokumentarkivPage(page);
    await dokumentarkiv.goto();

    await expect(
      dokumentarkiv.journalpostLinkByTitle(
        /Søknad om å beholde arbeidsavklaringspenger under opphold i innlandet/,
      ),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("viser antall dokumenter og sorteringsvalg", async ({ page }) => {
    const dokumentarkiv = new DokumentarkivPage(page);
    await dokumentarkiv.goto();
    await dokumentarkiv.expectAtLeastOneJournalpost();

    await expect(
      dokumentarkiv.main.getByText(/Viser \d+ av \d+ dokumenter/),
    ).toBeVisible();
  });

  test("hvert dokument lenker til en temaside", async ({ page }) => {
    const dokumentarkiv = new DokumentarkivPage(page);
    await dokumentarkiv.goto();
    await dokumentarkiv.expectAtLeastOneJournalpost();

    const firstLink = dokumentarkiv.journalpostLinks().first();
    await expect(firstLink).toHaveAttribute("href", /\/dokumentarkiv\/nb\/tema\//);
  });
});

test.describe("Representasjon", () => {
  test("viser fullmakter og vergemål i nedtrekkslisten", async ({ page }) => {
    const dokumentarkiv = new DokumentarkivPage(page);
    await dokumentarkiv.goto();

    await expect(
      dokumentarkiv.representasjonSelect.getByRole("option"),
    ).toHaveText([
      "Dag Helge Daghelgesen (Deg)",
      "Sergio Sergiozen (fullmakt)",
      "Amir Amiresen (fullmakt)",
      "Vera Vergehaversen (vergemål)",
    ]);
  });

  test("sender ident og type når et vergemål velges", async ({ page }) => {
    const dokumentarkiv = new DokumentarkivPage(page);
    await dokumentarkiv.goto();
    await expect(dokumentarkiv.representasjonSelect).toBeVisible();

    const request = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        request.url().endsWith("/mine-saker-api/repr/representert"),
    );
    await dokumentarkiv.representasjonSelect.selectOption({
      label: "Vera Vergehaversen (vergemål)",
    });

    expect((await request).postDataJSON()).toEqual({
      ident: "567890123",
      type: "Verge",
    });
  });
});

test.describe("Språkstøtte", () => {
  test("viser engelsk innhold på /en", async ({ page }) => {
    const dokumentarkiv = new DokumentarkivPage(page, "en");
    await dokumentarkiv.goto();

    await expect(dokumentarkiv.heading).toHaveText("Documents");
    await expect(
      dokumentarkiv.main.getByText("See documents in your cases with Nav."),
    ).toBeVisible();
  });

  test("viser nynorsk innhold på /nn", async ({ page }) => {
    const dokumentarkiv = new DokumentarkivPage(page, "nn");
    await dokumentarkiv.goto();

    await expect(dokumentarkiv.heading).toHaveText("Dokument");
    await expect(
      dokumentarkiv.main.getByText("Sjå dokument i sakene dine hos Nav."),
    ).toBeVisible();
  });
});
