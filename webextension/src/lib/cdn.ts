function cdnCanHandle(src: string): Promise<boolean> {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

export async function getImageCdnUrl(
  imgUrl: string | undefined | null,
  width?: number | 'document' | 'screen',
  height?: number | 'document' | 'screen',
) {
  if (!imgUrl) {
    return '';
  }

  const encodedUrl = encodeURIComponent(imgUrl);

  let cdnUrl = updateImageCdnUrl(`https://imagecdn.app/v2/image/${encodedUrl}?format=webp`, width, height);
  if (!(await cdnCanHandle(cdnUrl!))) {
    // if imagecdn.app can't server given image - let's use another CDN
    cdnUrl = updateImageCdnUrl(
      `https://demo.tiny.pictures/?source=${encodedUrl}&resizeType=cover&format=webp&progressive=true&optimize=true`,
      width,
      height,
    );
  }

  return cdnUrl;
}

export function updateImageCdnUrl(
  imgUrl: string | undefined | null,
  width?: number | 'document' | 'screen',
  height?: number | 'document' | 'screen',
) {
  if (!imgUrl) return imgUrl;
  if (width === 'document') {
    width = document.documentElement.clientWidth;
  } else if (width === 'screen') {
    width = window.screen.availWidth * window.devicePixelRatio;
  }

  if (height === 'document') {
    height = document.documentElement.clientHeight;
  } else if (height === 'screen') {
    height = window.screen.availHeight * window.devicePixelRatio;
  }

  const imgUrlObj = new URL(imgUrl);
  if (width) {
    imgUrlObj.searchParams.set('width', width.toFixed(0));
  } else {
    imgUrlObj.searchParams.delete('width');
  }

  if (height) {
    imgUrlObj.searchParams.set('height', height.toFixed(0));
  } else {
    imgUrlObj.searchParams.delete('height');
  }

  return imgUrlObj.toString();
}
