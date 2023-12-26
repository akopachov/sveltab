import { derived, get, type Readable } from 'svelte/store';

export function debounce<T>(value: Readable<T>, delayMs = 300) {
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
