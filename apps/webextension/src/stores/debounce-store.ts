import { derived, get, writable, type Readable, type Writable } from 'svelte/store';

export function debouncedDerived<T>(value: Readable<T>, delayMs: number = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return derived(
    value,
    ($value, set) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        set($value);
        timer = null;
      }, delayMs);
    },
    get(value),
  );
}

export function debouncedWritable<T>(value?: T | undefined, delayMs: number = 300): Writable<T> {
  const w = writable(value);

  return {
    ...debouncedDerived(w, delayMs),
    set: w.set,
    update: w.update,
  };
}
