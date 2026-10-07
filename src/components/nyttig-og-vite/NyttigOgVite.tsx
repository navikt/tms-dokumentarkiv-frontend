import type { Language } from "@language/language";
import { Heading } from "@navikt/ds-react";
import {
  kontaktOssUrl,
  saksbehandlingstiderUrl,
  tilbakemeldingerUrl,
} from "@src/urls";
import { text } from "../../language/text";
import { logNavigere } from "../../utils/client/analytics";
import styles from "./NyttigOgVite.module.css";

const NyttigOgVite = ({ language }: { language: Language }) => {
  return (
    <div className={styles.container}>
      <Heading level="2" size="small" className={styles.heading}>
        {text.nyttigOgVite[language]}
      </Heading>
      <a
        href={saksbehandlingstiderUrl}
        className={styles.lenke}
        onClick={() =>
          logNavigere({
            komponent: "Lenke",
            kategori: "Lenkepanel",
            lenketekst: text.lenke1["nb"],
            destinasjon: saksbehandlingstiderUrl,
          })
        }
      >
        {text.lenke1[language]}
      </a>
      <a
        href={tilbakemeldingerUrl}
        className={styles.lenke}
        onClick={() =>
          logNavigere({
            komponent: "Lenke",
            kategori: "Lenkepanel",
            lenketekst: text.lenke2["nb"],
            destinasjon: tilbakemeldingerUrl,
          })
        }
      >
        {text.lenke2[language]}
      </a>
      <a
        href={kontaktOssUrl}
        className={styles.lenke}
        onClick={() =>
          logNavigere({
            komponent: "Lenke",
            kategori: "Lenkepanel",
            lenketekst: text.lenke3["nb"],
            destinasjon: kontaktOssUrl,
          })
        }
      >
        {text.lenke3[language]}
      </a>
    </div>
  );
};

export default NyttigOgVite;
