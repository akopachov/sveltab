const BASE_API_URL = 'https://date.nager.at';

export enum HolidayType {
  Public = 'Public',
  Bank = 'Bank',
  School = 'School',
  Authorities = 'Authorities',
  Optional = 'Optional',
  Observance = 'Observance',
}

export type HolidayInfo = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: HolidayType[];
};

export function getHolidayInfo(countryCode: string, year: number): Promise<HolidayInfo[]> {
  return fetch(`${BASE_API_URL}/api/v3/PublicHolidays/${year}/${countryCode}`).then(response => response.json());
}

export function getAvailableCountryCodes(): Promise<string[]> {
  return fetch(`${BASE_API_URL}/api/v3/AvailableCountries`)
    .then(response => response.json())
    .then(data => data.map((country: { countryCode: string }) => country.countryCode));
}
