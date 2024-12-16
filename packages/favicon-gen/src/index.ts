import pica from 'pica';
import init, { optimise } from '@jsquash/oxipng/codec/pkg/squoosh_oxipng.js';
import { convertToBlobAsync } from './png2icojs';

export type FaviconData = { ico: Blob; 16: Blob; 32: Blob; 48: Blob };

await init();

export async function generateFavicon(input: Blob) {
  const image = new Image();
  let result: FaviconData;
  try {
    const promise = new Promise<FaviconData>((resolve, reject) => {
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

        const isSvg = input.type === 'image/svg+xml';
        const [icon48x48, icon32x32, icon16x16] = await Promise.all([
          resizeToPng(image, 48, 48, isSvg),
          resizeToPng(image, 32, 32, isSvg),
          resizeToPng(image, 16, 16, isSvg),
        ]);

        const ico = await convertToBlobAsync([{ png: icon48x48 }, { png: icon32x32 }, { png: icon16x16 }]);

        resolve({
          ico: ico,
          16: icon16x16,
          32: icon32x32,
          48: icon48x48,
        });
      };
      image.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    });
    image.src = URL.createObjectURL(input);
    result = await promise;
  } finally {
    URL.revokeObjectURL(image.src);
  }

  return result;
}

async function resizeToPng(image: HTMLImageElement, width: number, height: number, isSvg: boolean) {
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
  if (isSvg) {
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
