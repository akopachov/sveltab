import type { WidgetCatalogItem } from '../types';
import { WeakLazy } from '$lib/lazy';
import * as m from '$i18n/messages';

export const Widget: WidgetCatalogItem = {
  name: () => m.Widgets_Weather_Name(),
  components: {
    preview: new WeakLazy(() => import('./preview.svelte').then(r => r.default)),
    widget: new WeakLazy(() => import('./widget.svelte').then(r => r.default)),
    settings: {
      component: new WeakLazy(() => import('./settings.svelte').then(r => r.default)),
      model: new WeakLazy(() => import('./settings').then(r => r.Settings)),
    },
  },
  settings: {
    type: 'weather',
    position: {
      height: 40,
      width: 50,
    },
  },
};
