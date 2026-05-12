import { expandUsState, formatLocation } from "@/lib/location";
import { getFallbackZipForState } from "@/lib/quotify-us";

type ZipCandidate = {
  zip: string;
  city: string;
  areaCodes?: string[];
};

const STATE_ZIP_CANDIDATES: Record<string, ZipCandidate[]> = {
  Alabama: [
    { zip: "35203", city: "Birmingham", areaCodes: ["205", "659"] },
    { zip: "36104", city: "Montgomery", areaCodes: ["334"] },
  ],
  Alaska: [
    { zip: "99501", city: "Anchorage", areaCodes: ["907"] },
    { zip: "99701", city: "Fairbanks", areaCodes: ["907"] },
  ],
  Arizona: [
    { zip: "85001", city: "Phoenix", areaCodes: ["602", "480", "623"] },
    { zip: "85701", city: "Tucson", areaCodes: ["520"] },
    { zip: "85251", city: "Scottsdale", areaCodes: ["480"] },
  ],
  Arkansas: [
    { zip: "72201", city: "Little Rock", areaCodes: ["501"] },
    { zip: "72701", city: "Fayetteville", areaCodes: ["479"] },
  ],
  California: [
    { zip: "90001", city: "Los Angeles", areaCodes: ["213", "310", "323", "424", "562", "818", "747"] },
    { zip: "92101", city: "San Diego", areaCodes: ["619", "858"] },
    { zip: "94102", city: "San Francisco", areaCodes: ["415", "628"] },
    { zip: "95814", city: "Sacramento", areaCodes: ["916"] },
  ],
  Colorado: [
    { zip: "80202", city: "Denver", areaCodes: ["303", "720"] },
    { zip: "80903", city: "Colorado Springs", areaCodes: ["719"] },
    { zip: "80524", city: "Fort Collins", areaCodes: ["970"] },
  ],
  Connecticut: [
    { zip: "06103", city: "Hartford", areaCodes: ["860", "959"] },
    { zip: "06510", city: "New Haven", areaCodes: ["203", "475"] },
    { zip: "06901", city: "Stamford", areaCodes: ["203", "475"] },
  ],
  Delaware: [
    { zip: "19801", city: "Wilmington", areaCodes: ["302"] },
    { zip: "19901", city: "Dover", areaCodes: ["302"] },
  ],
  Florida: [
    { zip: "33101", city: "Miami", areaCodes: ["305", "786", "954"] },
    { zip: "32801", city: "Orlando", areaCodes: ["321", "407"] },
    { zip: "33602", city: "Tampa", areaCodes: ["813"] },
    { zip: "32202", city: "Jacksonville", areaCodes: ["904"] },
  ],
  Georgia: [
    { zip: "30303", city: "Atlanta", areaCodes: ["404", "470", "678", "770"] },
    { zip: "31401", city: "Savannah", areaCodes: ["912"] },
    { zip: "30901", city: "Augusta", areaCodes: ["706", "762"] },
  ],
  Hawaii: [
    { zip: "96813", city: "Honolulu", areaCodes: ["808"] },
    { zip: "96720", city: "Hilo", areaCodes: ["808"] },
  ],
  Idaho: [
    { zip: "83702", city: "Boise", areaCodes: ["208", "986"] },
    { zip: "83402", city: "Idaho Falls", areaCodes: ["208", "986"] },
  ],
  Illinois: [
    { zip: "60601", city: "Chicago", areaCodes: ["312", "773", "872"] },
    { zip: "62701", city: "Springfield", areaCodes: ["217", "447"] },
    { zip: "61602", city: "Peoria", areaCodes: ["309", "861"] },
  ],
  Indiana: [
    { zip: "46204", city: "Indianapolis", areaCodes: ["317", "463"] },
    { zip: "46802", city: "Fort Wayne", areaCodes: ["260"] },
  ],
  Iowa: [
    { zip: "50309", city: "Des Moines", areaCodes: ["515"] },
    { zip: "52401", city: "Cedar Rapids", areaCodes: ["319"] },
  ],
  Kansas: [
    { zip: "67202", city: "Wichita", areaCodes: ["316"] },
    { zip: "66603", city: "Topeka", areaCodes: ["785"] },
    { zip: "66204", city: "Overland Park", areaCodes: ["913"] },
  ],
  Kentucky: [
    { zip: "40202", city: "Louisville", areaCodes: ["502"] },
    { zip: "40507", city: "Lexington", areaCodes: ["859"] },
    { zip: "40601", city: "Frankfort", areaCodes: ["502"] },
  ],
  Louisiana: [
    { zip: "70112", city: "New Orleans", areaCodes: ["504"] },
    { zip: "70801", city: "Baton Rouge", areaCodes: ["225"] },
    { zip: "70501", city: "Lafayette", areaCodes: ["337"] },
  ],
  Maine: [
    { zip: "04101", city: "Portland", areaCodes: ["207"] },
    { zip: "04330", city: "Augusta", areaCodes: ["207"] },
  ],
  Maryland: [
    { zip: "21201", city: "Baltimore", areaCodes: ["410", "443", "667"] },
    { zip: "21401", city: "Annapolis", areaCodes: ["410", "443", "667"] },
    { zip: "20850", city: "Rockville", areaCodes: ["240", "301"] },
  ],
  Massachusetts: [
    { zip: "02108", city: "Boston", areaCodes: ["617", "857"] },
    { zip: "01608", city: "Worcester", areaCodes: ["508", "774"] },
    { zip: "01103", city: "Springfield", areaCodes: ["413"] },
  ],
  Michigan: [
    { zip: "48201", city: "Detroit", areaCodes: ["313"] },
    { zip: "49503", city: "Grand Rapids", areaCodes: ["616"] },
    { zip: "48933", city: "Lansing", areaCodes: ["517"] },
  ],
  Minnesota: [
    { zip: "55401", city: "Minneapolis", areaCodes: ["612"] },
    { zip: "55102", city: "Saint Paul", areaCodes: ["651"] },
    { zip: "55802", city: "Duluth", areaCodes: ["218"] },
  ],
  Mississippi: [
    { zip: "39201", city: "Jackson", areaCodes: ["601", "769"] },
    { zip: "39501", city: "Gulfport", areaCodes: ["228"] },
  ],
  Missouri: [
    { zip: "64106", city: "Kansas City", areaCodes: ["816"] },
    { zip: "63101", city: "St. Louis", areaCodes: ["314"] },
    { zip: "65101", city: "Jefferson City", areaCodes: ["573"] },
  ],
  Montana: [
    { zip: "59101", city: "Billings", areaCodes: ["406"] },
    { zip: "59601", city: "Helena", areaCodes: ["406"] },
  ],
  Nebraska: [
    { zip: "68102", city: "Omaha", areaCodes: ["402", "531"] },
    { zip: "68508", city: "Lincoln", areaCodes: ["402", "531"] },
  ],
  Nevada: [
    { zip: "89101", city: "Las Vegas", areaCodes: ["702", "725"] },
    { zip: "89501", city: "Reno", areaCodes: ["775"] },
    { zip: "89701", city: "Carson City", areaCodes: ["775"] },
  ],
  "New Hampshire": [
    { zip: "03301", city: "Concord", areaCodes: ["603"] },
    { zip: "03101", city: "Manchester", areaCodes: ["603"] },
  ],
  "New Jersey": [
    { zip: "07102", city: "Newark", areaCodes: ["862", "973"] },
    { zip: "07302", city: "Jersey City", areaCodes: ["201", "551"] },
    { zip: "08608", city: "Trenton", areaCodes: ["609"] },
  ],
  "New Mexico": [
    { zip: "87102", city: "Albuquerque", areaCodes: ["505"] },
    { zip: "87501", city: "Santa Fe", areaCodes: ["505"] },
  ],
  "New York": [
    { zip: "10001", city: "New York", areaCodes: ["212", "332", "646", "718", "917", "929"] },
    { zip: "14202", city: "Buffalo", areaCodes: ["716"] },
    { zip: "12207", city: "Albany", areaCodes: ["518", "838"] },
    { zip: "14604", city: "Rochester", areaCodes: ["585"] },
  ],
  "North Carolina": [
    { zip: "28202", city: "Charlotte", areaCodes: ["704", "980"] },
    { zip: "27601", city: "Raleigh", areaCodes: ["919", "984"] },
    { zip: "27401", city: "Greensboro", areaCodes: ["336", "743"] },
    { zip: "28801", city: "Asheville", areaCodes: ["828"] },
  ],
  "North Dakota": [
    { zip: "58501", city: "Bismarck", areaCodes: ["701"] },
    { zip: "58102", city: "Fargo", areaCodes: ["701"] },
  ],
  Ohio: [
    { zip: "43215", city: "Columbus", areaCodes: ["380", "614"] },
    { zip: "44113", city: "Cleveland", areaCodes: ["216"] },
    { zip: "45202", city: "Cincinnati", areaCodes: ["513"] },
    { zip: "43604", city: "Toledo", areaCodes: ["419", "567"] },
  ],
  Oklahoma: [
    { zip: "73102", city: "Oklahoma City", areaCodes: ["405", "572"] },
    { zip: "74103", city: "Tulsa", areaCodes: ["539", "918"] },
  ],
  Oregon: [
    { zip: "97201", city: "Portland", areaCodes: ["503", "971"] },
    { zip: "97301", city: "Salem", areaCodes: ["503", "971"] },
    { zip: "97401", city: "Eugene", areaCodes: ["458", "541"] },
  ],
  Pennsylvania: [
    { zip: "19102", city: "Philadelphia", areaCodes: ["215", "267", "445"] },
    { zip: "15222", city: "Pittsburgh", areaCodes: ["412", "878"] },
    { zip: "17101", city: "Harrisburg", areaCodes: ["717", "223"] },
    { zip: "18101", city: "Allentown", areaCodes: ["484", "610"] },
  ],
  "Rhode Island": [
    { zip: "02903", city: "Providence", areaCodes: ["401"] },
    { zip: "02840", city: "Newport", areaCodes: ["401"] },
  ],
  "South Carolina": [
    { zip: "29201", city: "Columbia", areaCodes: ["803", "839"] },
    { zip: "29401", city: "Charleston", areaCodes: ["843", "854"] },
    { zip: "29601", city: "Greenville", areaCodes: ["864"] },
  ],
  "South Dakota": [
    { zip: "57104", city: "Sioux Falls", areaCodes: ["605"] },
    { zip: "57501", city: "Pierre", areaCodes: ["605"] },
  ],
  Tennessee: [
    { zip: "37219", city: "Nashville", areaCodes: ["615", "629"] },
    { zip: "38103", city: "Memphis", areaCodes: ["901"] },
    { zip: "37902", city: "Knoxville", areaCodes: ["865"] },
    { zip: "37402", city: "Chattanooga", areaCodes: ["423"] },
  ],
  Texas: [
    { zip: "75201", city: "Dallas", areaCodes: ["214", "469", "972"] },
    { zip: "77002", city: "Houston", areaCodes: ["281", "346", "713", "832"] },
    { zip: "78701", city: "Austin", areaCodes: ["512", "737"] },
    { zip: "78205", city: "San Antonio", areaCodes: ["210", "726"] },
    { zip: "79901", city: "El Paso", areaCodes: ["915"] },
  ],
  Utah: [
    { zip: "84111", city: "Salt Lake City", areaCodes: ["385", "801"] },
    { zip: "84601", city: "Provo", areaCodes: ["385", "801"] },
  ],
  Vermont: [
    { zip: "05401", city: "Burlington", areaCodes: ["802"] },
    { zip: "05602", city: "Montpelier", areaCodes: ["802"] },
  ],
  Virginia: [
    { zip: "23219", city: "Richmond", areaCodes: ["804"] },
    { zip: "23451", city: "Virginia Beach", areaCodes: ["757", "948"] },
    { zip: "23510", city: "Norfolk", areaCodes: ["757", "948"] },
    { zip: "22201", city: "Arlington", areaCodes: ["571", "703"] },
  ],
  Washington: [
    { zip: "98101", city: "Seattle", areaCodes: ["206"] },
    { zip: "99201", city: "Spokane", areaCodes: ["509"] },
    { zip: "98402", city: "Tacoma", areaCodes: ["253"] },
  ],
  "West Virginia": [
    { zip: "25301", city: "Charleston", areaCodes: ["304", "681"] },
    { zip: "26505", city: "Morgantown", areaCodes: ["304", "681"] },
  ],
  Wisconsin: [
    { zip: "53202", city: "Milwaukee", areaCodes: ["414"] },
    { zip: "53703", city: "Madison", areaCodes: ["608"] },
    { zip: "54301", city: "Green Bay", areaCodes: ["920"] },
  ],
  Wyoming: [
    { zip: "82001", city: "Cheyenne", areaCodes: ["307"] },
    { zip: "82601", city: "Casper", areaCodes: ["307"] },
  ],
  "District of Columbia": [
    { zip: "20001", city: "Washington", areaCodes: ["202"] },
    { zip: "20036", city: "Washington", areaCodes: ["202"] },
  ],
};

function normalizeUsPhone(value?: string | null) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits.slice(0, 10);
}

function fallbackSeedFromState(state: string) {
  return Array.from(state).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function inferUsZipFromStateAndPhone(state?: string | null, phone?: string | null) {
  const expandedState = expandUsState(state);

  if (!expandedState) {
    const zipCode = getFallbackZipForState(state);
    return {
      zipCode,
      city: null as string | null,
      state: null as string | null,
      location: formatLocation(null, null),
      matchedByAreaCode: false,
    };
  }

  const candidates = STATE_ZIP_CANDIDATES[expandedState] || [
    {
      zip: getFallbackZipForState(expandedState),
      city: expandedState,
    },
  ];

  const normalizedPhone = normalizeUsPhone(phone);
  const areaCode = normalizedPhone.slice(0, 3);
  const areaMatches = areaCode
    ? candidates.filter((candidate) => candidate.areaCodes?.includes(areaCode))
    : [];
  const pool = areaMatches.length > 0 ? areaMatches : candidates;
  const seed = normalizedPhone
    ? Number(normalizedPhone.slice(-4)) || fallbackSeedFromState(expandedState)
    : fallbackSeedFromState(expandedState);
  const chosen = pool[seed % pool.length] || candidates[0];

  return {
    zipCode: chosen.zip,
    city: chosen.city,
    state: expandedState,
    location: formatLocation(chosen.city, expandedState),
    matchedByAreaCode: areaMatches.length > 0,
  };
}
