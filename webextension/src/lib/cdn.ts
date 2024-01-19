export function getImageCdnUrl(imgUrl: string | URL) {
  const strUrl = encodeURIComponent(imgUrl.toString());
  return `https://imagecdn.app/v2/image/${strUrl}`;
}
