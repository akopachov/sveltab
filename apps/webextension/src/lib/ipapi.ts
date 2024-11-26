/**
 * Represents the response from the IP API.
 */
export interface IpApiResponse {
  /**
   * The country of the IP address.
   */
  country: string;

  /**
   * The timezone of the IP address.
   */
  timezone: string;

  /**
   * The organization associated with the IP address.
   */
  organization: string;

  /**
   * The name of the organization associated with the IP address.
   */
  organization_name: string;

  /**
   * The autonomous system number (ASN) of the IP address.
   */
  asn: number;

  /**
   * The area code of the IP address.
   */
  area_code: string;

  /**
   * The three-letter country code of the IP address.
   */
  country_code3: string;

  /**
   * The two-letter country code of the IP address.
   */
  country_code: string;

  /**
   * The IP address.
   */
  ip: string;

  /**
   * The continent code of the IP address.
   */
  continent_code: string;

  /**
   * The latitude of the IP address.
   */
  latitude: string;

  /**
   * The region of the IP address.
   */
  region: string;

  /**
   * The city of the IP address.
   */
  city: string;

  /**
   * The longitude of the IP address.
   */
  longitude: string;

  /**
   * The accuracy of the IP address location.
   */
  accuracy: number;
}

export function getGeoIpInfo() {
  return fetch('https://get.geojs.io/v1/ip/geo.json').then<IpApiResponse>(r => r.json());
}
