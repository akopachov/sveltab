import type { BackgroundInstance } from '$lib/background-instance';
import type { Action } from 'svelte/action';

const forceNewSubscribers = new Set<() => void>();

export function forceUpdateBackground() {
  forceNewSubscribers.forEach(f => f());
}

export const dynamicBackground: Action<
  HTMLElement,
  BackgroundInstance | undefined | null,
  { 'on:backgroundChanged': (e: CustomEvent) => void }
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
      backgroundProviderDestroyPromise = background.components.provider.getValue().then(providerClass => {
        const provider = new providerClass(node, background.settings.extra);
        provider.addEventListener('backgroundChanged', notifyBackgroundChanged);
        function forceNew() {
          if (background) {
            provider.forceUpdate();
          }
        }
        forceNewSubscribers.add(forceNew);
        provider.apply();
        return () => {
          forceNewSubscribers.delete(forceNew);
          provider.removeEventListener('backgroundChanged', notifyBackgroundChanged);
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
