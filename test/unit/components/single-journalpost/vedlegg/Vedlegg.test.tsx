import type { DokumentProps } from "@src/components/journalpostliste/JournalpostInterfaces";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const logLastNed = vi.fn();
vi.mock("@utils/client/analytics", () => ({
  logLastNed: (...args: unknown[]) => logLastNed(...args),
}));

import Vedlegg from "@src/components/single-journalpost/vedlegg/Vedlegg";

const vedlegg: DokumentProps = {
  dokumentInfoId: "111",
  tittel: "Sensitiv vedleggstittel",
  filtype: "PDF",
  filstorrelse: 2048,
  brukerHarTilgang: true,
  tilgangssperre: null,
};

describe("Vedlegg (single journalpost)", () => {
  afterEach(() => {
    logLastNed.mockReset();
  });

  it("should log last ned with the generic tittel Vedlegg and never the real title", () => {
    render(
      <Vedlegg
        vedleggsListe={[vedlegg]}
        journalpostId="598134457"
        language="nb"
      />,
    );

    fireEvent.click(
      screen.getByRole("link", { name: /Sensitiv vedleggstittel/ }),
    );

    expect(logLastNed).toHaveBeenCalledTimes(1);
    expect(logLastNed).toHaveBeenCalledWith({
      komponent: "Dokumentlenke",
      tittel: "Vedlegg",
      type: "PDF",
      kontekst: "Vedlegg",
    });
    expect(JSON.stringify(logLastNed.mock.calls)).not.toContain(
      "Sensitiv vedleggstittel",
    );
  });
});
