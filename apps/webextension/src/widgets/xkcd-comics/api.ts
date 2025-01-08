import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';

export type XKCDComicsResponse = {
  month: string;
  num: number;
  link: string;
  year: string;
  news: string;
  safe_title: string;
  transcript: string;
  alt: string;
  img: string;
  title: string;
  day: string;
};

export function getLatestComics() {
  return fetch(getCorsFriendlyUrl('https://xkcd.com/info.0.json'))
    .then(response => response.json())
    .then((data: XKCDComicsResponse) => data);
}

export async function getRandomComics() {
  const latest = await getLatestComics();
  const random = Math.floor(Math.random() * latest.num) + 1;
  if (random === latest.num) {
    return latest;
  }

  return fetch(getCorsFriendlyUrl(`https://xkcd.com/${random}/info.0.json`))
    .then(response => response.json())
    .then((data: XKCDComicsResponse) => data);
}
