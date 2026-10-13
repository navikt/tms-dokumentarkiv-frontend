import { captureException, init } from "@nais/apm";
import {
  captureClientException,
  initializeObservability,
  redactTelemetryIdentifiers,
} from "@src/utils/client/observability";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@nais/apm", () => ({
  captureException: vi.fn(),
  init: vi.fn(),
}));

describe("client observability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize Nais APM with privacy-safe telemetry settings", () => {
    initializeObservability();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        app: "tms-dokumentarkiv",
        namespace: "min-side",
        tracing: true,
        sessionReplay: { enabled: false },
        screenshotOnError: false,
        beforeSend: expect.any(Function),
      }),
    );
  });

  it("should capture client failures with stable low-cardinality context", () => {
    const error = new Error("Get request failed");

    captureClientException(error, "fetch-api-data", 500);

    expect(captureException).toHaveBeenCalledWith(error, {
      fingerprint: "fetch-api-data-failed",
      context: {
        operation: "fetch-api-data",
        status: 500,
      },
    });
  });

  it("should redact document identifiers from telemetry URLs", () => {
    const telemetryItem = {
      page: {
        url: "https://www.nav.no/dokumentarkiv/nb/tema/BAR/123456789?fullmakt=true",
      },
      spans: [
        {
          url: "https://person.nav.no/mine-saker-api/v2/journalposter/journalpost/123456789",
        },
        {
          url: "https://person.nav.no/mine-saker-api/dokument/123456789/987654321",
        },
      ],
    };

    redactTelemetryIdentifiers(telemetryItem);

    expect(telemetryItem).toEqual({
      page: {
        url: "https://www.nav.no/dokumentarkiv/nb/tema/BAR/[journalpost-id]?fullmakt=true",
      },
      spans: [
        {
          url: "https://person.nav.no/mine-saker-api/v2/journalposter/journalpost/[journalpost-id]",
        },
        {
          url: "https://person.nav.no/mine-saker-api/dokument/[journalpost-id]/[document-info-id]",
        },
      ],
    });
  });
});
