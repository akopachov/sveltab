import { readable } from "svelte/store";

export function getClockStore(updateInterval: number) {
  return readable(new Date(), function start(set) {
    const interval = setInterval(() => {
      set(new Date());
    }, updateInterval);
  
    return function stop() {
      clearInterval(interval);
    };
  });
}
