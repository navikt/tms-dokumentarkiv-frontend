import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

declare const jsdom: { reconfigure: (settings: { url: string }) => void };

let defaultUrl: string;

beforeAll(() => {
  defaultUrl = window.location.href;
});

afterEach(() => {
  jsdom.reconfigure({ url: defaultUrl });
});

const environmentFor = async (url: string) => {
  jsdom.reconfigure({ url });
  vi.resetModules();
  const { getEnvironmentClientSide } = await import(
    "@src/utils/client/environment"
  );
  return getEnvironmentClientSide();
};

describe("getEnvironmentClientSide on staging hosts", () => {
  it("returns staging on the shared team host", async () => {
    expect(
      await environmentFor(
        "https://min-side-staging.ansatt.dev.nav.no/dokumentarkiv/nb",
      ),
    ).toBe("staging");
  });

  it("returns staging on an app specific ansatt host", async () => {
    expect(
      await environmentFor(
        "https://tms-dokumentarkiv-staging.ansatt.dev.nav.no/dokumentarkiv/nb",
      ),
    ).toBe("staging");
  });
});

describe("getEnvironmentClientSide on other ansatt hosts", () => {
  it("returns ansatt on the www host", async () => {
    expect(
      await environmentFor("https://www.ansatt.dev.nav.no/dokumentarkiv/nb"),
    ).toBe("ansatt");
  });

  it("returns ansatt when the host only ends with the same letters", async () => {
    expect(
      await environmentFor("https://notansatt.dev.nav.no/dokumentarkiv/nb"),
    ).toBe("ansatt");
  });
});
