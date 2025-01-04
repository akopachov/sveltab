import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';
import { logger } from '$lib/logger';

const log = logger.getSubLogger({ prefix: ['Backgrounds', 'Bing Daily Image', 'Provider'] });

export const BingResolutions = [
  { width: 240, height: 320, resolution: '240x320' },
  { width: 320, height: 240, resolution: '320x240' },
  { width: 400, height: 240, resolution: '400x240' },
  { width: 480, height: 800, resolution: '480x800' },
  { width: 640, height: 480, resolution: '640x480' },
  { width: 720, height: 1280, resolution: '720x1280' },
  { width: 768, height: 1280, resolution: '768x1280' },
  { width: 800, height: 480, resolution: '800x480' },
  { width: 800, height: 600, resolution: '800x600' },
  { width: 1024, height: 768, resolution: '1024x768' },
  { width: 1280, height: 768, resolution: '1280x768' },
  { width: 1366, height: 768, resolution: '1366x768' },
  { width: 1920, height: 1080, resolution: '1920x1080' },
  { width: 1920, height: 1200, resolution: '1920x1200' },
  { width: 3840, height: 2160, resolution: 'UHD' },
] as const;

export const BingMarkets = [
  'da-DK',
  'de-AT',
  'de-DE',
  'en-AU',
  'en-CA',
  'en-GB',
  'en-IN',
  'en-NZ',
  'en-US',
  'es-AR',
  'es-CL',
  'es-ES',
  'es-MX',
  'fi-FI',
  'fr-CA',
  'fr-FR',
  'it-IT',
  'ja-JP',
  'no-NO',
  'pl-PL',
  'pt-BR',
  'pt-PT',
  'sv-SE',
  'zh-CN',
] as const;

export type BingResolution = (typeof BingResolutions)[number]['resolution'];
export type BingMarket = (typeof BingMarkets)[number];

type BingOfficialApiResponse = { images: { urlbase: string }[] };
type BingUnofficialApiResponse = {
  start_date: string;
  end_date: string;
  url: string;
  copyright: string;
  copyright_link: string;
};

async function queryOfficialApi(resolution: BingResolution, market: BingMarket, abortSignal: AbortSignal) {
  const response = await fetch(
    getCorsFriendlyUrl(`https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=${market}`),
    {
      signal: abortSignal,
    },
  ).then<BingOfficialApiResponse>(r => r.json());
  if (!response?.images || response.images.length <= 0) {
    throw new Error('Unexpected response from official Bing API');
  }

  return `https://bing.com${response.images[0].urlbase}_${resolution}.jpg`;
}

async function queryUnofficialApi(resolution: BingResolution, market: BingMarket, abortSignal: AbortSignal) {
  const response = await fetch(`https://bing.biturl.top/?resolution=${resolution}&format=json&index=0&mkt=${market}`, {
    signal: abortSignal,
  }).then<BingUnofficialApiResponse>(r => r.json());
  if (!response?.url) {
    throw new Error('Unexpected response from unofficial Bing API');
  }

  return response.url;
}

export async function getDailyWalpaper(resolution: BingResolution, market: BingMarket, abortSignal: AbortSignal) {
  try {
    return await queryOfficialApi(resolution, market, abortSignal);
  } catch (e) {
    log.warn(e);
  }

  try {
    return await queryUnofficialApi(resolution, market, abortSignal);
  } catch (e) {
    log.warn(e);
  }

  return null;
}
