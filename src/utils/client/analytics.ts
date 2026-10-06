import { getAnalyticsInstance } from "@navikt/nav-dekoratoren-moduler";

type NavigereEvent = {
  origin: string;
  eventName: "navigere";
  eventData: { komponent: string; kategori: string; lenketekst?: string };
};

const analyticsLogger = getAnalyticsInstance("tms-dokumentarkiv");

export const logEvent = async (
  komponent: string,
  kategori: string,
  lenketekst?: string,
) => {
  const event: NavigereEvent = {
    origin: "tms-dokumentarkiv",
    eventName: "navigere",
    eventData: {
      komponent: komponent,
      kategori: kategori,
      lenketekst: lenketekst,
    },
  };

  await analyticsLogger.custom("navigere", event);
};
