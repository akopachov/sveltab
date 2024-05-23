export interface IpApiCoResponse {
  /** IP address of the location. */
  ip: string;
  /** Network associated with the IP address. */
  network: string;
  /** IP version (e.g., "IPv4"). */
  version: string;
  /** City where the IP address is located. */
  city: string;
  /** Region or state where the IP address is located. */
  region: string;
  /** Region code (e.g., "30" for Greater Poland). */
  region_code: string;
  /** Country code (e.g., "PL" for Poland). */
  country: string;
  /** Full country name (e.g., "Poland"). */
  country_name: string;
  /** ISO country code (e.g., "POL"). */
  country_code: string;
  /** Capital city of the country. */
  country_capital: string;
  /** Top-level domain associated with the country (e.g., ".pl"). */
  country_tld: string;
  /** Continent code (e.g., "EU" for Europe). */
  continent_code: string;
  /** Indicates whether the location is within the European Union. */
  in_eu: boolean;
  /** Postal code for the location. */
  postal: string;
  /** Latitude coordinate. */
  latitude: number;
  /** Longitude coordinate. */
  longitude: number;
  /** Timezone of the location (e.g., "Europe/Warsaw"). */
  timezone: string;
  /** UTC offset (e.g., "+0200"). */
  utc_offset: string;
  /** International calling code for the country (e.g., "+48" for Poland). */
  country_calling_code: string;
  /** Currency code (e.g., "PLN" for Zloty). */
  currency: string;
  /** Full currency name (e.g., "Zloty"). */
  currency_name: string;
  /** Languages spoken in the country (e.g., "pl" for Polish). */
  languages: string;
  /** Total area of the country (in square kilometers). */
  country_area: number;
  /** Population of the country. */
  country_population: number;
  /** Autonomous System Number associated with the IP address. */
  asn: string;
  /** Organization or ISP providing the IP address. */
  org: string;
}

export function getGeoIpInfo(): Promise<IpApiCoResponse> {
  return fetch('https://ipapi.co/json/').then(r => r.json());
}
