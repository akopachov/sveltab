import pica from 'pica';
import init, { optimise } from '@jsquash/oxipng/codec/pkg/squoosh_oxipng.js';
// @ts-ignore: TS1192
import oxiPngWasm from '@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm';
import { convertToBlobAsync } from './png2icojs';

export type FaviconData<T extends ReadonlyArray<number>> = {
  [K in T[number]]: Blob;
} & { ico: Blob };

await init(oxiPngWasm);

export class ImageLoadError extends Error {
  constructor(...args: unknown[]) {
    super('Failed to load image');
    this.additionalInfo = args;
  }

  readonly additionalInfo: ReadonlyArray<unknown>;
}

export async function generateFavicon<T extends [number, ...number[]]>(input: Blob, sizes: T) {
  const image = new Image();
  let result: FaviconData<T>;
  try {
    const promise = new Promise<FaviconData<T>>((resolve, reject) => {
      image.onload = async () => {
        if (image.width === 0 && image.height === 0) {
          const startText = await input.slice(0, 1024).text();
          if (startText.includes('<svg')) {
            const viewboxMatch = /viewBox="(\d+) (\d+) (\d+) (\d+)"/.exec(startText);
            if (viewboxMatch) {
              image.width = Number(viewboxMatch[3]) - Number(viewboxMatch[1]);
              image.height = Number(viewboxMatch[4]) - Number(viewboxMatch[2]);
            }
          }
        }

        const isVectorImage = input.type === 'image/svg+xml';
        const iconResizeResults = await Promise.all(sizes.map(size => resizeToPng(image, size, size, isVectorImage)));

        const ico = await convertToBlobAsync(iconResizeResults.map(blob => ({ png: blob })));
        resolve({
          ico: ico,
          ...(Object.fromEntries(sizes.map((size, index) => [size, iconResizeResults[index]])) as any),
        });
      };
      image.onerror = (...args) => {
        reject(new ImageLoadError(...args));
      };
    });
    image.src = URL.createObjectURL(input);
    result = await promise;
  } finally {
    URL.revokeObjectURL(image.src);
  }

  return result;
}

async function resizeToPng(image: HTMLImageElement, width: number, height: number, isVectorImage: boolean) {
  let newWidth = width;
  let newHeight = height;
  if (image.width < image.height) {
    newWidth = (image.width / image.height) * height;
  } else if (image.width > image.height) {
    newHeight = (image.height / image.width) * width;
  }

  const intermediateCanvas = new OffscreenCanvas(newWidth, newHeight);
  const intermediateCtx = intermediateCanvas.getContext('2d', { alpha: true })!;
  intermediateCtx.clearRect(0, 0, intermediateCanvas.width, intermediateCanvas.height);
  if (isVectorImage) {
    intermediateCtx.drawImage(image, 0, 0, newWidth, newHeight);
  } else {
    const picaInstance = pica({
      createCanvas(width, height) {
        return new OffscreenCanvas(width, height) as any as HTMLCanvasElement;
      },
      features: ['js', 'wasm'],
    });
    await picaInstance.resize(image, intermediateCanvas as any as HTMLCanvasElement);
  }

  const finalCanvas = new OffscreenCanvas(width, height);
  const dx = (width - newWidth) / 2;
  const dy = (height - newHeight) / 2;
  const finalCtx = finalCanvas.getContext('2d', { alpha: true })!;
  finalCtx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
  finalCtx.drawImage(intermediateCanvas, dx, dy);
  const rawPngBlob = await finalCanvas.convertToBlob({ type: 'image/png' });
  const optimizedPng = await optimise(new Uint8Array(await rawPngBlob.arrayBuffer()), 2, false, false);
  return new Blob([optimizedPng], { type: 'image/png' });
}
