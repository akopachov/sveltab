import { logger } from '$lib/logger';
import { ResourcesToPreload } from '$stores/preload-resources';
import { cache, getCached, forceDropCache } from '$stores/cache';
import type { Action } from 'svelte/action';
import { type FontSubset, type FontStyle, FontWeight, type FontSource } from '$lib/fontsource';
import { hoursToMilliseconds } from 'date-fns';

const log = logger.getSubLogger({ prefix: ['FontSource Loader:'] });

type ActiveFontRef = {
  fontFamily: string;
  fontSets: Map<string, { fontSet: Set<FontFace>; usage: number }>;
  raw: FontSource;
};
const ActiveFonts = new Map<string, Promise<ActiveFontRef> | ActiveFontRef>();

export type FontSourceActionSettings = {
  font: string;
  subsets?: ReadonlyArray<FontSubset> | null;
  weights?: ReadonlyArray<FontWeight> | null;
  styles?: ReadonlyArray<FontStyle> | null;
  noPreload?: boolean;
};

function getKey(subset: FontSubset, weight: FontWeight, style: FontStyle) {
  return `${subset}_${weight}_${style}`;
}

function getCacheKey(key: string) {
  return `font_${key}`;
}

function loadFontSource(fontId: string) {
  return fetch(`https://api.fontsource.org/v1/fonts/${fontId}`).then<FontSource>(r => r.json());
}

const fontFaceSources = new WeakMap<FontFace, string>();

export type FontChangedEventDetails = { target: HTMLElement; fontFamily: string };

export const fontsource: Action<
  HTMLElement,
  FontSourceActionSettings | undefined | null,
  { 'on:fontChanged': (e: CustomEvent<FontChangedEventDetails>) => void }
> = function (node: HTMLElement, settings: FontSourceActionSettings | undefined | null) {
  let currentFont: string | null = '';
  const currentSubsets: Set<FontSubset> = new Set<FontSubset>();
  const currentWeights: Set<FontWeight> = new Set<FontWeight>();
  const currentStyles: Set<FontStyle> = new Set<FontStyle>();

  async function updateFont(s: FontSourceActionSettings | undefined | null) {
    if (
      currentFont === s?.font &&
      (!s.subsets || s.subsets.every(v => currentSubsets.has(v))) &&
      (!s.weights || s.weights.every(v => currentWeights.has(v))) &&
      (!s.styles || s.styles.every(v => currentStyles.has(v)))
    )
      return;

    const fontFacesToRemove = await removeCurrentFont();
    if (s?.font) {
      const fontId = s.font;
      let activeFontRefPromise = ActiveFonts.get(fontId);
      if (!activeFontRefPromise) {
        const cachedFoontSourceResponse = getCached<FontSource>(getCacheKey(fontId));
        if (cachedFoontSourceResponse) {
          activeFontRefPromise = {
            fontFamily: cachedFoontSourceResponse.family,
            raw: cachedFoontSourceResponse,
            fontSets: new Map(),
          };
        } else {
          if (s.noPreload === true) {
            activeFontRefPromise = loadFontSource(fontId).then<ActiveFontRef>(fontObj => ({
              fontFamily: fontObj.family,
              raw: fontObj,
              fontSets: new Map(),
            }));
          } else {
            const cachedFoontSourceResponse = cache(
              getCacheKey(fontId),
              () => loadFontSource(fontId),
              hoursToMilliseconds(24 * 7),
            );
            if (cachedFoontSourceResponse instanceof Promise) {
              activeFontRefPromise = cachedFoontSourceResponse.then<ActiveFontRef>(fontObj => ({
                fontFamily: fontObj.family,
                raw: fontObj,
                fontSets: new Map(),
              }));
            } else {
              activeFontRefPromise = {
                fontFamily: cachedFoontSourceResponse.family,
                raw: cachedFoontSourceResponse,
                fontSets: new Map(),
              };
            }
          }
        }

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
      node.style.fontFamily = `"${activeFontRef!.fontFamily}", ${activeFontRef.raw.category}`;

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
              const fontObj = ((activeFontRef.raw.variants[`${weight}`] || {})[style] || {})[subset];
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
              if (settings?.noPreload !== true) {
                ResourcesToPreload.add({ src: uri, type: `font/${format}`, as: 'font' });
              }
              document.fonts.add(fontFace);
              document.fonts;
              loadedFontSet!.fontSet.add(fontFace);
              promisesToWait.push(fontFace.load());
              log.debug('Loaded font', activeFontRef.fontFamily, weight, style, subset);
            }
          }
        }
      }

      Promise.allSettled(promisesToWait).then(() => {
        node.dispatchEvent(
          new CustomEvent<FontChangedEventDetails>('fontChanged', {
            detail: { target: node, fontFamily: activeFontRef!.fontFamily },
          }),
        );
        fontFacesToRemove.forEach(f => document.fonts.delete(f));
      });
    } else {
      node.style.fontFamily = '';
      node.dispatchEvent(
        new CustomEvent<FontChangedEventDetails>('fontChanged', { detail: { target: node, fontFamily: '' } }),
      );
      fontFacesToRemove.forEach(f => document.fonts.delete(f));
    }

    currentFont = s?.font || null;
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
                  const uri = fontFaceSources.get(fontFace);
                  if (uri) {
                    fontFaceSources.delete(fontFace);
                    if (settings?.noPreload !== true) {
                      ResourcesToPreload.delete({ src: uri });
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (activeFontRef.fontSets.size === 0) {
        ActiveFonts.delete(currentFont);
        forceDropCache(getCacheKey(currentFont));
      }
    }

    currentFont = null;
    currentSubsets.clear();
    currentWeights.clear();
    currentStyles.clear();
    return fontFacesToRemove;
  }

  updateFont(settings);
  node.classList.add('[font-display:swap]');

  return {
    update(settings: FontSourceActionSettings | null | undefined) {
      updateFont(settings);
    },
    destroy() {
      removeCurrentFont().then(ff => ff.forEach(f => document.fonts.delete(f)));
      node.style.fontFamily = '';
      node.classList.remove('[font-display:swap]');
    },
  };
};
