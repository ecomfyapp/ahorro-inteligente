import { expandUsState } from "@/lib/location";

const FALLBACK_ZIP_BY_STATE: Record<string, string> = {
  Alabama: "35203",
  Alaska: "99501",
  Arizona: "85001",
  Arkansas: "72201",
  California: "90001",
  Colorado: "80202",
  Connecticut: "06103",
  Delaware: "19901",
  Florida: "33101",
  Georgia: "30301",
  Hawaii: "96813",
  Idaho: "83702",
  Illinois: "60601",
  Indiana: "46204",
  Iowa: "50309",
  Kansas: "66603",
  Kentucky: "40601",
  Louisiana: "70112",
  Maine: "04330",
  Maryland: "21201",
  Massachusetts: "02108",
  Michigan: "48201",
  Minnesota: "55102",
  Mississippi: "39201",
  Missouri: "65101",
  Montana: "59601",
  Nebraska: "68508",
  Nevada: "89101",
  "New Hampshire": "03301",
  "New Jersey": "07102",
  "New Mexico": "87501",
  "New York": "10001",
  "North Carolina": "27601",
  "North Dakota": "58501",
  Ohio: "43215",
  Oklahoma: "73102",
  Oregon: "97201",
  Pennsylvania: "17101",
  "Rhode Island": "02903",
  "South Carolina": "29201",
  "South Dakota": "57501",
  Tennessee: "37219",
  Texas: "73301",
  Utah: "84111",
  Vermont: "05602",
  Virginia: "23219",
  Washington: "98101",
  "West Virginia": "25301",
  Wisconsin: "53703",
  Wyoming: "82001",
  "District of Columbia": "20001",
};

export function normalizeUsZip(value?: string | null) {
  return String(value || "").replace(/\D/g, "").slice(0, 5);
}

export function getFallbackZipForState(state?: string | null) {
  const expanded = expandUsState(state) || String(state || "").trim();
  return FALLBACK_ZIP_BY_STATE[expanded] || "10001";
}

export function getDetectedZipCode({
  explicitZip,
  geoZip,
  state,
}: {
  explicitZip?: string | null;
  geoZip?: string | null;
  state?: string | null;
}) {
  return normalizeUsZip(explicitZip) || normalizeUsZip(geoZip) || getFallbackZipForState(state);
}
