export type StagingInfo =
  | {
      kind: "pr";
      number: string;
      title: string;
      prUrl: string;
      builtAt: string;
    }
  | { kind: "idle"; builtAt: string };

const unknownTitle = "(ukjent tittel)";

const decodeTitle = (encoded: string) => {
  if (!/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1) {
    return unknownTitle;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(
      Buffer.from(encoded, "base64url"),
    );
  } catch {
    return unknownTitle;
  }
};

export function readStagingInfo(
  env: NodeJS.ProcessEnv = process.env,
): StagingInfo | null {
  if (env.STAGING_SLOT !== "true") {
    return null;
  }

  const builtAt = env.STAGING_BUILT_AT ?? "";

  if (!env.STAGING_PR) {
    return { kind: "idle", builtAt };
  }

  return {
    kind: "pr",
    number: env.STAGING_PR,
    title: decodeTitle(env.STAGING_TITLE ?? ""),
    prUrl: env.STAGING_PR_URL ?? "",
    builtAt,
  };
}
