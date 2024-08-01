import type { BackgroundInstance } from '$lib/background-instance';
import type { IBackgroundProvider } from '$stores/background-catalog';
import type { Action } from 'svelte/action';
import { writable, type Readable } from 'svelte/store';

const forceNewSubscribers = new Set<() => void>();

export type BackgroundCornerColorChangedEventArgs = { color: string; isDark: boolean };

export function forceUpdateBackground() {
  forceNewSubscribers.forEach(f => f());
}

const _activeBackgroundProvider = writable<IBackgroundProvider | undefined>(undefined);
export const ActiveBackgroundProvider: Readable<IBackgroundProvider | undefined> = _activeBackgroundProvider;

export const dynamicBackground: Action<
  HTMLElement,
  BackgroundInstance | undefined | null,
  {
    'on:backgroundChanged': (e: CustomEvent) => void;
    'on:cornerColorChanged': (e: CustomEvent<BackgroundCornerColorChangedEventArgs>) => void;
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

        function forceNew() {
          if (background) {
            provider.forceUpdate(abortController.signal);
          }
        }
        forceNewSubscribers.add(forceNew);
        await provider.apply(abortController.signal);
        _activeBackgroundProvider.set(provider);
        return () => {
          _activeBackgroundProvider.set(undefined);
          forceNewSubscribers.delete(forceNew);
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
