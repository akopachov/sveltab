import type { Action } from 'svelte/action';

export const customStyles: Action<Document, string | undefined | null> = function (
  node: Document,
  styles: string | undefined | null,
) {
  const styleEl = node.createElement('style');
  node.head.appendChild(styleEl);
  styleEl.innerHTML = styles || '';
  return {
    update(styles: string | undefined | null) {
      styleEl.innerHTML = styles || '';
    },
    destroy() {
      styleEl.remove();
    },
  };
};
