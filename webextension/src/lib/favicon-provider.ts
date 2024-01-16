export function getFavIconUrl(site: string | URL) {
  const url = site instanceof URL ? site : new URL(site);
  return `https://favicon.twenty.com/${url.hostname}`;
}
