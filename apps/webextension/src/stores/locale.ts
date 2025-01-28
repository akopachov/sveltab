import { browser } from '$app/environment';
import { isAvailableLocale, setLocale, baseLocale, type AvailableLocale } from '$i18n/runtime';
import { derived, writable } from 'svelte/store';

const LocaleCharSubsetMap: ReadonlyMap<string, string[]> = new Map<string, string[]>([
  ['en', ['latin']],
  ['cs', ['latin', 'latin-ext']],
  ['ro', ['latin', 'latin-ext']],
  ['pl', ['latin', 'latin-ext']],
  ['hr', ['latin', 'latin-ext']],
  ['hu', ['latin', 'latin-ext']],
  ['sk', ['latin', 'latin-ext']],
  ['tr', ['latin', 'latin-ext']],
  ['lt', ['latin', 'latin-ext']],
  ['be', ['latin', 'cyrillic', 'cyrillic-ext']],
  ['uk', ['latin', 'cyrillic', 'cyrillic-ext']],
  ['bg', ['latin', 'cyrillic']],
  ['el', ['latin', 'greek']],
  ['vi', ['latin', 'vietnamese']],
  ['he', ['latin', 'hebrew']],
  ['ru', ['latin', 'cyrillic']],
]);

const LocalStorageLocaleKey = 'locale';

const { subscribe, set } = writable<AvailableLocale>();

export const locale = {
  subscribe,
  set(locale: AvailableLocale) {
    setLocale(locale);
    localStorage.setItem(LocalStorageLocaleKey, locale);
    set(locale);
  },
};

export const browserLocales: ReadonlyArray<Intl.Locale> = browser
  ? navigator.languages.map(m => new Intl.Locale(m))
  : [new Intl.Locale('en')];

export const localeCharSubset = derived(locale, $locale => LocaleCharSubsetMap.get($locale));
export const userPosssibleLocaleCharSubset = derived(localeCharSubset, $v => {
  const localeCharsets = $v || [];
  const possibleUserCharsets = navigator.languages.flatMap(
    m => LocaleCharSubsetMap.get(new Intl.Locale(m).language) || [],
  );
  return [...new Set([...localeCharsets, ...possibleUserCharsets])];
});

export function initLocaleStore() {
  function initLocale(locale: AvailableLocale) {
    setLocale(locale);
    set(locale);
  }

  if (browser) {
    const localeTag: string | null = localStorage.getItem(LocalStorageLocaleKey);
    if (isAvailableLocale(localeTag)) {
      initLocale(localeTag);
      return;
    }

    for (const lang of navigator.languages) {
      const intl = new Intl.Locale(lang);
      if (isAvailableLocale(intl.language)) {
        initLocale(intl.language);
        return;
      }
    }
  }

  initLocale(baseLocale);
}
