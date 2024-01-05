import { browser } from '$app/environment';
import { isAvailableLanguageTag, setLanguageTag, sourceLanguageTag, type AvailableLanguageTag } from '$i18n/runtime';
import { derived, writable } from 'svelte/store';

const LocaleCharSubsetMap = new Map<string, string[]>([
  ['en', ['latin']],
  ['cs', ['latin', 'latin-ext']],
  ['ro', ['latin', 'latin-ext']],
  ['pl', ['latin', 'latin-ext']],
  ['hr', ['latin', 'latin-ext']],
  ['hu', ['latin', 'latin-ext']],
  ['sk', ['latin', 'latin-ext']],
  ['tr', ['latin', 'latin-ext']],
  ['lt', ['latin', 'latin-ext']],
  ['by', ['cyrillic', 'cyrillic-ext']],
  ['uk', ['cyrillic', 'cyrillic-ext']],
  ['bg', ['cyrillic']],
  ['el', ['greek']],
  ['vi', ['vietnamese']],
  ['he', ['hebrew']],
  ['ru', ['cyrillic']],
]);

const LocalStorageLocaleKey = 'locale';

const { subscribe, set } = writable<AvailableLanguageTag>();

export const locale = {
  subscribe,
  set(locale: AvailableLanguageTag) {
    setLanguageTag(locale);
    localStorage.setItem(LocalStorageLocaleKey, locale);
    set(locale);
  },
};

export const localeCharSubset = derived(locale, $locale => LocaleCharSubsetMap.get($locale));
export const userPosssibleLocaleCharSubset = derived(localeCharSubset, $v => {
  const localeCharsets = $v || [];
  const possibleUserCharsets = navigator.languages.flatMap(
    m => LocaleCharSubsetMap.get(new Intl.Locale(m).language) || [],
  );
  return [...new Set([...localeCharsets, ...possibleUserCharsets])];
});

export function initLocaleStore() {
  function initLocale(locale: AvailableLanguageTag) {
    setLanguageTag(locale);
    set(locale);
  }

  if (browser) {
    const localeTag: string | null = localStorage.getItem(LocalStorageLocaleKey);
    if (isAvailableLanguageTag(localeTag)) {
      initLocale(localeTag);
      return;
    }

    for (const lang of navigator.languages) {
      const intl = new Intl.Locale(lang);
      if (isAvailableLanguageTag(intl.language)) {
        initLocale(intl.language);
        return;
      }
    }
  }

  initLocale(sourceLanguageTag);
}
