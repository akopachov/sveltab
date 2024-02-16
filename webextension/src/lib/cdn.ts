const ImageCdnAppBlacklistedChars = /[ŽžÀ-ÿ()]/;

export function getImageCdnUrl(
  imgUrl: string | undefined | null,
  width?: number | 'screen',
  height?: number | 'screen',
) {
  if (!imgUrl) {
    return '';
  }

  const encodedUrl = encodeURIComponent(imgUrl);

  let cdnUrl: string;
  if (ImageCdnAppBlacklistedChars.test(decodeURIComponent(imgUrl))) {
    // imagecdn.app doesn't like characters with an accent or diacritic mark as well as few other chars, so let's use another CDN that case
    cdnUrl = `https://demo.tiny.pictures/?source=${encodedUrl}&resizeType=cover&format=webp&progressive=true&optimize=true`;
  } else {
    cdnUrl = `https://imagecdn.app/v2/image/${encodedUrl}?format=webp`;
  }

  if (width) {
    cdnUrl += `&width=${width === 'screen' ? document.documentElement.clientWidth : width}`;
  }

  if (height) {
    cdnUrl += `&height=${height === 'screen' ? document.documentElement.clientHeight : height}`;
  }

  return cdnUrl;
}
