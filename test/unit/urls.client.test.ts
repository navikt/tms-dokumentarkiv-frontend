import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

declare const jsdom: { reconfigure: (settings: { url: string }) => void };

const STAGING_URL =
  "https://min-side-staging.ansatt.dev.nav.no/dokumentarkiv/nb";
let defaultUrl: string;

beforeAll(() => {
  defaultUrl = window.location.href;
});

afterEach(() => {
  jsdom.reconfigure({ url: defaultUrl });
});

const loadOnStaging = async () => {
  jsdom.reconfigure({ url: STAGING_URL });
  vi.resetModules();
  const urls = await import("@src/urls.client");
  const lenker = await import(
    "@src/components/single-journalpost/temaside-lenke/Lenker"
  );
  return { urls, lenker };
};

const loadOnAnsatt = async () => {
  jsdom.reconfigure({ url: "https://www.ansatt.dev.nav.no/dokumentarkiv/nb" });
  vi.resetModules();
  return import("@src/components/single-journalpost/temaside-lenke/Lenker");
};

describe("urls.client on staging", () => {
  it("calls the API on the page's own host", async () => {
    const { urls } = await loadOnStaging();

    expect(urls.mineSakerApiUrl).toBe(
      "https://www.ansatt.dev.nav.no/mine-saker-api",
    );
    expect(urls.getSakstemaerUrl).toBe(
      "https://www.ansatt.dev.nav.no/mine-saker-api/sakstemaer",
    );
  });

  it("links to itself on the page's own host", async () => {
    const { urls } = await loadOnStaging();

    expect(urls.dokumentArkivUrl).toBe(
      "https://min-side-staging.ansatt.dev.nav.no/dokumentarkiv",
    );
    expect(urls.baseUrlWithLanguage.nb).toBe(
      "https://min-side-staging.ansatt.dev.nav.no/dokumentarkiv/nb",
    );
    expect(urls.baseUrlWithLanguage.en).toBe(
      "https://min-side-staging.ansatt.dev.nav.no/dokumentarkiv/en",
    );
  });

  it("links to other apps on dev", async () => {
    const { urls } = await loadOnStaging();

    expect(urls.minSideUrl).toBe("https://www.ansatt.dev.nav.no/minside");
    expect(urls.kontaktOssUrl).toBe("https://www.ansatt.dev.nav.no/kontaktoss");
    expect(urls.digisosUrl).toBe("https://www-q0.dev.nav.no/sosialhjelp/innsyn/");
    expect(urls.internBaseUrl).toBe("https://www.intern.dev.nav.no");
  });

  it("gives the topic links the same values as on the ansatt host", async () => {
    const { lenker } = await loadOnStaging();
    const onAnsatt = await loadOnAnsatt();

    expect(lenker.lenker).toEqual(onAnsatt.lenker);
    expect(lenker.uforetrygdUrl).toBe(onAnsatt.uforetrygdUrl);
    expect(lenker.omsorgspengerKontaktOssUrl).toBe(
      "https://www.ansatt.dev.nav.no/kontaktoss",
    );
  });
});
