import { beforeEach, describe, expect, it, vi } from "vitest";

const { custom, logger, getAnalyticsInstance } = vi.hoisted(() => {
  const custom = vi.fn().mockResolvedValue(undefined);
  const logger = Object.assign(vi.fn().mockResolvedValue(undefined), {
    custom,
  });
  return { custom, logger, getAnalyticsInstance: vi.fn(() => logger) };
});

vi.mock("@navikt/nav-dekoratoren-moduler", () => ({ getAnalyticsInstance }));

import {
  logCustomEvent,
  logFiltervalg,
  logLastNed,
  logNavigere,
  logNedtrekkslisteValg,
} from "@utils/client/analytics";

describe("analytics", () => {
  beforeEach(() => {
    custom.mockClear();
    logger.mockClear();
  });

  it("creates the analytics instance with the app origin", () => {
    expect(getAnalyticsInstance).toHaveBeenCalledWith("tms-dokumentarkiv");
  });

  describe("logNavigere", () => {
    it("sends flat typed navigere properties", async () => {
      await logNavigere({
        komponent: "Lenke",
        kategori: "Lenkepanel",
        lenketekst: "Saksbehandlingstider",
        destinasjon: "https://www.nav.no/saksbehandlingstider",
      });

      expect(logger).toHaveBeenCalledTimes(1);
      expect(logger).toHaveBeenCalledWith("navigere", {
        lenketekst: "Saksbehandlingstider",
        destinasjon: "https://www.nav.no/saksbehandlingstider",
        komponentId: "Lenke",
        lenkegruppe: "Lenkepanel",
      });
      expect(custom).not.toHaveBeenCalled();
    });

    it("omits lenkegruppe when kategori is empty", async () => {
      await logNavigere({
        komponent: "Lenke",
        kategori: "",
        lenketekst: "Kontakt oss",
        destinasjon: "/kontaktoss",
      });

      expect(logger).toHaveBeenCalledWith("navigere", {
        lenketekst: "Kontakt oss",
        destinasjon: "/kontaktoss",
        komponentId: "Lenke",
      });
    });
  });

  describe("logLastNed", () => {
    it("sends last ned with tittel, type and tema", async () => {
      await logLastNed({
        komponent: "hoveddokument",
        tittel: "Hoveddokument",
        type: "PDF",
        tema: "Dagpenger",
      });

      expect(logger).toHaveBeenCalledWith("last ned", {
        komponentId: "hoveddokument",
        tittel: "Hoveddokument",
        type: "PDF",
        tema: "Dagpenger",
      });
      expect(custom).not.toHaveBeenCalled();
    });

    it("omits tema when not given and includes kontekst", async () => {
      await logLastNed({
        komponent: "Vedleggslenke",
        tittel: "Vedlegg",
        type: "PDF",
        kontekst: "Vedlegg",
      });

      expect(logger).toHaveBeenCalledWith("last ned", {
        komponentId: "Vedleggslenke",
        tittel: "Vedlegg",
        type: "PDF",
        kontekst: "Vedlegg",
      });
    });
  });

  it("sends filtervalg with komponentId and filternavn", async () => {
    await logFiltervalg("AAP");

    expect(logger).toHaveBeenCalledWith("filtervalg", {
      komponentId: "Filter",
      filternavn: "AAP",
    });
  });

  it("sends nedtrekksliste valg endret with the chosen value", async () => {
    await logNedtrekkslisteValg("Sorteringsrekkefolge", "desc");

    expect(logger).toHaveBeenCalledWith("nedtrekksliste valg endret", {
      komponentId: "Sorteringsrekkefolge",
      valgtVerdi: "desc",
    });
  });

  it("sends non-taxonomy interactions on logger.custom with their own name and a flat payload", async () => {
    await logCustomEvent("nedtrekksliste åpnet", {
      komponentId: "Nedtrekksliste",
      kontekst: "Representasjon",
    });

    expect(custom).toHaveBeenCalledTimes(1);
    expect(custom).toHaveBeenCalledWith("nedtrekksliste åpnet", {
      komponentId: "Nedtrekksliste",
      kontekst: "Representasjon",
    });
    expect(logger).not.toHaveBeenCalled();
  });
});
