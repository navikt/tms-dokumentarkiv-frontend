import { text } from "@language/text";
import {
  getFullmaktForhold,
  getFullmaktInfoUrl,
  hasDigisosContentUrl,
  postUserUrl,
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
  fullmaktsGivere: [
    { navn: "Kari Nordmann", ident: "22222222222", type: "Fullmakt" },
  ],
  verger: [],
};

const vergehaver = { navn: "Per Hansen", ident: "33333333333", type: "Verge" };

const fetchMock = vi.fn();

describe("SelectFullmakt", () => {
  beforeEach(() => {
    swrData[hasDigisosContentUrl] = true;
    fetchMock.mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    logNavigere.mockReset();
    logCustomEvent.mockReset();
    fetchMock.mockReset();
    vi.unstubAllGlobals();
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
      forholdstype: "Fullmakt",
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

  it("should list fullmakter before vergemål with the relation after each name", () => {
    swrData[getFullmaktForhold] = { ...fullmakter, verger: [vergehaver] };

    render(<SelectFullmakt language="nb" />);

    const options = screen.getAllByRole("option").map((o) => o.textContent);

    expect(options).toEqual([
      "Ola Nordmann (Deg)",
      "Kari Nordmann (fullmakt)",
      "Per Hansen (vergemål)",
    ]);
  });

  it("should show the relation in the selected language", () => {
    swrData[getFullmaktForhold] = { ...fullmakter, verger: [vergehaver] };

    const { unmount } = render(<SelectFullmakt language="nn" />);

    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Ola Nordmann (Deg)",
      "Kari Nordmann (fullmakt)",
      "Per Hansen (verjemål)",
    ]);

    unmount();
    render(<SelectFullmakt language="en" />);

    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Ola Nordmann (You)",
      "Kari Nordmann (power of attorney)",
      "Per Hansen (guardianship)",
    ]);
  });

  it("should show the nedtrekksliste without the fullmakt link for a user with only vergemål", () => {
    swrData[getFullmaktForhold] = {
      ...fullmakter,
      fullmaktsGivere: [],
      verger: [vergehaver],
    };

    render(<SelectFullmakt language="nb" />);

    expect(
      screen.getByRole("option", { name: "Per Hansen (vergemål)" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: text.representasjonLenkeTekst["nb"] }),
    ).not.toBeInTheDocument();
  });

  it("should post ident and type when a vergemål is selected", () => {
    swrData[getFullmaktForhold] = { ...fullmakter, verger: [vergehaver] };

    render(<SelectFullmakt language="nb" />);

    const option = screen.getByRole<HTMLOptionElement>("option", {
      name: "Per Hansen (vergemål)",
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: option.value },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(postUserUrl);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      ident: "33333333333",
      type: "Verge",
    });
  });

  it("should post ident and type when a fullmakt is selected", () => {
    swrData[getFullmaktForhold] = fullmakter;

    render(<SelectFullmakt language="nb" />);

    const option = screen.getByRole<HTMLOptionElement>("option", {
      name: "Kari Nordmann (fullmakt)",
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: option.value },
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      ident: "22222222222",
      type: "Fullmakt",
    });
  });

  it("should post only the ident when the user selects themself", () => {
    swrData[getFullmaktForhold] = fullmakter;

    render(<SelectFullmakt language="nb" />);

    const option = screen.getByRole<HTMLOptionElement>("option", {
      name: "Ola Nordmann (Deg)",
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: option.value },
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      ident: "11111111111",
    });
  });

  it("should select the row with the same forholdstype when a person is both fullmaktsgiver and vergehaver", () => {
    swrData[getFullmaktForhold] = {
      ...fullmakter,
      verger: [{ ...vergehaver, navn: "Kari Nordmann", ident: "22222222222" }],
    };
    swrData[getFullmaktInfoUrl] = {
      viserRepresentertesData: true,
      forholdstype: "Verge",
      representertNavn: "Kari Nordmann",
      representertIdent: "22222222222",
    };

    render(<SelectFullmakt language="nb" />);

    expect(
      screen.getByRole<HTMLOptionElement>("option", {
        name: "Kari Nordmann (vergemål)",
      }).selected,
    ).toBe(true);
    expect(
      screen.getByRole<HTMLOptionElement>("option", {
        name: "Kari Nordmann (fullmakt)",
      }).selected,
    ).toBe(false);
  });

  it("should use the repr endpoints", () => {
    expect(getFullmaktForhold).toMatch(/\/mine-saker-api\/repr\/forhold$/);
    expect(getFullmaktInfoUrl).toMatch(/\/mine-saker-api\/repr\/info$/);
    expect(postUserUrl).toMatch(/\/mine-saker-api\/repr\/representert$/);
  });
});
