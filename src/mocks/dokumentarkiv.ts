import type { MockDefinition } from "@navikt/astro-mocks";
import fullmaktsforhold from "./data/fullmaktsforhold.json";
import fullmaktsinfo from "./data/fullmaktsinfo.json";
import journalpost from "./data/journalpost.json";
import journalposterAlle from "./data/journalposterAlle.json";
import representert from "./data/representert.json";

export const mocks: MockDefinition[] = [
  { path: "/login/status", response: { authenticated: true, level: 4, levelOfAssurance: "High" } },
  { path: "/collect", method: "POST", response: "Done" },
  { path: "/mine-saker-api/v2/journalposter/alle", response: journalposterAlle },
  { path: "/mine-saker-api/v2/journalposter/journalpost/:id", response: journalpost },
  { path: "/mine-saker-api/repr/info", response: fullmaktsinfo },
  { path: "/mine-saker-api/repr/forhold", response: fullmaktsforhold },
  { path: "/mine-saker-api/v2/sosialhjelp/har_innsendte", response: true },
  { path: "/mine-saker-api/repr/representert", method: "POST", response: representert },
];
