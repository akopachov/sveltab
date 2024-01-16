import { stringToIcon } from '@iconify/utils';

export const IconifyMainUrl = 'https://api.iconify.design';
const IconifyMirror1Url = 'https://api.simplesvg.com';
const IconifyMirror2Url = 'https://api.unisvg.com';

export const FaviconPrimaryUrl = 'https://favicon.twenty.com';
const FaviconMirror1Url = 'https://icon.horse/icon';

export function getSvgUrl(icon: string, color: string) {
  const iconObj = stringToIcon(icon);
  if (!iconObj) return undefined;
  const encodedColor = encodeURIComponent(color);
  return `${IconifyMainUrl}/${iconObj.prefix}/${iconObj.name}.svg?color=${encodedColor}`;
}

export function getMirrorFor(url: string) {
  if (url.startsWith(IconifyMainUrl)) {
    return url.replace(IconifyMainUrl, IconifyMirror1Url);
  }

  if (url.startsWith(IconifyMirror1Url)) {
    return url.replace(IconifyMirror1Url, IconifyMirror2Url);
  }

  if (url.startsWith(FaviconPrimaryUrl)) {
    return url.replace(FaviconPrimaryUrl, FaviconMirror1Url);
  }

  return undefined;
}
