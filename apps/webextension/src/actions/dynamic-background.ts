import type { BackgroundInstance } from '$lib/background-instance';
import type { IBackgroundProvider } from '$backgrounds/types';
import type { Action } from 'svelte/action';
import { writable, type Readable } from 'svelte/store';

const forceNextSubscribers = new Set<() => void>();
const forcePreviousSubscribers = new Set<() => void>();

export type BackgroundCornerColorChangedEventArgs = { color: string; isDark: boolean };

export function forceNextBackground() {
  forceNextSubscribers.forEach(f => f());
}

export function forcePreviousBackground() {
  forcePreviousSubscribers.forEach(f => f());
}

const _activeBackgroundProvider = writable<IBackgroundProvider | undefined>(undefined);
export const ActiveBackgroundProvider: Readable<IBackgroundProvider | undefined> = _activeBackgroundProvider;

export const dynamicBackground: Action<
  HTMLElement,
  BackgroundInstance | undefined | null,
  {
    onbackgroundChanged: (e: CustomEvent) => void;
    oncornerColorChanged: (e: CustomEvent<BackgroundCornerColorChangedEventArgs>) => void;
  }
> = function (node: HTMLElement, background: BackgroundInstance | undefined | null) {
  let backgroundProviderDestroyPromise: Promise<() => void> | undefined;
  initializeNew(background);

  function notifyBackgroundChanged() {
    node.dispatchEvent(new CustomEvent('backgroundChanged'));
  }

  async function destroyExisting() {
    if (backgroundProviderDestroyPromise) {
      const backgroundProviderDestroy = await backgroundProviderDestroyPromise;
      backgroundProviderDestroy();
    }
  }

  async function initializeNew(background: BackgroundInstance | undefined | null) {
    if (background) {
      backgroundProviderDestroyPromise = background.components.provider.value.then(async providerClass => {
        const provider = new providerClass(node, background.settings.extra);
        const abortController = new AbortController();
        if (provider instanceof EventTarget) {
          provider.addEventListener('backgroundChanged', notifyBackgroundChanged);
        }

        function forceNext() {
          if (background) {
            provider.goNext(abortController.signal);
          }
        }
        function forcePrevious() {
          if (background) {
            provider.goBack();
          }
        }
        forceNextSubscribers.add(forceNext);
        forcePreviousSubscribers.add(forcePrevious);
        await provider.apply(abortController.signal);
        _activeBackgroundProvider.set(provider);
        return () => {
          _activeBackgroundProvider.set(undefined);
          forceNextSubscribers.delete(forceNext);
          forcePreviousSubscribers.delete(forcePrevious);
          if (provider instanceof EventTarget) {
            provider.removeEventListener('backgroundChanged', notifyBackgroundChanged);
          }
          abortController.abort('User has changed background provider');
          provider.destroy();
        };
      });
    }
  }

  return {
    destroy: destroyExisting,
    async update(background) {
      await destroyExisting();
      await initializeNew(background);
    },
  };
};
