import type { Action } from 'svelte/action';
import type { TextStrokeSettings } from '../lib/widget-settings';
import type { Unsubscriber } from 'svelte/store';

export const textStroke: Action<HTMLElement, TextStrokeSettings | undefined | null> = function (
  node: HTMLElement,
  settings: TextStrokeSettings | undefined | null,
) {
  let unsubscribeList: Unsubscriber[] = [];

  function unsubscribe() {
    unsubscribeList.forEach(u => u());
    unsubscribeList = [];
  }

  function updateStyleProperty(size: number, color: string) {
    if (size > 0) {
      node.style.setProperty('--sv-text-stroke', `${size}em ${color}`);
    } else {
      node.style.removeProperty('--sv-text-stroke');
    }
  }

  function update(settings: TextStrokeSettings | undefined | null) {
    unsubscribe();
    if (!settings?.color || !settings?.size || settings?.size.value <= 0) {
      updateStyleProperty(0, '');
    }

    if (settings?.color) {
      unsubscribeList.push(settings.color.subscribe(color => updateStyleProperty(settings?.size.value, color)));
    }
    if (settings?.size) {
      unsubscribeList.push(settings.size.subscribe(size => updateStyleProperty(size, settings?.color?.value)));
    }
  }

  if (settings) {
    update(settings);
  }

  return {
    update: update,

    destroy() {
      unsubscribe();
      updateStyleProperty(0, '');
    },
  };
};
