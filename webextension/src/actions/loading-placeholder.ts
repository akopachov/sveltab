import type { Action } from 'svelte/action';

const placeholderClasses = ['placeholder', 'animate-pulse'];

export const loadingPlaceholder: Action<HTMLElement, boolean> = function (node: HTMLElement, loaded: boolean) {
  function set(loaded: boolean) {
    if (loaded) {
      node.classList.remove(...placeholderClasses);
    } else {
      node.classList.add(...placeholderClasses);
    }
  }

  set(loaded);
  return {
    destroy() {
      set(true);
    },
    update(loaded: boolean) {
      set(loaded);
    },
  };
};
