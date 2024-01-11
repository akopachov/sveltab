export function getFlickrImageSuffix(width: number, height: number) {
  const longestEdge = Math.max(width, height);
  // https://www.flickr.com/services/api/misc.urls.html
  if (longestEdge <= 100) return '_t';
  if (longestEdge <= 240) return '_m';
  if (longestEdge <= 320) return '_n';
  if (longestEdge <= 400) return '_w';
  if (longestEdge <= 500) return '';
  if (longestEdge <= 640) return '_z';
  if (longestEdge <= 800) return '_c';
  return '_b';
}
