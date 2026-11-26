import { readStagingInfo } from "@src/utils/server/staging";
import { describe, expect, it } from "vitest";

const vectorTitle = "VmVyZ2Vtw6VsOiA8Yj7DpsO4w6U8L2I-ICYgInRlc3Qi";

describe("readStagingInfo", () => {
  it("returns null without STAGING_SLOT", () => {
    expect(readStagingInfo({})).toBeNull();
    expect(
      readStagingInfo({ STAGING_PR: "180", STAGING_TITLE: vectorTitle }),
    ).toBeNull();
    expect(readStagingInfo({ STAGING_SLOT: "false" })).toBeNull();
  });

  it("returns pr info with the decoded shared vector title", () => {
    expect(
      readStagingInfo({
        STAGING_SLOT: "true",
        STAGING_PR: "180",
        STAGING_TITLE: vectorTitle,
        STAGING_PR_URL: "https://github.com/navikt/x/pull/180",
        STAGING_BUILT_AT: "2026-11-25T13:02:00Z",
      }),
    ).toEqual({
      kind: "pr",
      number: "180",
      title: 'Vergemål: <b>æøå</b> & "test"',
      prUrl: "https://github.com/navikt/x/pull/180",
      builtAt: "2026-11-25T13:02:00Z",
    });
  });

  it("returns idle when STAGING_PR is empty", () => {
    expect(
      readStagingInfo({
        STAGING_SLOT: "true",
        STAGING_PR: "",
        STAGING_BUILT_AT: "2026-11-25T14:30:00Z",
      }),
    ).toEqual({ kind: "idle", builtAt: "2026-11-25T14:30:00Z" });
  });

  it("shows (ukjent tittel) for a value that does not decode", () => {
    const base = {
      STAGING_SLOT: "true",
      STAGING_PR: "180",
      STAGING_PR_URL: "https://github.com/navikt/x/pull/180",
      STAGING_BUILT_AT: "2026-11-25T13:02:00Z",
    };
    const invalid = ["", "VmVyZ2U=", "Vm Vy Z2U", "A", "VmVyZ", "_w"];

    for (const title of invalid) {
      expect(readStagingInfo({ ...base, STAGING_TITLE: title })).toMatchObject({
        title: "(ukjent tittel)",
      });
    }
    expect(readStagingInfo(base)).toMatchObject({ title: "(ukjent tittel)" });
  });
});
