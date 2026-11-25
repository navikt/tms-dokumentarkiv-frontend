import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

declare const jsdom: { reconfigure: (settings: { url: string }) => void };

let defaultUrl: string;

beforeAll(() => {
  defaultUrl = window.location.href;
});

afterEach(() => {
  jsdom.reconfigure({ url: defaultUrl });
});

const loadAt = async (url: string) => {
  jsdom.reconfigure({ url });
  vi.resetModules();
  return import("@src/urls.client");
};

describe("urls.client outside staging", () => {
  it("keeps prod on person.nav.no and www.nav.no", async () => {
    const urls = await loadAt("https://www.nav.no/dokumentarkiv/nb");

    expect(urls.mineSakerApiUrl).toBe("https://person.nav.no/mine-saker-api");
    expect(urls.dokumentArkivUrl).toBe("https://www.nav.no/dokumentarkiv");
    expect(urls.baseUrlWithLanguage.nb).toBe(
      "https://www.nav.no/dokumentarkiv/nb",
    );
  });

  it("keeps www on ansatt dev", async () => {
    const urls = await loadAt("https://www.ansatt.dev.nav.no/dokumentarkiv/nb");

    expect(urls.mineSakerApiUrl).toBe(
      "https://www.ansatt.dev.nav.no/mine-saker-api",
    );
    expect(urls.dokumentArkivUrl).toBe(
      "https://www.ansatt.dev.nav.no/dokumentarkiv",
    );
  });

  it("keeps intern dev", async () => {
    const urls = await loadAt("https://www.intern.dev.nav.no/dokumentarkiv");

    expect(urls.mineSakerApiUrl).toBe(
      "https://www.intern.dev.nav.no/mine-saker-api",
    );
  });

  it("keeps localhost", async () => {
    const urls = await loadAt("http://localhost:4321/dokumentarkiv/nb");

    expect(urls.mineSakerApiUrl).toBe("http://localhost:4321/mine-saker-api");
    expect(urls.dokumentArkivUrl).toBe("http://localhost:4321/dokumentarkiv");
  });
});
