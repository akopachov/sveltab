import { logger } from '$lib/logger';
import type { Action } from 'svelte/action';

const log = logger.getSubLogger({ prefix: ['FontSource Loader:'] });

const activeFonts = new Map<
  string,
  Promise<{ fontFamily: string; fontSets: Map<string, { fontSet: Set<FontFace>; usage: number }>; raw: any }>
>();

export type FontSourceActionSettings = {
  font: string;
  subsets?: ReadonlyArray<string> | null;
  weights?: ReadonlyArray<number> | null;
  styles?: ReadonlyArray<string> | null;
};

function getKey(subset: string, weight: number, style: string) {
  return `${subset}_${weight}_${style}`;
}

export const fontsource: Action<
  HTMLElement,
  FontSourceActionSettings,
  { 'on:fontChanged': (e: CustomEvent<string>) => void }
> = function (node: HTMLElement, settings: FontSourceActionSettings) {
  let currentFont: string | null = '';
  const currentSubsets: Set<string> = new Set<string>();
  const currentWeights: Set<number> = new Set<number>();
  const currentStyles: Set<string> = new Set<string>();

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
      let activeFontRefPromise = activeFonts.get(fontId);
      if (!activeFontRefPromise) {
        activeFontRefPromise = new Promise(resolve => {
          fetch(`https://api.fontsource.org/v1/fonts/${fontId}`)
            .then(r => r.json())
            .then(fontObj => resolve({ fontFamily: fontObj.family, raw: fontObj, fontSets: new Map() }));
        });
        activeFonts.set(fontId, activeFontRefPromise);
      }

      const activeFontRef = await activeFontRefPromise;

      const availableSubsets = <string[]>activeFontRef.raw.subsets;
      let subsets = s.subsets;
      if (subsets) {
        subsets = subsets.filter(s => availableSubsets.includes(s));
        if (subsets.length <= 0) {
          subsets = ['latin'];
        }
      } else {
        subsets = availableSubsets;
      }

      const availableStyles = <string[]>activeFontRef.raw.styles;
      let styles = s.styles;
      if (styles) {
        styles = styles.filter(s => availableStyles.includes(s));
        if (styles.length <= 0) {
          styles = ['normal'];
        }
      } else {
        styles = availableStyles;
      }

      const availableWeights = <number[]>activeFontRef.raw.weights;
      let weights = s.weights;
      if (weights) {
        weights = weights.filter(s => availableWeights.includes(s));
        if (weights.length <= 0) {
          weights = [400];
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
              const source = Object.entries(fontObj.url)
                .map(([format, url]) => `url(${url}) format(${format})`)
                .join(', ');
              const fontFace = new FontFace(activeFontRef.fontFamily, source, {
                weight: String(weight),
                style: style,
                unicodeRange: unicodeRange,
              });
              document.fonts.add(fontFace);
              loadedFontSet!.fontSet.add(fontFace);
              promisesToWait.push(fontFace.load());
              log.debug('Loaded font', activeFontRef.fontFamily, weight, style, subset);
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
    const activeFontRefPromise = activeFonts.get(currentFont);
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
