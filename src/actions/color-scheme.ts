import { PreferedColorScheme, type ColorScheme } from '$stores/color-scheme-store';
import type { Action } from 'svelte/action';
import { get } from 'svelte/store';

function setColorScheme(node: HTMLElement, osPreferDark: boolean, preferedColorScheme: ColorScheme) {
  const elemHtmlClasses = node.classList;
  const classDark = 'dark';
  if (preferedColorScheme === 'auto') {
    if (osPreferDark) {
      elemHtmlClasses.add(classDark);
    } else {
      elemHtmlClasses.remove(classDark);
    }
  } else if (preferedColorScheme === 'dark') {
    elemHtmlClasses.add(classDark);
  } else {
    elemHtmlClasses.remove(classDark);
  }
}

export const colorScheme: Action<Document> = function (node: Document) {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  PreferedColorScheme.subscribe(value => {
    setColorScheme(node.documentElement, mql.matches, value);
  });
  mql.onchange = () => {
    setColorScheme(node.documentElement, mql.matches, get(PreferedColorScheme));
  };
};
