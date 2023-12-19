import { PreferedColorScheme, type ColorScheme } from '$stores/color-scheme-store';
import type { Action } from 'svelte/action';
import { derived, get, readable, writable, type Readable } from 'svelte/store';

function setColorScheme(node: HTMLElement, osPreferDark: boolean, preferedColorScheme: ColorScheme) {
  const elemHtmlClasses = node.classList;
  const classDark = 'dark';
  if (preferedColorScheme === 'auto') {
    if (osPreferDark) {
      elemHtmlClasses.add(classDark);
      appliedColorScheme.set('dark');
    } else {
      elemHtmlClasses.remove(classDark);
      appliedColorScheme.set('light');
    }
  } else if (preferedColorScheme === 'dark') {
    elemHtmlClasses.add(classDark);
    appliedColorScheme.set('dark');
  } else {
    elemHtmlClasses.remove(classDark);
    appliedColorScheme.set('light');
  }
}

const appliedColorScheme = writable<Omit<ColorScheme, 'auto'>>();
export const AppliedColorScheme: Readable<Omit<ColorScheme, 'auto'>> = {
  subscribe: appliedColorScheme.subscribe,
};

export const colorScheme: Action<Document> = function (node: Document) {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  PreferedColorScheme.subscribe(value => {
    setColorScheme(node.documentElement, mql.matches, value);
  });
  mql.onchange = () => {
    setColorScheme(node.documentElement, mql.matches, get(PreferedColorScheme));
  };
};
