const isDevelopmentClientSide =
  window.location.href.includes("intern.dev.nav.no");
const isAnsattClientSide = window.location.href.includes("ansatt.dev.nav.no");
const isLocalClientSide = window.location.href.includes("localhost");
const isStagingClientSide =
  window.location.hostname.endsWith(".ansatt.dev.nav.no") &&
  window.location.hostname !== "www.ansatt.dev.nav.no";

export const getEnvironmentClientSide = () => {
  if (isStagingClientSide) {
    return "staging";
  }

  if (isLocalClientSide) {
    return "local";
  }

  if (isDevelopmentClientSide) {
    return "dev";
  }

  if (isAnsattClientSide) {
    return "ansatt";
  }

  return "prod";
};
