import { Alert, Link } from "@navikt/ds-react";
import type { StagingInfo } from "@src/utils/server/staging";

interface Props {
  info: StagingInfo | null;
}

const osloTime = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const formatBuiltAt = (builtAt: string) => {
  const date = new Date(builtAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = Object.fromEntries(
    osloTime.formatToParts(date).map((p) => [p.type, p.value]),
  );

  const [day, month, hour, minute] = [
    parts.day,
    parts.month,
    parts.hour,
    parts.minute,
  ].map((value) => value.padStart(2, "0"));

  return `${day}.${month} kl. ${hour}:${minute}`;
};

export default function StagingBanner({ info }: Props) {
  if (!info) {
    return null;
  }

  const builtAt = formatBuiltAt(info.builtAt);

  return (
    <Alert variant="info" size="small" fullWidth>
      {info.kind === "pr" ? (
        <>
          Staging · til test: «{info.title}» (
          <Link href={info.prUrl}>#{info.number}</Link>)
          {builtAt && ` · oppdatert ${builtAt}`}
        </>
      ) : (
        <>
          Staging · ingen sak til test nå · viser main
          {builtAt && ` per ${builtAt}`}
        </>
      )}
    </Alert>
  );
}
