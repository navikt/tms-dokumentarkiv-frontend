import Disclaimer from "@components/disclaimers/disclaimer-journalpostliste/Disclaimer";
import SkeletonComponent from "@components/loader/skeleton/Skeleton";
import type { Language } from "@language/language";
import { text } from "@language/text";
import { useStore } from "@nanostores/react";
import { BodyShort, Select } from "@navikt/ds-react";
import { getAlleJournalposterUrl } from "@src/urls.client";
import {
  filteredJournalposter,
  isValgtRepresentantAtom,
  isValidatingJournalposterAtom,
  sakstemaFiltersAtom,
  setIsError,
  setJournalposter,
  setSakstemaer,
  setShowFilters,
  setShowVedtakFilter,
  setSortingOrder,
  sortingOrderAtom,
} from "@store/store";
import { logNedtrekkslisteValg } from "@utils/client/analytics";
import { fetcher } from "@utils/client/api";
import { type ChangeEvent, useEffect } from "react";
import useSWRImmutable from "swr/immutable";
import IngenJournalposter from "./ingen-journalposter/IngenJournalposter";
import type { JournalpostProps } from "./JournalpostInterfaces";
import styles from "./Journalpostliste.module.css";
import Journalpost from "./journalpost/Journalpost";

interface Props {
  language: Language;
}

const Journalpostliste = ({ language }: Props) => {
  const {
    data: journalposter,
    isLoading,
    error: getJournalposterError,
  } = useSWRImmutable<JournalpostProps[]>(getAlleJournalposterUrl, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (journalposter) {
      setSakstemaer(journalposter);
      setShowVedtakFilter(journalposter);
    }
  }, [journalposter]);

  useEffect(() => {
    if (journalposter) {
      hasJournalposter && numberOfDocuments > 0
        ? setShowFilters(true)
        : setShowFilters(false);
    }
  }, [journalposter]);

  const isValidating = useStore(isValidatingJournalposterAtom);
  const isValgtRepresentant = useStore(isValgtRepresentantAtom);
  const sakstemaFilters = useStore(sakstemaFiltersAtom);
  const order = useStore(sortingOrderAtom);
  const showContentLoader = isLoading || isValidating;

  if (getJournalposterError) {
    setIsError(true);
    return null;
  }

  if (journalposter) {
    setJournalposter(journalposter);
  }

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortingOrder(event.target.value.toString());
    logNedtrekkslisteValg(
      "Sorteringsrekkefolge",
      event.target.value.toString(),
    );
  };

  const filteredList = filteredJournalposter({
    order,
    sakstemaFilters,
  });

  const numberOfDocuments = journalposter ? journalposter.length : 0;
  const numberOfShownDocuments = filteredList.length;
  const hasJournalposter = journalposter && journalposter?.length > 0;

  return (
    <>
      <div className={styles.container}>
        <div>
          <div className={styles.contentWrapper}>
            {showContentLoader ? (
              <SkeletonComponent />
            ) : hasJournalposter ? (
              <>
                <div className={styles.dokumentlisteInfo}>
                  <BodyShort size="small" className={styles.text}>
                    {numberOfDocuments &&
                      text.viserAntallDokumenter[language](
                        numberOfShownDocuments,
                        numberOfDocuments,
                      )}
                  </BodyShort>
                  <Select
                    label="Sorteringsrekkefølge etter dato"
                    size="small"
                    hideLabel
                    onChange={handleSelectChange}
                  >
                    <option value="asc">
                      {text.sortingOrderAsc[language]}
                    </option>
                    <option value="desc">
                      {text.sortingOrderDesc[language]}
                    </option>
                  </Select>
                </div>
                <ul
                  className={styles.list}
                  key="journalpostliste"
                  id="journalpostliste"
                >
                  {filteredList?.map((journalpost: JournalpostProps) => {
                    return (
                      <Journalpost
                        journalpost={journalpost}
                        language={language}
                        isValgtRepresentant={isValgtRepresentant}
                        key={journalpost.journalpostId}
                      />
                    );
                  })}
                </ul>
              </>
            ) : (
              <IngenJournalposter language={language} />
            )}
          </div>
        </div>
        <Disclaimer
          language={language}
          showingRepresentantDocuments={isValgtRepresentant}
        />
      </div>
    </>
  );
};

export default Journalpostliste;
