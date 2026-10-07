import type { Language } from "@language/language";
import { ChevronRightIcon } from "@navikt/aksel-icons";
import { BodyShort, Tag } from "@navikt/ds-react";
import { baseUrlWithLanguage } from "@src/urls.client";
import { logNavigere } from "@utils/client/analytics";
import { setAvsenderMottaker } from "@utils/client/setAvsenderMottaker";
import { format } from "date-fns";
import type { JournalpostProps } from "../JournalpostInterfaces";
import styles from "./Journalpost.module.css";

interface Props {
  journalpost: JournalpostProps;
  language: Language;
  isValgtRepresentant: boolean;
}

const Journalpost = ({ journalpost, language, isValgtRepresentant }: Props) => {
  const dato = format(new Date(journalpost.opprettet), "dd.MM.yyyy");
  const avsenderText = setAvsenderMottaker(journalpost);
  const hideAvsenderText = avsenderText === null;
  const url = isValgtRepresentant
    ? `${baseUrlWithLanguage[language]}/tema/${journalpost.temakode}/${journalpost.journalpostId}?fullmakt=true`
    : `${baseUrlWithLanguage[language]}/tema/${journalpost.temakode}/${journalpost.journalpostId}`;

  return (
    <li className={styles.container} key={journalpost.journalpostId}>
      <article className={styles.wrapper}>
        <div>
          <BodyShort size="small">
            {hideAvsenderText ? dato : dato + " - " + avsenderText}
          </BodyShort>
          <a
            className={styles.link}
            href={url}
            lang="nb"
            onClick={() =>
              logNavigere({
                komponent: "Journalpostlenke",
                kategori: journalpost.temanavn,
                lenketekst: "Journalpost",
                destinasjon: url,
              })
            }
          >
            <BodyShort
              size="medium"
              weight="semibold"
              className={styles.linkText}
            >
              {journalpost.tittel}
            </BodyShort>
          </a>
          <Tag
            variant="moderate"
            data-color="neutral"
            className={styles.tag}
            lang="nb"
          >
            {journalpost.temanavn}
          </Tag>
        </div>
        <div className={styles.chevron}>
          <ChevronRightIcon fontSize="1.25rem" aria-hidden="true" />
        </div>
      </article>
    </li>
  );
};

export default Journalpost;
