import {
  getAnalyticsInstance,
  type LastNedProperties,
  type NavigereProperties,
} from "@navikt/nav-dekoratoren-moduler";

const analyticsLogger = getAnalyticsInstance("tms-dokumentarkiv");

type NavigereParams = {
  komponent: string;
  kategori?: string;
  lenketekst: string;
  destinasjon: string;
};

type LastNedParams = {
  komponent: string;
  // Aldri den faktiske dokumenttittelen, den er fritekst og kan inneholde personopplysninger
  tittel: "Hoveddokument" | "Vedlegg";
  type?: string;
  tema?: string;
  kontekst?: string;
};

export const logNavigere = async ({
  komponent,
  kategori,
  lenketekst,
  destinasjon,
}: NavigereParams) => {
  const properties: NavigereProperties = {
    lenketekst,
    destinasjon,
    komponentId: komponent,
  };
  if (kategori) properties.lenkegruppe = kategori;

  await analyticsLogger("navigere", properties);
};

export const logLastNed = async ({
  komponent,
  tittel,
  type,
  tema,
  kontekst,
}: LastNedParams) => {
  const properties: LastNedProperties = { komponentId: komponent, tittel };
  if (type) properties.type = type;
  if (tema) properties.tema = tema;
  if (kontekst) properties.kontekst = kontekst;

  await analyticsLogger("last ned", properties);
};

export const logFiltervalg = async (filternavn: string) => {
  await analyticsLogger("filtervalg", { komponentId: "Filter", filternavn });
};

export const logNedtrekkslisteValg = async (
  komponent: string,
  valgtVerdi: string,
) => {
  await analyticsLogger("nedtrekksliste valg endret", {
    komponentId: komponent,
    valgtVerdi,
  });
};

// Interaksjoner som ikke passer i taksonomien (ingen lenke, ikke et valg)
export const logCustomEvent = async (
  eventName: string,
  eventData: Record<string, unknown>,
) => {
  await analyticsLogger.custom(eventName, eventData);
};
