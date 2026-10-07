import type { JournalpostProps } from "@src/components/journalpostliste/JournalpostInterfaces";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const logNavigere = vi.fn();
vi.mock("@utils/client/analytics", () => ({
  logNavigere: (...args: unknown[]) => logNavigere(...args),
}));

import Journalpost from "@src/components/journalpostliste/journalpost/Journalpost";

const baseJournalpost: JournalpostProps = {
  journalpostId: "598134457",
  temakode: "AAP",
  temanavn: "Arbeidsavklaringspenger",
  tittel: "Søknad om dagpenger",
  avsender: "NAV Klageinstans",
  mottaker: "",
  journalposttype: "Inn",
  opprettet: "2024-03-15T12:00:00.000Z",
  dokument: {
    dokumentInfoId: "624887896",
    tittel: "Søknad om dagpenger",
    filtype: "PDF",
    filstorrelse: 12345,
    brukerHarTilgang: true,
    tilgangssperre: null,
  },
  vedlegg: [],
};

const renderJournalpost = (
  overrides: Partial<JournalpostProps> = {},
  isValgtRepresentant = false,
) =>
  render(
    <Journalpost
      journalpost={{ ...baseJournalpost, ...overrides }}
      language="nb"
      isValgtRepresentant={isValgtRepresentant}
    />,
  );

describe("Journalpost", () => {
  afterEach(() => {
    logNavigere.mockReset();
  });

  it("should render the title as a link to the tema page", () => {
    renderJournalpost();

    const link = screen.getByRole("link", { name: "Søknad om dagpenger" });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("/dokumentarkiv/nb/tema/AAP/598134457"),
    );
  });

  it("should render the created date together with the avsender", () => {
    renderJournalpost();

    expect(
      screen.getByText("15.03.2024 - NAV Klageinstans"),
    ).toBeInTheDocument();
  });

  it("should fall back to the mottaker when there is no avsender", () => {
    renderJournalpost({ avsender: "", mottaker: "Ola Nordmann" });

    expect(screen.getByText("15.03.2024 - Ola Nordmann")).toBeInTheDocument();
  });

  it("should render only the date when neither avsender nor mottaker is set", () => {
    renderJournalpost({
      avsender: null as unknown as string,
      mottaker: null as unknown as string,
    });

    expect(screen.getByText("15.03.2024")).toBeInTheDocument();
  });

  it("should render the temanavn as a tag", () => {
    renderJournalpost();

    expect(screen.getByText("Arbeidsavklaringspenger")).toBeInTheDocument();
  });

  it("should append a fullmakt query param when viewing as a representative", () => {
    renderJournalpost({}, true);

    const link = screen.getByRole("link", { name: "Søknad om dagpenger" });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("?fullmakt=true"),
    );
  });

  it("should log a navigere event with the generic lenketekst and the exact href", () => {
    renderJournalpost();

    const link = screen.getByRole("link", { name: "Søknad om dagpenger" });
    fireEvent.click(link);

    expect(logNavigere).toHaveBeenCalledTimes(1);
    expect(logNavigere).toHaveBeenCalledWith({
      komponent: "Journalpostlenke",
      kategori: "Arbeidsavklaringspenger",
      lenketekst: "Journalpost",
      destinasjon: link.getAttribute("href"),
    });
    expect(link.getAttribute("href")).toMatch(
      /\/dokumentarkiv\/nb\/tema\/AAP\/598134457$/,
    );
  });

  it("should log the fullmakt href when viewing as a representative", () => {
    renderJournalpost({}, true);

    const link = screen.getByRole("link", { name: "Søknad om dagpenger" });
    fireEvent.click(link);

    expect(logNavigere).toHaveBeenCalledWith({
      komponent: "Journalpostlenke",
      kategori: "Arbeidsavklaringspenger",
      lenketekst: "Journalpost",
      destinasjon: link.getAttribute("href"),
    });
    expect(link.getAttribute("href")).toMatch(
      /\/dokumentarkiv\/nb\/tema\/AAP\/598134457\?fullmakt=true$/,
    );
  });

  it("should never send the journalpost title to analytics", () => {
    renderJournalpost();

    fireEvent.click(screen.getByRole("link", { name: "Søknad om dagpenger" }));

    expect(JSON.stringify(logNavigere.mock.calls)).not.toContain(
      "Søknad om dagpenger",
    );
  });
});
