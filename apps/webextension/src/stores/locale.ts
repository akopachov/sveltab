import { browser } from '$app/environment';
import { isLocale, overwriteGetLocale, overwriteSetLocale, baseLocale, type Locale } from '$i18n/runtime';
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

let _currentLocale: Locale = baseLocale;
const { subscribe, set } = writable<Locale>(_currentLocale);

function getLocale() {
  return _currentLocale;
}

function setLocale(newLocale: Locale) {
  if (!isLocale(newLocale) || newLocale === _currentLocale) {
    return;
  }

  _currentLocale = newLocale;
  set(newLocale);
  localStorage.setItem(LocalStorageLocaleKey, newLocale);
}

function setLocaleWithoutPersist(newLocale: Locale) {
  if (newLocale === _currentLocale) {
    return;
  }

  _currentLocale = newLocale;
  set(newLocale);
}

overwriteGetLocale(getLocale);
overwriteSetLocale(setLocale);

export const locale = {
  subscribe,
  set(locale: Locale) {
    setLocale(locale);
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
  if (browser) {
    const localeTag: string | null = localStorage.getItem(LocalStorageLocaleKey);
    if (isLocale(localeTag)) {
      setLocaleWithoutPersist(localeTag);
      return;
    }

    for (const lang of navigator.languages) {
      if (isLocale(lang)) {
        setLocale(lang);
        return;
      }
      const intl = new Intl.Locale(lang);
      if (isLocale(intl.language)) {
        setLocale(intl.language);
        return;
      }
    }
  }

  setLocale(baseLocale);
}
