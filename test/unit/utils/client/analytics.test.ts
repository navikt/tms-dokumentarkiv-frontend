import { beforeEach, describe, expect, it, vi } from "vitest";

const { custom, logger, getAnalyticsInstance } = vi.hoisted(() => {
  const custom = vi.fn().mockResolvedValue(undefined);
  const logger = Object.assign(vi.fn().mockResolvedValue(undefined), {
    custom,
  });
  return { custom, logger, getAnalyticsInstance: vi.fn(() => logger) };
});

vi.mock("@navikt/nav-dekoratoren-moduler", () => ({ getAnalyticsInstance }));

import { logEvent } from "@utils/client/analytics";

describe("logEvent", () => {
  beforeEach(() => {
    custom.mockClear();
    logger.mockClear();
  });

  it("creates the analytics instance with the app origin", () => {
    expect(getAnalyticsInstance).toHaveBeenCalledWith("tms-dokumentarkiv");
  });

  it("sends the navigere event through logger.custom", async () => {
    await logEvent("journalpost", "lenke til dokument", "Se dokument");

    expect(custom).toHaveBeenCalledTimes(1);
    expect(custom).toHaveBeenCalledWith("navigere", {
      origin: "tms-dokumentarkiv",
      eventName: "navigere",
      eventData: {
        komponent: "journalpost",
        kategori: "lenke til dokument",
        lenketekst: "Se dokument",
      },
    });
    expect(logger).not.toHaveBeenCalled();
  });

  it("keeps lenketekst undefined when it is not given", async () => {
    await logEvent("filter", "filtrer");

    expect(custom).toHaveBeenCalledWith("navigere", {
      origin: "tms-dokumentarkiv",
      eventName: "navigere",
      eventData: {
        komponent: "filter",
        kategori: "filtrer",
        lenketekst: undefined,
      },
    });
  });
});
