import { WeakLazy } from '$lib/lazy';
import type { BackgroundCatalogItem } from '../types';
import * as m from '$i18n/messages';

export const Background: BackgroundCatalogItem = {
  name: m.Backgrounds_AnimeImage_Name,
  components: {
    provider: new WeakLazy(() => import('./provider').then(r => r.AnimeImageBackgroundProvider)),
    settings: {
      component: new WeakLazy(() => import('./settings.svelte').then(r => r.default)),
      model: new WeakLazy(() => import('./settings').then(r => r.Settings)),
    },
  },
  settings: {
    type: 'anime-image',
  },
};
