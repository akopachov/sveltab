import { stringToIcon } from '@iconify/utils';

export const IconifyMainUrl = 'https://api.iconify.design';
export const IconifyMirror1Url = 'https://api.simplesvg.com';
export const IconifyMirror2Url = 'https://api.unisvg.com';

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

  return undefined;
}
