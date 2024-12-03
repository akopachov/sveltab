import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';

export type AnimeImageInfo = {
  file_url: string;
  file_size: number;
  md5: string;
  tags: string[];
  width: number;
  height: number;
  source: string;
  author: string;
  has_children: boolean;
  _id: number;
};

export type AnimeTagInfo = {
  name: string;
  count: number;
};

export async function getAnimeImage(options?: {
  includeTags?: string[];
  excludeTags?: string[];
  abortSignal?: AbortSignal;
}) {
  const url = new URL('https://pic.re/image.json?compress=false');
  if (options?.includeTags && options.includeTags.length > 0) {
    url.searchParams.append('in', options.includeTags.join(','));
  }
  if (options?.excludeTags && options.excludeTags.length > 0) {
    url.searchParams.append('nin', options.excludeTags.join(','));
  }
  return await fetch(url, {
    signal: options?.abortSignal,
  }).then<AnimeImageInfo>(r => r.json());
}

export async function getAnimeTags(abortSignal?: AbortSignal) {
  return await fetch(getCorsFriendlyUrl('https://pic.re/tags'), {
    signal: abortSignal,
  }).then<AnimeTagInfo[]>(r => r.json());
}
