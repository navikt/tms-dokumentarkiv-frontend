import type { JournalpostProps } from "@src/components/journalpostliste/JournalpostInterfaces";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const logLastNed = vi.fn();
vi.mock("@utils/client/analytics", () => ({
  logLastNed: (...args: unknown[]) => logLastNed(...args),
  logNavigere: vi.fn(),
}));

const journalpost: JournalpostProps = {
  journalpostId: "598134457",
  temakode: "AAP",
  temanavn: "Arbeidsavklaringspenger",
  tittel: "Sensitiv journalposttittel",
  avsender: "NAV Klageinstans",
  mottaker: "",
  journalposttype: "Inn",
  opprettet: "2024-03-15T12:00:00.000Z",
  dokument: {
    dokumentInfoId: "624887896",
    tittel: "Sensitiv hoveddokumenttittel",
    filtype: "PDF",
    filstorrelse: 12345,
    brukerHarTilgang: true,
    tilgangssperre: null,
  },
  vedlegg: [],
};

vi.mock("swr/immutable", () => ({
  default: () => ({ data: journalpost, isLoading: false, error: undefined }),
}));

import SingleJournalpost from "@src/components/single-journalpost/SingleJournalpost";

describe("SingleJournalpost", () => {
  afterEach(() => {
    logLastNed.mockReset();
  });

  it("should log last ned with the generic tittel Hoveddokument and never the real title", () => {
    render(
      <SingleJournalpost
        language="nb"
        journalpostId="598134457"
        temakode="AAP"
        fullmakt={null}
      />,
    );

    fireEvent.click(
      screen.getByRole("link", { name: /sensitiv hoveddokumenttittel/i }),
    );

    expect(logLastNed).toHaveBeenCalledTimes(1);
    expect(logLastNed).toHaveBeenCalledWith({
      komponent: "hoveddokument",
      tittel: "Hoveddokument",
      type: "PDF",
      tema: "Arbeidsavklaringspenger",
    });
    expect(JSON.stringify(logLastNed.mock.calls)).not.toMatch(/sensitiv/i);
  });
});
