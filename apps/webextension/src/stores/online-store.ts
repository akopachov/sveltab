import { readable } from 'svelte/store';

declare global {
  interface Navigator {
    connection: EventTarget | undefined;
  }
}

export const online = readable(navigator.onLine, function start(set) {
  const handler = () => set(navigator.onLine);

  if (navigator.connection) {
    navigator.connection.addEventListener('change', handler);
  } else {
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
  }

  return function stop() {
    if (navigator.connection) {
      navigator.connection.removeEventListener('change', handler);
    } else {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    }
  };
});
