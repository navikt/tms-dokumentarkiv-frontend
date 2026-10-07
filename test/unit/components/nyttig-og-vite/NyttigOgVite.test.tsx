import { text } from "@language/text";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const logNavigere = vi.fn();
vi.mock("@utils/client/analytics", () => ({
  logNavigere: (...args: unknown[]) => logNavigere(...args),
}));

import NyttigOgVite from "@src/components/nyttig-og-vite/NyttigOgVite";

describe("NyttigOgVite", () => {
  afterEach(() => {
    logNavigere.mockReset();
  });

  it.each([
    ["lenke1", text.lenke1["nb"]],
    ["lenke2", text.lenke2["nb"]],
    ["lenke3", text.lenke3["nb"]],
  ])(
    "should log navigere with the href when %s is clicked",
    (_key, lenketekst) => {
      render(<NyttigOgVite language="nb" />);

      const link = screen.getByRole("link", { name: lenketekst });
      fireEvent.click(link);

      expect(logNavigere).toHaveBeenCalledTimes(1);
      expect(logNavigere).toHaveBeenCalledWith({
        komponent: "Lenke",
        kategori: "Lenkepanel",
        lenketekst,
        destinasjon: link.getAttribute("href"),
      });
    },
  );

  it("should log the bokmål lenketekst even when the page is in English", () => {
    render(<NyttigOgVite language="en" />);

    const link = screen.getByRole("link", { name: text.lenke1["en"] });
    fireEvent.click(link);

    expect(logNavigere).toHaveBeenCalledWith(
      expect.objectContaining({
        lenketekst: text.lenke1["nb"],
        destinasjon: link.getAttribute("href"),
      }),
    );
  });
});
