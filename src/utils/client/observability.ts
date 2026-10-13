import { captureException, init } from "@nais/apm";

export type ClientOperation = "fetch-api-data" | "select-represented-user";

const sensitivePathSegments = [
  {
    pattern: /(\/v2\/journalposter\/journalpost\/)[^/?#]+/g,
    replacement: "$1[journalpost-id]",
  },
  {
    pattern: /(\/mine-saker-api\/dokument\/)[^/?#]+\/[^/?#]+/g,
    replacement: "$1[journalpost-id]/[document-info-id]",
  },
  {
    pattern: /(\/dokumentarkiv\/(?:nb|nn|en)\/tema\/[^/]+\/)[^/?#]+/g,
    replacement: "$1[journalpost-id]",
  },
];

const redactSensitivePaths = (value: string) =>
  sensitivePathSegments.reduce(
    (redacted, { pattern, replacement }) =>
      redacted.replace(pattern, replacement),
    value,
  );

export const redactTelemetryIdentifiers = (value: unknown): void => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === "string") {
        value[index] = redactSensitivePaths(item);
      } else {
        redactTelemetryIdentifiers(item);
      }
    });
    return;
  }

  if (value === null || typeof value !== "object") {
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") {
      Reflect.set(value, key, redactSensitivePaths(item));
    } else {
      redactTelemetryIdentifiers(item);
    }
  }
};

export const initializeObservability = () =>
  init({
    app: "tms-dokumentarkiv",
    namespace: "min-side",
    tracing: true,
    sessionReplay: { enabled: false },
    screenshotOnError: false,
    beforeSend: (item) => {
      redactTelemetryIdentifiers(item);
      return item;
    },
  });

export const captureClientException = (
  error: unknown,
  operation: ClientOperation,
  status?: number,
) => {
  captureException(error, {
    fingerprint: `${operation}-failed`,
    context: {
      operation,
      ...(status === undefined ? {} : { status }),
    },
  });
};
