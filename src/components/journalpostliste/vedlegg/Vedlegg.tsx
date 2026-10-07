import type { Language } from "@language/language";
import { text } from "@language/text";
import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Detail } from "@navikt/ds-react";
import { dokumentUrl } from "@src/urls.client";
import { logLastNed } from "@utils/client/analytics";
import { readableFileSize } from "@utils/readableFilesize";
import { useState } from "react";
import type { DokumentProps } from "../JournalpostInterfaces";
import styles from "./Vedlegg.module.css";

interface Props {
  vedleggsListe: DokumentProps[];
  journalpostId: string;
  language: Language;
}

interface VedleggslenkeProps {
  url: string;
  tittel: string;
  filtype: string;
  filstorrelse: number;
  brukerHarTilgang: boolean;
}

const Vedlegg = ({ vedleggsListe, journalpostId, language }: Props) => {
  const [hideVedlegg, setHideVedlegg] = useState(true);
  const antallVedlegg = vedleggsListe.length;
  const hasVedlegg = antallVedlegg > 0;
  const grupperVedlegg = antallVedlegg > 4;
  const baseUrl = `${dokumentUrl}/${journalpostId}`;

  const handleOnClick = () => {
    setHideVedlegg(!hideVedlegg);
  };

  const VedleggsLenke = ({
    url,
    tittel,
    brukerHarTilgang,
    filtype,
    filstorrelse,
  }: VedleggslenkeProps) => {
    const tittelMedPdfTag = tittel + ".pdf";

    return brukerHarTilgang ? (
      <>
        <a
          href={url}
          className={styles.vedlegg}
          onClick={() =>
            logLastNed({
              komponent: "Vedleggslenke",
              tittel: "Vedlegg",
              type: filtype,
              kontekst: "Vedlegg",
            })
          }
        >
          {tittelMedPdfTag}
        </a>
        <Detail>{readableFileSize(filstorrelse)}</Detail>
      </>
    ) : (
      <>
        <div className={styles.vedleggIngenTilgang}>
          {tittelMedPdfTag + text.vedleggKanIkkeVises[language]}
        </div>
        <Detail>{readableFileSize(filstorrelse)}</Detail>
      </>
    );
  };

  if (!hasVedlegg) {
    return null;
  }

  if (grupperVedlegg) {
    return (
      <div className={styles.veddleggsListe}>
        <BodyShort className={styles.tittel}>
          {text.antallVedlegg[language](antallVedlegg)}
        </BodyShort>
        <Button
          className={styles.btn}
          variant="secondary"
          data-color="neutral"
          size="xsmall"
          icon={
            hideVedlegg ? (
              <ChevronDownIcon fontSize="1.5rem" aria-hidden />
            ) : (
              <ChevronUpIcon fontSize="1.5rem" aria-hidden />
            )
          }
          onClick={() => handleOnClick()}
        >
          {hideVedlegg
            ? text.visVedlegg[language]
            : text.skjulVedlegg[language]}
        </Button>
        <div className={hideVedlegg ? styles.visuallyHidden : undefined}>
          {vedleggsListe.map((vedlegg: DokumentProps) => (
            <VedleggsLenke
              url={`${baseUrl}/${vedlegg.dokumentInfoId}`}
              tittel={vedlegg.tittel}
              brukerHarTilgang={vedlegg.brukerHarTilgang}
              filtype={vedlegg.filtype}
              filstorrelse={vedlegg.filstorrelse}
              key={vedlegg.dokumentInfoId}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.veddleggsListe}>
      <BodyShort className={styles.tittel}>
        {text.antallVedlegg[language](antallVedlegg)}
      </BodyShort>
      {vedleggsListe.map((vedlegg: DokumentProps) => (
        <VedleggsLenke
          url={`${baseUrl}/${vedlegg.dokumentInfoId}`}
          tittel={vedlegg.tittel}
          brukerHarTilgang={vedlegg.brukerHarTilgang}
          filtype={vedlegg.filtype}
          filstorrelse={vedlegg.filstorrelse}
          key={vedlegg.dokumentInfoId}
        />
      ))}
    </div>
  );
};

export default Vedlegg;
