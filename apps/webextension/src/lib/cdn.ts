function cdnCanHandle(src: string): Promise<boolean> {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

function getImageSizeHandler(widthParamName: string, heightParamName: string) {
  return (url: URL, width?: number, height?: number) => {
    if (width) {
      url.searchParams.set(widthParamName, width.toFixed(0));
    } else {
      url.searchParams.delete(widthParamName);
    }

    if (height) {
      url.searchParams.set(heightParamName, height.toFixed(0));
    } else {
      url.searchParams.delete(heightParamName);
    }
  };
}

interface ImageCdn {
  getUrl(imageUrl: string): string;
  setImageSizeParams(url: URL, width?: number, height?: number): void;
  host: string;
}

const ImageCdnPool: ImageCdn[] = [
  {
    getUrl(imageUrl: string) {
      return `https://media.assets.so/?url=${encodeURIComponent(imageUrl)}&f=webp&fit=cover`;
    },
    setImageSizeParams: getImageSizeHandler('w', 'h'),
    host: 'media.assets.so',
  },
  {
    getUrl(imageUrl: string) {
      return `https://imagecdn.app/v2/image/${encodeURIComponent(imageUrl)}?format=webp`;
    },
    setImageSizeParams: getImageSizeHandler('width', 'height'),
    host: 'imagecdn.app',
  },
  {
    getUrl(imageUrl: string) {
      return `https://demo.tiny.pictures/?source=${encodeURIComponent(imageUrl)}&resizeType=cover&format=webp&progressive=true&optimize=true`;
    },
    setImageSizeParams: getImageSizeHandler('width', 'height'),
    host: 'demo.tiny.pictures',
  },
];
const ImageCdnIndex = Object.fromEntries(ImageCdnPool.map(cdn => [cdn.host, cdn]));

export async function getImageCdnUrl(
  imgUrl: string | undefined | null,
  width?: number | 'document' | 'screen',
  height?: number | 'document' | 'screen',
) {
  if (!imgUrl) {
    return '';
  }

  let cdnedUrl: string = imgUrl;
  for (const cdn of ImageCdnPool) {
    cdnedUrl = updateImageCdnUrl(cdn.getUrl(imgUrl), width, height)!;
    if (await cdnCanHandle(cdnedUrl)) {
      break;
    }
  }

  return cdnedUrl;
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
  ImageCdnIndex[imgUrlObj.host]?.setImageSizeParams(imgUrlObj, width, height);

  return imgUrlObj.toString();
}
