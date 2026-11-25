import StagingBanner from "@src/components/staging/StagingBanner";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const bannerText = (container: HTMLElement) =>
  container.querySelector(".aksel-alert__wrapper")?.textContent;

describe("StagingBanner", () => {
  it("renders nothing for null", () => {
    const { container } = render(<StagingBanner info={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the pr, title and build time with the number linking to the pr", () => {
    const { container } = render(
      <StagingBanner
        info={{
          kind: "pr",
          number: "180",
          title: "Vis vergemål i nedtrekkslisten",
          prUrl: "https://github.com/navikt/x/pull/180",
          builtAt: "2026-11-25T13:02:00Z",
        }}
      />,
    );

    expect(bannerText(container)).toBe(
      "Staging · til test: «Vis vergemål i nedtrekkslisten» (#180) · oppdatert 25.11 kl. 14:02",
    );
    expect(screen.getByRole("link", { name: "#180" })).toHaveAttribute(
      "href",
      "https://github.com/navikt/x/pull/180",
    );
  });

  it("shows the idle text with the build time", () => {
    const { container } = render(
      <StagingBanner info={{ kind: "idle", builtAt: "2026-11-25T14:30:00Z" }} />,
    );

    expect(bannerText(container)).toBe(
      "Staging · ingen sak til test nå · viser main per 25.11 kl. 15:30",
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders as a small full width info alert", () => {
    const { container } = render(
      <StagingBanner info={{ kind: "idle", builtAt: "2026-11-25T14:30:00Z" }} />,
    );
    const alert = container.firstElementChild;

    expect(alert).toHaveAttribute("data-variant", "info");
    expect(alert).toHaveClass("aksel-alert--small", "aksel-alert--full-width");
  });

  it("leaves out the time when builtAt is missing or not a date", () => {
    for (const builtAt of ["", "garbage"]) {
      const pr = render(
        <StagingBanner
          info={{
            kind: "pr",
            number: "180",
            title: "Vis vergemål i nedtrekkslisten",
            prUrl: "https://github.com/navikt/x/pull/180",
            builtAt,
          }}
        />,
      );
      expect(bannerText(pr.container)).toBe(
        "Staging · til test: «Vis vergemål i nedtrekkslisten» (#180)",
      );

      const idle = render(<StagingBanner info={{ kind: "idle", builtAt }} />);
      expect(bannerText(idle.container)).toBe(
        "Staging · ingen sak til test nå · viser main",
      );
    }
  });

  it("shows a 24-hour time even where the locale data defaults to a 12-hour clock", async () => {
    const RealDateTimeFormat = Intl.DateTimeFormat;
    const spy = vi
      .spyOn(Intl, "DateTimeFormat")
      .mockImplementation(function (_locales, options) {
        return new RealDateTimeFormat("en-US", options);
      });
    try {
      vi.resetModules();
      const { default: Banner } = await import(
        "@src/components/staging/StagingBanner"
      );
      const { container } = render(
        <Banner info={{ kind: "idle", builtAt: "2026-11-25T13:02:00Z" }} />,
      );
      expect(bannerText(container)).toContain("per 25.11 kl. 14:02");
    } finally {
      spy.mockRestore();
      vi.resetModules();
    }
  });

  it("shows Oslo time around midnight", () => {
    const { container } = render(
      <StagingBanner info={{ kind: "idle", builtAt: "2026-11-25T23:30:00Z" }} />,
    );
    expect(bannerText(container)).toContain("per 26.11 kl. 00:30");

    const summer = render(
      <StagingBanner info={{ kind: "idle", builtAt: "2026-07-01T22:15:00Z" }} />,
    );
    expect(bannerText(summer.container)).toContain("per 02.07 kl. 00:15");
  });

  it("renders the shared vector title as text, with no <b> element", () => {
    const { container } = render(
      <StagingBanner
        info={{
          kind: "pr",
          number: "180",
          title: 'Vergemål: <b>æøå</b> & "test"',
          prUrl: "https://github.com/navikt/x/pull/180",
          builtAt: "2026-11-25T13:02:00Z",
        }}
      />,
    );

    expect(container.querySelector("b")).toBeNull();
    expect(bannerText(container)).toContain('«Vergemål: <b>æøå</b> & "test"»');
  });
});
