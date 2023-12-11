import type { BackgroundInstance } from '$models/background-instance';
import type { Action } from 'svelte/action';

const forceNewSubscribers = new Set<() => void>();

export function forceUpdateBackground() {
  forceNewSubscribers.forEach(f => f());
}

export const dynamicBackground: Action<
  HTMLElement,
  BackgroundInstance,
  { 'on:backgroundChanged': (e: CustomEvent) => void }
> = function (node: HTMLElement, background: BackgroundInstance) {
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

  async function initializeNew(background: BackgroundInstance) {
    if (background) {
      backgroundProviderDestroyPromise = background.components.provider.getValue().then(providerClass => {
        const provider = new providerClass(node);
        provider.addEventListener('backgroundChanged', notifyBackgroundChanged);
        const unsubscribe = background.settings.extra.subscribe(v => {
          provider.update(background.settings.extra);
        });
        function forceNew() {
          provider.update(background.settings.extra, true);
        }
        forceNewSubscribers.add(forceNew);
        return () => {
          unsubscribe();
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
