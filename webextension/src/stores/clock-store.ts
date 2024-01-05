import { readable, type Readable } from 'svelte/store';

const stores = new Map<number, WeakRef<Readable<Date>>>();

export function getClockStore(updateInterval: number) {
  let store = stores.get(updateInterval)?.deref();
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
