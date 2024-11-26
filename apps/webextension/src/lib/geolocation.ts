import { storage } from '$stores/storage';
import { minutesToMilliseconds } from 'date-fns';
import { getGeoIpInfo } from './ipapi';

export type GeolocationCoordinates = { latitude: number; longitude: number; accuracy: number };
export type Geolocation = { city: string; country: string; admin1: string; admin2: string };
export type Coordinates = Pick<GeolocationCoordinates, 'latitude' | 'longitude'>;
type CachedGeolocationCoordinates = { expiresAt: number; coordinates: GeolocationCoordinates };

export function getPrecision(accuracy: number) {
  if (accuracy <= 0) return 0.001;
  return 1 / Math.pow(10, (111_111 / accuracy).toFixed(0).length); // https://gis.stackexchange.com/a/8674
}

export function compareCoordinates(c1: Coordinates, c2: Coordinates, precision: number) {
  return Math.abs(c1.latitude - c2.latitude) <= precision && Math.abs(c1.longitude - c2.longitude) <= precision;
}

const browserGeolocationCacheKey = 'browser_geolocation';

export async function getBrowserGeolocation() {
  let cachedLocation = <CachedGeolocationCoordinates | undefined>(
    (await storage.local.get(browserGeolocationCacheKey))[browserGeolocationCacheKey]
  );
  if (!cachedLocation || cachedLocation.expiresAt <= Date.now()) {
    const coordinates = await new Promise<GeolocationCoordinates>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        p => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy }),
        reject,
      ),
    );
    cachedLocation = { expiresAt: Date.now() + minutesToMilliseconds(10), coordinates: coordinates };
    await storage.local.set({ [browserGeolocationCacheKey]: cachedLocation });
  }

  return cachedLocation.coordinates;
}

export async function getIpGeolocation(): Promise<Geolocation & Coordinates> {
  const response = await getGeoIpInfo();
  return {
    city: response.city,
    country: response.country,
    admin1: response.region,
    admin2: '',
    latitude: Number(response.latitude),
    longitude: Number(response.longitude),
  };
}

export function getDefaultFallbackGeolocation(): Geolocation & Coordinates {
  return {
    city: 'Poznan',
    country: 'Poland',
    latitude: 52.406376,
    longitude: 16.925167,
    admin1: 'Greater Poland',
    admin2: '',
  };
}

export async function reverseGeocode(coordinates: GeolocationCoordinates): Promise<Geolocation> {
  type NominatimReverseGeocoderResult = { address: { country: string; state: string; city: string } };
  const { address } = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=10`,
  ).then<NominatimReverseGeocoderResult>(t => t.json());
  return {
    admin1: address.state,
    admin2: '',
    city: address.city,
    country: address.country,
  };
}
