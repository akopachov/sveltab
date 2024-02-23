import { browser } from '$app/environment';

export type ResourceInfo = { src: string; type?: string; as: 'font' | 'image' | 'document' | 'object' };

function getHash(value: Pick<ResourceInfo, 'src'>) {
  return value.src;
}

class ResourceSet {
  #map = new Map<string, ResourceInfo>();
  [Symbol.iterator] = this.values;

  values() {
    return this.#map.values();
  }

  has(value: ResourceInfo) {
    const hash = getHash(value);
    return this.#map.has(hash);
  }

  add(value: ResourceInfo): this {
    const hash = getHash(value);
    if (!this.#map.has(hash)) {
      this.#map.set(hash, value);
    }
    return this;
  }

  delete(value: Pick<ResourceInfo, 'src'>): boolean {
    const hash = getHash(value);
    return this.#map.delete(hash);
  }
}

export const ResourcesToPreload = new ResourceSet();

if (browser) {
  const localstorageKey = 'external-resources__preload';
  localStorage.setItem(localstorageKey, '');
  window.addEventListener('beforeunload', () => {
    localStorage.setItem(localstorageKey, JSON.stringify([...ResourcesToPreload.values()]));
  });
}
