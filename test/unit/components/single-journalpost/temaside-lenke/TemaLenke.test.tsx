import { text } from "@language/text";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const logNavigere = vi.fn();
vi.mock("@utils/client/analytics", () => ({
  logNavigere: (...args: unknown[]) => logNavigere(...args),
}));

import TemaLenke from "@src/components/single-journalpost/temaside-lenke/TemaLenke";

describe("TemaLenke", () => {
  afterEach(() => {
    logNavigere.mockReset();
  });

  it("should log navigere with the href for a standard tema link", () => {
    render(<TemaLenke lenketekst="Dagpenger" temakode="DAG" language="nb" />);

    const link = screen.getByRole("link", { name: "Dagpenger" });
    fireEvent.click(link);

    expect(logNavigere).toHaveBeenCalledTimes(1);
    expect(logNavigere).toHaveBeenCalledWith({
      komponent: "Lenke",
      kategori: "Temalenke",
      lenketekst: "Dagpenger",
      destinasjon: link.getAttribute("href"),
    });
  });

  it("should not log when a standard tema link has no lenketekst", () => {
    render(<TemaLenke lenketekst={undefined} temakode="DAG" language="nb" />);

    fireEvent.click(document.querySelector("a") as HTMLAnchorElement);

    expect(logNavigere).not.toHaveBeenCalled();
  });

  it.each(["SYK", "SYM"])(
    "should log the generic sykefravær link for %s",
    (temakode) => {
      render(
        <TemaLenke lenketekst="Sykepenger" temakode={temakode} language="nb" />,
      );

      const link = screen.getByRole("link", {
        name: text.sykOgSymLenke["nb"],
      });
      fireEvent.click(link);

      expect(logNavigere).toHaveBeenCalledWith({
        komponent: "Lenke",
        kategori: "Temalenke",
        lenketekst: text.sykOgSymLenke["nb"],
        destinasjon: link.getAttribute("href"),
      });
    },
  );

  it("should log both links for omsorgspenger", () => {
    render(
      <TemaLenke lenketekst="Omsorgspenger" temakode="OMS" language="nb" />,
    );

    const pleiepenger = screen.getByRole("link", {
      name: text.pleiepengerTitle["nb"],
    });
    const kontaktOss = screen.getByRole("link", {
      name: text.temaLenkeOmsKontakteOss["nb"],
    });

    fireEvent.click(pleiepenger);
    expect(logNavigere).toHaveBeenLastCalledWith({
      komponent: "Lenke",
      kategori: "Temalenke",
      lenketekst: text.pleiepengerTitle["nb"],
      destinasjon: pleiepenger.getAttribute("href"),
    });

    fireEvent.click(kontaktOss);
    expect(logNavigere).toHaveBeenLastCalledWith({
      komponent: "Lenke",
      kategori: "Temalenke",
      lenketekst: text.temaLenkeOmsKontakteOss["nb"],
      destinasjon: kontaktOss.getAttribute("href"),
    });
    expect(logNavigere).toHaveBeenCalledTimes(2);
    expect(pleiepenger.getAttribute("href")).not.toBe(
      kontaktOss.getAttribute("href"),
    );
  });
});
