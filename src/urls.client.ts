import { getEnvironmentClientSide } from "@utils/client/environment";

const MINE_SAKER_API_URL = {
  local: "http://localhost:4321/mine-saker-api",
  dev: "https://www.intern.dev.nav.no/mine-saker-api",
  ansatt: "https://www.ansatt.dev.nav.no/mine-saker-api",
  staging: "https://www.ansatt.dev.nav.no/mine-saker-api",
  prod: "https://person.nav.no/mine-saker-api",
};

const BASE_URL = {
  local: "http://localhost:4321",
  dev: "https://www.intern.dev.nav.no",
  ansatt: "https://www.ansatt.dev.nav.no",
  staging: "https://www.ansatt.dev.nav.no",
  prod: "https://www.nav.no",
};

const BASE_URL_INTERN = {
  local: "http://localhost:4321",
  dev: "https://www.intern.dev.nav.no",
  ansatt: "https://www.intern.dev.nav.no",
  staging: "https://www.intern.dev.nav.no",
  prod: "https://www.intern.nav.no",
};

const DIGISOS_URL = {
  local: "http://localhost:4321/sosialhjelp/innsyn",
  dev: "https://www-q0.dev.nav.no/sosialhjelp/innsyn/",
  ansatt: "https://www-q0.dev.nav.no/sosialhjelp/innsyn/",
  staging: "https://www-q0.dev.nav.no/sosialhjelp/innsyn/",
  prod: "https://www.nav.no/sosialhjelp/innsyn/",
};

const appBaseUrl =
  getEnvironmentClientSide() === "staging"
    ? window.location.origin
    : BASE_URL[getEnvironmentClientSide()];

export const mineSakerApiUrl = MINE_SAKER_API_URL[getEnvironmentClientSide()];
export const authenticationUrl = `${MINE_SAKER_API_URL[getEnvironmentClientSide()]}/login/status`;
export const getSakstemaerUrl = `${MINE_SAKER_API_URL[getEnvironmentClientSide()]}/sakstemaer`;
export const dokumentUrl = `${MINE_SAKER_API_URL[getEnvironmentClientSide()]}/dokument`;
export const getFullmaktForhold = `${MINE_SAKER_API_URL[getEnvironmentClientSide()]}/repr/forhold`;
export const postUserUrl = `${MINE_SAKER_API_URL[getEnvironmentClientSide()]}/repr/representert`;
export const getFullmaktInfoUrl = `${MINE_SAKER_API_URL[getEnvironmentClientSide()]}/repr/info`;
export const hasDigisosContentUrl = `${MINE_SAKER_API_URL[getEnvironmentClientSide()]}/v2/sosialhjelp/har_innsendte`;

export const baseUrl = BASE_URL[getEnvironmentClientSide()];
export const internBaseUrl = BASE_URL_INTERN[getEnvironmentClientSide()];
export const minSideUrl = `${BASE_URL[getEnvironmentClientSide()]}/minside`;
export const dokumentArkivUrl = `${appBaseUrl}/dokumentarkiv`;
export const pdlFullmaktUrl = `${BASE_URL[getEnvironmentClientSide()]}/person/pdl-fullmakt-ui/`;
export const digisosUrl = DIGISOS_URL[getEnvironmentClientSide()];
export const kontaktOssUrl = `${BASE_URL[getEnvironmentClientSide()]}/kontaktoss`;

export const getJournalposterUrl = (tema: string) =>
  `${MINE_SAKER_API_URL[getEnvironmentClientSide()]}/v2/sakstema/${tema}/journalposter`;
export const getAlleJournalposterUrl = `${MINE_SAKER_API_URL[getEnvironmentClientSide()]}/v2/journalposter/alle`;
export const getJournalpostUrl = (journalpostId: string) =>
  `${MINE_SAKER_API_URL[getEnvironmentClientSide()]}/v2/journalposter/journalpost/${journalpostId}`;

export const baseUrlWithLanguage = {
  nb: `${appBaseUrl}/dokumentarkiv/nb`,
  en: `${appBaseUrl}/dokumentarkiv/en`,
  nn: `${appBaseUrl}/dokumentarkiv/nn`,
};

export const minSideUrlWithLanguage = {
  nb: minSideUrl,
  en: `${minSideUrl}/en`,
  nn: `${minSideUrl}/nn`,
};
