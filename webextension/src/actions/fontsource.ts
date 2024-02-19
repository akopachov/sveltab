import { browser } from '$app/environment';
import { logger } from '$lib/logger';
import pDebounce from 'p-debounce';
import type { Action } from 'svelte/action';

const log = logger.getSubLogger({ prefix: ['FontSource Loader:'] });

const ActiveFonts = new Map<
  string,
  Promise<{ fontFamily: string; fontSets: Map<string, { fontSet: Set<FontFace>; usage: number }>; raw: any }>
>();

export type FontSubset =
  | 'latin'
  | 'latin-ext'
  | 'cyrillic'
  | 'cyrillic-ext'
  | 'greek'
  | 'vietnamese'
  | 'hebrew'
  | 'cyrillic'
  | (string & NonNullable<unknown>);

export type FontStyle = 'normal' | 'italic' | (string & NonNullable<unknown>);

export enum FontWeight {
  Thin = 100,
  ExtraLight = 200,
  Light = 300,
  Normal = 400,
  Medium = 500,
  SemiBold = 600,
  Bold = 700,
  ExtraBold = 800,
  Heavy = 900,
}

export type FontSourceActionSettings = {
  font: string;
  subsets?: ReadonlyArray<FontSubset> | null;
  weights?: ReadonlyArray<FontWeight> | null;
  styles?: ReadonlyArray<FontStyle> | null;
};

function getKey(subset: FontSubset, weight: FontWeight, style: FontStyle) {
  return `${subset}_${weight}_${style}`;
}

const fontFaceSources = new WeakMap<FontFace, string>();
const storeFontSourcesToPreload = pDebounce(async () => {
  const values = await Promise.all(ActiveFonts.values());
  const sources = [];
  for (const { fontSets } of values) {
    for (const { fontSet } of fontSets.values()) {
      for (const fontFace of fontSet) {
        const src = fontFaceSources.get(fontFace);
        if (src) {
          sources.push(src);
        }
      }
    }
  }

  if (browser) {
    localStorage.setItem('FontSource_preload', sources.join(';'));
  }
}, 500);

export const fontsource: Action<
  HTMLElement,
  FontSourceActionSettings,
  { 'on:fontChanged': (e: CustomEvent<string>) => void }
> = function (node: HTMLElement, settings: FontSourceActionSettings) {
  let currentFont: string | null = '';
  const currentSubsets: Set<FontSubset> = new Set<FontSubset>();
  const currentWeights: Set<FontWeight> = new Set<FontWeight>();
  const currentStyles: Set<FontStyle> = new Set<FontStyle>();

  async function updateFont(s: FontSourceActionSettings) {
    if (
      currentFont === s.font &&
      (!s.subsets || s.subsets.every(v => currentSubsets.has(v))) &&
      (!s.weights || s.weights.every(v => currentWeights.has(v))) &&
      (!s.styles || s.styles.every(v => currentStyles.has(v)))
    )
      return;

    const fontId = s.font;

    const fontFacesToRemove = await removeCurrentFont();
    if (fontId) {
      let activeFontRefPromise = ActiveFonts.get(fontId);
      if (!activeFontRefPromise) {
        activeFontRefPromise = new Promise(resolve => {
          fetch(`https://api.fontsource.org/v1/fonts/${fontId}`)
            .then(r => r.json())
            .then(fontObj => resolve({ fontFamily: fontObj.family, raw: fontObj, fontSets: new Map() }));
        });
        ActiveFonts.set(fontId, activeFontRefPromise);
      }

      const activeFontRef = await activeFontRefPromise;

      const availableSubsets = <FontSubset[]>activeFontRef.raw.subsets;
      let subsets = s.subsets;
      if (subsets) {
        subsets = subsets.filter(s => availableSubsets.includes(s));
        if (subsets.length <= 0) {
          subsets = ['latin'];
        }
      } else {
        subsets = availableSubsets;
      }

      const availableStyles = <FontStyle[]>activeFontRef.raw.styles;
      let styles = s.styles;
      if (styles) {
        styles = styles.filter(s => availableStyles.includes(s));
        if (styles.length <= 0) {
          styles = ['normal'];
        }
      } else {
        styles = availableStyles;
      }

      const availableWeights = <FontWeight[]>activeFontRef.raw.weights;
      let weights = s.weights;
      if (weights) {
        weights = weights.filter(s => availableWeights.includes(s));
        if (weights.length <= 0) {
          weights = [FontWeight.Normal];
        }
      } else {
        weights = availableWeights;
      }

      const promisesToWait = [];

      for (const subset of subsets) {
        const unicodeRange = activeFontRef.raw.unicodeRange[subset];
        currentSubsets.add(subset);
        for (const weight of weights) {
          currentWeights.add(weight);
          for (const style of styles) {
            currentStyles.add(style);
            const cacheKey = getKey(subset, weight, style);
            let loadedFontSet = activeFontRef.fontSets.get(cacheKey);
            if (loadedFontSet) {
              loadedFontSet.usage++;
            } else {
              loadedFontSet = { fontSet: new Set(), usage: 1 };
              activeFontRef.fontSets.set(cacheKey, loadedFontSet);
              const fontObj = ((activeFontRef.raw.variants[String(weight)] || {})[style] || {})[subset];
              if (!fontObj) continue;
              const uri = fontObj.url.woff2 || fontObj.url.woff || fontObj.url.ttf;
              const format = fontObj.url.woff2 ? 'woff2' : fontObj.url.woff ? 'woff' : 'ttf';
              const source = `url(${uri}) format(${format})`;
              const fontFace = new FontFace(activeFontRef.fontFamily, source, {
                weight: String(weight),
                style: style,
                unicodeRange: unicodeRange,
              });
              fontFaceSources.set(fontFace, uri);
              document.fonts.add(fontFace);
              loadedFontSet!.fontSet.add(fontFace);
              promisesToWait.push(fontFace.load());
              log.debug('Loaded font', activeFontRef.fontFamily, weight, style, subset);
              storeFontSourcesToPreload();
            }
          }
        }
      }

      Promise.allSettled(promisesToWait).then(() => {
        node.style.fontFamily = `"${activeFontRef!.fontFamily}", ${activeFontRef.raw.category}`;
        node.dispatchEvent(new CustomEvent('fontChanged', { detail: activeFontRef!.fontFamily }));
        fontFacesToRemove.forEach(f => document.fonts.delete(f));
      });
    } else {
      node.style.fontFamily = '';
      node.dispatchEvent(new CustomEvent('fontChanged', { detail: '' }));
      fontFacesToRemove.forEach(f => document.fonts.delete(f));
    }

    currentFont = fontId;
  }

  async function removeCurrentFont() {
    if (!currentFont) return [];

    const fontFacesToRemove = [];
    const activeFontRefPromise = ActiveFonts.get(currentFont);
    if (activeFontRefPromise) {
      const activeFontRef = await activeFontRefPromise;
      for (const subset of currentSubsets) {
        for (const weight of currentWeights) {
          for (const style of currentStyles) {
            const cacheKey = getKey(subset, weight, style);
            const fontSet = activeFontRef.fontSets.get(cacheKey);
            if (fontSet) {
              fontSet.usage--;
              if (fontSet.usage <= 0) {
                activeFontRef.fontSets.delete(cacheKey);
                for (const fontFace of fontSet.fontSet) {
                  fontFacesToRemove.push(fontFace);
                  log.debug('Unloaded font', activeFontRef.fontFamily, weight, style, subset);
                  fontFaceSources.delete(fontFace);
                  storeFontSourcesToPreload();
                }
              }
            }
          }
        }
      }
    }

    currentFont = null;
    currentSubsets.clear();
    currentWeights.clear();
    currentStyles.clear();
    return fontFacesToRemove;
  }

  updateFont(settings);

  return {
    update(settings: FontSourceActionSettings) {
      updateFont(settings);
    },
    destroy() {
      removeCurrentFont().then(ff => ff.forEach(f => document.fonts.delete(f)));
      node.style.fontFamily = '';
    },
  };
};
