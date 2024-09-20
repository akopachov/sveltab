import { getMirrorFor } from '$lib/service-mirrors';
import type { Action } from 'svelte/action';
import fallbackImage from '$lib/assets/image-fallback.svg';
import { secondsToMilliseconds } from 'date-fns';

const placeholderClasses = ['placeholder', 'animate-pulse', '!rounded-[inherit]'];

export const imgSrcEx: Action<HTMLImageElement, string | undefined> = function (
  node: HTMLImageElement,
  src: string | undefined,
) {
  let timeout: ReturnType<typeof setTimeout>;

  function updateSrc(s: string | undefined) {
    clearTimeout(timeout);
    if (s) {
      if (node.src !== s) {
        node.src = s;
        timeout = setTimeout(rollSrc, secondsToMilliseconds(5));
      }
    } else {
      node.src = '';
    }
  }

  function rollSrc() {
    const mirror = getMirrorFor(node.src);
    if (mirror) {
      node.style.backgroundColor = '';
      updateSrc(mirror);
    } else if (Boolean(node.dataset['fallback']) === true) {
      updateSrc(fallbackImage);
      node.style.backgroundColor = '#fff';
    } else {
      loadEnd();
    }
  }

  function loadStart() {
    node.classList.add(...placeholderClasses);
  }

  function loadEnd() {
    clearTimeout(timeout);
    node.classList.remove(...placeholderClasses);
  }

  node.addEventListener('loadstart', loadStart);
  node.addEventListener('load', loadEnd);
  node.addEventListener('error', rollSrc);

  updateSrc(src);

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
    update(newSrc: string | undefined) {
      if (!node.complete) {
        loadStart();
      }
      updateSrc(newSrc);
    },
  };
};
