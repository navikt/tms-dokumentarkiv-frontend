import { text } from "@language/text";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const logNavigere = vi.fn();
vi.mock("@utils/client/analytics", () => ({
  logNavigere: (...args: unknown[]) => logNavigere(...args),
}));

import Disclaimer from "@src/components/disclaimers/disclaimer-journalpostliste/Disclaimer";

describe("Disclaimer", () => {
  afterEach(() => {
    logNavigere.mockReset();
  });

  it("should log navigere with the href when the sosialhjelp link is clicked", () => {
    render(<Disclaimer language="nb" showingRepresentantDocuments={false} />);

    const link = screen.getByRole("link", {
      name: text.sosialhjelpLenketekst["nb"],
    });
    fireEvent.click(link);

    expect(logNavigere).toHaveBeenCalledTimes(1);
    expect(logNavigere).toHaveBeenCalledWith({
      komponent: "Lenke",
      kategori: "Sosialhjelp lenke",
      lenketekst: text.sosialhjelpLenketekst["nb"],
      destinasjon: link.getAttribute("href"),
    });
  });

  it("should not render the sosialhjelp link when showing representant documents", () => {
    render(<Disclaimer language="nb" showingRepresentantDocuments={true} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
