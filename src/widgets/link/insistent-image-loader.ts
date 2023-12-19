import type { Action } from 'svelte/action';

export type InsistentImageLoaderParameters = { urls: string[] };

export const insistentImageLoader: Action<HTMLImageElement, InsistentImageLoaderParameters> = function (
  node: HTMLImageElement,
  parameters: InsistentImageLoaderParameters,
) {
  let availableUrls = parameters.urls;
  let urlIndex = 0;
  let timeout: any;

  function updateSrc() {
    clearTimeout(timeout);
    if (urlIndex < availableUrls.length) {
      if (node.src !== availableUrls[urlIndex]) {
        node.src = availableUrls[urlIndex];
        timeout = setTimeout(rollSrc, 5000);
      }
    }
  }

  function rollSrc() {
    urlIndex++;
    updateSrc();
  }

  function loadStart() {
    node.classList.add('placeholder', 'animate-pulse');
  }

  function loadEnd() {
    clearTimeout(timeout);
    node.classList.remove('placeholder', 'animate-pulse');
  }

  node.addEventListener('loadstart', loadStart);
  node.addEventListener('load', loadEnd);
  node.addEventListener('error', rollSrc);

  updateSrc();

  if (!node.complete) {
    loadStart();
  }

  return {
    destroy() {
      node.removeEventListener('loadstart', loadStart);
      node.removeEventListener('load', loadEnd);
      node.removeEventListener('error', rollSrc);
      node.src = '';
      clearTimeout(timeout);
    },
    update(parameters: InsistentImageLoaderParameters) {
      if (!node.complete) {
        loadStart();
      }
      availableUrls = parameters.urls;
      urlIndex = 0;
      updateSrc();
    },
  };
};
