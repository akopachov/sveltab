import debounce from 'debounce';
import type { Action } from 'svelte/action';

export type FlickrImageData = {
  id: string;
  owner: string;
  sources: { width: number; height: number; source: string }[];
};

export const flickrSrc: Action<HTMLImageElement, FlickrImageData | undefined> = function (
  node: HTMLImageElement,
  src: FlickrImageData | undefined,
) {
  const resizeObserver = new ResizeObserver(() => updateImageDeb());
  resizeObserver.observe(node.parentElement ?? node);

  let currentSrc = src;

  function updateImage() {
    if (!currentSrc) {
      node.src = '';
      return;
    }

    const source =
      currentSrc.sources.find(s => s.width >= node.clientWidth && s.height >= node.clientHeight) ||
      currentSrc.sources[currentSrc.sources.length - 1];

    if (node.src != source.source) {
      node.src = source.source;
    }
  }

  const updateImageDeb = debounce(updateImage, 500);

  updateImage();

  return {
    destroy() {
      resizeObserver.unobserve(node.parentElement ?? node);
    },
    update(newSrc: FlickrImageData | undefined) {
      currentSrc = newSrc;
      updateImage();
    },
  };
};
