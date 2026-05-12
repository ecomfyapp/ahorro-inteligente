export type ResolvedLocation = {
  location: string;
  source: "zippopotam" | "vercel-ip" | "fallback";
  city: string | null;
  country: string | null;
  state: string | null;
  zipCode: string | null;
  fallback: boolean;
};

const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

function cleanPart(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function formatLocation(city?: string | null, state?: string | null) {
  const safeCity = cleanPart(city);
  const safeState = cleanPart(state);

  if (safeCity && safeState) {
    return `${safeCity}, ${safeState}`;
  }

  return safeCity || safeState || "Rates available for your area";
}

export function expandUsState(value?: string | null) {
  const safeValue = cleanPart(value);

  if (!safeValue) {
    return null;
  }

  const normalized = safeValue.includes("-")
    ? safeValue.split("-").at(-1)?.toUpperCase()
    : safeValue.toUpperCase();

  return (normalized && US_STATE_NAMES[normalized]) || safeValue;
}

export function isUsState(value?: string | null) {
  const expanded = expandUsState(value);
  return !!expanded && Object.values(US_STATE_NAMES).includes(expanded);
}

export function buildVercelLocation(
  details: Partial<{
    city: string | null;
    country: string | null;
    countryRegion: string | null;
    postalCode: string | null;
  }>
): ResolvedLocation | null {
  const city = cleanPart(details.city);
  const country = cleanPart(details.country);
  const state =
    country === "US"
      ? expandUsState(details.countryRegion)
      : cleanPart(details.countryRegion);
  const zipCode = cleanPart(details.postalCode);

  if (!city && !state) {
    return null;
  }

  return {
    location: formatLocation(city, state),
    source: "vercel-ip",
    city,
    country,
    state,
    zipCode,
    fallback: true,
  };
}
