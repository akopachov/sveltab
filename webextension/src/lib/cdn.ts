// What imagecdn.app doesn't like
const ImageCdnAppBlacklist = [
  /[ŽžÀ-ÿ()]/, // characters with an accent or diacritic mark as well as few other chars
  /^https:\/\/upload.wikimedia.org/, // sometimes it may not like images from upload.wikimedia.org
] as const;

export function getImageCdnUrl(
  imgUrl: string | undefined | null,
  width?: number | 'document',
  height?: number | 'document',
) {
  if (!imgUrl) {
    return '';
  }

  const encodedUrl = encodeURIComponent(imgUrl);
  const pureDecodedUrl = decodeURIComponent(imgUrl);

  let cdnUrl: string;
  if (ImageCdnAppBlacklist.some(b => b.test(pureDecodedUrl))) {
    // if unlikely imagecdn.app would server given url - let's use another CDN
    cdnUrl = `https://demo.tiny.pictures/?source=${encodedUrl}&resizeType=cover&format=webp&progressive=true&optimize=true`;
  } else {
    cdnUrl = `https://imagecdn.app/v2/image/${encodedUrl}?format=webp`;
  }

  if (width) {
    cdnUrl += `&width=${width === 'document' ? document.documentElement.clientWidth : width}`;
  }

  if (height) {
    cdnUrl += `&height=${height === 'document' ? document.documentElement.clientHeight : height}`;
  }

  return cdnUrl;
}
