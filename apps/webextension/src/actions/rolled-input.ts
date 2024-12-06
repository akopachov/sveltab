import type { Action } from 'svelte/action';

export const rolledInput: Action<HTMLInputElement> = function (node: HTMLInputElement) {
  const min = node.min ? Number(node.min) : NaN;
  const max = node.max ? Number(node.max) : NaN;

  function onKeyDown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement) {
      if (!isNaN(min) && event.target.valueAsNumber === min && event.key === 'ArrowDown') {
        event.preventDefault();
        event.target.valueAsNumber = max;
        event.target.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (!isNaN(max) && event.target.valueAsNumber === max && event.key === 'ArrowUp') {
        event.preventDefault();
        event.target.valueAsNumber = min;
        event.target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  node.addEventListener('keydown', onKeyDown);

  return {
    destroy() {
      node.removeEventListener('keydown', onKeyDown);
    },
  };
};
