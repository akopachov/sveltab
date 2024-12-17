/* eslint-disable */

const MaxSize = 256; // 1 << 8
const MaxFiles = 65536; // 1 << 16

const FileHeaderSize = 6;
const ImageHeaderSize = 16;

const IcoMime = 'image/x-icon';

export type BinaryLike = ArrayBuffer | Blob;

export async function convertToBlobAsync(inputs: IConvertInputItem[], mime = IcoMime) {
  const arr = await convertAsync(inputs);
  return new Blob([arr], {
    type: mime,
  });
}

export async function convertAsync(inputs: IConvertInputItem[]) {
  const inLen = inputs.length;
  if (inLen > MaxFiles) {
    throw new Error('TOO_MANY_FILES');
  }

  // File Format: https://en.wikipedia.org/wiki/ICO_(file_format)

  // File Header + Image Header + Image Content
  const headersLen = FileHeaderSize + ImageHeaderSize * inLen;
  const totalLen = headersLen + sumInputLen(inputs);
  const arr = new Uint8Array(totalLen);

  // File Header
  arr.set([0, 0, 1, 0, ...to2Bytes(inLen)], 0);

  // Image Headers & Data
  let imgPos = headersLen;
  for (let i = 0; i < inputs.length; i++) {
    const currPos = FileHeaderSize + ImageHeaderSize * i,
      input = inputs[i];

    const blob = toBlob(input.png),
      img = await loadImageAsync(blob),
      w = img.naturalWidth,
      h = img.naturalHeight;

    if (!input.ignoreSize && (w > MaxSize || h > MaxSize)) {
      throw new Error('INVALID_SIZE');
    }

    // Header
    arr.set(
      [
        w > MaxSize ? 0 : w,
        h > MaxSize ? 0 : h,
        0,
        0,
        0,
        0,
        ...(input.bpp ? to2Bytes(input.bpp) : [0, 0]),
        ...to4Bytes(blob.size),
        ...to4Bytes(imgPos),
      ],
      currPos,
    );

    // Image
    const buffer = input.png instanceof ArrayBuffer ? input.png : await input.png.arrayBuffer();
    arr.set(new Uint8Array(buffer), imgPos);

    imgPos += blob.size;
  }

  return arr;
}

function loadImageAsync(png: Blob) {
  return new Promise<HTMLImageElement>((r, rej) => {
    const img = new Image();

    img.onload = () => r(img);

    img.onerror = () => rej('INVALID_IMAGE');

    img.src = URL.createObjectURL(png);
  });
}

function toBlob(input: BinaryLike, type = 'image/png') {
  return input instanceof Blob
    ? input
    : new Blob([input], {
        type,
      });
}

function to2Bytes(n: number): number[] {
  return [n & 255, (n >> 8) & 255];
}

function to4Bytes(n: number): number[] {
  return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255];
}

function sumInputLen(inputs: IConvertInputItem[]) {
  let total = 0;
  for (const i of inputs) {
    const png = i.png;
    if (png instanceof Blob) {
      total += png.size;
    } else {
      total += png.byteLength;
    }
  }

  return total;
}

export interface IConvertInputItem {
  png: BinaryLike;

  bpp?: number;
  ignoreSize?: number;
}
