import { stringToIcon } from '@iconify/utils';

export function getSvgUrls(icon: string, color: string) {
  const iconObj = stringToIcon(icon);
  if (!iconObj) return [];

  const encodedColor = encodeURIComponent(color);

  return [
    `https://api.iconify.design/${iconObj.prefix}/${iconObj.name}.svg?color=${encodedColor}`,
    `https://api.simplesvg.com/${iconObj.prefix}/${iconObj.name}.svg?color=${encodedColor}`,
    `https://api.unisvg.com/${iconObj.prefix}/${iconObj.name}.svg?color=${encodedColor}`,
  ];
}
