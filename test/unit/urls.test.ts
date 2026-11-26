import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

const loadUrls = async () => {
  vi.resetModules();
  return import("@src/urls");
};

describe("urls with STAGING_ORIGIN", () => {
  it("uses the staging origin for its own links", async () => {
    vi.stubEnv("NAIS_CLUSTER_NAME", "dev-gcp");
    vi.stubEnv("STAGING_ORIGIN", "https://min-side-staging.ansatt.dev.nav.no");

    const urls = await loadUrls();

    expect(urls.baseUrl).toBe(
      "https://min-side-staging.ansatt.dev.nav.no/dokumentarkiv",
    );
    expect(urls.baseUrlWithLanguage.nb).toBe(
      "https://min-side-staging.ansatt.dev.nav.no/dokumentarkiv/nb",
    );
  });

  it("keeps links to other apps on dev", async () => {
    vi.stubEnv("NAIS_CLUSTER_NAME", "dev-gcp");
    vi.stubEnv("STAGING_ORIGIN", "https://min-side-staging.ansatt.dev.nav.no");

    const urls = await loadUrls();

    expect(urls.minSideUrl).toBe("https://www.ansatt.dev.nav.no/minside");
  });
});
