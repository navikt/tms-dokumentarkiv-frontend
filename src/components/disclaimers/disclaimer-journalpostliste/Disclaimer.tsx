import type { Language } from "@language/language";
import { text } from "@language/text";
import { BodyLong, Heading } from "@navikt/ds-react";
import { digisosUrl } from "@src/urls.client";
import { logNavigere } from "@utils/client/analytics";
import styles from "./Disclaimer.module.css";

interface Props {
  language: Language;
  showingRepresentantDocuments: boolean;
}

const Disclaimer = ({ language, showingRepresentantDocuments }: Props) => {
  const hideSosialhjelpLenke = showingRepresentantDocuments ? false : true;

  return (
    <div className={styles.container}>
      <Heading level="2" size="small">
        {text.landingssideDisclaimerTittel[language]}
      </Heading>
      <ul className={styles.list}>
        {hideSosialhjelpLenke && (
          <li>
            <BodyLong>
              <a
                href={digisosUrl}
                onClick={() =>
                  logNavigere({
                    komponent: "Lenke",
                    kategori: "Sosialhjelp lenke",
                    lenketekst: text.sosialhjelpLenketekst["nb"],
                    destinasjon: digisosUrl,
                  })
                }
              >
                {text.sosialhjelpLenketekst[language]}
              </a>
            </BodyLong>
          </li>
        )}
        <li>
          <BodyLong>
            {text.landingssideDisclaimerListepunktTo[language]}
          </BodyLong>
        </li>
      </ul>
    </div>
  );
};

export default Disclaimer;
