import { FaviconPrimaryUrl } from './service-mirrors';

export function getFavIconUrl(site: string | URL) {
  const url = site instanceof URL ? site : new URL(site);
  return `${FaviconPrimaryUrl}/${encodeURIComponent(url.hostname)}`;
}
