import { readable, type Readable } from 'svelte/store';

const stores = new Map<number, WeakRef<Readable<Date>>>();
const alignedStores = new Map<number, WeakRef<Readable<Date>>>();

export function getClockStore(updateInterval: number): Readable<Date> {
  let store = stores.get(updateInterval)?.deref() || alignedStores.get(updateInterval)?.deref();
  if (!store) {
    store = readable(new Date(), function start(set) {
      const interval = setInterval(() => {
        set(new Date());
      }, updateInterval);

      return function stop() {
        clearInterval(interval);
      };
    });
    stores.set(updateInterval, new WeakRef(store));
  }

  return store;
}

export function getPreciselyAlignedClockStore(updateInterval: number): Readable<Date> {
  let store = alignedStores.get(updateInterval)?.deref();
  if (!store) {
    store = readable(new Date(), function start(set) {
      const drift = updateInterval - (new Date().getTime() % updateInterval);
      let interval: ReturnType<typeof setInterval> | undefined;
      const timeout = setTimeout(() => {
        set(new Date());
        interval = setInterval(() => {
          set(new Date());
        }, updateInterval);
      }, drift);

      return function stop() {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    });

    alignedStores.set(updateInterval, new WeakRef(store));
  }

  return store;
}
