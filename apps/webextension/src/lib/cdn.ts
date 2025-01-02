import { PUBLIC_CLOUDIMG_TOKEN } from '$env/static/public';

export const enum ImageResizeType {
  Cover = 'cover',
  Contain = 'contain',
}

abstract class ImageCDN {
  abstract getUrl(
    src: string,
    width?: number | 'document' | 'screen',
    height?: number | 'document' | 'screen',
    resizeType?: ImageResizeType,
  ): string;

  abstract updateUrl(
    src: string,
    width?: number | 'document' | 'screen',
    height?: number | 'document' | 'screen',
    resizeType?: ImageResizeType,
  ): string;

  protected updateUrlInternal(
    src: string | URL,
    widthArg: string,
    width: number | 'document' | 'screen' | undefined,
    heightArg: string,
    height: number | 'document' | 'screen' | undefined,
    resizeTypeArg: string | undefined,
    resizeTypeArgValue: string | undefined,
  ): string {
    ({ width, height } = this.getAbsoluteDimension(width, height));
    const imgUrlObj = src instanceof URL ? src : new URL(src);

    if (width) {
      imgUrlObj.searchParams.set(widthArg, width.toFixed(0));
    } else {
      imgUrlObj.searchParams.delete(widthArg);
    }

    if (height) {
      imgUrlObj.searchParams.set(heightArg, height.toFixed(0));
    } else {
      imgUrlObj.searchParams.delete(heightArg);
    }

    if (resizeTypeArg && resizeTypeArgValue) {
      imgUrlObj.searchParams.set(resizeTypeArg, resizeTypeArgValue);
    }

    return imgUrlObj.toString();
  }

  abstract isKnownUrl(src: string): boolean;

  protected getAbsoluteDimension(width?: number | 'document' | 'screen', height?: number | 'document' | 'screen') {
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

    return { width, height };
  }
}

class ImageCDNApp extends ImageCDN {
  #baseUrl = 'https://imagecdn.app/v2/image';

  getUrl(
    src: string,
    width?: number | 'document' | 'screen' | undefined,
    height?: number | 'document' | 'screen' | undefined,
    resizeType?: ImageResizeType | undefined,
  ): string {
    const encodedUrl = encodeURIComponent(src);
    return this.updateUrl(`${this.#baseUrl}/${encodedUrl}?format=webp`, width, height, resizeType);
  }

  updateUrl(
    src: string,
    width?: number | 'document' | 'screen' | undefined,
    height?: number | 'document' | 'screen' | undefined,
    resizeType?: ImageResizeType | undefined,
  ): string {
    let resizeTypeArg: string | undefined;
    switch (resizeType) {
      case ImageResizeType.Cover:
        resizeTypeArg = 'cover';
        break;
      case ImageResizeType.Contain:
        resizeTypeArg = 'inside';
        break;
      default:
        resizeTypeArg = 'cover';
        break;
    }
    return this.updateUrlInternal(src, 'width', width, 'height', height, 'fit', resizeTypeArg);
  }

  isKnownUrl(src: string): boolean {
    return src.startsWith(this.#baseUrl);
  }
}

class CloudImg extends ImageCDN {
  #baseUrl = `https://${PUBLIC_CLOUDIMG_TOKEN}.cloudimg.io`;

  getUrl(
    src: string,
    width?: number | 'document' | 'screen' | undefined,
    height?: number | 'document' | 'screen' | undefined,
    resizeType?: ImageResizeType | undefined,
  ): string {
    const url = new URL(encodeURIComponent(src), this.#baseUrl);
    url.searchParams.set('gravity', 'smart');
    url.searchParams.set('ci_url_encoded', '1');
    url.searchParams.set('force_format', 'webp');
    return this.updateUrl(url, width, height, resizeType);
  }

  updateUrl(
    src: string | URL,
    width?: number | 'document' | 'screen' | undefined,
    height?: number | 'document' | 'screen' | undefined,
    resizeType?: ImageResizeType | undefined,
  ): string {
    let resizeTypeArg: string | undefined;
    switch (resizeType) {
      case ImageResizeType.Cover:
        resizeTypeArg = 'crop';
        break;
      case ImageResizeType.Contain:
        resizeTypeArg = 'bound';
        break;
      default:
        resizeTypeArg = 'crop';
        break;
    }

    return this.updateUrlInternal(src, 'width', width, 'height', height, 'func', resizeTypeArg);
  }

  isKnownUrl(src: string): boolean {
    return src.startsWith(this.#baseUrl);
  }
}

const ImageCDNs = [new CloudImg(), new ImageCDNApp()];

function cdnCanHandle(src: string): Promise<boolean> {
  return new Promise(resolve => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

export async function getImageCdnUrl(
  imgUrl: string | undefined | null,
  width?: number | 'document' | 'screen',
  height?: number | 'document' | 'screen',
  resizeType?: ImageResizeType,
) {
  if (!imgUrl) {
    return '';
  }

  for (const cdn of ImageCDNs) {
    const cdnUrl = cdn.getUrl(imgUrl, width, height, resizeType);
    if (await cdnCanHandle(cdnUrl)) {
      return cdnUrl;
    }
  }

  return imgUrl;
}

export function updateImageCdnUrl(
  imgUrl: string | undefined | null,
  width?: number | 'document' | 'screen',
  height?: number | 'document' | 'screen',
  resizeType?: ImageResizeType,
) {
  if (!imgUrl) return imgUrl;
  for (const cdn of ImageCDNs) {
    if (cdn.isKnownUrl(imgUrl)) {
      return cdn.updateUrl(imgUrl, width, height, resizeType);
    }
  }

  return imgUrl;
}
