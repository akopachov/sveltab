import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type ColorScheme = 'light' | 'dark' | 'auto';

const { subscribe, set } = writable<ColorScheme>(
  (browser ? <ColorScheme>localStorage.getItem('preferedColorScheme') : null) || 'auto',
);

export const PreferedColorScheme = {
  subscribe,
  set(value: ColorScheme) {
    localStorage.setItem('preferedColorScheme', value);
    set(value);
  },
};
