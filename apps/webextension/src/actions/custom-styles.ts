import type { Action } from 'svelte/action';

export const customStyles: Action<Document, string> = function (node: Document, styles: string) {
  const styleEl = node.createElement('style');
  node.head.appendChild(styleEl);
  styleEl.innerHTML = styles;
  return {
    update(styles: string) {
      styleEl.innerHTML = styles;
    },
    destroy() {
      styleEl.remove();
    },
  };
};
