import type { Action } from 'svelte/action';

const activeFonts = new Map<
  string,
  { fontFamily: string; fontSets: Map<string, { fontSet: Set<FontFace>; usage: number }>; raw: any }
>();

export type FontSourceActionSettings = {
  font: string;
  subsets?: string[] | null;
  weights?: number[] | null;
  styles?: string[] | null;
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
  let currentSubsets: Set<string> = new Set<string>();
  let currentWeights: Set<number> = new Set<number>();
  let currentStyles: Set<string> = new Set<string>();

  async function updateFont(s: FontSourceActionSettings) {
    if (
      currentFont === s.font &&
      (!s.subsets || s.subsets.every(v => currentSubsets.has(v))) &&
      (!s.weights || s.weights.every(v => currentWeights.has(v))) &&
      (!s.styles || s.styles.every(v => currentStyles.has(v)))
    )
      return;

    let fontId = s.font;

    const fontFacesToRemove = removeCurrentFont();
    if (fontId) {
      let activeFontRef = activeFonts.get(fontId);
      if (!activeFontRef) {
        const fontObj = await fetch(`https://api.fontsource.org/v1/fonts/${fontId}`).then(r => r.json());
        activeFontRef = { fontFamily: fontObj.family, raw: fontObj, fontSets: new Map() };
        activeFonts.set(fontId, activeFontRef);
      }

      let subsets = s.subsets || <string[]>activeFontRef.raw.subsets;
      let styles = s.styles || <string[]>activeFontRef.raw.styles;
      let weights = s.weights || <number[]>activeFontRef.raw.weights;
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
              console.info(`Loaded font "${activeFontRef.fontFamily}" ${weight} ${style} ${subset}`);
              const fontObj = ((activeFontRef.raw.variants[String(weight)] || {})[style] || {})[subset];
              if (!fontObj) continue;
              const url = fontObj.url.woff2 || fontObj.url.woff || fontObj.url.ttf;
              const fontFace = new FontFace(activeFontRef.fontFamily, `url(${url})`, {
                weight: String(weight),
                style: style,
                unicodeRange: unicodeRange,
              });
              promisesToWait.push(
                fontFace.load().then(ff => {
                  document.fonts.add(ff);
                  loadedFontSet!.fontSet.add(ff);
                }),
              );
            }
          }
        }
      }

      Promise.allSettled(promisesToWait).then(() => {
        node.style.fontFamily = `"${activeFontRef!.fontFamily}", sans-serif`;
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

  function removeCurrentFont() {
    if (!currentFont) return [];

    const fontFacesToRemove = [];
    const activeFontRef = activeFonts.get(currentFont);
    if (activeFontRef) {
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
                  console.info(`Unloaded font "${activeFontRef.fontFamily}" ${weight} ${style} ${subset}`);
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
      removeCurrentFont().forEach(f => document.fonts.delete(f));
      node.style.fontFamily = '';
    },
  };
};
