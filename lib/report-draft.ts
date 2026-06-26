import type { Gender } from "@/lib/ai/report";
import type { City } from "@/lib/geo/cities";
import {
  normalizeReportLocale,
  type ReportLocale,
} from "@/lib/report-i18n";

export type DraftReportInput = {
  name: string;
  gender: Gender;
  locale: ReportLocale;
  birthDate: string;
  birthTime: string;
  city: City;
};

export function getReportDraftCookieName(reportId: string) {
  return `dp_report_${reportId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64)}`;
}

type DraftPayload = {
  v: 1;
  name: string;
  gender: Gender;
  locale: ReportLocale;
  birthDate: string;
  birthTime: string;
  city: City;
};

export function encodeReportDraft(input: DraftReportInput) {
  const payload: DraftPayload = {
    v: 1,
    name: input.name,
    gender: input.gender,
    locale: input.locale,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    city: input.city,
  };

  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeReportDraft(value: string | undefined) {
  if (!value) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Partial<DraftPayload>;

    if (
      payload.v !== 1 ||
      typeof payload.name !== "string" ||
      (payload.gender !== "male" && payload.gender !== "female") ||
      typeof payload.birthDate !== "string" ||
      typeof payload.birthTime !== "string" ||
      !payload.city ||
      typeof payload.city.label !== "string" ||
      typeof payload.city.latitude !== "number" ||
      typeof payload.city.longitude !== "number" ||
      typeof payload.city.timezone !== "string"
    ) {
      return null;
    }

    return {
      name: payload.name,
      gender: payload.gender,
      locale: normalizeReportLocale(payload.locale ?? "en"),
      birthDate: payload.birthDate,
      birthTime: payload.birthTime,
      city: {
        id: payload.city.id || "draft-city",
        label: payload.city.label,
        country: payload.city.country || "",
        latitude: payload.city.latitude,
        longitude: payload.city.longitude,
        timezone: payload.city.timezone,
        aliases: payload.city.aliases ?? [payload.city.label],
      },
    } satisfies DraftReportInput;
  } catch {
    return null;
  }
}
