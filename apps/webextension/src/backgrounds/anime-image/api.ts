import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';

export enum AnimeTopics {
  YCY = 'ycy',
  MOEZ = 'moez',
  AI = 'ai',
  OriginalGod = 'ysz',
  PCTransverse = 'pc',
  MOE = 'moe',
  Landscape = 'fj',
  BD = 'bd',
  Genshin = 'ys',
  MP = 'mp',
  MOEMP = 'moemp',
  YSMP = 'ysmp',
  AIMP = 'aimp',
  LAI = 'lai',
  XHL = 'xhl',
}

export async function getAnimeImageForTopic(topic: AnimeTopics, abortSignal?: AbortSignal) {
  return await fetch(getCorsFriendlyUrl(`https://t.alcy.cc/${topic}/?json`), {
    signal: abortSignal,
  })
    .then(r => r.text())
    .then(t => t?.trim());
}
