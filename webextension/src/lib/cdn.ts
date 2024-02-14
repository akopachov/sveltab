export function getImageCdnUrl(
  imgUrl: string | undefined | null,
  width?: number | 'screen',
  height?: number | 'screen',
) {
  if (!imgUrl) {
    return '';
  }
  if (/[ŽžÀ-ÿ]/.test(decodeURIComponent(imgUrl))) {
    // imagecdn.app doesn't like characters with an accent or diacritic mark
    return imgUrl;
  }

  if (width === 'screen') {
    width = document.documentElement.clientWidth;
  }

  if (height === 'screen') {
    height = document.documentElement.clientHeight;
  }

  const strUrl = encodeURIComponent(imgUrl);
  let cdnUrl = `https://imagecdn.app/v2/image/${strUrl}?format=webp`;
  if (width) {
    cdnUrl += `&width=${width}`;
  }

  if (height) {
    cdnUrl += `&height=${height}`;
  }

  return cdnUrl;
}
