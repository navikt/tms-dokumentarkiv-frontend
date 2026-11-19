import { requestOboToken } from "@navikt/oasis";
import { isLocal } from "@src/utils/server/environment.ts";
import type { AstroRuntimeLogger } from "astro";

export const getOboToken = async (
  token: string,
  audience: string,
  logger: AstroRuntimeLogger,
): Promise<string> => {
  const oboResult = await requestOboToken(token, audience);

  if (isLocal) {
    return "Fake token";
  }

  if (!oboResult.ok) {
    logger.error("Error getting access token: " + oboResult.error);
    throw new Error("Request oboToken for mine-saker-api failed ");
  }

  return oboResult.token;
};
