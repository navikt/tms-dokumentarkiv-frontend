import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

const loadUrls = async () => {
  vi.resetModules();
  return import("@src/urls");
};

describe("urls without STAGING_ORIGIN", () => {
  it("keeps dev on the ansatt host", async () => {
    vi.stubEnv("NAIS_CLUSTER_NAME", "dev-gcp");
    vi.stubEnv("STAGING_ORIGIN", "");

    const urls = await loadUrls();

    expect(urls.baseUrl).toBe("https://www.ansatt.dev.nav.no/dokumentarkiv");
    expect(urls.baseUrlWithLanguage.nb).toBe(
      "https://www.ansatt.dev.nav.no/dokumentarkiv/nb",
    );
  });

  it("keeps prod on www.nav.no", async () => {
    vi.stubEnv("NAIS_CLUSTER_NAME", "prod-gcp");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STAGING_ORIGIN", "");

    const urls = await loadUrls();

    expect(urls.baseUrl).toBe("https://www.nav.no/dokumentarkiv");
  });
});
