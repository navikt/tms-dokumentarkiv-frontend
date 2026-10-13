import { fetcher, NotFoundError, postUser } from "@src/utils/client/api";
import { captureClientException } from "@src/utils/client/observability";
import { redirectToIdPorten } from "@src/utils/client/redirect";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@src/utils/client/observability", () => ({
  captureClientException: vi.fn(),
}));

vi.mock("@src/utils/client/redirect", () => ({
  redirectToIdPorten: vi.fn(),
}));

describe("client API telemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not report expected document-not-found responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 }),
    );

    await expect(fetcher("/api/documents/123")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(captureClientException).not.toHaveBeenCalled();
  });

  it("should report handled GET failures without including the URL", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    await expect(fetcher("/api/documents/123")).rejects.toThrow(
      "Get request failed",
    );
    expect(captureClientException).toHaveBeenCalledWith(
      expect.any(Error),
      "fetch-api-data",
      500,
    );
  });

  it("should report network failures handled by SWR", async () => {
    const error = new TypeError("Failed to fetch");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(error);

    await expect(fetcher("/api/documents/123")).rejects.toBe(error);
    expect(captureClientException).toHaveBeenCalledWith(
      error,
      "fetch-api-data",
    );
  });

  it("should redirect without reporting an expected authentication response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    await postUser({ ident: "12345678901" });

    expect(redirectToIdPorten).toHaveBeenCalledOnce();
    expect(captureClientException).not.toHaveBeenCalled();
  });

  it("should report a failed represented-user selection without the ident", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    await postUser({ ident: "12345678901" });

    expect(captureClientException).toHaveBeenCalledWith(
      expect.any(Error),
      "select-represented-user",
      500,
    );
  });
});
