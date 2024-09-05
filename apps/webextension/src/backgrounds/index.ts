import type { BackgroundCatalogItem } from './types';
import { Background as StaticColorBackground } from './static-color';
import { Background as RandomColorBackground } from './random-color';
import { Background as StaticImageBackground } from './static-image';
import { Background as BingDailyImageBackground } from './bing-daily-image';
import { Background as AnimeImageBackground } from './anime-image';
import { Background as NasaApodBackground } from './nasa-apod';
import { Background as PexelsBackground } from './pexels';
import { Background as WikimediaCommonsPodBackground } from './wikimedia-commons-pod';
import { Background as WallhavenBackground } from './wallhaven';

export const Backgrounds: Readonly<BackgroundCatalogItem[]> = [
  StaticColorBackground,
  RandomColorBackground,
  StaticImageBackground,
  BingDailyImageBackground,
  AnimeImageBackground,
  NasaApodBackground,
  PexelsBackground,
  WikimediaCommonsPodBackground,
  WallhavenBackground,
];
