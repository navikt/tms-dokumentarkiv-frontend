import type { Language } from "@language/language";
import { text } from "@language/text";
import { useStore } from "@nanostores/react";
import { Chips, Label } from "@navikt/ds-react";
import {
  sakstemaerAtom,
  setSakstemaFilters,
  showFiltersAtom,
  showVedtakFilterAtom,
} from "@store/store";
import { logFiltervalg } from "@utils/client/analytics";
import { useEffect, useState } from "react";
import styles from "./Filters.module.css";

interface Props {
  language: Language;
  queryParam: string | null;
}

const Filters = ({ language, queryParam }: Props) => {
  const [selected, setSelected] = useState<string[]>(["Alle"]);
  const sakstemaer = useStore(sakstemaerAtom);
  const showFilters = useStore(showFiltersAtom);
  const showVedtakFilter = useStore(showVedtakFilterAtom);

  const isValidFilterValue = (queryParam: string | null) => {
    const filterValue = sakstemaer.filter(
      (sakstema) => sakstema.temakode === queryParam,
    );

    return filterValue.length > 0;
  };

  const isValidQueryParam = isValidFilterValue(queryParam);

  useEffect(() => {
    if (queryParam && isValidQueryParam) {
      setSelected([queryParam]);
      setSakstemaFilters([queryParam]);
    }
  }, [queryParam, isValidQueryParam]);

  if (!showFilters) {
    return null;
  }

  const handleToggle = (value: string[]) => {
    setSakstemaFilters(value);
    setSelected(value);
    logFiltervalg(value[0]);
  };
  return (
    <div className={styles.container}>
      <Label size={"medium"}>{text.filtersTitle[language]}</Label>
      <Chips>
        <Chips.Toggle
          key={"Alle"}
          lang="nb"
          checkmark={false}
          selected={selected.includes("Alle")}
          onClick={() => handleToggle(["Alle"])}
        >
          {"Alle"}
        </Chips.Toggle>
        {showVedtakFilter.map(() => (
          <Chips.Toggle
            key={"Vedtak"}
            lang="nb"
            checkmark={false}
            selected={selected.includes("Vedtak")}
            onClick={() => handleToggle(["Vedtak"])}
          >
            {"Vedtak"}
          </Chips.Toggle>
        ))}
        {sakstemaer.map((sakstema) => (
          <Chips.Toggle
            key={sakstema.temanavn}
            lang="nb"
            checkmark={false}
            selected={selected.includes(sakstema.temakode)}
            onClick={() => handleToggle([sakstema.temakode])}
          >
            {sakstema.temanavn}
          </Chips.Toggle>
        ))}
      </Chips>
    </div>
  );
};

export default Filters;
