import { text } from "@language/text";
import {
  getFullmaktForhold,
  getFullmaktInfoUrl,
  hasDigisosContentUrl,
} from "@src/urls.client";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const logNavigere = vi.fn();
const logCustomEvent = vi.fn();
vi.mock("@utils/client/analytics", () => ({
  logNavigere: (...args: unknown[]) => logNavigere(...args),
  logCustomEvent: (...args: unknown[]) => logCustomEvent(...args),
}));

const swrData: Record<string, unknown> = {};
vi.mock("swr", () => ({
  default: (key: string) => ({
    data: swrData[key],
    error: undefined,
    isValidating: false,
    mutate: vi.fn(),
  }),
}));
vi.mock("swr/immutable", () => ({
  default: (key: string) => ({
    data: swrData[key],
    error: undefined,
    isLoading: false,
  }),
}));

import SelectFullmakt from "@src/components/representasjon/SelectFullmakt";

const fullmakter = {
  navn: "Ola Nordmann",
  ident: "11111111111",
  fullmaktsGivere: [{ navn: "Kari Nordmann", ident: "22222222222" }],
};

describe("SelectFullmakt", () => {
  beforeEach(() => {
    swrData[hasDigisosContentUrl] = true;
  });

  afterEach(() => {
    logNavigere.mockReset();
    logCustomEvent.mockReset();
    for (const key of Object.keys(swrData)) delete swrData[key];
  });

  it("should log navigere with the href for the sosialhjelp link without fullmakter", () => {
    swrData[getFullmaktForhold] = { ...fullmakter, fullmaktsGivere: [] };

    render(<SelectFullmakt language="nb" />);

    const link = screen.getByRole("link", {
      name: text.sosialhjelpLenketekst["nb"],
    });
    fireEvent.click(link);

    expect(logNavigere).toHaveBeenCalledTimes(1);
    expect(logNavigere).toHaveBeenCalledWith({
      komponent: "Lenke",
      kategori: "Sosialhjelp ingress",
      lenketekst: text.sosialhjelpLenketekst["nb"],
      destinasjon: link.getAttribute("href"),
    });
  });

  it("should log navigere with the href for the pdl fullmakt link", () => {
    swrData[getFullmaktForhold] = fullmakter;

    render(<SelectFullmakt language="nb" />);

    const link = screen.getByRole("link", {
      name: text.representasjonLenkeTekst["nb"],
    });
    fireEvent.click(link);

    expect(logNavigere).toHaveBeenCalledTimes(1);
    expect(logNavigere).toHaveBeenCalledWith({
      komponent: "Lenke",
      kategori: "Digital fullmakt innsynslenke",
      lenketekst: text.representasjonLenkeTekst["nb"],
      destinasjon: link.getAttribute("href"),
    });
  });

  it("should log navigere with the href for the sosialhjelp link when viewing a representert", () => {
    swrData[getFullmaktForhold] = fullmakter;
    swrData[getFullmaktInfoUrl] = {
      viserRepresentertesData: true,
      representertNavn: "Kari Nordmann",
      representertIdent: "22222222222",
    };

    render(<SelectFullmakt language="nb" />);

    const link = screen.getByRole("link", {
      name: text.sosialhjelpLenketekst["nb"],
    });
    fireEvent.click(link);

    expect(logNavigere).toHaveBeenCalledWith({
      komponent: "Lenke",
      kategori: "Sosialhjelp ingress",
      lenketekst: text.sosialhjelpLenketekst["nb"],
      destinasjon: link.getAttribute("href"),
    });
  });

  it("should log a flat nedtrekksliste åpnet event without fnr or names", () => {
    swrData[getFullmaktForhold] = fullmakter;

    render(<SelectFullmakt language="nb" />);

    fireEvent.click(screen.getByRole("combobox"));

    expect(logCustomEvent).toHaveBeenCalledTimes(1);
    expect(logCustomEvent).toHaveBeenCalledWith("nedtrekksliste åpnet", {
      komponentId: "Nedtrekksliste",
      kontekst: "Representasjon",
    });
    expect(JSON.stringify(logCustomEvent.mock.calls)).not.toMatch(
      /11111111111|22222222222|Nordmann/,
    );
  });
});
